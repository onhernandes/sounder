const Music = require('./schema.js')
const mongofilter = require('../helpers/mongo_filter.js')
const MusicError = require('./error.js')
const yt = require('ytdl-core')

async function _post (body) {
  let post = body
  let basic = ['title', 'url', 'author', 'album', 'cover', 'playlist', 'spotify']

  if (!post.hasOwnProperty('url')) {
    throw new MusicError({
      error: 'URL not found'
    }, 400)
  }

  // simpliest (and dirty? idk) way to check and validate for parameters
  Object.keys(post).forEach(key => {
    // remove any either unused or not allowed parameters
    if (basic.indexOf(key) === -1) {
      delete post[key]
    }
  })

  post.video_id = yt.getURLVideoID(post.url)

  if (!post.video_id) {
    throw new MusicError({
      error: 'Could not parse YoutubeID!'
    }, 400)
  }

  try {
    let song = new Music(post)
    let saved = await song.save()
    return mongofilter(saved.toObject())
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

module.exports = async (body) => {
  if (Array.isArray(body)) {
    let err = 0
    let promise = body.map(async it => {
      try {
        return await _post(it)
      } catch (e) {
        err++
        return (e.response || e)
      }
    })

    let all = await Promise.all(promise)

    if (err < body.length) {
      return all
    } else {
      throw new MusicError(all, 409)
    }
  }

  let result = await _post(body)
  return result
}
