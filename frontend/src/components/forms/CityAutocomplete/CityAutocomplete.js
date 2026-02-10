import React, { useState, useEffect, useRef } from 'react';
import './CityAutocomplete.css';
import { popularCities } from '../../../data/popularCities';

const CityAutocomplete = ({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Search city...',
  showGeolocation = true
}) => {
  const getFlagEmoji = (countryCode) => {
    if (!countryCode) return '📍';
    const code = countryCode.toUpperCase();
    if (code.length !== 2) return '📍';
    const codePoints = code
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isGeolocating, setIsGeolocating] = useState(false);

  const wrapperRef = useRef(null);
  const debounceTimer = useRef(null);
  const searchCache = useRef({}); // Cache for search results

  // Sync internal input value with the value prop
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch city suggestions from GeoNames API
  const fetchCitySuggestions = async (query) => {
    const trimmedQuery = query.toLowerCase().trim();
    if (!trimmedQuery || trimmedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    // 1. Check Local Popular Cities First (Instant - 0ms)
    const localMatches = popularCities.filter(c => 
      c.name.toLowerCase().includes(trimmedQuery)
    ).map(city => ({
      name: city.name,
      state: city.state,
      country: city.country,
      countryCode: city.countryCode || (city.country === 'India' ? 'IN' : city.country === 'USA' ? 'US' : city.country === 'UK' ? 'GB' : ''),
      fullName: `${city.name}, ${city.state ? city.state + ', ' : ''}${city.country}`,
      lat: city.lat,
      lng: city.lng,
      isLocal: true
    }));

    if (localMatches.length > 0) {
      setSuggestions(localMatches);
      setIsOpen(true);
      // If we found local matches, we can still fetch more in background if needed
      // but showing them instantly makes it feel "fastly"
    }

    // 2. Check Cache
    if (searchCache.current[trimmedQuery]) {
      const cachedResults = searchCache.current[trimmedQuery];
      // Merge local with cached (avoid duplicates)
      const merged = [...localMatches];
      cachedResults.forEach(cr => {
        if (!merged.find(m => m.name.toLowerCase() === cr.name.toLowerCase())) {
          merged.push(cr);
        }
      });
      setSuggestions(merged);
      setIsOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      // Use cities1000 for faster and more comprehensive results
      // Shortened timeout and removed orderby to see if it speeds up
      const response = await fetch(
        `http://api.geonames.org/searchJSON?name_startsWith=${encodeURIComponent(trimmedQuery)}&maxRows=15&username=ucs05&featureClass=P&cities=cities1000`
      );
      const data = await response.json();

      if (data.geonames) {
        const formattedSuggestions = data.geonames.map(city => ({
          name: city.name,
          state: city.adminName1 || '',
          country: city.countryName,
          countryCode: city.countryCode,
          fullName: `${city.name}, ${city.adminName1 ? city.adminName1 + ', ' : ''}${city.countryName}`,
          lat: city.lat,
          lng: city.lng
        }));
        
        // Save to cache
        searchCache.current[trimmedQuery] = formattedSuggestions;
        
        // Merge with local results
        const merged = [...localMatches];
        formattedSuggestions.forEach(fs => {
            if (!merged.find(m => m.name.toLowerCase() === fs.name.toLowerCase())) {
                merged.push(fs);
            }
        });

        setSuggestions(merged);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      if (localMatches.length === 0) setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);

    if (onChange) onChange(newValue);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer - 400ms since local matches are instant anyway
    debounceTimer.current = setTimeout(() => {
      fetchCitySuggestions(newValue);
    }, 400);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    setInputValue(suggestion.name);
    setIsOpen(false);
    setSuggestions([]);

    if (onSelect) {
      onSelect(suggestion);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Handle geolocation
  const handleGeolocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGeolocating(true);
    setInputValue('Locating...'); // Give user feedback
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/fetchCityName/${lat}/${lng}`
          );
          if (!response.ok) throw new Error('Failed to fetch city name');

          const data = await response.json();
          const cityData = {
            name: data.cityName,
            fullName: data.cityName,
            lat,
            lng
          };
          setInputValue(data.cityName);
          if (onSelect) onSelect(cityData);
        } catch (error) {
          console.error('Error fetching city:', error);
          // Only alert on serious failures
        } finally {
          setIsGeolocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsGeolocating(false);
        // Only alert if it's a permission denied error
        if (error.code === error.PERMISSION_DENIED) {
          alert('Please enable location permissions in your browser.');
        } else {
          console.warn('Geolocation failed but might work on retry or with better signal.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="city-autocomplete" ref={wrapperRef}>
      <div className="autocomplete-input-wrapper">
        <input
          type="text"
          className="autocomplete-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.length >= 2 && setSuggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
        />
        {isLoading && (
          <div className="autocomplete-spinner">⏳</div>
        )}
        {showGeolocation && (
          <button
            type="button"
            className={`geolocation-icon-btn ${isGeolocating ? 'loading' : ''}`}
            onClick={handleGeolocation}
            disabled={isGeolocating}
            title="Use My Location"
          >
            {isGeolocating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-location-arrow"></i>}
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="autocomplete-dropdown">
            {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="city-icon">
                {suggestion.countryCode ? (
                  <img 
                    src={`https://flagcdn.com/w40/${suggestion.countryCode.toLowerCase()}.png`}
                    srcSet={`https://flagcdn.com/w80/${suggestion.countryCode.toLowerCase()}.png 2x`}
                    width="24"
                    alt={suggestion.country}
                    className="flag-img"
                  />
                ) : (
                  <span>📍</span>
                )}
              </div>
              <div className="city-info">
                <div className="city-name">{suggestion.name}</div>
                <div className="city-location">{suggestion.state && `${suggestion.state}, `}{suggestion.country}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CityAutocomplete;
