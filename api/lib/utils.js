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
			Music.findByIdAndUpdate(music._id, {status: 'downloading'}, () => { return; });
		});

		converting.on('end', () => {
			logger.log('info', 'end download and convert music', {
				id: music._id,
				url: music.url,
			});
			Music.findByIdAndUpdate(music._id, {status: 'downloaded'}, () => { return; });
			resolve(true);
		});
	});
}

function getDownloading() {
	return Music.find({status: 'downloading'}).exec();
}

function getPending() {
	return Music.find({status: 'pending'}).exec();
}

function getData() {
	return new Promise((resolve, reject) => {
		yt.getInfo('https://www.youtube.com/watch?v=BlYj1FcAUDs')
			.then(data => {
				let metadata = {};

				if (data.title !== null && data.title !== undefined && data.title.length > 0) {
					metadata.title = data.title;
				} else {
					metadata.title = '';
				}

				if (data.author.name !== null && data.author.name !== undefined && data.author.name.length > 0) {
					metadata.author = data.author.name;
				} else {
					metadata.author = '';
				}

				if (data.iurlmaxres !== null && data.iurlmaxres !== undefined && data.iurlmaxres.length > 0) {
					metadata.cover = data.iurlmaxres;
				} else {
					metadata.cover = '';
				}

				resolve(metadata);
			})
			.catch(e => reject(e));
	});
}

function writeMusicData(music) {
	return new Promise((resolve, reject) => {
		let data = {}, opt = {}, up = false,
			file = path.resolve(__dirname, '../music/' + music.file_name);

		getData(music.url)
			.then(original_metadata => {
				if (music.title.length > 0) {
					data.title = music.title;
					data.label = music.title;
				} else {
					data.title = original_metadata.title;
					data.label = original_metadata.title;
				}

				if (music.cover.length > 0) {
					opt.attachments = [music.cover];
				} else {
					opt.attachments = [original_metadata.cover];
				}

				if (music.album.length > 0) {
					data.album = music.album;
				}

				if (music.author.length > 0) {
					data.artist = music.author;
				} else {
					data.artist = original_metadata.author;
				}

				return;
			})
			.then(() => {
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
			})
			.catch(e => resolve(true));
	});
}

module.exports = {
	writeMusicData,
	downloadMusic,
	convertMusic,
	getMusicDataFromYT,
	getDownloading,
	getPending,
	getData
};