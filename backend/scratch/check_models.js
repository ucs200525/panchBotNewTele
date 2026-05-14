const https = require('https');

const options = {
  hostname: 'openrouter.ai',
  path: '/api/v1/models',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const freeModels = parsed.data
        .filter(m => m.pricing && m.pricing.prompt === "0" && m.pricing.completion === "0")
        .map(m => ({ id: m.id, name: m.name }));
      
      console.log('--- CURRENT FREE MODELS ---');
      console.log(JSON.stringify(freeModels, null, 2));
    } catch (e) {
      console.error('Error parsing response:', e.message);
      console.log('Raw data snippet:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();
