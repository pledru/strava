const https = require('https');

var options = {
    host: 'www.strava.com',
    port: 443,
    path: '/api/v3/athlete/activities',
    method: 'GET',
    headers: { 'Authorization': 'Bearer <ACCESS_TOKEN>' }
};

var req = https.request(options, function(resp) {
    let data = '';
    resp.on('data', (d) => { data += d; });
    resp.on('end', () => { console.log(data); });
});

req.end();


