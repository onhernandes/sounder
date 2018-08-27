const Music = require('mongoose').model('Music')
const mongofilter = require('../helpers/mongo_filter')
const MusicError = require('./error')

module.exports = async (params, query) => {
  if (params.video_id) {
    try {
      let song = await Music.findOne({ video_id: params.video_id }).lean().exec()

      if (!song) {
        throw new MusicError({
          error: 'not found'
        }, 404)
      }

      return mongofilter(song)
    } catch (e) {
      if (e instanceof MusicError) {
        throw e
      }

      throw new MusicError({
        error: e.name,
        message: e.message,
        code: e.code
      }, 400)
    }
  }

  if (query.title) {
    query.title = new RegExp(query.title)
  }

  if (query.url) {
    query.url = /query.url/
  }

  if (query.album) {
    query.album = new RegExp(query.album)
  }

  if (query.author) {
    query.author = /query.author/
  }

  if (query.video_id) {
    query.video_id = /query.video_id/
  }

  if (query.next) {
    query._id = { $gte: query.next }
    delete query.next
  }

  try {
    let songs = await Music.find(query).lean().limit(20).exec()
    return mongofilter(songs)
  } catch (e) {
    throw new MusicError({
      error: e.name,
      message: e.message,
      code: e.code
    }, 400)
  }
}
