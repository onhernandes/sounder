let mongoose = require('mongoose')
let Q = require('q')
let logger = require('./logger.js')
let Spotify = require('./spotify.js')
let Credentials = require('./credentials.js')
let credentialsfile = require('./spotify.json')

// Use Q.Promise on Mongoose
mongoose.Promise = Q.Promise

function doTheJob () {
  let api
  return Credentials.find({}, null, { sort: { spotify_created: -1 } })
    .then(found => {
      api = new Spotify({
        clientId: credentialsfile.client_id,
        clientSecret: credentialsfile.secret_id,
        redirectUri: credentialsfile.uri
      }, found[0])

      return api.validateToken()
    })
    .then(status => {
      return api.getUser()
    })
    .then(user => {
      return api.getLocalData()
    })
    .then(musics => {
      return Promise.all(musics.map(api.sendPlaylist))
    })
    .then(status => {
      logger.log('info', 'send-to-spotify.js ended', status)
      return status
    })
    .catch(e => logger.log('error', 'Ops! Something bad happened while trying to send musics to Spotify!', e))
}

doTheJob()
