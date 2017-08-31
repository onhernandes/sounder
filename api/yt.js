var ffmpeg = require('ffmpeg'),
	ytdl = require('ytdl-core'),
	fs = require('fs');

function yt(url, toGoogleDrive) {
	if (url == 'undefined' || url === '') { return; }
	return new Promise(function(resolve, reject) {
	});
}

module.exports = yt;