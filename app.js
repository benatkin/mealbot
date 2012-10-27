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
  app.use(express.errorHandler({dumpExceptions: true}));
});

function getenv(name) {
  var val = process.env[name.toUpperCase()];
  assert.ok(val);
  return val;
}

function log(message, callback) {
  request
    .post(getenv('couch_url'))
    .type('json')
    .send(message)
    .set('Accept', 'application/json')
    .end(function(rres) {
      assert.equal(rres.statusCode, 201);
      callback(null);
    });
}

function recipients(message) {
  var fields = [];
  if (message.to) fields.push(message.to);
  if (message.cc) fields.push(message.cc);
  var people = fields.join(",").trim().split(/\s*,\s*/);
  console.error('emails', emails);
  return emails;
}

function reply(message, callback) {
  request
    .post('https://sendgrid.com/api/mail.send.json')
    .type('form')
    .send({
      api_user: getenv('sendgrid_api_user'),
      api_key: getenv('sendgrid_api_key'),
      to: recipients(message),
      subject: 'Re: ' + message.subject,
      html: '<h1 style="color: red">Coming Soon! For now just go to Chipotle.</h1>',
      from: 'noms@mealbot.json.bz'
    })
    .end(function(res) {
      assert.equal(res.status, 200);
      callback(null);
    });
}

app.post('/email', function(req, res) {
  log(req.body, function() {});
  reply(req.body, function(err) {
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
