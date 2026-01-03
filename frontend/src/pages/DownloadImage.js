import React, { useState } from 'react';
import './PanchakaMuhurth.css';

const DownloadImage = () => {
    const [city, setCity] = useState('');
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showNonBlue, setShowNonBlue] = useState(true);  // default to true
    const [is12HourFormat, setIs12HourFormat] = useState(true); // default to true

    const handleDownload = async () => {
        try {
            setLoading(true);
            setError(null);

            // Now make the image request with all required data
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/combine-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    city, 
                    date,
                    showNonBlue,
                    is12HourFormat
                }),
            });

            if (!response.ok) {
                console.log("Response status:", response.status);
                console.log("Response status text:", response.statusText);
                throw new Error('Failed to generate image');
            }

            // Convert response to blob
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `combined-data-${city}-${date}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err) {
            console.error("Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="download-image-container">
            <h2>Download Combined Muhurat Image</h2>
            <div className="form-group">
                <label htmlFor="city">City:</label>
                <input
                    type="text"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city name"
                />
            </div>
            <div className="form-group">
                <label htmlFor="date">Date:</label>
                <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>
            <button 
                className="download-btn"
                onClick={handleDownload}
                disabled={loading || !city || !date}
            >
                {loading ? 'Generating...' : 'Download Image'}
            </button>
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default DownloadImage;

