#!/usr/bin/node
const db = require('../../api/init/db')
const mongoose = require('mongoose')
const downloader = require('./download')

const main = async () => {
  await db('mongodb://localhost/soundman')
  const Music = mongoose.model('Music')
  const query = { status: 'pending' }
  const musics = await Music.find(query).exec()

  if (musics.length === 0) {
    console.log('Any music available for downloading')
    return
  }

  const download = song => {
    try {
      return downloader(song)
    } catch (e) {
      console.error(e)
      const find = { _id: song._id }
      const update = { $inc: { tries: 1 } }
      return Music.findOneAndUpdate(find, update).exec()
    }
  }

  await Promise.all(musics.map(download))
  console.log(`Download finished for ${musics.length} musics`)
  process.exit()
}

main()
  .then()
  .catch(console.error)
