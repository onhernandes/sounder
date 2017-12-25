process.on('unhandledRejection', (reason) => {
    console.log('unhandledRejection', {
    	code: reason.code,
    	message: reason.message,
    	stack: reason.stack,
    });
});

let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/soundman');

let express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
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

app.listen(3000, () => {
	console.log('Started');
});
