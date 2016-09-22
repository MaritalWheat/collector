var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    getUrls = require('get-urls'),
    twilio = require('twilio');

//store URLs in memory for now, since only care about last unseen
var sessionURLs = [];

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

//used as webhook for Twilio
app.post('/sms', function(req, res) {
  var bodyText = req.body.Body;
  var urlsObtained = getUrls(bodyText);

  if(urlsObtained[0]){
     sessionURLs.push(urlsObtained[0]);
     return;
  }

  if (req.body.Body.indexOf('Collecto Bot') == -1) {
    return;
  }

  var twilio = require('twilio');
  var twiml = new twilio.TwimlResponse();

  if (req.body.Body == 'Collecto Bot') {
     twiml.message('Hi!');
  } else if(req.body.Body == 'Collecto Bot Read') {
     var output = 'Reading...URLs are: \n';
     var index = 0;

     while (sessionURLs[index]) {
       if (sessionURLs[index + 1]) {
         output = output + sessionURLs[index] + '\n';
       } else {
         output = output + sessionURLs[index];
       }
       index = index + 1;
     }
     sessionURLs = [];
     twiml.message(output);
  }

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});
