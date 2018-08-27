const mongoose = require('mongoose')
const Schema = mongoose.Schema

let musicSchema = new Schema({
  title: { type: String },
  url: { type: String },
  video_id: { type: String, unique: true },
  author: { type: String },
  album: { type: String },
  cover: {
    type: [String],
    default: undefined
  },
  file_name: { type: String },
  tries: { type: Number, default: 0 },
  status: { type: String, default: 'pending' }
})

musicSchema.post('update', (doc) => {
  if (doc.tries >= 5) { doc.status = 'error' }

  doc.save(() => {})
})

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
* status: pending | downloading | downloaded | error
*/

module.exports = mongoose.model('Music', musicSchema)
