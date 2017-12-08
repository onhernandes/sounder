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
	tries: { type: Number, default: 0 },
	status: { type: String, default: 'pending' },
	// wip: add to google drive
	// google_drive: Boolean
});

musicSchema.post('update', (doc) => {
	if (doc.tries >= 5) { doc.status = 'error'; }

	doc.save(() => { return; });
});

/*
* status: pending | downloading | downloaded
*/

module.exports = mongoose.model('Music', musicSchema);