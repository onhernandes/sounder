const Music = require('mongoose').model('Music')
const MusicError = require('./error')

module.exports = async (params, body) => {
  let music = false

  try {
    music = await Music.findOne({ video_id: params.video_id }).exec()

    if (!music) {
      throw new MusicError({
        error: 'not music'
      }, 404)
    }
  } catch (e) {
    throw new MusicError({
      error: e.name,
      message: e.message,
      code: e.code
    }, 400)
  }

  if (body.status) {
    delete body.status
  }

  music.set(body)

  if (body.update) {
    music.status = 'pending'
  }

  try {
    return await music.save()
  } catch (e) {
    throw new MusicError({
      error: e.name,
      message: e.message,
      code: e.code
    }, 400)
  }
}
