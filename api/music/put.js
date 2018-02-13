const Music = require('./schema.js')

module.exports = async (params, body) => {
  let found

  if (!params.hasOwnProperty('video_id')) {
    return {
      status: 'error',
      message: 'No video_id!'
    }
  }

  try {
    found = await Music.findOne({ video_id: params.video_id }).exec()
  } catch (e) {
    return {
      status: 'error',
      message: `Not found!`
    }
  }

  let keys = ['title', 'cover', 'album', 'author', 'status']
  let hasChanges = false

  keys.map(k => {
    if (body.hasOwnProperty(k) && found.hasOwnProperty(k) && body[k] !== found[k]) {
      hasChanges = true
      found[k] = body[k]
    }
  })

  if (!hasChanges) {
    return {
      status: 'error',
      message: 'No changes were found!'
    }
  }

  if (body.hasOwnProperty('update') && body.update === true) {
    found.status = 'pending'
  }

  try {
    return {
      status: 'success',
      music: await found.save()
    }
  } catch (e) {
    return {
      status: 'error',
      message: `${e.name} ${e.message}`
    }
  }
}
