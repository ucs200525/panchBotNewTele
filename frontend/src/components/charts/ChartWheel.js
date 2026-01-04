import React from 'react';
import './ChartWheel.css';

/**
 * South Indian Style Chart Component
 */
const ChartWheel = ({ houses, title, lagnaRashi }) => {
    if (!houses || !Array.isArray(houses)) {
        return (
            <div className="chart-error">
                <p>No chart data available</p>
            </div>
        );
    }

    // Mapping house index to South Indian grid positions (4x4)
    // 0: Meena, 1: Mesha, 2: Vrishabha, 3: Mithuna
    // 11: Kumbha,           4: Karka
    // 10: Makara,           5: Simha
    // 9: Dhanu, 8: Vrishchika, 7: Kanya, 6: Tula
    // Standard South Indian chart starts with Mesha at top second from left

    const gridLayout = [
        { rashi: 'Meena', index: 11, pos: [0, 0] },
        { rashi: 'Mesha', index: 0, pos: [0, 1] },
        { rashi: 'Vrishabha', index: 1, pos: [0, 2] },
        { rashi: 'Mithuna', index: 2, pos: [0, 3] },
        { rashi: 'Karka', index: 3, pos: [1, 3] },
        { rashi: 'Simha', index: 4, pos: [2, 3] },
        { rashi: 'Kanya', index: 5, pos: [3, 3] },
        { rashi: 'Tula', index: 6, pos: [3, 2] },
        { rashi: 'Vrishchika', index: 7, pos: [3, 1] },
        { rashi: 'Dhanu', index: 8, pos: [3, 0] },
        { rashi: 'Makara', index: 9, pos: [2, 0] },
        { rashi: 'Kumbha', index: 10, pos: [1, 0] }
    ];

    return (
        <div className="chart-wheel-container">
            <h3>{title}</h3>
            <div className="south-indian-grid">
                {/* 12 houses */}
                {gridLayout.map((cell, i) => {
                    const houseData = houses.find(h => h.rashiIndex === cell.index);
                    const isLagna = cell.rashi === lagnaRashi;

                    return (
                        <div
                            key={i}
                            className="chart-cell"
                            style={{
                                gridRow: cell.pos[0] + 1,
                                gridColumn: cell.pos[1] + 1
                            }}
                        >
                            <div className="cell-rashi-name">{cell.rashi}</div>
                            {isLagna && <div className="cell-lagna-mark">ASC (As)</div>}
                            <div className="cell-planets">
                                {houseData?.planets?.map((p, pi) => (
                                    <span key={pi} className="planet-name">{p.substring(0, 2)}</span>
                                ))}
                            </div>
                        </div>
                    );
                })}
                {/* Center Title */}
                <div className="chart-center">
                    <div className="center-title">{title}</div>
                </div>
            </div>
        </div>
    );
};

export default ChartWheel;
