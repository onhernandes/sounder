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

function getTitle(obj) {
	return new Promise((resolve, reject) => {
		if (obj.title.length !== 0) { resolve(obj.title); }
		ytdl.getInfo(obj.url)
			.then(inf => {
				resolve(inf.title);
			})
			.catch(err => resolve(obj._id));
	});
}

function download_mp3(pathh, url, id) {
	return new Promise((resolve, reject) => {
		ffmpeg(ytdl(url, {quality: 'lowest'}))
			.noVideo()
			.audioCodec('libmp3lame')
			.save(pathh)
			.on('error', (err, stdout, stderr) => {
				// get status back to 'pending'
				Music.findByIdAndUpdate(id, {status: 'pending'}, () => { return; });
				resolve();
			})
			.on('start', cli => {
				console.log('Start downloading');
				// update status to 'downloading'
				Music.findByIdAndUpdate(id, {status: 'downloading'}, () => { return; });
				resolve();
			})
			.on('end', (stdout, stderr) => {
				// update status to 'downloaded'
				Music.findByIdAndUpdate(id, {status: 'downloaded'}, () => { return; });
				resolve();
			})
	});
}

// download
function download(obj) {
	var where = path.resolve(__dirname, '../music/'), file;
	return new Promise((resolve, reject) => {
		getTitle(obj)
			.then(title => {
				file = where+'/'+tt+'.mp3';
				return download_mp3(file, obj.url, obj._id);
			})
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
	/*download({
		_id: '59a9d25808eb503d4ed15d71',
		url: 'https://www.youtube.com/watch?v=t7BG20q7wZs',
		added_at: "2017-09-01T21:34:16.046Z", 
		status: "pending", 
		cover: "", 
		album: "", 
		author: "", 
		title: ""
	}).then(() => console.log('Successfull')).catch(err => console.error);*/
	// return;
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