var express = require('express')
  , path = require('path')
  , request = require('superagent')
  , assert = require('assert')
  , yelp = require('yelp')
  , sax = require('sax')
  , mimelib = require('mimelib-noiconv');

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


function getRecipients(message) {
  function addRecipients(field) {
    var addresses = mimelib.parseAddresses(field);
    Array.forEach(addresses, function(address) {
      emails.push(address.address);
      names.push(address.name || address.address);
    });
  }

  var emails = [], names = [];
  if (message.to) addRecipients(message.to);
  if (message.cc) addRecipients(message.cc);
  return {emails: emails, names: names};
}

function reply(message, callback) {
  var recipients = getRecipients(message);
  request
    .post('https://sendgrid.com/api/mail.send.json')
    .type('form')
    .send({
      api_user: getenv('sendgrid_api_user'),
      api_key: getenv('sendgrid_api_key'),
      to: recipients.to,
      toname: recipients.toname,
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
  var places = getPlaces("Denver, Colorado", "chinese", function(err, locations) {
    var location = locations[0];
    res.render('map', {"title":"Mealbot Suggestions", places: locations.businesses});
    
  }); // getPlaces
  //console.error(places.city.toString());
});

// function that gets an address, returns list of places based on apis
function getPlaces(location, food, callback) {

  var debug = false;
  console.error("get places");
  var locations = locationEnrichment(location, function(err, geolocations) {
    console.log('list locations');
    if (debug) {
      var len = geolocations.length;
      for(var i = 0; i<len; i++) {
        console.error("location ",i," is ",geolocations[i].address," in ",geolocations[i].state.code)
      }
    }

    getYelpPlaces(geolocations[0].city, geolocations[0].state.name, food, function(err, places) {
      console.error('yelp data is in places: ',places);
      callback(null, places);
    });  

    //callback(null, geolocations);
  
  });
}

function locationEnrichment(location, callback) {
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
      callback(null, locations);
    });
}

function getYelpPlaces(city, state, typeOfFood, callback) {
  var yelpapi  = yelp.createClient({
    consumer_key: getenv('yelp_consumer_key'),
    consumer_secret: getenv('yelp_consumer_secret'),
    token: getenv('yelp_token'),
    token_secret: getenv('yelp_token_secret')
  });

  // See http://www.yelp.com/developers/documentation/v2/search_api
  yelpapi.search({term: typeOfFood + " food", location: city + ", " + state}, function(err, data) {
    if (err) {
      console.log('got an error from yelp', err);
      return callback(err);
    }

    callback(null, data);
  });
}

function getMapQuestPlaces() {
  
}

module.exports = app;
