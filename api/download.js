var mongoose = require('mongoose'),
	Q = require('q'),
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

// download
function download(obj) {
	return new Promise((resolve, reject) => {
		resolve(true);
	});
}

// wrapper
function check() {
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
			console.log(all.length);
			// return;
		})/*
		.then(() => {
			Promise.all(all);
		})*/
		.catch(err => console.log(err));
}

module.exports = check;