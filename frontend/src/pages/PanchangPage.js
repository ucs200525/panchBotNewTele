import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, Section } from '../components/layout';
import { LoadingSpinner, ErrorMessage } from '../components/common';
import { CityDateForm } from '../components/forms';
import PanchangInfo from '../components/PanchangInfo';
import { useAuth } from '../context/AuthContext';

const PanchangPage = () => {
    const { localCity, localDate } = useAuth();
    const [panchangData, setPanchangData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPanchangData = async (city, date) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/panchang`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ city, date })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch panchang data');
            }

            const data = await response.json();
            setPanchangData(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching panchang data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer maxWidth="1000px">
            <PageHeader 
                title="Today's Panchanga"
                icon="📅"
                subtitle="Traditional Hindu Calendar"
            />
            
            <CityDateForm 
                initialCity={localCity || ''}
                initialDate={localDate || new Date().toISOString().substring(0, 10)}
                onSubmit={fetchPanchangData}
                showGeolocation={true}
            />

            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
            
            {panchangData && (
                <Section>
                    <PanchangInfo data={panchangData} />
                </Section>
            )}
        </PageContainer>
    );
};

export default PanchangPage;
