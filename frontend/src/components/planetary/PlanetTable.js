import React from 'react';

const PlanetTable = ({ planets }) => {
    if (!planets) return null;

    return (
        <div className="panchang-table">
            <div className="panchang-row" style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                <div className="panchang-label">Body</div>
                <div className="panchang-value" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 80px' }}>
                    <span>Rashi</span>
                    <span>Longitude</span>
                    <span>Speed</span>
                    <span>Status</span>
                </div>
            </div>
            {planets.map((planet, index) => (
                <div key={index} className="panchang-row">
                    <div className="panchang-label">
                        {planet.name === 'Sun' ? '☀️' : 
                         planet.name === 'Moon' ? '🌙' : 
                         planet.name === 'Mars' ? '🔴' : 
                         planet.name === 'Mercury' ? '🔸' : 
                         planet.name === 'Jupiter' ? '🟡' : 
                         planet.name === 'Venus' ? '⚪' : 
                         planet.name === 'Saturn' ? '🪐' : '🔘'} {planet.name}
                    </div>
                    <div className="panchang-value" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 80px' }}>
                        <span>{planet.rashi}</span>
                        <span>{planet.formatted}</span>
                        <span>{planet.speed.toFixed(4)}°/day</span>
                        <span>
                            {planet.isRetrograde ? 
                                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>[R]</span> : 
                                <span style={{ color: '#22c55e' }}>Direct</span>
                            }
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PlanetTable;
