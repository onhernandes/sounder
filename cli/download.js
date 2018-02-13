let mongoose = require('mongoose'),
	Q = require('q'),
	{
		writeMusicData,
		downloadMusic,
		convertMusic,
		getMusicDataFromYT,
		getDownloading,
		getPending,
		getData
	} = require('../api/utils.js'),
	path = require('path'),
	logger = require('../api/logger.js'),
	Music = require('../api/schema.js');

// Use Q.Promise on Mongoose
mongoose.Promise = Q.Promise;

// get title, download and write metadata
function download(music) {
	return new Promise((resolve, reject) => {
		if (music.url.length == 0) { return false; }

		if (music.file_name.length == 0) {
			music.file_name = music._id + '.mp3';
			music.save();
		}

		let stream = downloadMusic(music.url);
		convertMusic(stream, music)
			.then(done => {
				return writeMusicData(music);
			})
			.then(status => {
				resolve(status);
			})
			.catch(e => {
				music.status = 'error';
				music.save(() => {});
				reject(e);
			});
	});
}

// wrapper, check db and start downloads
function check() {
	let downloading = 0;
	logger.log('info', 'Start checking');
	return getDownloading()
		.then(res => {
			return getPending();
		})
		.then(pending => {
			if (!pending || pending.length === 0) {
				throw new Error('Did not find any peding musics');
			}
			logger.log('info', 'Got some pending music', pending.length);
			let all = [];
			for (let i = 0; i < (pending.length - downloading); i++) {
				all.push(pending[i]);
			}
			return all;
		})
		.then(list => list.map(download))
		.then(run => Promise.all(run))
		.then(ran => {
			logger.log('info', 'Status: ');
			logger.log('info', ran);
			logger.log('info', 'Done checking');
		})
		.catch(err => {
			logger.log('info', 'No music found');
			return;
		});
}

module.exports = check;