import React, { useState } from 'react';
import { PageContainer, PageHeader, Section } from '../components/layout';
import { LoadingSpinner, ErrorMessage } from '../components/common';
import { CityDateForm } from '../components/forms';
import PlanetTable from '../components/planetary/PlanetTable';
import { useAuth } from '../context/AuthContext';

const PlanetaryPage = () => {
    const { localCity, localDate } = useAuth();
    const [planetData, setPlanetData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPlanetData = async (city, date) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/planetary/positions`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ city, date })
                }
            );

            if (!response.ok) throw new Error('Failed to fetch planetary data');
            const data = await response.json();
            setPlanetData(data.planets);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer maxWidth="1000px">
            <PageHeader 
                title="Planetary Positions"
                icon="🪐"
                subtitle="Sidereal positions of celestial bodies"
            />
            
            <CityDateForm 
                initialCity={localCity || ''}
                initialDate={localDate || new Date().toISOString().substring(0, 10)}
                onSubmit={fetchPlanetData}
                showGeolocation={true}
            />

            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
            
            {planetData && (
                <Section title="Planet Positions">
                    <PlanetTable planets={planetData} />
                </Section>
            )}
        </PageContainer>
    );
};

export default PlanetaryPage;
