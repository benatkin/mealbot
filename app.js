var express = require('express')
  , path = require('path')
  , request = require('superagent')
  , assert = require('assert');

var app = express();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.post('/email', function(req, res) {
  var couchUrl = process.env.COUCH_URL;
  assert.ok(couchUrl);
  request
    .post(couchUrl)
    .send(req.body)
    .set('Accept', 'application/json')
    .end(function(rres) {
      assert.equal(rres.statusCode, 201);
      res.send(200);
    });
});

app.get('/', function(req, res) {
  console.error('index loaded');
  res.render('index', {"title":"Welcome to Mealbot!"});
});

app.get('/map', function(req, res) {
  console.error('render map');
  res.render('map', {"title":"MapQuest sample"});
});

module.exports = app;
