const YT = require('../../api/lib/youtube/youtube.js')
const Music = require('../../api/music/schema.js')
const fs = require('fs-extra')
const pid = process.pid

console.log(`Worker ${pid} started`)

const exec = async (music) => {
  this.yt = new YT(music)
  this.apiData = await this.yt.getData()
  this.music = music
  this.filename = this.music.title.length > 0 ? this.music.title : this.apiData.title
  music.status = 'downloading'
  await music.save()

  if (this.filename.length === 0) {
    this.filename = this.music._id
  }

  let filename = `${music._id}.mp3`
  let tmp = await this.yt.download()
  let final = await this.yt.convert(tmp, filename)

  let metadata = await this.yt.writeMetaData(final, {
    title: music.title || this.apiData.title,
    author: music.author || this.apiData.author,
    album: music.album || '',
    cover: [music.cover || this.apiData.cover]
  })

  await fs.remove(tmp)
  music.status = 'downloaded'

  if (metadata && await music.save()) {
    return final
  } else {
    throw new Error('Could not write metadata')
  }
}

process.on('message', (message) => {
  if (!message.data._id) {
    process.exit(0)
  }

  Music.findOne({ _id: message.data._id }).exec()
    .then(exec)
    .then(result => {
      console.log(result)
      process.exit(0)
    })
    .catch(e => {
      console.error(e)
      process.exit(0)
    })
})
