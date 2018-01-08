const fs = require('fs');
const geolib = require('geolib');
const request = require('request');

const path = 'https://maps.googleapis.com/maps/api/geocode/json?address=<address>&key=<key>';

let addresses = ['Boulder, CO', 'Broomfield, CO'];

const getLatLong = function(address) {
    let url = path;
    url = url.replace('<address>', encodeURIComponent(address));
    url = url.replace('<key>', '<KEY>');

    return new Promise((resolve, reject) => {
        var req = request(url, (err, resp, body) => {
            let d = JSON.parse(body);
            let p = {
                latitude: d.results[0].geometry.location.lat,
                longitude: d.results[0].geometry.location.lng,
            };
            resolve(p);
        });
    });
}

async function getAll(addresses) {
    const p1 = await getLatLong(addresses[0]);
    const p2 = await getLatLong(addresses[1]);
    return [p1, p2];
}

const getActivities = function() {
    return getAll(addresses).then(p => {
        return new Promise((resolve, reject) => {
            fs.readFile('all.json', 'utf8', (err, contents) => {
                let all = [];
                let activities = JSON.parse(contents);
                activities.forEach(activity => { 
                    if (activity.commute) return;
                    if (activity.start_latlng == null || activity.end_latlng == null) return;
                    let start = {
                        latitude: activity.start_latlng[0],
                        longitude: activity.start_latlng[1]
                    };
                    let end = {
                        latitude: activity.end_latlng[0],
                        longitude: activity.end_latlng[1]
                    };
                    let dist1 = geolib.getDistance(p[0], start);
                    let dist2 = geolib.getDistance(p[1], end);
                    if (dist1 < 1000 && dist2 < 1000)  all.push(activity);
                });
                resolve(all);
            });
        });
    });
}

async function process() {
    return await getActivities();
}

process().then(activities => {
    activities.forEach(activity => console.log(activity.id));
});

