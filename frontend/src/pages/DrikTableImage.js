import React, { useState } from 'react';
import './PanchakaMuhurth.css';

const DrikTableImage = () => {
    const [city, setCity] = useState('');
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [goodTimingsOnly, setGoodTimingsOnly] = useState(true);

    const handleDownload = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/getDrikTable-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    city, 
                    date,
                    goodTimingsOnly 
                }),
            });

            if (!response.ok) throw new Error('Failed to generate image');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `drik-panchang-${city}-${date}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <h2>Download Drik Panchang Image</h2>
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
                            checked={goodTimingsOnly}
                            onChange={(e) => setGoodTimingsOnly(e.target.checked)}
                        />
                        Show Good Timings Only
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

export default DrikTableImage;
