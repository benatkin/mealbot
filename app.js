var express = require('express')
  , path = require('path')
  , request = require('superagent')
  , assert = require('assert')
  , async = require('async')
  , yelp = require('yelp')
  , sax = require('sax');

var strict = true, 
    parser = sax.parser(strict);

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

function findEmails(emails, field) {
  if (Array.isArray(field)) {
    for (var i=0; i < field.length; i++) {
      var email = field[i];
      if (email.toLowerCase().indexOf('mealbot.json.bz') == -1) {
        emails.push(email);
      }
    }
  }
}

function recipients(message) {
  var envelope = typeof message.envelope == 'string'
                 ? JSON.parse(message.envelope)
                 : message.envelope
    , emails = Array.isArray(envelope.from)
               ? envelope.from.slice()
               : [envelope.from];
  findEmails(emails, envelope.to);
  findEmails(emails, envelope.cc);
  console.error('envelope', envelope);
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
  var places = getPlaces("Denver, Colorado", "chinese", function(err, locations) {
    var location = locations[0];
    
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
    });  

    callback(null, geolocations);
  
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

  console.error('request is async');

}

function getYelpPlaces(city, state, typeOfFood, callback) {
  var yelpapi  = yelp.createClient({
    consumer_key: "akqqN2r0exZiFtHjavVxpA", 
    consumer_secret: "scrubbed",
    token: "AC9JsQ3rcVxeVyX8LJjwaVVYJrsoSjuE",
    token_secret: "scrubbed"
  });

  // See http://www.yelp.com/developers/documentation/v2/search_api
  yelpapi.search({term: typeOfFood + " food", location: city + ", " + state}, function(error, data) {
    console.log('yelp errors: ',
      error);
    //console.log(data);
    callback(null, data);
  });
}

function getLiquorJoints() {
  parser.onerror = function (e) {
    // an error happened.
  };
  parser.ontext = function (t) {
    // got some text.  t is the string of text.
    console.error('text ',t);
  };
  parser.onopentag = function (node) {
    // opened a tag.  node has "name" and "attributes"
    console.error('node ', node.name)
  };
  parser.onattribute = function (attr) {
    // an attribute.  attr has "name" and "value"
  };
  parser.onend = function () {
    // parser stream is done, and ready to have more stuff written to it.
    console.error('write more xml please')
  };

  parser.write('<xml>Hello, <who name="world">world</who>!</xml>').close();

}

function getMapQuestPlaces() {
  
}

function getYellowPagesPlaces() {

}

function getIngredients() {

}
module.exports = app;
