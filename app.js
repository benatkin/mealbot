var express = require('express')
  , path = require('path')
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
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.post('/email', function(req, res) {
  console.error('email request');
  console.error(req.body);
  res.send(200);
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
