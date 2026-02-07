const { planetary } = require('./backend/swisseph');
const birthDate = new Date('2005-12-25T06:35:00Z'); // 12:05 PM IST
const moonPos = planetary.getPlanetPosition(birthDate, 1);
console.log('Moon Sidereal Longitude:', moonPos.siderealLongitude);
console.log('Moon Rashi:', moonPos.rashi);
console.log('Ayanamsa:', moonPos.siderealLongitude - moonPos.longitude);
