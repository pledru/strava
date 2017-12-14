// print the # of activities per month
const fs = require('fs');

console.log('day\thour\tvalue');

let f = process.argv.slice(2);
fs.readFile(f[0], 'utf8', (err, contents) => {
    let data = JSON.parse(contents);
    // build a map with the # of activities per day and hour
    let r = data.reduce((acc, x) => {
        let d = new Date(x.start_date_local);
        day = d.getUTCDay();
        hour = d.getUTCHours();
        if (acc[day] != undefined) {
            let h = acc[day];
            if (h[hour] != undefined) {
                h[hour] = h[hour] + 1;
            } else {
                h[hour] = 1;
            }
        } else {
            let h = {};
            h[hour] = 1;
            acc[day] = h;
        }
        return acc;
    }, {});

    for (p in r) {
        let hours = r[p];
        for (h in hours) {
            console.log((parseInt(p)+1) + '\t' + (parseInt(h)+1) + '\t' + hours[h]);
        }
    }
});




