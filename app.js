
process.on('unhandledRejection', (reason) => {
    console.log('Reason: ' + reason);
});

var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	download = require('./api/download.js'),
	routes = require('./api/route.js');

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json 
app.use(bodyParser.json());

app.use('/', routes);

/*download();
// Check queue and download every 5 min
setInterval(function() {
	download();
}, 50000);*/

app.listen(3000, () => {
	console.log('Started');
});