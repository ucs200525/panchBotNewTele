const { planetary } = require('./backend/swisseph');

// Check Moon position on Aug 21, 2004
const startDate = new Date('2004-08-21T06:00:00Z'); // 11:30 AM IST
const moonPos = planetary.getPlanetPosition(startDate, 1);
console.log('2004-08-21 Moon Longitude:', moonPos.siderealLongitude);
console.log('2004-08-21 Nakshatra:', Math.floor(moonPos.siderealLongitude / (360 / 27)));
