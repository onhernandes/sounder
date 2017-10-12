var mongoose = require('mongoose'),
	Schema = mongoose.Schema, musicSchema;

musicSchema = new Schema({
	title: { type: String, default: '' },
	url: { type: String, default: '' },
	video_id: { type: String, default: '' },
	author: { type: String, default: '' },
	album: { type: String, default: '' },
	cover: { type: String, default: '' },
	file_name: { type: String, default: '' },
	status: { type: String, default: 'pending' },
	// wip: add to google drive
	// google_drive: Boolean
});

musicSchema.post('save', (doc) => {
	let u = doc.url;
	if (u.indexOf('watch?v=') !== -1) {
		u = u.split('watch?v=');
		u = u[1];
	} else if (u.indexOf('youtu.be/') !== -1) {
		u = u.split('youtu.be/');
		u = u[1];
	}

	doc.video_id = u;
	doc.save((a,b) => {});
});

/*
* status: pending | downloading | downloaded
*/

module.exports = mongoose.model('Music', musicSchema);