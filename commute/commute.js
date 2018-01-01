const axios = require("axios");
const fs = require("fs");
const geolib = require("geolib");
const path = 'https://maps.googleapis.com/maps/api/geocode/json?address=<address>&key=<key>';

let addresses = process.argv.slice(2);

function getLatLong(address1, address2, func) {
    let url1 = path;
    url1 = url1.replace('<address>', encodeURIComponent(address1));
    url1 = url1.replace('<key>', '<KEY>');

    let url2 = path;
    url2 = url2.replace('<address>', encodeURIComponent(address2));
    url2 = url2.replace('<key>', '<KEY>');

    axios.all([
        axios.get(url1),
        axios.get(url2)
    ])
    .then(axios.spread((resp1, resp2) => {
        let data1 = resp1.data;
        let data2 = resp2.data;
        let p1 = {
            latitude: data1.results[0].geometry.location.lat,
            longitude: data1.results[0].geometry.location.lng,
        };
        let p2 = {
            latitude: data2.results[0].geometry.location.lat,
            longitude: data2.results[0].geometry.location.lng,
        };
        func(p1, p2);
    }));
}

const verify = function(p1, p2) {
    fs.readFile('all.json', 'utf8', (err, contents) => {
        let activities = JSON.parse(contents);
        activities.forEach(activity => {
           if (activity.start_latlng != null && activity.end_latlng != null) {
               let start = {
                   latitude: activity.start_latlng[0],
                   longitude: activity.start_latlng[1]
               };
               let end = {
                   latitude: activity.end_latlng[0],
                   longitude: activity.end_latlng[1]
               };
               // house to office
               let to1 = geolib.getDistance(p1, start);
               let to2 = geolib.getDistance(p2, end);
               // office to house
               let from1 = geolib.getDistance(p1, end);
               let from2 = geolib.getDistance(p2, start);
               if (!activity.commute) {
                   // assume less than 1000 meter is a match
                   // should be configurable, same as the hidden locations in the user interface
                   if ((to1 < 1000 && to2 < 1000) || (from1 < 1000 && from2 < 1000)) {
                       console.log("Activity: " + activity.id + " Commute: " + activity.commute);
                   }
               }
           }
        });
    });
}

getLatLong(addresses[0], addresses[1], verify);
