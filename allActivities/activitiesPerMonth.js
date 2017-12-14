// print the # of activities per month
const fs = require('fs');

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'];

console.log('month,activities');

let f = process.argv.slice(2);
fs.readFile(f[0], 'utf8', (err, contents) => {
    let data = JSON.parse(contents);
    // build a map with the # of activities per month
    let r = data.reduce((acc, x) => {
        let d = new Date(x.start_date).getMonth();
        acc[d] = d in acc ? acc[d] + 1 : 1;
        return acc;
    }, {});
    let result = [];
    for (p in r) {
        result.push({month: p, distance: r[p]});
    }
    result.sort((a,b) => (a.month - b.month));
    result.forEach(x => console.log(months[x.month] + ',' + x.distance));
});




