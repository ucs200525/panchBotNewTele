import React, { useState } from 'react';

const CityAndDateInput = ({ onCityChange, onDateChange, initialCity , initialDate }) => {
  const [city, setCity] = useState(initialCity);
  const [date, setDate] = useState(
    initialDate ||
      (() => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = today.getFullYear();
        return `${day}/${month}/${year}`; // Format: dd/mm/yyyy
      })()
  );

  const handleCityChange = (e) => {
    const newCity = e.target.value;
    setCity(newCity);
    onCityChange(newCity); // Notify parent component
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    onDateChange(newDate); // Notify parent component
  };

  return (
    <div className="cityAndDate">
      <label htmlFor="city">City:</label>
      <input
        type="text"
        id="city"
        placeholder="Enter city"
        value={city}
        onChange={handleCityChange}
      />
      <br />
      <label htmlFor="date">Date (DD/MM/YYYY):</label>
      <input
        type="text"
        id="date"
        placeholder="Enter date"
        value={date}
        onChange={handleDateChange}
      />
      <br />
    </div>
  );
};

export default CityAndDateInput;
