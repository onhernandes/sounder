var mongoose = require('mongoose'),
	Schema = mongoose.Schema, credentialsSchema;

credentialsSchema = new Schema({
	spotify_access: { type: String, default: '' },
	spotify_refresh: { type: String, default: '' },
	spotify_expires: { type: Number, default: 0 },
	spotify_created: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Credentials', credentialsSchema);