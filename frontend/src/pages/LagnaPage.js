import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, Section } from '../components/layout';
import { LoadingSpinner, ErrorMessage } from '../components/common';
import { CityDateForm } from '../components/forms';
import { useAuth } from '../context/AuthContext';
import './LagnaPage.css';

const LagnaPage = () => {
    const { localCity, localDate } = useAuth();
    const [lagnaData, setLagnaData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchLagnaData = async (city, date) => {
        setIsLoading(true);
        setError(null);
        try {
            // Get Panchang data which includes lagnas
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/panchang`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ city, date })
            });

            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            setLagnaData(data.lagnas);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '--:--';
        if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
        try {
            const date = new Date(timeStr);
            if (isNaN(date.getTime())) return timeStr;
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return timeStr;
        }
    };

    return (
        <PageContainer maxWidth="900px">
            <PageHeader 
                title="Lagna (Ascendant) Timings"
                icon="🌅"
                subtitle="Daily ascendant sign transitions"
            />
            
            <CityDateForm 
                initialCity={localCity || ''}
                initialDate={localDate || new Date().toISOString().substring(0, 10)}
                onSubmit={fetchLagnaData}
                showGeolocation={true}
            />

            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
            
            {lagnaData && lagnaData.length > 0 && (
                <Section>
                    <div className="lagna-table">
                        {lagnaData.map((lagna, idx) => (
                            <div key={idx} className="lagna-row">
                                <div className="lagna-sign">
                                    <span className="lagna-symbol">{lagna.symbol}</span>
                                    <span className="lagna-name">{lagna.name}</span>
                                </div>
                                <div className="lagna-time">
                                    {formatTime(lagna.startTime)} - {formatTime(lagna.endTime)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '1rem', fontStyle: 'italic' }}>
                        ℹ️ Lagna duration varies by latitude and date. Not fixed 2-hour blocks.
                    </p>
                </Section>
            )}
        </PageContainer>
    );
};

export default LagnaPage;
