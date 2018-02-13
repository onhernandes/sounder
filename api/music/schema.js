const mongoose = require('mongoose')
const Schema = mongoose.Schema
let musicSchema

musicSchema = new Schema({
  title: { type: String, default: '' },
  url: { type: String, default: '' },
  video_id: { type: String, default: '' },
  author: { type: String, default: '' },
  album: { type: String, default: '' },
  cover: { type: String, default: '' },
  file_name: { type: String, default: '' },
  playlist: { type: String, default: '' },
  spotify: { type: Boolean, default: true },
  spotify_status: { type: String, default: '' },
  spotify_uri: { type: String, default: '' },
  tries: { type: Number, default: 0 },
  status: { type: String, default: 'pending' }
})

musicSchema.post('update', (doc) => {
  if (doc.tries >= 5) { doc.status = 'error' }
  doc.save(() => {})
})

/*
* status: pending | downloading | downloaded
*/

module.exports = mongoose.model('Music', musicSchema)
