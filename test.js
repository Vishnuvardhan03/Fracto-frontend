const http = require('http');

http.get('http://localhost:5209/api/doctor', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.log("Raw Output:", data);
    }
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
