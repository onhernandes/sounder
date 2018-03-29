const mongoose = require('mongoose')
const Schema = mongoose.Schema

let musicSchema = new Schema({
  title: { type: String, default: '' },
  url: { type: String, default: '' },
  video_id: { type: String, default: '', unique: true },
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
