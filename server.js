// server.js
// where your node app starts
var database_uri = "mongodb+srv://fredjoya:mongoose@cluster0.3tamr.mongodb.net/Cluster0?retryWrites=true&w=majority";
// init project
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var bodyParser = require("body-parser");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var shortid = require("shortid");

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
const { response } = require('express');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204


//mongoose.connect(process.env.DB_URI)
mongoose.connect(database_uri, {
  useNewUrlParser: true, 
  useUnifiedTopology: true
});



// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


app.get("/timestamp", function (req, res) {
  res.sendFile(__dirname + '/views/timestamp.html');
});

app.get("/url-shortener", function (req, res) {
  res.sendFile(__dirname + '/views/url-shortener.html');
});

app.get("/exercise-tracker", function (req, res) {
  res.sendFile(__dirname + '/views/exercise-tracker.html');
});

let responseObject = {}
app.enable("trust proxy")
app.get("/api/whoami", function (req, res) {
  responseObject["ipaddress"] = req.ip
  responseObject["language"] = req.get("Accept-Language")
  responseObject["software"] = req.get("user-agent")
  res.json(responseObject)
});



// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.get("/api/", function(req, res) {

  var now = new Date()
  res.json({
    "unix": now.getTime(),
    "utc": now.toUTCString()
  });
});


app.get("/api/:date_string", function (req, res) {
  let dateString = req.params.date_string
  let passedInValue = new Date(dateString);
  

if (parseInt(dateString) > 10000) {
  let unixTime = new Date(parseInt(dateString));
res.json({
    "unix": unixTime.getTime(),
    "utc": unixTime.toUTCString()
  });
}



if (passedInValue == "Invalid Date") {
res.json({"error": "Invalid Date"});
} else {
  res.json({
    "unix": passedInValue.getTime(),
    "utc": passedInValue.toUTCString()
  })
}
});

 
var ShortURL = mongoose.model('ShortURL', new mongoose.Schema({ 
  short_url: String,
  original_url: String,
  suffix: String
}));

app.use(bodyParser.urlencoded({ extended: false}))

app.use(bodyParser.json())


  app.post("/api/shorturl", function (req, res) {
    
    let client_req_url = req.body.url
    let suffix = shortid.generate();
    let newShortURL = suffix
    console.log(suffix, "this will be suffix");
    let newURL = ShortURL({
      short_url: __dirname + "/api/shorturl/" + suffix,
      original_url: client_req_url,
      suffix: suffix
    })
    newURL.save(function(err, doc) {
    if (err) return console.error(err);
    res.json({
    "saved": true,
    "short_url": newURL.short_url,
    "original_url": newURL.original_url,
    "suffix": newURL.suffix
    });
  });
});

app.get("/api/shorturl/:suffix", function (req, res) {
  let userGenSuffix = req.params.suffix;
  ShortURL.find({suffix: userGenSuffix}).then(function(foundUrls) {
  let urlForRedirect = foundUrls[0];

  res.redirect(urlForRedirect.original_url);
  });
    // res.json({
    //   "userGenSuffix": userGenSuffix,
    //   "userReqUrl": userReqUrl
    // })
  });
 

// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
