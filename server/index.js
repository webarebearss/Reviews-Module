require('newrelic');
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const compression = require('compression');

// const cache = require('./utils.js');
const app = express();
const {
  findMostRecent,
  findMostRelevant,
  findFilteredReviews,
  deleteReview,
  addReview,
  updateReview,
} = require("../database/index.js");
const port = process.env.PORT || 3003;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(express.static(__dirname + "/../client/dist", { maxAge: 31536000 }));

app.get("/rooms/reviews/recent/", function(req, res) {
  console.log("Inside server for get request");

  let listing_id = req.query.data;

  findMostRecent(listing_id).then(records => {
    console.log("retrieved recent reviews from DB!!!");
    return res.status(200).send(records);
  });
});

app.get("/rooms/reviews/relevant", function(req, res) {
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
