const redis = require('redis');
const client = redis.createClient();

client.on('connect', () => {
  console.log('Conectado ao Redis');
});

function setCache(key, value) {
  client.set(key, JSON.stringify(value), 'EX', 3600);  
}

function getCache(key, callback) {
  client.get(key, (err, data) => {
    if (err) throw err;
    callback(JSON.parse(data));
  });
}

module.exports = { setCache, getCache };
