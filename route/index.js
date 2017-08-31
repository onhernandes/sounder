var express = require('express'),
	router = express.Router(),
	yt = require('../yt/');

router.use(function(req, res, next) {
	console.log('Soudman accessed at: ' + Date.now());
	next();
});

router.post('/', function(req, res) {
	var post = req.params;
});

router.get('/', function(req, res) {
	res.send('GET ACCESS');
});

module.exports = router;