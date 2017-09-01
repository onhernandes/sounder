var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	teste = require('./api/download.js'),
	routes = require('./api/route.js');

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json 
app.use(bodyParser.json());

app.use('/', routes);

app.listen(3000, () => {
	console.log('Started');
});