const YT = require('../../api/lib/youtube/youtube')
const fs = require('fs')
const path = require('path')
const urlToFile = require('../../api/helpers/url_to_file')
const pid = process.pid
const remove = (f) => new Promise((resolve, reject) => {
  fs.unlink(f, (err) => {
    if (err) {
      reject(err)
    } else {
      resolve(true)
    }
  })
})

console.log(`Worker ${pid} started`)

const exec = async (music) => {
  this.yt = new YT(music)
  this.apiData = await this.yt.getData()
  this.music = music
  this.filename = this.music.title.length > 0 ? this.music.title : this.apiData.title
  console.log(`Start downloading:: "${music.title || this.apiData.title}"`)

  if (this.filename.length === 0) {
    this.filename = this.music._id
  }

  let filename = `${music._id}.mp3`
  let tmp = await this.yt.download()
  console.log(`Downloaded MP4 File of "${music.title || this.apiData.title}"`)
  let final = await this.yt.convert(tmp, filename)
  console.log(`Converted MP4 File of "${music.title || this.apiData.title}"`)
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
      const finalfile = path.resolve(__dirname, `../../music/${Date.now()}_${Math.random()}.jpeg`)
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
  console.log(`Metadata Wrote within "${music.title || this.apiData.title}"`)

  mp3metadata.cover.push(tmp)

  await Promise.all(mp3metadata.cover.map(remove))
  console.log(`Removed useless files for "${music.title || this.apiData.title}"`)

  music.status = 'downloaded'

  if (metadata && await music.save()) {
    return final
  } else {
    throw new Error('Could not write metadata')
  }
}

const db = require('../../api/init/db')
db('mongodb://localhost/soundman')
  .then(mongoose => {
    const Music = mongoose.model('Music')
    return Music.findOneAndUpdate({ status: 'pending' }, { $set: { status: 'downloading' } }, { new: true }).exec()
  })
  .then(m => {
    if (!m) {
      process.exit(0)
    }

    return m
  })
  .then(exec)
  .then(data => {
    console.log(`Music downloaded successfully!\nFilepath: ${data}`)
    process.exit(0)
  })
  .catch(e => {
    console.error(e)
    process.exit(0)
  })
