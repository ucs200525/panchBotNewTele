import React, { useState } from 'react';
import { PageContainer, PageHeader, Section } from '../components/layout';
import { LoadingSpinner, ErrorMessage } from '../components/common';
import { CityDateForm } from '../components/forms';
import { useAuth } from '../context/AuthContext';
import './DashaPage.css';

const DashaPage = () => {
    const { localCity, localDate } = useAuth();
    const [dashaData, setDashaData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [birthTime, setBirthTime] = useState('12:00');

    const fetchDashaData = async (city, date) => {
        setIsLoading(true);
        setError(null);
        try {
            const geoResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/fetchCoordinates/${city}`);
            if (!geoResponse.ok) throw new Error('Could not find city');
            const coords = await geoResponse.json();

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/dasha/vimshottari`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date,
                    time: birthTime,
                    lat: coords.lat,
                    lng: coords.lng
                })
            });

            if (!response.ok) throw new Error('Failed to fetch Dasha data');
            const data = await response.json();
            setDashaData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <PageContainer maxWidth="1000px">
            <PageHeader 
                title="Vimshottari Dasha"
                icon="⏳"
                subtitle="120-year planetary period system"
            />
            
            <div className="dasha-form-container">
                <CityDateForm 
                    initialCity={localCity || ''}
                    initialDate={localDate || new Date().toISOString().substring(0, 10)}
                    onSubmit={fetchDashaData}
                    showGeolocation={true}
                />
                
                <div className="time-input-group">
                    <label htmlFor="birth-time-dasha" className="time-label">Birth Time</label>
                    <input
                        id="birth-time-dasha"
                        type="time"
                        value={birthTime}
                        onChange={(e) => setBirthTime(e.target.value)}
                        className="time-input"
                    />
                </div>
            </div>

            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
            
            {dashaData && dashaData.mahadashas && (
                <Section title="Mahadasha Periods">
                    <div className="dasha-table">
                        {dashaData.mahadashas.map((dasha, idx) => (
                            <div key={idx} className="dasha-row">
                                <div className="dasha-planet">{dasha.planet}</div>
                                <div className="dasha-period">
                                    {formatDate(dasha.start)} - {formatDate(dasha.end)}
                                </div>
                                <div className="dasha-duration">{dasha.years} years</div>
                            </div>
                        ))}
                    </div>
                </Section>
            )}
        </PageContainer>
    );
};

export default DashaPage;
