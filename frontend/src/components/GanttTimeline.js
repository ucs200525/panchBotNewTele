import React, { useState, useEffect } from 'react';
import './GanttTimeline.css';

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  
  // Strip leading/trailing spaces, then strip date prefixes like " May 7 , " from next-day times
  // Backend produces: " May 7 , 12:05 AM" (note leading space)
  const stripped = timeStr.trim().replace(/^[A-Za-z]+ \d+\s*,\s*/, '').trim();
  
  const cleanStr = stripped.toUpperCase();
  const isPM = cleanStr.includes('PM');
  const isAM = cleanStr.includes('AM');
  const timeOnly = cleanStr.replace(/[AP]M/, '').trim();
  const parts = timeOnly.split(':');
  if (parts.length < 2) return null;
  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) return null;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

export const GanttTimeline = ({ data = [], selectedDate, showNonBlueOnly = false }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentTimePercent, setCurrentTimePercent] = useState(null);

  // Activity filter rules
  // Excludes or highlights categories based on activity selected
  const filterRules = {
    all: () => true,
    home: (category = '', name = '') => {
      const cat = String(category).toLowerCase();
      const nm = String(name).toLowerCase();
      
      const isGoodCat = cat.includes('good') || cat.includes('auspicious') || cat.includes('favorable') || cat.includes('timing');
      const isDangerCat = cat.includes('danger') || cat.includes('risk') || cat.includes('bad') || cat.includes('evil');

      const isTelugu = /[\u0C00-\u0C7F]/.test(nm);

      if (isTelugu) {
        const isTeluguHome = nm.includes('భూలాభ') || nm.includes('గృహ') || nm.includes('వాహన') || nm.includes('సౌఖ్యం') || nm.includes('లాభం') || nm.includes('అభీష్టసిద్ధి') || nm.includes('గో లాభ') || nm.includes('వస్త్ర') || nm.includes('ధనలాభ') || nm.includes('పూజ్యత') || nm.includes('సన్మానం') || nm.includes('అనుగ్రహం');
        const isTeluguDanger = nm.includes('కార్యహాని') || nm.includes('హాని') || nm.includes('భంగం') || nm.includes('నాశ') || nm.includes('నష్టం') || nm.includes('కష్టం') || nm.includes('దుఃఖ') || nm.includes('భయ') || nm.includes('పీడ') || nm.includes('కలహ') || nm.includes('ప్రమాదం') || nm.includes('మృత్య');
        
        return isTeluguHome && !isTeluguDanger;
      } else {
        if (nm.includes('mrityu') || nm.includes('roga') || nm.includes('agni') || nm.includes('raja') || nm.includes('chora')) return false;
        return isGoodCat && !isDangerCat;
      }
    },
    business: (category = '', name = '') => {
      const cat = String(category).toLowerCase();
      const nm = String(name).toLowerCase();

      const isGoodCat = cat.includes('good') || cat.includes('auspicious') || cat.includes('favorable') || cat.includes('timing');
      const isDangerCat = cat.includes('danger') || cat.includes('risk') || cat.includes('bad') || cat.includes('evil');

      const isTelugu = /[\u0C00-\u0C7F]/.test(nm);

      if (isTelugu) {
        const isTeluguBusiness = nm.includes('ధన') || nm.includes('లాభ') || nm.includes('సిద్ధి') || nm.includes('జయం') || nm.includes('విజయం') || nm.includes('ఉద్యోగ') || nm.includes('వ్యాపార') || nm.includes('వ్యవహార') || nm.includes('మిత్ర');
        const isTeluguDanger = nm.includes('కష్టం') || nm.includes('నష్టం') || nm.includes('భంగం') || nm.includes('హాని') || nm.includes('శత్రు') || nm.includes('చోర') || nm.includes('కలహ') || nm.includes('బంధనం') || nm.includes('భయం');
        
        return isTeluguBusiness && !isTeluguDanger;
      } else {
        if (nm.includes('chora') || nm.includes('mrityu') || nm.includes('roga')) return false;
        return isGoodCat && !isDangerCat;
      }
    },
    travel: (category = '', name = '') => {
      const cat = String(category).toLowerCase();
      const nm = String(name).toLowerCase();

      const isGoodCat = cat.includes('good') || cat.includes('auspicious') || cat.includes('favorable') || cat.includes('timing');
      const isDangerCat = cat.includes('danger') || cat.includes('risk') || cat.includes('bad') || cat.includes('evil');

      const isTelugu = /[\u0C00-\u0C7F]/.test(nm);

      if (isTelugu) {
        const isTeluguTravel = nm.includes('ప్రయాణ') || nm.includes('యాత్రా');
        const isTeluguDanger = nm.includes('నష్టం') || nm.includes('నాశ') || nm.includes('కష్టం') || nm.includes('భయ') || nm.includes('ప్రమాదం') || nm.includes('భంగ');
        
        return isTeluguTravel && !isTeluguDanger;
      } else {
        if (nm.includes('mrityu') || nm.includes('roga') || nm.includes('chora')) return false;
        return isGoodCat && !isDangerCat;
      }
    },
    health: (category = '', name = '') => {
      const cat = String(category).toLowerCase();
      const nm = String(name).toLowerCase();

      const isGoodCat = cat.includes('good') || cat.includes('auspicious') || cat.includes('favorable') || cat.includes('timing');
      const isDangerCat = cat.includes('danger') || cat.includes('risk') || cat.includes('bad') || cat.includes('evil');

      const isTelugu = /[\u0C00-\u0C7F]/.test(nm);

      if (isTelugu) {
        const isTeluguHealth = nm.includes('ఆరోగ్య') || nm.includes('భోజనం') || nm.includes('సౌఖ్యం') || nm.includes('సుఖ') || nm.includes('రోగనాశ');
        const isTeluguDanger = nm.includes('పీడ') || nm.includes('జ్వర') || nm.includes('మృత్యు') || nm.includes('విష') || nm.includes('రోగ') || nm.includes('స్పోటక') || nm.includes('దుఃఖ') || nm.includes('కలహ');
        
        return isTeluguHealth && !isTeluguDanger;
      } else {
        if (nm.includes('roga') || nm.includes('mrityu') || nm.includes('disease')) return false;
        return isGoodCat && !isDangerCat;
      }
    }
  };

  // Track current time position if selected date is today
  useEffect(() => {
    const updateTime = () => {
      if (!selectedDate) return;
      const todayStr = new Date().toISOString().substring(0, 10);
      if (selectedDate === todayStr) {
        const now = new Date();
        const minutes = now.getHours() * 60 + now.getMinutes();
        const percent = (minutes / 1440) * 100;
        setCurrentTimePercent(percent);
      } else {
        setCurrentTimePercent(null);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [selectedDate]);

  if (!data || data.length === 0) return null;

  // Transform data into timeline segments
  const segments = [];
  data.forEach((item, index) => {
    if (!item.time || !item.time.includes(' to ')) return;
    const [startStr, endStr] = item.time.split(' to ');
    const startMinutes = parseTimeToMinutes(startStr);
    const endMinutes = parseTimeToMinutes(endStr);

    // Skip if either time couldn't be parsed
    if (startMinutes === null || endMinutes === null) return;

    const isMatch = filterRules[activeFilter](item.category, item.muhurat);

    // If the parent page is in "Good Timings Only" mode, additionally grey out danger/risk blocks
    const isGoodCategory = !item.category.toLowerCase().includes('danger') && !item.category.toLowerCase().includes('risk');
    const finalMatch = isMatch && (showNonBlueOnly ? isGoodCategory : true);

    if (endMinutes < startMinutes) {
      // Crosses midnight: split into two segments
      // First part: from startMinutes to end of day (1440)
      segments.push({
        ...item,
        id: `${index}-1`,
        start: startMinutes,
        end: 1440,
        startPercent: (startMinutes / 1440) * 100,
        widthPercent: ((1440 - startMinutes) / 1440) * 100,
        isMatch: finalMatch
      });
      // Second part: from 0 (midnight) to endMinutes (next day early hours)
      segments.push({
        ...item,
        id: `${index}-2`,
        start: 0,
        end: endMinutes,
        startPercent: 0,
        widthPercent: (endMinutes / 1440) * 100,
        isMatch: finalMatch
      });
    } else {
      segments.push({
        ...item,
        id: index.toString(),
        start: startMinutes,
        end: endMinutes,
        startPercent: (startMinutes / 1440) * 100,
        widthPercent: ((endMinutes - startMinutes) / 1440) * 100,
        isMatch: finalMatch
      });
    }
  });

  // Category Color Map
  const getSegmentColor = (category, isMatch) => {
    if (!isMatch) return '#cbd5e1'; // Greyed out if not matching active filter
    const cat = category.toLowerCase();
    if (cat.includes('good') || cat.includes('favorable')) return '#10b981'; // Green
    if (cat.includes('danger')) return '#ef4444'; // Red
    if (cat.includes('risk')) return '#f59e0b'; // Amber
    if (cat.includes('bad') || cat.includes('disease')) return '#8b5cf6'; // Violet/Purple
    if (cat.includes('evil')) return '#64748b'; // Slate Grey
    return '#3b82f6'; // Blue default
  };

  const getCategoryLabelClass = (category) => {
    const cat = category.toLowerCase();
    if (cat.includes('good')) return 'label-good';
    if (cat.includes('danger')) return 'label-danger';
    if (cat.includes('risk')) return 'label-risk';
    return 'label-neutral';
  };

  // Hour markers for horizontal guide
  const hourMarkers = Array.from({ length: 25 }, (_, i) => i);

  return (
    <div className="gantt-timeline-card">
      <h3 className="gantt-title">Interactive Auspicious Visual Timeline</h3>
      
      {/* Activity Filter Badges */}
      <div className="activity-filters">
        <span className="filter-title">Filter by Activity:</span>
        <div className="filter-pills">
          <button 
            className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            📊 All
          </button>
          <button 
            className={`filter-pill ${activeFilter === 'home' ? 'active' : ''}`}
            onClick={() => setActiveFilter('home')}
          >
            🏠 Home Purchase
          </button>
          <button 
            className={`filter-pill ${activeFilter === 'business' ? 'active' : ''}`}
            onClick={() => setActiveFilter('business')}
          >
            💼 Business Setup
          </button>
          <button 
            className={`filter-pill ${activeFilter === 'travel' ? 'active' : ''}`}
            onClick={() => setActiveFilter('travel')}
          >
            ✈️ Travel
          </button>
          <button 
            className={`filter-pill ${activeFilter === 'health' ? 'active' : ''}`}
            onClick={() => setActiveFilter('health')}
          >
            🩺 Medical & Health
          </button>
        </div>
      </div>

      {/* Main Timeline Viewport */}
      <div className="timeline-container">
        {/* Horizontal Grid Markers */}
        <div className="timeline-grid">
          {hourMarkers.map(hour => (
            <div 
              key={hour} 
              className="grid-line" 
              style={{ left: `${(hour / 24) * 100}%` }}
            >
              {hour % 2 === 0 && (
                <span className={`grid-hour ${hour === 0 ? 'first-hour' : hour === 24 ? 'last-hour' : ''}`}>
                  {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour === 24 ? '12 AM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Stacked Interactive Blocks */}
        <div className="timeline-track">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className="timeline-block"
              style={{
                left: `${segment.startPercent}%`,
                width: `${segment.widthPercent}%`,
                backgroundColor: getSegmentColor(segment.category, segment.isMatch),
                opacity: segment.isMatch ? 1 : 0.4
              }}
            >
              <div className="timeline-tooltip">
                <div className="tooltip-header">
                  <span className="tooltip-name">{segment.muhurat}</span>
                  <span className={`tooltip-badge ${getCategoryLabelClass(segment.category)}`}>
                    {segment.category}
                  </span>
                </div>
                <div className="tooltip-time">⏱️ {segment.time}</div>
              </div>
            </div>
          ))}

          {/* Glowing Current Time Bar */}
          {currentTimePercent !== null && (
            <div 
              className="current-time-indicator" 
              style={{ left: `${currentTimePercent}%` }}
              title="Current Time"
            >
              <div className="indicator-glow"></div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="timeline-legend">
        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#10b981' }}></span> Good / Auspicious</div>
        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span> Danger / Warning</div>
        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span> Risk / Fire</div>
        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></span> Health Risk</div>
        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#cbd5e1' }}></span> Filtered / Inactive</div>
      </div>
    </div>
  );
};
