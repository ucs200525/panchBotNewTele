import React, { useState } from 'react';
import { PageContainer, PageHeader, Section } from '../components/layout';
import { LoadingSpinner, ErrorMessage, Card } from '../components/common';
import { CityDateForm } from '../components/forms';
import ChartWheel from '../components/charts/ChartWheel';
import { useAuth } from '../context/AuthContext';
import './ChartsPage.css';

const ChartsPage = () => {
    const { localCity, localDate } = useAuth();
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [birthTime, setBirthTime] = useState('12:00');

    const fetchChartData = async (city, date) => {
        setIsLoading(true);
        setError(null);
        try {
            const geoResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/fetchCoordinates/${city}`);
            if (!geoResponse.ok) throw new Error('Could not find city');
            const coords = await geoResponse.json();

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/charts/details`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date,
                    time: birthTime,
                    lat: coords.lat,
                    lng: coords.lng
                })
            });

            if (!response.ok) throw new Error('Failed to fetch chart data');
            const data = await response.json();
            console.log('Chart API Response:', data); // Debug log
            setChartData(data);
        } catch (err) {
            console.error('Chart fetch error:', err); // Debug log
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer maxWidth="1200px">
            <PageHeader 
                title="Divisional Charts"
                icon="📊"
                subtitle="Vedic astrology chart calculator"
            />
            
            <div className="chart-form-container">
                <CityDateForm 
                    initialCity={localCity || ''}
                    initialDate={localDate || new Date().toISOString().substring(0, 10)}
                    onSubmit={fetchChartData}
                    showGeolocation={true}
                />
                
                <div className="time-input-group">
                    <label htmlFor="birth-time" className="time-label">Birth Time</label>
                    <input
                        id="birth-time"
                        type="time"
                        value={birthTime}
                        onChange={(e) => setBirthTime(e.target.value)}
                        className="time-input"
                    />
                </div>
            </div>

            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
            
            {chartData && (
                <>
                    <Section title="Rasi Chart (D1)" icon="🔮">
                        <Card>
                            <ChartWheel 
                                houses={chartData.rasiChart?.houses} 
                                title="D1 - Rasi" 
                                lagnaRashi={chartData.rasiChart?.lagnaRashi} 
                            />
                        </Card>
                    </Section>

                    <Section title="Navamsa Chart (D9)" icon="✨">
                        <Card>
                            <ChartWheel 
                                houses={chartData.navamsaChart?.houses} 
                                title="D9 - Navamsa" 
                                lagnaRashi={chartData.navamsaChart?.lagnaRashi} 
                            />
                        </Card>
                    </Section>

                    {chartData.dasamsa && (
                        <Section title="Dasamsa Chart (D10)" icon="💼">
                            <Card>
                                <ChartWheel 
                                    houses={chartData.dasamsa?.houses} 
                                    title="D10 - Dasamsa" 
                                    lagnaRashi={chartData.dasamsa?.lagnaRashi} 
                                />
                            </Card>
                        </Section>
                    )}
                </>
            )}
        </PageContainer>
    );
};

export default ChartsPage;
