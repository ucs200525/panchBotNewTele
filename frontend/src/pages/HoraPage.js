import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, Section } from '../components/layout';
import { LoadingSpinner, ErrorMessage } from '../components/common';
import { CityDateForm } from '../components/forms';
import { useAuth } from '../context/AuthContext';
import './HoraPage.css';

const HoraPage = () => {
    const { localCity, localDate } = useAuth();
    const [horaData, setHoraData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHoraData = async (city, date) => {
        setIsLoading(true);
        setError(null);
        try {
            // Get coordinates first
            const geoResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/fetchCoordinates/${city}`);
            if (!geoResponse.ok) throw new Error('Could not find city');
            const coords = await geoResponse.json();

            // Fetch Hora data
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lagna/hora`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    date, 
                    lat: coords.lat, 
                    lng: coords.lng 
                })
            });

            if (!response.ok) throw new Error('Failed to fetch Hora data');
            const data = await response.json();
            setHoraData(data.horas);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (timeObj) => {
        if (!timeObj) return '--:--';
        try {
            const date = new Date(timeObj);
            if (isNaN(date.getTime())) return '--:--';
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return '--:--';
        }
    };

    const dayHoras = horaData ? horaData.filter(h => h.type === 'Day') : [];
    const nightHoras = horaData ? horaData.filter(h => h.type === 'Night') : [];

    return (
        <PageContainer maxWidth="1000px">
            <PageHeader 
                title="Hora (Planetary Hours)"
                icon="⌛"
                subtitle="24 planetary hours of the day"
            />
            
            <CityDateForm 
                initialCity={localCity || ''}
                initialDate={localDate || new Date().toISOString().substring(0, 10)}
                onSubmit={fetchHoraData}
                showGeolocation={true}
            />

            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
            
            {horaData && (
                <div className="hora-grid">
                    <Section title="Day Horas" icon="☀️">
                        <div className="hora-table">
                            {dayHoras.map((hora, idx) => (
                                <div key={idx} className="hora-row">
                                    <div className="hora-index">{hora.index}</div>
                                    <div className="hora-lord">{hora.lord}</div>
                                    <div className="hora-time">
                                        {formatTime(hora.start)} - {formatTime(hora.end)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section title="Night Horas" icon="🌙">
                        <div className="hora-table">
                            {nightHoras.map((hora, idx) => (
                                <div key={idx} className="hora-row">
                                    <div className="hora-index">{hora.index}</div>
                                    <div className="hora-lord">{hora.lord}</div>
                                    <div className="hora-time">
                                        {formatTime(hora.start)} - {formatTime(hora.end)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>
            )}
        </PageContainer>
    );
};

export default HoraPage;
