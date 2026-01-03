import React from 'react';

const CityAndDateInput = ({ city, setCity, date, setDate, getMuhuratData }) => {
    return (
        <div className="cityAndDate">
            <label htmlFor="city">City:</label>
            <input
                type="text"
                id="city"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
            />
            <br />
            <label htmlFor="date">Date (DD/MM/YYYY):</label>
            <input
                type="text"
                id="date"
                placeholder="Enter date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />
            <br />
            <button onClick={getMuhuratData}>Get Muhurat</button>
        </div>
    );
};

export default CityAndDateInput;
