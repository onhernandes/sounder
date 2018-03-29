const Music = require('./schema.js')
const MusicError = require('./error.js')
const path = require('path')
const fs = require('fs-extra')
const mongofilter = require('../../helpers/mongo_filter.js')

module.exports = async (params) => {
  let found

  if (!params.hasOwnProperty('video_id')) {
    throw new MusicError({
      status: 'error',
      message: 'video_id does not exists!'
    }, 400)
  }

  try {
    found = await Music.findOneAndRemove({ video_id: { $eq: params.video_id } }).exec()
  } catch (e) {
    throw new MusicError({
      status: 'error',
      message: 'Music not found!'
    }, 404)
  }

  found = found.toObject()

  try {
    let file = path.resolve(__dirname, '../../models/music/' + found.file_name)
    await fs.remove(file)
  } catch (e) {
  }

  return mongofilter(found)
}
