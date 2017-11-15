let mongoose = require('mongoose'),
	Q = require('q'),
	{
		writeMusicData,
		downloadMusic,
		convertMusic,
		getMusicDataFromYT,
		getDownloading,
		getPending
	} = require('./utils.js'),
	path = require('path'),
	logger = require('./logger.js'),
	Music = require('./schema.js');

// Use Q.Promise on Mongoose
mongoose.Promise = Q.Promise;

// get title, download and write metadata
function download(music) {
	return new Promise((resolve, reject) => {
		if (music.url.length == 0) { return false; }

		let stream = downloadMusic(music.url);
		convertMusic(stream)
			.then(done => {
				return writeMusicData(music);
			})
			.then(status => {
				resolve(status);
			})
			.catch(e => {
				reject(e);
			});
	});
}

// wrapper, check db and start downloads
function check() {
	let downloading = 0;
	logger.log('info', 'Start checking');
	getDownloading()
		.then(res => {
			if (res.length < 5) {
				downloading = res.length;
				return getPending();
			} else {
				return false;
			}
		})
		.then(pending => {
			if (!pending || pending.length === 0) { return false; }
			logger.log('info', 'Got some pending music', pending.length);
			let all = [];
			for (let i = 0; i < (pending.length - downloading); i++) {
				all.push(pending[i]);
			}
			return all;
		})
		.then(list => list.map(download))
		.then(run => {
			logger.log('info', 'Status: ');
			logger.log('info', Promise.all(run));
			logger.log('info', 'Done checking');
		})
		.catch(err => logger.log('error', 'Error on checking', err));
}

module.exports = check;