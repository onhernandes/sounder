const Music = require('./schema.js')

module.exports = async (post) => {
  let basic = ['title', 'url', 'author', 'album', 'cover', 'playlist', 'spotify']
  let has = false
  let u

  // simpliest (and dirty? idk) way to check and validate for parameters
  Object.keys(post).forEach(key => {
    // 'url' is essential
    if (key === 'url') { has = true }

    // remove any either unused or not allowed parameters
    if (basic.indexOf(key) === -1) {
      delete post[key]
    }
  })

  if (has === false || post.url.indexOf('youtu') === -1) {
    return {
      error: 'invalid parameters'
    }
  }

  u = post.url

  if (u.indexOf('watch?v=') !== -1) {
    u = u.split('watch?v=')
    u = u[1]
  } else if (u.indexOf('youtu.be/') !== -1) {
    u = u.split('youtu.be/')
    u = u[1]
  }

  post.video_id = u

  try {
    let m = new Music(post)
    let music = await m.save()

    return {
      status: 'created, will be downloaded soon',
      video_id: music.video_id
    }
  } catch (e) {
    return {
      error: 'save',
      message: `${e.name} ${e.message}`
    }
  }
}
