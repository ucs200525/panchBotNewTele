const http = require('http');

const url = 'http://127.0.0.1:4000/api/getDrikTableSwiss?city=Vijayawada&date=04/05/2026&goodTimingsOnly=false&lat=16.5061743&lng=80.6480153';

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('LOCAL_OUTPUT_START');
    console.log(data);
    console.log('LOCAL_OUTPUT_END');
  });
}).on('error', (err) => {
  console.error('Error: ' + err.message);
});
