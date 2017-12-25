let mongoose = require('mongoose'),
	Q = require('q'),
	logger = require('./logger.js'),
	Spotify = require('./spotify.js'),
	Credentials = require('./credentials.js'),
	credentials_file = require('./spotify.json');

// Use Q.Promise on Mongoose
mongoose.Promise = Q.Promise;

function doTheJob() {
	let api;
	return Credentials.find({}, null, { sort: { spotify_created: -1 } })
		.then(found => {
			api = new Spotify({
				clientId: credentials_file.client_id,
				clientSecret: credentials_file.secret_id,
				redirectUri: credentials_file.uri
			}, found[0]);

			return api.validateToken();
		})
		.then(status => {
			return api.getUser();
		})
		.then(user => {
			return api.getLocalData();
		})
		.then(musics => {
			return Promise.all(musics.map(api.sendPlaylist));
		})
		.then(status => {
			logger.log('info', 'send-to-spotify.js ended', status);
			return status;
		})
		.catch(e => logger.log('error', 'Ops! Something bad happened while trying to send musics to Spotify!', e));
}

doTheJob();