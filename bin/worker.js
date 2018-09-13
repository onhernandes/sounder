module.exports = async () => {
  await db('mongodb://localhost/soundman')
  const Music = mongoose.model('Music')
  const query = { status: 'pending' }
  const musics = await Music.find(query).exec()

  if (musics.length === 0) {
    console.log('There are no songs available to download.');
    return
  }

  console.log(`Got ${musics.length} song(s) to download...starting.`);

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

