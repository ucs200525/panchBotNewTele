import React, { useState, useEffect } from 'react';
import './BotPromotion.css';

const BotPromotion = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasBeenShown, setHasBeenShown] = useState(false);

    useEffect(() => {
        const shown = localStorage.getItem('bot_promo_shown');
        if (!shown) {
            setIsVisible(true);
            setHasBeenShown(false);
        } else {
            setHasBeenShown(true);
        }
    }, []);

    const dismissPromo = () => {
        setIsVisible(false);
        localStorage.setItem('bot_promo_shown', 'true');
        setHasBeenShown(true);
    };

    const togglePromo = () => {
        setIsVisible(!isVisible);
    };

    return (
        <div className="bot-promo-wrapper">
            <button 
                className={`bot-info-icon ${isVisible ? 'active' : ''}`} 
                onClick={togglePromo}
                title="Telegram Bot Info"
            >
                ℹ️
                {!hasBeenShown && <span className="notification-dot"></span>}
            </button>

            {isVisible && (
                <div className="bot-promo-card">
                    <div className="bot-promo-header">
                        <span className="bot-icon">🤖</span>
                        <h3>Telegram Bot Available!</h3>
                        <button className="close-btn" onClick={dismissPromo}>&times;</button>
                    </div>
                    <div className="bot-promo-body">
                        <p>Get Panchangam images directly in Telegram with our bot.</p>
                        <ul className="bot-features">
                            <li>✨ Simple search: <strong>@PanchangamBot</strong></li>
                            <li>🖼️ Instant image generation</li>
                            <li>📅 <strong>Schedule Option:</strong> Get required images automatically at your selected time!</li>
                        </ul>
                        <div className="bot-actions">
                            <a 
                                href="https://t.me/PanchangamBot" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="telegram-btn"
                                onClick={dismissPromo}
                            >
                                Open Telegram
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BotPromotion;
