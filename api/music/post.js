const Music = require('mongoose').model('Music')
const mongofilter = require('../helpers/mongo_filter')
const MusicError = require('./error')
const yt = require('ytdl-core')

async function _post (body) {
  if (!body.hasOwnProperty('url')) {
    throw new MusicError({
      error: 'URL not found'
    }, 400)
  }

  body.video_id = yt.getURLVideoID(body.url)

  if (!body.video_id) {
    throw new MusicError({
      error: 'Could not parse YoutubeID!'
    }, 400)
  }

  try {
    let song = await Music.create(body)
    return mongofilter(song.toObject())
  } catch (e) {
    if (e.code === 11000) {
      throw new MusicError({
        error: 'Music already exists'
      }, 409)
    } else {
      throw new MusicError({
        error: e.name,
        message: e.message,
        code: e.code
      }, 400)
    }
  }
}

module.exports = (body) => {
  if (!Array.isArray(body)) {
    body = [body]
  }

  return Promise.all(body.map(_post))
}
