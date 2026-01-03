// Live period tracker utility functions
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || timeStr.trim() === '') return null;
  
  const parts = timeStr.trim().split(' ');
  if (parts.length !== 2) return null;
  
  const [time, period] = parts;
  const [hoursStr, minutesStr] = time.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  
  if (isNaN(hours) || isNaN(minutes)) return null;
  
  // Convert to 24-hour format
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
};

export const findCurrentPeriod = (data, currentTime) => {
  if (!data || data.length === 0) return null;
  
  const now = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    // Check period 1 (Start1-End1)
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
        weekday: row.weekday
      };
    }
    
    // Check period 2 (Start2-End2)
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
        weekday: row.weekday
      };
    }
  }
  
  return null;
};
