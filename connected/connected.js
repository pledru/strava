const fs = require('fs');
const https = require('https');
const sleep = require('system-sleep');

const followers = '/api/v3/athletes/:id/followers?page=';
const friends = '/api/v3/athletes/:id/friends?page=';

let f = process.argv.slice(2);
let from = parseInt(f[0]);
let to = parseInt(f[1]);

var options = {
    host: 'www.strava.com',
    port: 443,
    method: 'GET',
    headers: { 'Authorization': 'Bearer <ACCESS_TOKEN>' }
};

class Queue {
    constructor() {
        this.values = [];
    }
    enqueue(v) {
        this.values.push(v);
    }
    dequeue() {
        return this.values.shift();
    }
    isEmpty() {
        return (this.values.length == 0);
    }
}

class Node {
    constructor(id, parent) {
        this.id = id;
        this.parent = parent;
    }
    path() {
        let r = [this.id];
        let p = this.parent;
        while (p != null) {
            r.push(p.id);
            p = p.parent;
        }
        return r.reverse();
    }
}

let queue = new Queue();
let visited = new Set();

let all = [];
let mode = 'followers';

function reset() {
    all = [];
    mode = 'followers';
}

function load(path, node, page) {
  options.path = path.replace(':id', node.id);
  options.path += page;
  console.log(options.path);
  let req = https.request(options, (resp) => {
      if (resp.statusCode == 403) {
          console.log('waiting...');
          sleep(10*60*1000);
          reset();
          load(path, node, page);
          return;
      }

      visited.add(node.id);
      let data = '';
  
      resp.on('data', d => { data += d; });

      resp.on('end', () => {
          let d = JSON.parse(data);
          if (d.length == 0) {
              if (mode == 'followers') {
                  mode = 'friends';
                  loadFriends(node, 1);
              } else {
                  // remove duplicate ids
                  ids = Array.from(all.reduce((acc, x) => {
                      acc.add(x.id);
                      return acc;
                  }, new Set()));
                  reset();
                  for (var i = 0; i < ids.length; i++) {
                      if (ids[i] == to) {
                          let path = new Node(ids[i], node).path();
                          console.log('PATH: ' + path);
                          return;
                      }
                      queue.enqueue(new Node(ids[i], node));
                  }
                  loadAthlete();
              }
              return;
          }
          for (var i = 0; i < d.length; i++) {
              all.push(d[i]);
          }
          load(path, node, page+1);
      });
  }).on('socket', (socket) => {
      socket.setTimeout(10000);  
      socket.on('timeout', () => { req.abort(); });
  }).on('error', (e) => {
      console.log(e);
  });
  req.end();
}

function loadFollowers(node, page) {
    load(followers, node, page);
}

function loadFriends(node, page) {
    load(friends, node, page);
}

function loadAthlete() {
    while (!queue.isEmpty()) {
        let node = queue.dequeue();
        if (!visited.has(node.id)) {
            console.log('ID: ' + node.id);
            loadFollowers(node, 1);
            break;
        }
    }
}

queue.enqueue(new Node(from, null));
loadAthlete();

