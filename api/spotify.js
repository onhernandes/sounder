let mongoose = require('mongoose'),
	Q = require('q'),
	logger = require('./logger.js'),
	Music = require('./schema.js'),
	{ getMusicDataFromYT } = require('./utils.js'),
	Spotify = require('spotify-web-api-node'),
	Credentials = require('./credentials.js'),
	credentials_file = require('./spotify.json');

// Use Q.Promise on Mongoose
mongoose.Promise = Q.Promise;

/**
* {@return} an array of musics allowed to Spotify
*/
function getAvailable() {
	return Music.find({ spotify: true, status: 'pending' });
}

/**
* {@return} an array with playlist's name registered
*/
function getLocalPlaylists() {
	return new Promise((resolve, reject) => {
		Music.find({ playlist: { $ne: '' } })
			.then(count => {
				let list = [];
				count.map(it => {
					if (list.indexOf(it.playlist) == -1) {
						list.push(it.playlist);
					}
				});

				resolve(list);
			})
			.catch(e => reject(e));
	});
}

/**
* {@return} Either return a Spotify's playlist or create one then returns it
*/
function setPlaylistSpotify(spotifyApi, userid, name) {
	return new Promise((resolve, reject) => {
		getPlaylist(spotifyApi, userid, name)
			.then(list => {
				if (list.length > 0) {
					resolve(list[0]);
					return null;
				} else {
					return spotifyApi.createPlaylist(userid, name);
				}
			})
			.then(status => {
				if (status) {
					resolve(status.body);
				}
			})
			.catch(e => reject(e));
	});
}

/**
* {@return} Spotify formatted search string
*/
function toSpotifySearch(music) {
	return new Promise((resolve, reject) => {
		getMusicDataFromYT(music.url)
			.then(title => {
				let track = title,
					artist = music.author,
					splitted = title.indexOf(' - ') !== -1 ? title.split(' - ') : false;

				if (splitted !== false) {
					artist = splitted[0];
					track = splitted[1];

					if (artist.indexOf(',') !== -1) {
						artist = artist.split(',')[0];
					}

					if (track.indexOf('(') !== -1) {
						track = track.split('(')[0];
					}
				}

				resolve('track:' + track + ' artist:' + artist);
			})
			.catch(e => reject(e));
	});
}

/**
* {@return} either track found or false 
*/
function findInSpotify(spotifyApi, music) {
	return new Promise((resolve, reject) => {
		toSpotifySearch(music)
			.then(search => spotifyApi.searchTracks(search))
			.then(found => {
				if (found.body.tracks.items.length > 0) {
					found = found.body.tracks.items[0].album;
				} else {
					found = false;
				}

				resolve(found);
			})
			.catch(e => reject(e));
	});
}

/**
* {@return} an array of playlists that matches the `name` and the owner is the user
*/
function getPlaylist(spotifyApi, userid, name) {
	return new Promise((resolve, reject) => {
		spotifyApi.getUserPlaylists(userid)
			.then(found => {
				resolve(found.body.items.filter(it => it.owner.id == userid && it.name.indexOf(name) != -1));
			})
			.catch(e => reject(e));
	});
}

/**
* {@return} the snapshot id
*/
function addToPlaylist(spotifyApi, data) {
	return new Promise((resolve, reject) => {
		if (!data.tracks || !data.userid || !data.playlist) {
			reject(new Error('Missing data'));
		}

		spotifyApi.addTracksToPlaylist(data.userid, data.playlist, data.tracks)
			.then(data => {
				resolve(data.body.snapshot_id);
			})
			.catch(e => reject(e));
	});
}

/**
* {@return} a Spotify's User object
*/
function getUser(spotifyApi) {
	return new Promise((resolve, reject) => {
		spotifyApi.getMe()
			.then(user => {
				resolve(user.body);
			})
			.catch(e => reject(e));
	});
}

/**
* {@return} a Spotify's API Wrapper instance
* Use credentials for storing access_tokens, should be Users
* Reload the access_token if needed
*/
function getSpotifyInstance() {
	return new Promise((resolve, reject) => {
		let sp = new Spotify({
			clientId: credentials_file.client_id,
			clientSecret: credentials_file.secret_id,
			redirectUri: credentials_file.uri
		}), local;

		Credentials.findOne({}, null, { sort: { spotify_created: -1 } })
			.then(found => {
				if (!found) {
					reject(new Error('Not found'));
				}

				sp.setAccessToken(found.spotify_access);
				sp.setRefreshToken(found.spotify_refresh);

				let old = new Date(found.spotify_created);
				local = found;

				if (old < new Date()) {
					return sp.refreshAccessToken(null);
				} else {
					resolve(sp);
					return null;
				}
			})
			.then(data => {
				if (data) {
					local.spotify_access = data.body.access_token;
					local.spotify_expires = data.body.expires_in;

					local.save(err => {
						if (err) {
							reject(err);
						}
					});

					sp.setAccessToken(data.body.access_token);
				}

				resolve(sp);
			})
			.catch(e => reject(e));
	});
}

function handle(spotifyApi, user) {
	return new Promise((resolve, reject) => {
		getAvailable()
			.then(found => {
				resolve(found);
			})
			.catch(e => reject(e));
	});
}

function test() {
	let api, user;
	getSpotifyInstance()
		.then(instance => {
			api = instance;
			return getUser(instance);
		})
		.then(u => {
			user = u;
			let uri = 'TRACK_URI';
			return handle(api, user);
			return addToPlaylist(api, {
				userid: 'USER_ID',
				tracks: [uri],
				playlist: 'PLAYLIST_ID'
			});
			// return Music.findOne({ spotify: true });
		})
		// .then(local => findInSpotify(api, local))
		.then(track => {
			console.log(track);
		})
		.catch(e => console.log('all', e));
}

module.exports = test;