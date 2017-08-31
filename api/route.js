var express = require('express'),
	router = express.Router(),
	yt = require('../yt');

router.post('/', function(req, res) {
	var post = req.params;
});

router.get('/', function(req, res) {
	res.send('Only POST allowed');
});

module.exports = router;