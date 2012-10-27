var express = require('express')
  , path = require('path')
  , request = require('superagent')
  , assert = require('assert'),
  , async = require('async');

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
  var emails = message.envelope.from;
  if (Array.isArray(message.envelope.to)) {
    for (var i=0; i < message.envelope.to.length; i++) {
      var email = message.envelope.to[i];
      if (email.toLowerCase().indexOf('mealbot.json.bz') == -1) {
        emails.push(email);
      }
    }
  }
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
  var places = getPlaces("Denver, Colorado", "chinese", function(err, locations) {
    console.error(places);

  });
  //console.error(places.city.toString());
});

// function that gets an address, returns list of places based on apis
function getPlaces(location, food) {

  console.error("get places");
  var locations = locationEnrichment(location, function(err, geolocations) {
    console.log('list locations');
    var len = geolocations.length;
    for(var i = 0; i<len; i++) {
      console.error("location ",i," is ",geolocations[i].address," in ",geolocations[i].state.code)
    }

    callback(null, geolocations);
  
  });
}

function locationEnrichment(location) {
  // enrich location data using full contact api
  var fcKey = "scrubbed";
  var address = '', city = '', state = '';
  var locations = [];
  request
    .get('https://api.fullcontact.com/v2/address/locationEnrichment.json')
    .query({'place': encodeURI(location)})
    .query({'apiKey': fcKey})
    .set('Accept', 'application/json')
    .end(function(rres) {
      assert.equal(rres.statusCode, 200);
      console.error("Found ",rres.body.locations.length," locations");
      //console.error('done');
      locations = rres.body.locations;
    });

  console.error('request is async');
  callback(null, locations);

}

function getYelpPlaces() {

}

function getMapQuestPlaces() {
  
}

function getYellowPagesPlaces() {

}

function getIngredients() {

}
module.exports = app;
