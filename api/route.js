var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	fs = require('fs'),
	path = require('path'),
	logger = require('./logger.js'),
	Music = require('./schema.js');

mongoose.connect('mongodb://localhost/soundman');

let db = mongoose.connection;

/*
* POST: add a music to db
*/
router.post('/api/music/', (req, res) => {
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

/*
* GET: get a specific music data using video_id
*/
router.get('/api/music/:video_id', (req, res) => {
	Music.findOne({ video_id: req.params.video_id })
		.then((data, err) => {
			if (err) {
				throw new Error();
			} else {
				return data;
			}
		})
		.then(obj => {
			res.end(JSON.stringify({
				title: obj.title,
				video_id: obj.video_id,
				url: obj.url,
				album: obj.album,
				author: obj.author,
				cover: obj.cover,
				status: obj.status,
			}));
		})
		.catch(e => res.end(JSON.stringify({error: 'not found'})));
});

/*
* GET: search for musics based on title, url, video_id, album and author
*/
router.get('/api/search/', (req, res) => {
	let args = ['title', 'url', 'video_id', 'album', 'author'], query = {},
	video_id = typeof(req.query.video_id) === undefined || typeof(req.query.video_id) === "undefined";

	if (typeof(req.query.title) !== "undefined" && video_id) {
		query.title = new RegExp(req.query.title, 'i');
	}

	if (typeof(req.query.url) !== "undefined" && video_id) {
		query.url = new RegExp(req.query.url, 'i');
	}

	if (typeof(req.query.album) !== "undefined" && video_id) {
		query.album = new RegExp(req.query.album, 'i');
	}

	if (typeof(req.query.author) !== "undefined" && video_id) {
		query.author = new RegExp(req.query.author, 'i');
	}

	if (!video_id) {
		query.video_id = req.query.video_id;
	}

	let skip = typeof(req.query.page) !== "undefined" && parseInt(req.query.page) > 1 ? parseInt(req.query.page) * 15 : 0; 

	Music.find(query).skip(skip)
		.then((list, err) => {
			res.end(JSON.stringify(list.map(it => {
				return {
					title: it.title,
					video_id: it.video_id,
					url: it.url,
					album: it.album,
					author: it.author,
					cover: it.cover,
					status: it.status,
				};
			})));
		})
		.catch(e => console.log(e));
});

/*
* DELETE: deletes a music
*/
router.delete('/api/delete/:video_id', (req, res) => {
	Music.findOne({ video_id: { $eq: req.params.video_id } })
		.then((music, err) => {
			if (err) { res.end(JSON.stringify({error: 'could not find this music'})); } else {
				let file = path.resolve(__dirname, '../music/' + music.file_name);
				fs.stat(file, (err, stats) => {
					if (err) {
						res.end(JSON.stringify({error: 'could not find this music'}));
					} else {
						fs.unlink(file, (err) => {
							if (err) {
								res.end(JSON.stringify({error: 'could not find this music'}));
							} else {
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
							}
						});
					}
				});
			}
		})
		.catch(e => res.end(JSON.stringify({error: 'could not find this music'})));
});

/*
* PUT: updates a music title, cover, album and author
*/
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