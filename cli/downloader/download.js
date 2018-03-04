require('../../api/init/db.js')()
const YT = require('../../api/lib/youtube/youtube.js')
const Music = require('../../api/music/schema.js')
const fs = require('fs-extra')
const pid = process.pid

console.log(`Worker ${pid} started`)

const exec = async (music) => {
  console.log('test')
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

  music.status = 'downloaded'
  let metadata = await this.yt.writeMetaData(final, {
    title: music.title || this.apiData.title,
    author: music.author || this.apiData.author,
    album: music.album || '',
    cover: [music.cover || this.apiData.cover]
  })
  .then(fs.remove(tmp))
  .then(music.save())
  .catch(e => console.error(e))

  if (metadata) {
    return final
  } else {
    throw new Error('Could not write metadata')
  }
}

process.on('message', (message) => {
  // if (!message.data._id) {
  //   process.exit(0)
  // }

  // Music.findOne({ _id: message.data._id }).exec()
  //   .then(exec)
  //   .then(result => {
  //     console.log(result)
  //     process.exit(0)
  //   })
  //   .catch(e => {
  //     console.error(e)
  //     process.exit(0)
  //   })
})

Music.findOne({ _id: '5a93037132aa1171f74d721a' }).exec()
  .then(exec)
  .then(result => {
    console.log(result)
    process.exit(0)
  })
  .catch(e => {
    console.error(e)
    process.exit(0)
  })
