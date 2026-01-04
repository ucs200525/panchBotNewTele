// Simple test to verify Swiss modal integration in API

const axios = require('axios');

const testData = {
    city: 'Tadepalligudem',
    date: '04-01-2026',
    lat: 16.8135,
    lng: 81.5217
};

console.log('Testing Panchang API with new Swiss Ephemeris modules...\n');

axios.post('http://localhost:4000/api/panchang', testData)
    .then(response => {
        const data = response.data;

        console.log('✅ API Response received!\n');
        console.log('Tithis:', data.tithis?.length || 0);
        console.log('Nakshatras:', data.nakshatras?.length || 0);
        console.log('Lagnas:', data.lagnas?.length || 0);

        if (data.tithis && data.tithis.length > 0) {
            console.log('\n🌙 First Tithi:');
            console.log(JSON.stringify(data.tithis[0], null, 2));
        }

        if (data.nakshatras && data.nakshatras.length > 0) {
            console.log('\n⭐ First Nakshatra:');
            console.log(JSON.stringify(data.nakshatras[0], null, 2));
        }

        if (data.lagnas && data.lagnas.length > 0) {
            console.log('\n🌅 First Lagna:');
            console.log(JSON.stringify(data.lagnas[0], null, 2));
        }
    })
    .catch(error => {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    });
