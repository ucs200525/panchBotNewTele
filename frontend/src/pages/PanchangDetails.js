import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import TableScreenshot from '../components/TableScreenshot';
import { CityAutocomplete } from '../components/forms';

const PanchangDetails = () => {
    
    const { localCity, localDate, localLat, localLng, setCityAndDate } = useAuth();
    const [city, setCity] = useState(localCity);
    const [date, setDate] = useState(localDate);
    const [lat, setLat] = useState(localLat);
    const [lng, setLng] = useState(localLng);
    
    const [panchangData, setPanchangData] = useState(() => {
        const storedData = localStorage.getItem('panchang_details_data');
        return storedData ? JSON.parse(storedData) : null;
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fetchCity, setfetchCity] = useState(false);
    const [cityError, setCityError] = useState(false);

    useEffect(() => {
        if (panchangData) {
            localStorage.setItem('panchang_details_data', JSON.stringify(panchangData));
        }
    }, [panchangData]);

    useEffect(() => {
        if (city !== localCity || date !== localDate || lat !== localLat || lng !== localLng) {
            setCityAndDate(city, date, lat, lng);
        }
    }, [city, date, lat, lng, localCity, localDate, localLat, localLng, setCityAndDate]);

    const autoGeolocation = async () => {
        alert("Please select a City and Date manually.");
    };
    
    const fetchPanchangFromAPI = (fetchCity, fetchDate, fetchLat, fetchLng) => {
        setLoading(true);
        fetch(`${process.env.REACT_APP_API_URL}/api/getPanchangData?city=${encodeURIComponent(fetchCity)}&date=${fetchDate}&lat=${fetchLat || ''}&lng=${fetchLng || ''}`)
            .then(response => response.json())
            .then(data => {
                setPanchangData(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                setLoading(false);
            });
    };

    const getDetailsData = async () => {
        if (!date) {
            alert("Please select a Date manually.");
            return;
        }

        if (!city) {
            if (navigator.geolocation) {
                setLoading(true);
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const newLat = position.coords.latitude;
                        const newLng = position.coords.longitude;
                        try {
                            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/fetchCityName/${newLat}/${newLng}`);
                            if (!response.ok) throw new Error('Failed to fetch city name');
                            const data = await response.json();
                            
                            setCity(data.cityName);
                            setLat(newLat);
                            setLng(newLng);
                            setCityAndDate(data.cityName, date, newLat, newLng);
                            
                            fetchPanchangFromAPI(data.cityName, date, newLat, newLng);
                        } catch (error) {
                            console.error("Error fetching city from geolocation:", error);
                            alert("Could not determine city from your location. Please enter manually.");
                            setLoading(false);
                        }
                    },
                    (error) => {
                        console.error("Geolocation error:", error);
                        alert("Geolocation failed or permission denied. Please enter city manually.");
                        setLoading(false);
                    }
                );
                return;
            } else {
                alert("Geolocation is not supported by your browser. Please enter City Manually.");
                return;
            }
        }

        fetchPanchangFromAPI(city, date, lat, lng);
    };

    useEffect(() => {
        if (fetchCity) {
            getDetailsData();
            setfetchCity(false);
        }
    }, [fetchCity]);
    
    const checkAndFetchData = async () => {
        if (!date) {
            alert("Please select a Date manually.");
            return;
        }
        setCityError(false);
        await getDetailsData();
    };

    const handleCityChange = (value) => {
        setCity(value);
        setLat(null);
        setLng(null);
        setCityError(false);
    };

    const handleCitySelect = (selectedCity) => {
        setCity(selectedCity.name);
        setLat(selectedCity.lat);
        setLng(selectedCity.lng);
        setCityError(false);
    };

    const handleDateChange = (e) => {
        setDate(e.target.value);
    };

    const renderTable = (title, items, formatRow) => {
        if (!items || items.length === 0) return null;
        return (
            <div style={{ margin: "20px 0" }}>
                <h3 style={{ textAlign: "left", marginBottom: "10px", color: "#2c3e50" }}>{title}</h3>
                <table border="1" cellSpacing="0" cellPadding="5" style={{ width: "100%", textAlign: "left", backgroundColor: "white" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#3498db", color: "white" }}>
                            <th>Name</th>
                            <th>Number / Index</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => formatRow(item, index))}
                    </tbody>
                </table>
            </div>
        );
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return "N/A";
        return new Date(timeStr).toLocaleString('en-IN', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    return (
        <div className="PanchakaMuhurthContent">
            {error && <div className="error-message">{error}</div>}
      
            <div style={{ textAlign: 'center', margin: '20px' }}>
                <h1>Panchang Details (Sunrise to Sunrise)</h1>
                <label className="entercity">Enter City Name:</label>
                <CityAutocomplete
                    value={city}
                    onChange={handleCityChange}
                    onSelect={handleCitySelect}
                    placeholder="Enter city"
                    hasError={cityError}
                />
            </div>
      
            <div style={{ textAlign: "center", margin: "20px" }}>
                <label className="date">Enter Date:</label>
                <input
                    className="enterdate"
                    type="date"
                    value={date}
                    onChange={handleDateChange}
                    style={{
                        padding: "10px",
                        border: "1px solid #cccccc",
                        borderRadius: "5px",
                        fontSize: "16px",
                        margin: "10px 0",
                    }}
                />
            </div>
      
            <div className="cityAndDate">
                <button onClick={checkAndFetchData}>Get Details</button>
            </div>

            {loading && <LoadingSpinner />}

            {panchangData && (
                <div id="muhurats-table" style={{ marginTop: "30px" }}>
                    <h2>Result</h2>
                    <div className="info-inline">
                        <div className="info-inline-item">
                            <strong>City:</strong> {city}
                        </div>
                        <div className="info-inline-item">
                            <strong>Date:</strong> {date}
                        </div>
                        <div className="info-inline-item">
                            <strong>Vara (Day):</strong> {panchangData.vara} (Index: {new Date(date).getDay() + 1})
                        </div>
                        <div className="info-inline-item">
                            <strong>Sunrise:</strong> {panchangData.sunrise}
                        </div>
                        <div className="info-inline-item">
                            <strong>Sunset:</strong> {panchangData.sunset}
                        </div>
                    </div>

                    {renderTable("Tithi", panchangData.tithis, (item, i) => (
                        <tr key={i}>
                            <td>{item.name} {item.paksha ? `(${item.paksha})` : ''}</td>
                            <td>{item.number !== undefined ? item.number + 1 : 'N/A'}</td>
                            <td>{formatTime(item.startTime)}</td>
                            <td>{formatTime(item.endTime)}</td>
                        </tr>
                    ))}

                    {renderTable("Nakshatra", panchangData.nakshatras, (item, i) => (
                        <tr key={i}>
                            <td>{item.name}</td>
                            <td>{item.number !== undefined ? item.number + 1 : 'N/A'}</td>
                            <td>{formatTime(item.startTime)}</td>
                            <td>{formatTime(item.endTime)}</td>
                        </tr>
                    ))}

                    {renderTable("Lagna", panchangData.lagnas, (item, i) => (
                        <tr key={i}>
                            <td>{item.name} {item.symbol}</td>
                            <td>{item.index !== undefined ? item.index + 1 : 'N/A'}</td>
                            <td>{item.startTime}</td>
                            <td>{item.endTime}</td>
                        </tr>
                    ))}
                    
                    <TableScreenshot tableId="muhurats-table" city={city} />
                </div>
            )}
        </div>
    );
};

export default PanchangDetails;
