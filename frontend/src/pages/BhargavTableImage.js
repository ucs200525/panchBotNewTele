import React, { useState } from 'react';
import './PanchakaMuhurth.css';

const BhargavTableImage = () => {
    const [city, setCity] = useState('');
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showNonBlue, setShowNonBlue] = useState(true);
    const [is12HourFormat, setIs12HourFormat] = useState(true);

    const handleDownload = async () => {
        try {
            setLoading(true);
            setError(null);

            // Convert date format if needed
            const [year, month, day] = date.split('-');
            const formattedDate = `${year}-${month}-${day}`;

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/getBharagvTable-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    city,
                    date: formattedDate,
                    showNonBlue,
                    is12HourFormat 
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate image');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bhargav-panchang-${city}-${formattedDate}.png`;
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
        <div className="container">
            <div className="form-container">
                <h2>Download Bhargav Panchang Image</h2>
                <div className="input-group">
                    <label>City:</label>
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter city name"
                    />
                </div>
                <div className="input-group">
                    <label>Date:</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
                <div className="input-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            checked={showNonBlue}
                            onChange={(e) => setShowNonBlue(e.target.checked)}
                        />
                        Show Non-Blue Timings
                    </label>
                </div>
                <div className="input-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            checked={is12HourFormat}
                            onChange={(e) => setIs12HourFormat(e.target.checked)}
                        />
                        Use 12-Hour Format
                    </label>
                </div>
                <button 
                    className="submit-btn"
                    onClick={handleDownload}
                    disabled={loading || !city || !date}
                >
                    {loading ? 'Generating...' : 'Download Image'}
                </button>
                {error && <div className="error">{error}</div>}
            </div>
        </div>
    );
};

export default BhargavTableImage;
