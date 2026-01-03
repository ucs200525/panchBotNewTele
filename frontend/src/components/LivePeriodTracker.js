import React, { useState, useEffect } from 'react';
import { findCurrentPeriod } from '../utils/periodHelpers';

const LivePeriodTracker = ({ data }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPeriod, setCurrentPeriod] = useState(null);

  // Real-time clock - updates every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Update current period whenever time or data changes
  useEffect(() => {
    if (data && data.length > 0) {
      const period = findCurrentPeriod(data, currentTime);
      setCurrentPeriod(period);
    }
  }, [currentTime, data]);

  // Calculate remaining time
  const getRemainingTime = () => {
    if (!currentPeriod) return null;
    
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const remainingMinutes = currentPeriod.end - now;
    
    return {
      hours: Math.floor(remainingMinutes / 60),
      minutes: remainingMinutes % 60,
      totalMinutes: remainingMinutes
    };
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!currentPeriod) return 0;
    
    const duration = currentPeriod.end - currentPeriod.start;
    const elapsed = (currentTime.getHours() * 60 + currentTime.getMinutes()) - currentPeriod.start;
    
    return Math.min(100, Math.max(0, (elapsed / duration) * 100));
  };

  // Get next period preview
  const getNextPeriod = () => {
    if (!currentPeriod || !data || data.length === 0) return null;
    
    // Simple next period logic - can be enhanced
    const nextIndex = currentPeriod.index < data.length - 1 ? currentPeriod.index + 1 : 0;
    const nextRow = data[nextIndex];
    
    if (!nextRow) return null;
    
    return {
      weekday: nextRow.weekday,
      startTime: currentPeriod.column === 'period1' ? nextRow.start2 : (data[nextIndex + 1] || data[0]).start1
    };
  };

  // Don't render if no current period
  if (!currentPeriod) {
    return (
      <div className="live-status-card" style={{ background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' }}>
        <div className="clock">{currentTime.toLocaleTimeString('en-US')}</div>
        <p style={{ textAlign: 'center', opacity: 0.9 }}>
          No active period right now. Check the table for upcoming periods.
        </p>
      </div>
    );
  }

  const remaining = getRemainingTime();
  const progress = getProgressPercentage();
  const nextPeriod = getNextPeriod();

  return (
    <div className="live-status-card">
      {/* Real-time clock */}
      <div className="clock">{currentTime.toLocaleTimeString('en-US')}</div>
      
      {/* Current period information */}
      <div className="current-period-info">
        <h3>🔴 Current Period</h3>
        <p className="period-name">{currentPeriod.weekday}</p>
        <p className="time-range">
          {currentPeriod.startTime} - {currentPeriod.endTime}
        </p>
        
        {/* Countdown timer */}
        {remaining && (
          <div className="countdown">
            <span className="time-remaining">
              ⏱️ {remaining.hours > 0 ? `${remaining.hours}h ` : ''}
              {remaining.minutes}m remaining
            </span>
            
            {/* Progress bar */}
            <div className="progress-bar" title={`${Math.round(progress)}% complete`}>
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Next period preview */}
      {nextPeriod && (
        <div className="next-period-preview">
          <h4>⏭️ Up Next</h4>
          <p>
            <strong>{nextPeriod.weekday}</strong><br/>
            Starts at {nextPeriod.startTime}
          </p>
        </div>
      )}
    </div>
  );
};

export default LivePeriodTracker;
