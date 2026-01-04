import React, { useState } from 'react';
import Button from '../../common/Button/Button';
import './CityDateForm.css';

const CityDateForm = ({ 
  initialCity = '', 
  initialDate = new Date().toISOString().substring(0, 10),
  onSubmit,
  showGeolocation = true
}) => {
  const [city, setCity] = useState(initialCity);
  const [date, setDate] = useState(initialDate);
  const [isGeolocating, setIsGeolocating] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city && date && onSubmit) {
      onSubmit(city, date);
    }
  };

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
          setCity(data.cityName);
          setIsGeolocating(false);
        } catch (error) {
          console.error('Error fetching city:', error);
          alert('Could not determine city from location');
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
    <form className="city-date-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city-input" className="form-label">City</label>
          <input
            id="city-input"
            type="text"
            className="form-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date-input" className="form-label">Date</label>
          <input
            id="date-input"
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-actions">
        <Button type="submit" variant="primary" fullWidth>
          Get Panchanga
        </Button>
        {showGeolocation && (
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleGeolocation}
            disabled={isGeolocating}
            icon="📍"
          >
            {isGeolocating ? 'Locating...' : 'Use My Location'}
          </Button>
        )}
      </div>
    </form>
  );
};

export default CityDateForm;
