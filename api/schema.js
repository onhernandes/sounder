var mongoose = require('mongoose'),
	Schema = mongoose.Schema, musicSchema;

musicSchema = new Schema({
	title: { type: String, default: '' },
	url: { type: String, default: '' },
	author: { type: String, default: '' },
	album: { type: String, default: '' },
	cover: { type: String, default: '' },
	status: { type: String, default: 'pending' },
	// wip: add to google drive
	// google_drive: Boolean
});

/*
* status: pending | downloading | downloaded
*/

module.exports = mongoose.model('Music', musicSchema);