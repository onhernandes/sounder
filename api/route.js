var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	logger = require('./logger.js'),
	Music = require('./schema.js');

mongoose.connect('mongodb://localhost/soundman');

let db = mongoose.connection;

/*
* POST: add a music to db
*/
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

	if (has === false || post.url.indexOf('youtu') == -1) { logger.log('error', 'Invalid data when accessing API'); res.end(JSON.stringify({error: 'invalid parameters'})); }

	let m = new Music(post);

	m.save(err => {
		if (err) { logger.log('error', 'Error on writing music to db', [err, post.url]); }
		logger.log('info', 'Music inserted');
		res.end(JSON.stringify({status: 'created, will be downloaded soon'}));
	});
});

router.get('/api/search/title/:title*?/:page*?', (req, res) => {
	let skip = parseInt(req.params.page) == 1 ? 0 : parseInt(req.params.page) * 50;
	let regex = req.params.title ? '.*' + req.params.title + '.*' : '';
	Music.find({ title: { $regex: regex } }).skip(skip).limit(50)
		.then((data, err) => {
			if (err) {
				res.end(JSON.stringify({error: 'error'}));
			} else {
				res.end(JSON.stringify(data.map(i => {
					delete i[_id];
					return i;
				})));
			}
		});
});

router.get('/api/search/url/:url*?/:page*?', (req, res) => {
	let skip = parseInt(req.params.page) == 1 ? 0 : parseInt(req.params.page) * 50;
	let regex = req.params.url ? '.*' + req.params.url + '.*' : '';
	Music.find({ url: { $regex: regex } }).skip(skip).limit(50)
		.then((data, err) => {
			if (err) {
				res.end(JSON.stringify({error: 'error'}));
			} else {
				res.end(JSON.stringify(data.map(i => {
					delete i[_id];
					return i;
				})));
			}
		});
});

router.delete('/api/delete/:video_id*?', (req, res) => {
	Music.findOneAndRemove({ video_id: { $eq: req.params.video_id } })
		.then((data, err) => {
			if (err) {
				res.end(JSON.stringify({error: 'error'}));
			} else {
				res.end(JSON.stringify({
					status: 'deleted',
					title: data.title,
					url: data.url
				}));
			}
		});
});

router.put('/api/:video_id', (req, res) => {
	Music.findOne({ video_id: req.params.video_id })
		.then((data, err) => {
			if (err) {
				throw new Error();
			} else {
				return data;
			}
		})
		.then(obj => {
			if (req.body.title !== undefined) { obj.title = req.body.title; }
			if (req.body.cover !== undefined) { obj.cover = req.body.cover; }
			if (req.body.album !== undefined) { obj.album = req.body.album; }
			if (req.body.author !== undefined) { obj.author = req.body.author; }
			return obj.save();
		})
		.then(result => res.end(JSON.stringify(result)))
		.catch(e => res.end(JSON.stringify({error: 'not found'})));
});

module.exports = router;