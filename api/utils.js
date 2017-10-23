const fs = require('fs'),
	path = require('path'),
	logger = require('./logger.js'),
	yt = require('ytdl-core'),
	ffmpeg = require('fluent-ffmpeg'),
	meta = require('ffmetadata'),
	stream = require('stream'),
	Music = require('./schema.js');

function getMusicDataFromYT(url) {
	return new Promise((resolve, reject) => {
		yt.getInfo(url)
			.then(info => {
				resolve(info.title);
			})
			.catch(err => {
				logger.log('error', 'Could not get music title', {
					message: err.message,
					url: url
				});
				reject(err);
			});
	});
}

function downloadMusic(url) {
	return yt(url, {quality: 'lowest'});
}

function convertMusic(readable, music) {
	let file = path.resolve(__dirname, '../music/' + music.file_name);
	return new Promise((resolve, reject) => {
		if (!(readable instanceof stream.Stream) && typeof(readable._read) !== 'function' && typeof(readable._readableState) !== 'object') {
			logger.log('error', 'Did not received a readable stream from ytdl-core', {
				id: music._id
			});

			Music.findByIdAndUpdate(music._id, { tries: music.tries++ }, () => { return; });
			reject(new Error('Did not received a readable stream from ytdl-core'));
		}

		let converting = ffmpeg(readable)
			.noVideo()
			.audioCodec('libmp3lame')
			.save(file);

		converting.on('error', (err, stdout, stderr) => {
			// get status back to 'pending'
			logger.log('error', 'error when converting music', {
				err: err.message, 
				stdout: stdout, 
				stderr: stderr, 
				id: music._id
			});

			Music.findByIdAndUpdate(music._id, { status: 'pending', tries: music.tries++ }, () => { return; });
			reject(new Error('could not convert music'));
		});

		converting.on('start', () => {
			logger.log('info', 'Start downloading', {
				id: music._id,
				url: music.url,
			});
			// update status to 'downloading'
			Music.findByIdAndUpdate(id, {status: 'downloading'}, () => { return; });
		});

		converting.on('end', () => {
			logger.log('info', 'end download and convert music', {
				id: music._id,
				url: music.url,
			});
			Music.findByIdAndUpdate(id, {status: 'downloaded'}, () => { return; });
			resolve(true);
		});
	});
}

function writeMusicData(music) {
	return new Promise((resolve, reject) => {
		let data = {}, opt = {}, up = false;

		if (music.title.length !== 0) { up = true; data.title = music.title; data.label = music.title; }
		if (music.album.length !== 0) { up = true; data.album = music.album; }
		if (music.author.length !== 0) { up = true; data.artist = music.author; }
		if (music.cover.length !== 0) { up = true; opt.attachments = [music.cover]; }

		if (up) {
			meta.write(file, data, opt, err => {
				if (err) {
					logger.log('error', 'error when writing metadata', {
						err: err, 
						id: music._id,
						url: music.url,
					});

					Music.findByIdAndUpdate(obj._id, { status: 'downloaded' }, () => { return; });
				}

				resolve(true);
			});
		} else {
			resolve(true);
		}
	});
}

function getDownloading() {
	return Music.find({status: 'downloading'}).exec();
}

function getPending() {
	return Music.find({status: 'pending'}).limit(5).exec();
}

module.exports = {
	writeMusicData,
	downloadMusic,
	convertMusic,
	getMusicDataFromYT,
	getDownloading,
	getPending
};