import React, { useState, useEffect, useRef } from 'react';
import './CityAutocomplete.css';

const CityAutocomplete = ({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Search city...',
  showGeolocation = true
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isGeolocating, setIsGeolocating] = useState(false);

  const wrapperRef = useRef(null);
  const debounceTimer = useRef(null);

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
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://api.geonames.org/searchJSON?name_startsWith=${encodeURIComponent(query)}&maxRows=10&username=ucs05&featureClass=P&orderby=population`
      );
      const data = await response.json();

      if (data.geonames) {
        const formattedSuggestions = data.geonames.map(city => ({
          name: city.name,
          state: city.adminName1 || '',
          country: city.countryName,
          fullName: `${city.name}, ${city.adminName1 ? city.adminName1 + ', ' : ''}${city.countryName}`,
          lat: city.lat,
          lng: city.lng
        }));
        setSuggestions(formattedSuggestions);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      setSuggestions([]);
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

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      fetchCitySuggestions(newValue);
    }, 300);
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
          alert('Could not determine city from location');
        } finally {
          setIsGeolocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Could not get your location');
        setIsGeolocating(false);
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
              <span className="city-icon">📍</span>
              <div className="city-info">
                <div className="city-name">{suggestion.name}</div>
                <div className="city-location">{suggestion.state && `${suggestion.state}, `}{suggestion.country}</div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showGeolocation && (
        <button
          type="button"
          className="geolocation-btn"
          onClick={handleGeolocation}
          disabled={isGeolocating}
        >
          <span className="geo-icon">📍</span>
          {isGeolocating ? 'Locating...' : 'Use My Location'}
        </button>
      )}
    </div>
  );
};

export default CityAutocomplete;
