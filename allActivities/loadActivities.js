// retrieve all the activities of the given user (non private):
// see: https://strava.github.io/api/v3/activities/

const https = require('https');

var options = {
    host: 'www.strava.com',
    port: 443,
    path: '/api/v3/athlete/activities',
    method: 'GET',
    headers: { 'Authorization': 'Bearer <ACCESS_TOKEN>' }
};

let all = [];
function load(before) {
  if (before) {
      options.path = '/api/v3/athlete/activities?before=' + before;
  } 
  var req = https.request(options, function(resp) {
      let data = '';
  
      resp.on('data', (d) => { data += d; });

      resp.on('end', () => {
          let d = JSON.parse(data);
          for (var i = 0; i < d.length; i++) {
              all.push(d[i]);
          }
          let last_date = new Date(d[d.length-1].start_date);
          // it seems activities are retrieved by block of 30.
          // if we get less we assume we reached the end
          if (d.length < 30) {
              let s = JSON.stringify(all);
              console.log(s);
              return;
          }
          let last_time = (last_date.getTime() / 1000);
          load(last_time);
      });
  });
  req.end();
}

load();
