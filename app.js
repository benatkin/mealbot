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

function log(message, callback) {
  var couchUrl = process.env.COUCH_URL;
  assert.ok(couchUrl);
  request
    .post(couchUrl)
    .send(message)
    .set('Accept', 'application/json')
    .end(function(rres) {
      assert.equal(rres.statusCode, 201);
      if (callback) callback(null);
    });
}

app.post('/email', function(req, res) {
  log(req.body);
  res.send(200);
});

module.exports = app;
