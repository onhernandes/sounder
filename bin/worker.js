module.exports = async () => {
  await db('mongodb://localhost/soundman')
  const Music = mongoose.model('Music')
  const query = { status: 'pending' }
  const musics = await Music.find(query).exec()

  if (musics.length === 0) {
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

  return Promise.all(musics.map(download))
}

