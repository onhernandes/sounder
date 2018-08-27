const Music = require('mongoose').model('Music')
const MusicError = require('./error')
const path = require('path')
const fs = require('fs-extra')
const mongofilter = require('../helpers/mongo_filter')

module.exports = async (params) => {
  let music

  if (!params.hasOwnProperty('video_id')) {
    throw new MusicError({
      status: 'error',
      message: 'video_id does not exists!'
    }, 400)
  }

  try {
    music = await Music.findOneAndRemove({ video_id: { $eq: params.video_id } }).lean().exec()
  } catch (e) {
    throw new MusicError({
      status: 'error',
      message: 'Music not found!'
    }, 404)
  }

  let file = path.resolve(__dirname, '../../downloads/' + music.file_name)
  await fs.remove(file)

  return mongofilter(music)
}
