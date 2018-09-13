const db = require('../api/init/db')

module.exports = async (music) => {
  await db()
  const mongoose = require('mongoose')
  const Music = mongoose.model('Music')
  await Music.create(music)
  return true
}
