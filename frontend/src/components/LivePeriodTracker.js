import React, { useState, useEffect } from 'react';
import { findCurrentPeriod } from '../utils/periodHelpers';

const LivePeriodTracker = ({ data, selectedDate }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Calculate remaining time
  const getRemainingTime = () => {
    if (!currentPeriod) return null;

    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    let remainingMinutes;

    // Handle overnight periods (end time is on next day)
    if (currentPeriod.end < currentPeriod.start) {
      // Period crosses midnight
      // If we're past midnight (now < start), calculate from now to end
      // If we're before midnight (now >= start), calculate from now to midnight + end
      if (now < currentPeriod.end) {
        remainingMinutes = currentPeriod.end - now;
      } else {
        remainingMinutes = (24 * 60 - now) + currentPeriod.end;
      }
    } else {
      // Normal same-day period
      remainingMinutes = currentPeriod.end - now;
    }

    return {
      hours: Math.floor(remainingMinutes / 60),
      minutes: remainingMinutes % 60,
      totalMinutes: remainingMinutes
    };
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!currentPeriod) return 0;

    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    let duration, elapsed;

    // Handle overnight periods
    if (currentPeriod.end < currentPeriod.start) {
      duration = (24 * 60 - currentPeriod.start) + currentPeriod.end;
      if (now < currentPeriod.end) {
        elapsed = (24 * 60 - currentPeriod.start) + now;
      } else {
        elapsed = now - currentPeriod.start;
      }
    } else {
      duration = currentPeriod.end - currentPeriod.start;
      elapsed = now - currentPeriod.start;
    }

    return Math.min(100, Math.max(0, (elapsed / duration) * 100));
  };

  // Get next period preview
  const getNextPeriod = () => {
    if (!currentPeriod || !data || data.length === 0) return null;

    // Find next row
    const currentIndex = currentPeriod.index;
    const nextIndex = currentIndex < data.length - 1 ? currentIndex + 1 : 0;
    const nextRow = data[nextIndex];

    if (!nextRow) return null;

    // For Panchaka Muhurth format
    if (nextRow.time) {
      const timeParts = nextRow.time.split(' to ');
      return {
        weekday: nextRow.muhurat || nextRow.category || '',
        startTime: timeParts[0] || ''
      };
    }

    // For Bhargava Panchang format
    if (currentPeriod.column === 'period1' && nextRow.start2) {
      return {
        weekday: nextRow.weekday,
        startTime: nextRow.start2
      };
    } else if (currentPeriod.column === 'period2') {
      const nextNextIndex = nextIndex < data.length - 1 ? nextIndex + 1 : 0;
      const nextNextRow = data[nextNextIndex];
      return {
        weekday: nextNextRow?.weekday || '',
        startTime: nextNextRow?.start1 || ''
      };
    }

    return null;
  };

  // Don't render if no current period
  if (!currentPeriod) {
    return (
      <div className="live-tracker-compact">
        <div className="tracker-minimal">
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          <span className="no-period">• No active period</span>
        </div>
      </div>
    );
  }

  const remaining = getRemainingTime();
  const progress = getProgressPercentage();
  const nextPeriod = getNextPeriod();

  // Determine tracker state color
  let statusClass = 'status-normal';
  if (currentPeriod.isColored) statusClass = 'status-ashubh';
  if (currentPeriod.isWednesdayColored) statusClass = 'status-special';

  return (
    <div className={`live-tracker-premium ${statusClass}`}>
      <div className="tracker-main-row">
        <div className="tracker-left">
          <div className="live-pulse"></div>
          <span className="current-time">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="tracker-center">
          <span className="period-title">{currentPeriod.weekday}</span>
          <span className="time-remaining">
            {remaining.totalMinutes}m left
          </span>
        </div>

        <div className="tracker-right">
          <i className="fas fa-chart-line expand-icon"></i>
        </div>
      </div>

      <div className="tracker-progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="tracker-details">
        <div className="detail-item">
          <span className="detail-label">Today's Period</span>
          <span className="detail-value">{currentPeriod.startTime} - {currentPeriod.endTime}</span>
        </div>

        {nextPeriod && (
          <div className="detail-item">
            <span className="detail-label">Coming Up Next</span>
            <span className="detail-value">{nextPeriod.weekday} at {nextPeriod.startTime}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePeriodTracker;
