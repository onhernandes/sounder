const Music = require('./schema.js')
const MusicError = require('./error.js')

module.exports = async (params, body) => {
  let found = false

  try {
    found = await Music.findOne({ video_id: params.video_id }).exec()

    if (!found) {
      throw new MusicError({
        error: 'not found'
      }, 404)
    }
  } catch (e) {
    throw new MusicError({
      error: e.name,
      message: e.message,
      code: e.code
    }, 400)
  }

  let keys = ['title', 'cover', 'album', 'author']

  keys.map(k => {
    if (body.hasOwnProperty(k) && found.toObject().hasOwnProperty(k) && found[k] !== body[k]) {
      found[k] = body[k]
    }
  })

  if (typeof body.update !== 'undefined' && body.update !== false) {
    found.status = 'pending'
  }

  try {
    return await found.save()
  } catch (e) {
    throw new MusicError({
      error: e.name,
      message: e.message,
      code: e.code
    }, 400)
  }
}
