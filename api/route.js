var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	logger = require('./logger.js'),
	Music = require('./schema.js');

mongoose.connect('mongodb://localhost/soundman');

var db = mongoose.connection;

router.post('/api/', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	logger.log('info', 'API accessed');
	
	var post = req.body,
		basic = ['title', 'url', 'author', 'album', 'cover'],
		has = false;

	// simpliest (and dirty? idk) way to check and validate for parameters
	Object.keys(post).forEach(key => {
		// 'url' is essential
		if (key == 'url') { has = true; }

		// remove any either unused or not allowed parameters
		if (basic.indexOf(key) == -1) {
			delete post[key];
		}
	});

	if (has === false) { logger.log('error', 'Invalid data on accessing API'); res.end(JSON.stringify({error: 'must have at leats url parameter'})); }

	var m = new Music(post);

	m.save(err => {
		if (err) { logger.log('error', 'Error on writing music to db', [err, post.url]); }
		logger.log('info', 'Music inserted');
		res.end(JSON.stringify({status: 'created, will be downloaded soon'}));
	});
});

module.exports = router;