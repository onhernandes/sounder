var mongoose = require('mongoose'),
	Q = require('q'),
	ffmpeg = require('fluent-ffmpeg'),
	meta = require('ffmetadata'),
	ytdl = require('ytdl-core'),
	fs = require('fs'),
	path = require('path'),
	logger = require('./logger.js'),
	Music = require('./schema.js');

// Use Q.Promise on Mongoose
mongoose.Promise = Q.Promise;

// get downloading musics
function getDownloading() {
	return Music.find({status: 'downloading'}).exec();
}

// get pending musics
function getPending() {
	return Music.find({status: 'pending'}).limit(5).exec();
}

// get music title from obj or YT
function getTitle(obj) {
	return new Promise((resolve, reject) => {
		if (obj.title.length !== 0) {
			Music.findByIdAndUpdate(obj._id, {file_name: obj.title + '.mp3'}, () => { return; });
			resolve(obj.title);
		}
		ytdl.getInfo(obj.url)
			.then(inf => {
				return Music.findByIdAndUpdate(obj._id, {file_name: inf.title + '.mp3'}, () => { return; });
			})
			.then(nothing => {
				resolve(inf.title);
			})
			.catch(err => {
				logger.log('error', 'Error on getting music title', [err, obj.url]);
				resolve(obj._id);
			});
	});
}

// download and convert a music from YT to path
function download_mp3(path, url, id) {
	return new Promise((resolve, reject) => {
		ffmpeg(ytdl(url, {quality: 'lowest'}))
			.noVideo()
			.audioCodec('libmp3lame')
			.save(path)
			.on('error', (err, stdout, stderr) => {
				// get status back to 'pending'
				logger.log('error', 'Error on downloading', [err, stdout, stderr, url]);
				Music.findByIdAndUpdate(id, {status: 'pending'}, () => { return; });
				resolve(false);
			})
			.on('start', cli => {
				logger.log('info', 'Start downloading', url);
				// update status to 'downloading'
				Music.findByIdAndUpdate(id, {status: 'downloading'}, () => { return; });
			})
			.on('end', (stdout, stderr) => {
				// update status to 'downloaded'
				logger.log('info', 'End download', url);
				Music.findByIdAndUpdate(id, {status: 'downloaded'}, () => { return; });
				resolve(true);
			});
	});
}

// get title, download and write metadata
function download(obj) {
	var where = path.resolve(__dirname, '../music/'), file = '';
	return new Promise((resolve, reject) => {
		logger.log('info', 'Start downloading', obj.url);
		getTitle(obj)
			.then(title => {
				logger.log('info', 'Got title', obj.url);
				file = path.resolve(__dirname, '../music/'+title+'.mp3');
				return download_mp3(file, obj.url, obj._id);
			})
			.then(n => {
				if (n === false) { resolve(); }
				logger.log('info', 'Writing metadata', obj.url);
				var data = {}, opt = {}, up = false;

				if (obj.title.length !== 0) { up = true; data.title = obj.title; data.label = obj.title; }
				if (obj.album.length !== 0) { up = true; data.album = obj.album; }
				if (obj.author.length !== 0) { up = true; data.artist = obj.author; }
				if (obj.cover.length !== 0) { up = true; opt.attachments = [obj.cover]; }

				if (up) {
					meta.write(file, data, opt, err => {
						if (err) {
							logger.log('error', 'Error on writing metadata', [err, obj.url]);
							Music.findByIdAndUpdate(obj._id, {status: 'pending'}, () => { return; });
						}
						resolve();
					});
				} else {
					resolve();
				}
			})
			.catch(e => {
				Music.findByIdAndUpdate(obj._id, {status: 'pending'}, () => { return; });
				logger.log('error', 'Error on downloading', [err, obj.url]);
				resolve();
			});
	});
}

// wrapper, check db and start downloads
function check() {
	var downloading = 0;
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
			for (var i = 0; i < (pending.length - downloading); i++) {
				all.push(pending[i]);
			}
			return all;
		})
		.then(list => list.map(download))
		.then(run => {
			Promise.all(run);
			logger.log('info', 'Done checking');
		})
		.catch(err => logger.log('error', 'Error on checking', err));
}

module.exports = check;