const path = require('path')
const logger = require('../../helpers/logger.js')
const yt = require('ytdl-core')
const ffmpeg = require('fluent-ffmpeg')
const ffmetadata = require('ffmetadata')
const fs = require('fs')
const fse = require('fs-extra')
const MUSIC_FOLDER = '../../../music/'
const validUrl = require('valid-url')

function Youtube (music) {
  if (!yt.validateURL(music.url)) {
    throw new Error(`Given music URL is invalid!`)
  }

  this.url = music.url
  this.music = music
  this.video_id = yt.getURLVideoID(music.url)
}

Youtube.prototype.download = function () {
  return new Promise((resolve, reject) => {
    let final = `/tmp/${this.music._id}.mp4`
    let write = fs.createWriteStream(path.resolve(__dirname, final))

    write.on('open', (fd) => {
      yt(this.url, { quality: 'lowest' })
        .pipe(write)
        .on('finish', () => {
          resolve(final)
        })
        .on('error', (err, stdout, stdsomething) => {
          reject(err)
        })
    })
  })
}

Youtube.prototype.convert = async function (tmp, filename) {
  let file = path.resolve(__dirname, MUSIC_FOLDER + filename)
  let id = this.music._id

  return new Promise((resolve, reject) => {
    let converting

    fse.pathExists(tmp)
      .then(exists => {
        if (!exists) {
          reject(new Error(`file ${tmp} does not exists`))
        }
      })
      .catch(reject)
      .then(() => {
        converting = ffmpeg(tmp)
          .noVideo()
          .audioCodec('libmp3lame')
          .save(file)

        converting.on('error', (err, stdout, stderr) => {
          logger.log('error', 'error when converting music', {
            err: err.message,
            stdout: stdout,
            stderr: stderr,
            id: id
          })

          reject(err)
        })

        converting.on('start', () => {})

        converting.on('end', () => {
          resolve(file)
        })
      })
  })
}

Youtube.prototype.getData = async function (url) {
  let info = await yt.getInfo(this.url || url)

  return {
    title: info.title,
    author: info.author.name,
    cover: info.iurlmaxres
  }
}

Youtube.prototype.getImageURL = function (videoid) {
  return `https://i.ytimg.com/vi/${videoid || this.video_id}/hqdefault.jpg`
}

Youtube.prototype.generateCover = function () {
  if (!this.music.cover || this.music.cover.length === 0) {
    return [this.getImageURL()]
  } else {
    return this.music.cover
  }
}

Youtube.prototype.writeMetaData = async function (filename, data) {
  return new Promise((resolve, reject) => {
    let file = filename
    let options = {}

    if (data.cover && Array.isArray(data.cover)) {
      options.attachments = data.cover
    }

    let metadata = {
      title: data.title || '',
      label: data.title || '',
      album: data.album || '',
      artist: data.author || ''
    }

    fse.pathExists(file)
    .then(exists => {
      if (!exists) {
        reject(new Error('File does not exists!'))
      }

      ffmetadata.write(file, metadata, options, err => {
        if (err) {
          reject(err)
        }

        resolve(true)
      })
    })
  })
}

module.exports = Youtube
