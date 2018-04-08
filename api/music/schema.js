const mongoose = require('mongoose')
const Schema = mongoose.Schema

let musicSchema = new Schema({
  title: { type: String },
  url: { type: String },
  video_id: { type: String, unique: true },
  author: { type: String },
  album: { type: String },
  cover: { type: String },
  file_name: { type: String },
  playlist: { type: String },
  spotify: { type: Boolean, default: true },
  spotify_status: { type: String },
  spotify_uri: { type: String },
  tries: { type: Number, default: 0 },
  status: { type: String, default: 'pending' }
})

musicSchema.post('update', (doc) => {
  if (doc.tries >= 5) { doc.status = 'error' }

  doc.save(() => {})
})

musicSchema.statics.getYoutubeID = (url) => {
  let regexp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/i
  let values = url.match(regexp)

  if (values.length > 1) {
    return values[1]
  } else {
    return false
  }
}

musicSchema.statics.increaseTries = async (id) => {
  let item = await this.find({ _id: id }).lean().exec()
  item.tries++

  if (item.tries >= 5) {
    item.status = 'error'
  } else {
    item.status = 'pending'
  }

  return item.save()
}

/*
* status: pending | downloading | downloaded
*/

module.exports = mongoose.model('Music', musicSchema)
