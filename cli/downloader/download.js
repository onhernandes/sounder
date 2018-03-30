require('../../api/init/db.js')()
const YT = require('../../api/lib/youtube/youtube.js')
const Music = require('../../api/models/music/schema.js')
const fs = require('fs-extra')
const path = require('path')
const urlToFile = require('../../api/helpers/url_to_file.js')
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
  let mp3metadata = await (new Promise((resolve, reject) => {
    let mp3data = {
      title: music.title || this.apiData.title,
      author: music.author || this.apiData.author,
      album: music.album || '',
      cover: this.yt.generateCover()
    }

    if (!Array.isArray(mp3data.cover)) {
      mp3data.cover = [mp3data.cover]
    }

    mp3data.cover = mp3data.cover.map(it => {
      const finalfile = path.resolve(__dirname, `../../models/music/${Date.now()}_${Math.random()}.jpeg`)
      const urlvalid = (url) => {
        return url.indexOf('jpg') !== 1 || url.indexOf('jpeg') !== 1 || url.indexOf('png') !== 1
      }

      return urlToFile(it, finalfile, urlvalid)
    })

    Promise.all(mp3data.cover)
      .then(all => {
        mp3data.cover = all
        resolve(mp3data)
      })
      .catch(reject)
  }))

  let metadata = await this.yt.writeMetaData(final, mp3metadata)

  mp3metadata.cover.push(tmp)

  await Promise.all(mp3metadata.cover.map(fs.remove))

  music.status = 'downloaded'

  if (metadata && await music.save()) {
    return final
  } else {
    throw new Error('Could not write metadata')
  }
}

process.on('message', (message) => {
  if (!message.data._id) {
    console.log('Did not received an ID!')
    process.exit(0)
  }

  console.log(`Music ${message.data._id} started`)

  Music.findOne({ _id: message.data._id }).exec()
    .then(exec)
    .then(result => {
      console.log(`Music ${message.data._id} ended`, result)
      process.exit(0)
    })
    .catch(e => {
      console.error(e)
      process.exit(0)
    })
})
