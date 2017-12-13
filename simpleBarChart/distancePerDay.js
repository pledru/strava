// print distances per day
const fs = require('fs');

console.log('date,distance');

let f = process.argv.slice(2);
fs.readFile(f[0], 'utf8', (err, contents) => {
    let data = JSON.parse(contents);
    // build a map to sum the distances within the same day
    let r = data.reduce((acc, x) => {
        let d = new Date(x.start_date).toDateString();
        let dist = parseInt(x.distance) / 1000;
        acc[d] = d in acc ? acc[d] + dist : dist;
        return acc;
    }, {});
    let result = [];
    for (p in r) {
        result.push({start_date: new Date(p), distance: r[p]});
    }
    result.sort((a,b) => (a.start_date - b.start_date));
    result.forEach(x => console.log(x.start_date.toDateString() + ',' + x.distance));
});




