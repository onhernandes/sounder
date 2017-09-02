var mongoose = require('mongoose'),
	Q = require('q'),
	ffmpeg = require('fluent-ffmpeg'),
	meta = require('ffmetadata'),
	ytdl = require('ytdl-core'),
	fs = require('fs'),
	path = require('path'),
	Music = require('./schema.js');

mongoose.Promise = Q.Promise;

// get downloading
function getDownloading() {
	return Music.find({status: 'downloading'}).exec();
}

// get pending
function getPending() {
	return Music.find({status: 'pending'}).limit(5).exec();
}

function download_mp3(pathh, url) {
	return new Promise((resolve, reject) => {
		ffmpeg(ytdl(url, {quality: 'lowest'}))
			.noVideo()
			.audioCodec('libmp3lame')
			.save(pathh)
			.on('error', (err, stdout, stderr) => {
				// get status back to 'pending'
				resolve();
			})
			.on('start', cli => {
				// update status to 'downloading'
				resolve();
			})
			.on('end', (stdout, stderr) => {
				// update status to 'downloaded'
				resolve();
			})
	});
}

// download
function download(obj, where) {
	return new Promise((resolve, reject) => {
		var tt = obj.title.length !== 0 ? obj.title : obj._id,
			file = where+'/'+tt+'.mp3';

		download_mp3(file, obj.url)
			.then(() => {
				var data = {}, opt = {}, up = false;

				if (obj.title.length !== 0) { up = true; data.title = obj.title; data.label = obj.title; }
				if (obj.album.length !== 0) { up = true; data.album = obj.album; }
				if (obj.author.length !== 0) { up = true; data.artist = obj.author; }
				if (obj.cover.length !== 0) { up = true; opt.attachments = [obj.cover]; }

				if (up) {
					meta.write(file, data, opt, err => {
						// if (err) console.log(err);
						resolve();
					});
				} else {
					resolve();
				}
			})
			.catch(e => console.error);
	});
}

// wrapper
function check() {
	var folder = path.resolve(__dirname, '../music/');

	download({
		_id: '59a9d25808eb503d4ed15d71',
		url: 'https://www.youtube.com/watch?v=t7BG20q7wZs',
		added_at: "2017-09-01T21:34:16.046Z", 
		status: "pending", 
		cover: "", 
		album: "", 
		author: "", 
		title: ""
	}, folder).then(() => console.log('Successfull')).catch(err => console.error);
	return;
	var trye = true, all = [], downloading = 0;
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
			for (var i = 0; i < (pending.length - downloading); i++) {
				all.push(download(pending[i]));
			}
			return;
		})
		.then(() => {
			Promise.all(all);
		})
		.catch(err => console.log(err));
}

module.exports = check;