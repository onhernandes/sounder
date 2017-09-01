var express = require('express'),
	router = express.Router(),
	yt = require('./yt.js'),
	t = require('./download.js'),
	mongoose = require('mongoose'),
	Music = require('./schema.js');

mongoose.connect('mongodb://localhost/soundman');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

router.post('/api/', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	
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

	if (has === false) { res.end(JSON.stringify({error: 'must have at leats url parameter'})); }

	var m = new Music(post);

	m.save(err => {
		if (err) { console.log('Error adding: ' + post.url, err); }
		console.log('Saving');
		res.end(JSON.stringify({status: 'created, will be downloaded soon'}));
	});
});

// search
router.get('/api/search/', (req, res) => {
	Music.find({})
	 .then(found => {
	 	res.end(JSON.stringify(found));
	 })
	 .catch(err => console.log(err));
});

router.get('/', (req, res) => {
	t('pending');
	res.end();
});

module.exports = router;