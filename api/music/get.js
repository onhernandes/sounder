const Music = require('./schema.js')

module.exports = async (params, query) => {
  let found

  if (params.video_id) {
    try {
      found = await Music.findOne({ video_id: params.video_id }).exec()
      return found
    } catch (e) {
      return {
        error: 'Not found',
        message: `${e.name} ${e.message}`
      }
    }
  }

  if (typeof query.title !== 'undefined') {
    query.title = new RegExp(query.title, 'i')
  }

  if (typeof query.url !== 'undefined') {
    query.url = new RegExp(query.url, 'i')
  }

  if (typeof query.album !== 'undefined') {
    query.album = new RegExp(query.album, 'i')
  }

  if (typeof query.author !== 'undefined') {
    query.author = new RegExp(query.author, 'i')
  }

  if (typeof query.video_id !== 'undefined') {
    query.video_id = new RegExp(query.video_id, 'i')
  }

  let skip = typeof (query.page) !== 'undefined' && parseInt(query.page) > 1 ? parseInt(query.page) * 15 : 0

  try {
    found = await Music.find(query).skip(skip).exec()
    return found
  } catch (e) {
    return {
      error: 'Not found',
      message: `${e.name} ${e.message}`
    }
  }
}
