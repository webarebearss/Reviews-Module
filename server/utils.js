const redis = require('redis');

const client = redis.createClient();

const cache = (req,res,next) => {
  let key = '__express__' + req.originalUrl || req.url;
  client.get(key, (err, cachedBody) => {
    if(cachedBody) {
      res.send(JSON.parse(cachedBody));
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        client.setex(key, 45, JSON.stringify(body));
        res.sendResponse(body);
      }
      next();
    }
  })
}

exports.module = cache;