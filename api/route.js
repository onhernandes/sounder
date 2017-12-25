let express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	fs = require('fs'),
	path = require('path'),
	logger = require('./logger.js'),
	Music = require('./schema.js'),
	Spotify = require('spotify-web-api-node'),
	Credentials = require('./credentials.js'),
	credentials_file = require('./spotify.json');

let db = mongoose.connection;

let spotifyApi = new Spotify({
		clientId: credentials_file.client_id,
		clientSecret: credentials_file.secret_id,
		redirectUri: credentials_file.uri
	});

/*
* logging middleware
*/
router.use((req, res, next) => {
	logger.log('info', 'API accessed :: ' + req.method);
	next();
});

/*
* GET: access index for getting a login button
*/
router.get('/login', (req, res) => {
	res.render('login-spotify.html', { url: spotifyApi.createAuthorizeURL(credentials_file.scopes, credentials_file.state) });
});

/*
* ANY: Spotify callback for login
*/
router.get('/auth', (req, res) => {
	let code = req.query.code || null,
		state = req.query.state || null;

	if (!code) {
		res.send('Code not defined'); res.end(); return;
	}

	spotifyApi.authorizationCodeGrant(code)
		.then(function(data) {
			let cred = new Credentials({
				spotify_access: data.body.access_token,
				spotify_refresh: data.body.refresh_token,
				spotify_expires: data.body.expires_in,
			});

			cred.save(err => {
				if (err) {
					res.write('Error on writing to Mongo');
					res.end(JSON.stringify(err)); return;
				}

				res.write('Credentials saved successfully! You can use the app.');
				res.end();
			});
		})
		.catch(err => logger.log('error', 'Something went wrong!', err));
});


/*
* POST: add a music to db
*/
router.post('/api/music/', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	logger.log('info', 'Before checking values');
	let post = req.body,
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

	if (has === false || post.url.indexOf('youtu') == -1) { 
		logger.log('error', 'Invalid data when accessing API'); 
		res.end(JSON.stringify({error: 'invalid parameters'})); 
	}

	let u = post.url;

	if (u.indexOf('watch?v=') !== -1) {
		u = u.split('watch?v=');
		u = u[1];
	} else if (u.indexOf('youtu.be/') !== -1) {
		u = u.split('youtu.be/');
		u = u[1];
	}

	post.video_id = u;
	let m = new Music(post);

	m.save(err => {
		if (err) { logger.log('error', 'Error whent trying to write music to Mongo', [err, post.url]); }
		logger.log('info', 'Music created');
		res.send(JSON.stringify({status: 'created, will be downloaded soon'})).end();
	});
});

/*
* GET: get a specific music data using video_id
*/
router.get('/api/music/:video_id?', (req, res) => {
	if (req.params.video_id) {
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
	} else {
		let query = {};

		if (typeof(req.query.title) !== "undefined") {
			query.title = new RegExp(req.query.title, 'i');
		}

		if (typeof(req.query.url) !== "undefined") {
			query.url = new RegExp(req.query.url, 'i');
		}

		if (typeof(req.query.album) !== "undefined") {
			query.album = new RegExp(req.query.album, 'i');
		}

		if (typeof(req.query.author) !== "undefined") {
			query.author = new RegExp(req.query.author, 'i');
		}

		if (typeof(req.query.video_id) !== "undefined") {
			query.video_id = new RegExp(req.query.video_id, 'i');
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
	}
});

/*
* DELETE: deletes a music
*/
router.delete('/api/music/:video_id', (req, res) => {
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
router.put('/api/music/:video_id', (req, res) => {
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
			if (req.body.update !== false) { obj.status = 'pending'; }
			return obj.save();
		})
		.then(result => res.end(JSON.stringify(result)))
		.catch(e => res.end(JSON.stringify({error: 'not found'})));
});

module.exports = router;