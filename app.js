var express = require('express'),
	app = express(),
	routes = require('./api/route.js');


app.use('/', routes);

app.listen(3000, function () {
	console.log('Started');
});