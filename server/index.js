require('newrelic');
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const compression = require('compression');
const redis = require('redis');

const app = express();
const {
  findMostRecent,
  findMostRelevant,
  findFilteredReviews,
  deleteReview,
  addReview,
  updateReview,
} = require("../database/index.js");
const port = process.env.PORT || 3000;
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

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(express.static(__dirname + "/../client/dist"));

// // seed db
// knex.migrate.latest([config]).then(function() {
//   return knex.seed.run();
// });

app.get("/rooms/reviews/recent/", cache, function(req, res) {
  console.log("Inside server for get request");

  let listing_id = req.query.data;

  findMostRecent(listing_id).then(records => {
    console.log("retrieved recent reviews from DB!!!");
    return res.status(200).send(records);
  });
});

app.get("/rooms/reviews/relevant", cache, function(req, res) {
  console.log("Inside server for relevant get request");

  findMostRelevant().then(records => {
    console.log("retrieved relevant reviews from DB!!!");
    return res.status(200).send(records);
  });
});

app.get("/rooms/reviews/filter", function(req, res) {
  console.log("on server side!!!");

  findFilteredReviews(req.query.data).then(records => {
    return res.status(200).send(records);
  });
});

app.post('/rooms/reviews/', function(req, res) {
  let newReview = req.query.data;

  addReview(newReview).then(() => {
    return res.status(200).end();
  })
});

app.put('/rooms/reviews/', function(req, res) {
  let review_id = req.query.data.review_id;
  let column = req.query.data.column;
  let newData = req.query.data.newData;

  updateReview(review_id, column, newData).then(() => {
    return res.end();
  })
});

app.delete('/rooms/reviews/', function(req, res) {
  let review_id = req.query.data.review_id;

  deleteReview(review_id).then(() => {
    return res.end();
  })
});


app.listen(port);
console.log("Listening on port", port);
