// Live period tracker utility functions
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || timeStr.trim() === '') return null;
  
  // Remove date suffix if present (e.g., ", Jan 04")
  let cleanTime = timeStr.split(',')[0].trim();
  
  const parts = cleanTime.trim().split(' ');
  if (parts.length !== 2) return null;
  
  const [time, period] = parts;
  const [hoursStr, minutesStr] = time.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  
  if (isNaN(hours) || isNaN(minutes)) return null;
  
  // Convert to 24-hour format
  const normalizedPeriod = period.toUpperCase();
  if (normalizedPeriod === 'PM' && hours !== 12) hours += 12;
  if (normalizedPeriod === 'AM' && hours === 12) hours = 0;
  
  let totalMinutes = hours * 60 + minutes;
  
  // If the original string had a date (next day), add 24 hours
  if (timeStr.includes(',')) {
    totalMinutes += 24 * 60;
  }
  
  return totalMinutes;
};

export const findCurrentPeriod = (data, currentTime) => {
  if (!data || data.length === 0) return null;
  
  const now = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    // For Panchaka Muhurth format: "06:34 AM to 07:24 AM" or "10:46 PM to 12:50 AM, Jan 04"
    if (row.time) {
      const timeParts = row.time.split(' to ');
      if (timeParts.length === 2) {
        const start = parseTimeToMinutes(timeParts[0]);
        const end = parseTimeToMinutes(timeParts[1]);
        
        if (start !== null && end !== null) {
          // Handle overnight periods
          if (end > 24 * 60) {
            // Period crosses midnight
            if (now >= start || now < (end - 24 * 60)) {
              return {
                index: i,
                column: 'time',
                start: start,
                end: end > 24 * 60 ? end - 24 * 60 : end, // Normalize for display
                startTime: timeParts[0],
                endTime: timeParts[1],
                weekday: row.muhurat || row.category || ''
              };
            }
          } else {
            // Normal period within same day
            if (now >= start && now < end) {
              return {
                index: i,
                column: 'time',
                start: start,
                end: end,
                startTime: timeParts[0],
                endTime: timeParts[1],
                weekday: row.muhurat || row.category || ''
              };
            }
          }
        }
      }
    }
    
    // For Bhargava Panchang format: start1/end1 and start2/end2
    const start1 = parseTimeToMinutes(row.start1);
    const end1 = parseTimeToMinutes(row.end1);
    
    if (start1 !== null && end1 !== null && now >= start1 && now < end1) {
      return { 
        index: i, 
        column: 'period1', 
        start: start1, 
        end: end1,
        startTime: row.start1,
        endTime: row.end1,
        weekday: row.weekday,
        isColored: row.isColored,
        isWednesdayColored: row.isWednesdayColored
      };
    }
    
    const start2 = parseTimeToMinutes(row.start2);
    const end2 = parseTimeToMinutes(row.end2);
    
    if (start2 !== null && end2 !== null && now >= start2 && now < end2) {
      return { 
        index: i, 
        column: 'period2', 
        start: start2, 
        end: end2,
        startTime: row.start2,
        endTime: row.end2,
        weekday: row.weekday,
        isColored: row.isColored,
        isWednesdayColored: row.isWednesdayColored
      };
    }
    // For Swiss calculation format: start and end fields
    if (row.start && row.end) {
      const start = parseTimeToMinutes(row.start);
      const end = parseTimeToMinutes(row.end);

      if (start !== null && end !== null) {
        // Handle overnight periods
        if (end > 24 * 60) {
          if (now >= start || now < (end - 24 * 60)) {
            return {
              index: i,
              column: 'swiss',
              start: start,
              end: end > 24 * 60 ? end - 24 * 60 : end,
              startTime: row.start,
              endTime: row.end,
              weekday: row.muhurat || row.category || '',
              category: row.category
            };
          }
        } else {
          // Normal period within same day
          if (now >= start && now < end) {
            return {
              index: i,
              column: 'swiss',
              start: start,
              end: end,
              startTime: row.start,
              endTime: row.end,
              weekday: row.muhurat || row.category || '',
              category: row.category
            };
          }
        }
      }
    }
  }
  
  return null;
};
