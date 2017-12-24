process.on('unhandledRejection', (reason) => {
    console.log('unhandledRejection', {
    	code: reason.code,
    	message: reason.message,
    	stack: reason.stack,
    });
});

let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/soundman');

let test = require('./api/spotify.js');
test();

let express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	download = require('./api/download.js'),
	routes = require('./api/route.js');

app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }));

// public data 
app.use(express.static('public'));
 
// parse application/json 
app.use(bodyParser.json());

app.use('/', routes);

download();
// Check queue and download every 5 min
setInterval(function() {
	// download();
	// console.log('App running now!');
}, 1000);

app.listen(3000, () => {
	console.log('Started');
});
