const path = require('path')
const logger = require('./logger.js')
const yt = require('ytdl-core')
const ffmpeg = require('fluent-ffmpeg')
const meta = require('ffmetadata')
const stream = require('stream')
const Music = require('./schema.js')

function Youtube (url) {
  this.url = url
}

Youtube.prototype.getData = async function () {
  let data = await yt.getInfo(this.url)
  return data
}

Youtube.prototype.download = async function () {
  return yt(this.url, { quality: 'lowest' })
}

Youtube.prototype.convert = async function (readable, id, filename) {
  let file = path.resolve(__dirname, '../../music/' + filename)

  return new Promise((resolve, reject) => {
    if (!(readable instanceof stream.Stream) && typeof (readable._read) !== 'function' && typeof (readable._readableState) !== 'object') {
      Music.increaseTries(id)
        .then(() => reject(new Error('Did not received a readable stream from ytdl-core')))
    }

    let converting = ffmpeg(readable)
      .noVideo()
      .audioCodec('libmp3lame')
      .save(file)

    converting.on('error', (err, stdout, stderr) => {
      // get status back to 'pending'
      logger.log('error', 'error when converting music', {
        err: err.message,
        stdout: stdout,
        stderr: stderr,
        id: id
      })

      Music.increaseTries(id)
        .then(() => reject(new Error('could not convert music')))
    })

    converting.on('start', () => {
      // update status to 'downloading'
      Music.findByIdAndUpdate(id, {status: 'downloading'}, () => { })
    })

    converting.on('end', () => {
      Music.findByIdAndUpdate(id, {status: 'downloaded'}, () => { })
      resolve(true)
    })
  })
}

Youtube.prototype.getData = async function (url) {
  let info = await yt.getInfo(this.url || url)

  return {
    title: info.title || '',
    author: info.author.name || '',
    cover: info.iurlmaxres || ''
  }
}

Youtube.prototype.writeMusicData = async function (filename, data) {
  return new Promise((resolve, reject) => {
    let file = path.resolve(__dirname, '../music/' + filename)
    let options = {
      attachments: data.cover
    }

    let metadata = {
      title: data.title || '',
      label: data.title || '',
      album: data.album || '',
      artist: data.author || ''
    }

    meta.write(file, metadata, options, err => {
      if (err) {
        reject(err)
      }

      resolve()
    })
  })
}

module.exports = Youtube
