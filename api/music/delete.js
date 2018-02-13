const Music = require('./schema.js')
const path = require('path')
const fs = require('fs-extra')

module.exports = async (params) => {
  let found

  if (!params.hasOwnProperty('video_id')) {
    return {
      status: 'error',
      message: 'video_id does not exists!'
    }
  }

  try {
    found = await Music.findOneAndRemove({ video_id: { $eq: params.video_id } }).exec()
  } catch (e) {
    return {
      status: 'error',
      message: 'Music not found!'
    }
  }

  try {
    let file = path.resolve(__dirname, '../music/' + found.file_name)
    await fs.remove(file)
  } catch (e) {
    return {
      status: 'deleted',
      message: 'Music deleted from our database but the file was not found!',
      title: found.title,
      url: found.url
    }
  }

  return {
    status: 'deleted',
    title: found.title,
    url: found.url
  }
}
