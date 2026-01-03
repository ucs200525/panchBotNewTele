import React, { useState, useEffect } from 'react';
import { findCurrentPeriod } from '../utils/periodHelpers';

const LivePeriodTracker = ({ data, selectedDate }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if selected date is today
  const isToday = () => {
    if (!selectedDate) return true; // If no date provided, assume it's today
    
    const today = new Date();
    const selected = new Date(selectedDate);
    
    return today.getFullYear() === selected.getFullYear() &&
           today.getMonth() === selected.getMonth() &&
           today.getDate() === selected.getDate();
  };

  // Don't render if not viewing today's data
  if (!isToday()) {
    return null;
  }

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
      <div className="live-tracker-compact">
        <div className="tracker-minimal">
          🕐 {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          <span className="no-period">• No active period</span>
        </div>
      </div>
    );
  }

  const remaining = getRemainingTime();
  const progress = getProgressPercentage();
  const nextPeriod = getNextPeriod();

  return (
    <div className="live-tracker-compact">
      {/* Minimal collapsed view */}
      <div 
        className="tracker-minimal" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <div className="minimal-row">
          <span className="time-badge">🕐 {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="period-badge">🔴 {currentPeriod.weekday}</span>
          <span className="countdown-badge">
            ⏱️ {remaining.hours > 0 ? `${remaining.hours}h ` : ''}{remaining.minutes}m
          </span>
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        </div>
        <div className="mini-progress">
          <div className="mini-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Expanded view */}
      {isExpanded && (
        <div className="tracker-expanded">
          <div className="expanded-content">
            <div className="info-row">
              <span className="label">⏰ Period:</span>
              <span className="value">{currentPeriod.startTime} - {currentPeriod.endTime}</span>
            </div>
            {nextPeriod && (
              <div className="info-row">
                <span className="label">⏭️ Next:</span>
                <span className="value">{nextPeriod.weekday} at {nextPeriod.startTime}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LivePeriodTracker;
