const fs = require('fs')
const path = require('path')
const os = require('os')
const url = require('url')
const yt = require('ytdl-core')
const ffmpeg = require('fluent-ffmpeg')
const ffmetadata = require('ffmetadata')
const urlToFile = require('../../api/helpers/url_to_file')
const remove = (f) => new Promise((resolve, reject) => {
  fs.unlink(f, (err) => {
    if (err) {
      reject(err)
    } else {
      resolve(true)
    }
  })
})

const ensure = (folder) => new Promise((resolve, reject) => {
  fs.stat(folder, (err, stats) => {
    if (err) {
      return fs.mkdir(folder, (err) => err ? reject(err) : resolve())
    }

    resolve()
  })
})

const download = (url, filepath) => new Promise((resolve, reject) => {
  const streaming = yt(url, { quality: 'lowest' })
    .pipe(fs.createWriteStream(filepath))

  streaming.on('finish', resolve)
  streaming.on('error', reject)
})

const convert = (filepath, savepath) => new Promise((resolve, reject) => {
  const streaming = ffmpeg(filepath).noVideo().audioCodec('libmp3lame').save(savepath)

  streaming.on('error', reject)
  streaming.on('end', resolve)
})

const generateCover = (cover, urlDefault) => {
  cover = cover || urlDefault

  if (!Array.isArray(cover)) {
    cover = [cover]
  }

  const generate = p => {
    const test = url.parse(p)

    if (!test.host && !test.hostname) {
      return p
    }

    const downloadPath = path.join('/tmp/soundman/', `${Date.now()}.jpg`)

    return urlToFile(p, downloadPath)
  }

  return Promise.all(cover.map(generate))
}

const writeMetadata = (meta, filepath) => new Promise((resolve, reject) => {
  ffmetadata.write(filepath, meta, meta, e => e ? reject(e) : resolve())
})

const exec = async music => {
  const source = await yt.getInfo(music.url)
  const title = music.title || source.title
  const artist = music.author || source.author.name
  const album = music.album || ''
  const filename = `${title} - ${artist}`
  const tmp = '/tmp/soundman/'

  // Ensure soundman folder exists
  await Promise.all([
    ensure(path.join(os.homedir(), 'soundman/')),
    ensure(tmp)
  ])

  // Download music as MP4 video
  await download(music.url, path.join(tmp, `${filename}.mp4`))

  // Convert to MP3
  const destiny = path.join(os.homedir(), 'soundman/', `${filename}.mp3`)
  await convert(path.join(tmp, `${filename}.mp4`), destiny)

  // Write metadata
  const attachments = await generateCover(music.cover, `https://i.ytimg.com/vi/${music.video_id}/hqdefault.jpg`)
  await writeMetadata({ title, album, attachments, artist }, destiny)

  music.status = 'downloaded'

  attachments.push(path.join(tmp, `${filename}.mp4`))

  await Promise.all(attachments.map(remove))
  await music.save()

  return destiny
}

module.exports = exec

