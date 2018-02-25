const Music = require('./schema.js')
const mongofilter = require('../helpers/mongo_filter.js')
const MusicError = require('./error.js')

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

  if (typeof (query.title) !== 'undefined') {
    query.title = /query.title/
  }

  if (typeof (query.url) !== 'undefined') {
    query.url = /query.url/
  }

  if (typeof (query.album) !== 'undefined') {
    query.album = /query.album/
  }

  if (typeof (query.author) !== 'undefined') {
    query.author = /query.author/
  }

  if (typeof (query.video_id) !== 'undefined') {
    query.video_id = /query.video_id/
  }

  if (typeof (query.next) !== 'undefined') {
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
