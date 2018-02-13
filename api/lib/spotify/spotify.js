'use strict'

let mongoose = require('mongoose')
let Q = require('q')
let Music = require('./schema.js')
let { getMusicDataFromYT } = require('./utils.js')
let SpotifyWrapper = require('spotify-web-api-node')

// Use Q.Promise on Mongoose
mongoose.Promise = Q.Promise

function Spotify (data, credentials) {
  this.api = new SpotifyWrapper(data)
  this.credentials = credentials
  this.user = null

  this.api.setAccessToken(credentials.spotify_access)
  this.api.setRefreshToken(credentials.spotify_refresh)

/**
* {@return} an array of musics allowed to Spotify
*/
  this.getAvailable = () => {
    return Music.find({ spotify: true, status: 'pending' })
  }

/**
* {@return} a Spotify's User object
*/
  this.getUser = () => {
    return new Promise((resolve, reject) => {
      this.api.getMe()
    .then(user => {
      this.user = user.body
      resolve(user.body)
    })
    .catch(e => reject(e))
    })
  }

/**
* {@return} a Spotify's API Wrapper instance
* Use credentials for storing access_tokens, should be Users
* Reload the access_token if needed
*/
  this.validateToken = () => {
    return new Promise((resolve, reject) => {
      let old = new Date(this.credentials.spotify_created)

      if (old > new Date()) {
        resolve(true)
      } else {
        this.api.refreshAccessToken(null)
      .then(data => {
        this.credentials.spotify_access = data.body.access_token
        this.credentials.spotify_expires = data.body.expires_in

        this.credentials.save(err => {
          if (err) {
            reject(err)
          }
        })

        this.api.setAccessToken(data.body.access_token)

        resolve(true)
      })
      .catch(e => reject(e))
      }
    })
  }

/**
* {@return} either track found or false
*/
  this.findInSpotify = (music) => {
    return new Promise((resolve, reject) => {
      this.toSpotifySearch(music)
    .then(search => this.api.searchTracks(search))
    .then(found => {
      if (found.body.tracks.items.length > 0) {
        music.spotify_status = 'sent'
        music.spotify_uri = found.body.tracks.items[0].uri
        music.save(e => {
          resolve(found.body.tracks.items[0])
        })
      } else {
        music.spotify_status = 'not-found'
        music.save(e => {
          resolve(false)
        })
      }
    })
    .catch(e => reject(e))
    })
  }

/**
* {@return} an array with playlist's data within MongoDB
*/
  this.getLocalData = () => {
    return new Promise((resolve, reject) => {
      Music.find({ spotify: true, spotify_status: { $ne: 'not-found' } })
    .then(allFound => {
      let list = {}, final = []

      allFound.forEach(it => {
        let playlist_name = it.playlist.length > 0 ? it.playlist : 'Soundman'

        if (!list.hasOwnProperty(it.playlist)) {
          list[it.playlist] = {
            playlist: it.playlist,
            playlist_id: '',
            tracks: []
          }
        }

        list[it.playlist].tracks.push(it)
      })

      Object.keys(list).forEach(item => {
        final.push(list[item])
      })

      resolve(final)
    })
    .catch(e => reject(e))
    })
  }

/**
* {@return} Either return a Spotify's playlist or create one then returns it
*/
  this.setPlaylistSpotify = (name) => {
    return new Promise((resolve, reject) => {
      this.getPlaylist(name)
    .then(list => {
      if (list.length > 0) {
        resolve(list[0])
        return null
      } else {
        return this.api.createPlaylist(this.user.id, name)
      }
    })
    .then(status => {
      if (status) {
        resolve(status.body)
      }
    })
    .catch(e => reject(e))
    })
  }

/**
* {@return} Spotify formatted search string
*/
  this.toSpotifySearch = (music) => {
    return new Promise((resolve, reject) => {
      getMusicDataFromYT(music.url)
    .then(title => {
      let track = title
      let artist = music.author
      let splitted = title.indexOf(' - ') !== -1 ? title.split(' - ') : false

      if (splitted !== false) {
        artist = splitted[0]
        track = splitted[1]

        if (artist.indexOf(',') !== -1) {
          artist = artist.split(',')[0]
        }

        if (track.indexOf('(') !== -1) {
          track = track.split('(')[0]
        }
      }

      resolve('track:' + track + ' artist:' + artist)
    })
    .catch(e => reject(e))
    })
  }

/**
* {@return} an array of playlists that matches the `name` and the owner is the user
*/
  this.getPlaylist = (name) => {
    return new Promise((resolve, reject) => {
      this.api.getUserPlaylists(this.user.id)
    .then(found => {
      resolve(found.body.items.filter(it => it.owner.id === this.user.id && it.name.indexOf(name) !== -1))
    })
    .catch(e => reject(e))
    })
  }

/**
* {@return} the snapshot id
*/
  this.addToPlaylist = (tracks, playlist) => {
    return new Promise((resolve, reject) => {
      this.api.addTracksToPlaylist(this.user.id, playlist, tracks)
    .then(data => {
      resolve(data.body.snapshot_id)
    })
    .catch(e => reject(e))
    })
  }

/**
* {@return} true for success
*/
  this.sendPlaylist = (playlist) => {
    return new Promise((resolve, reject) => {
      Promise.resolve()
    .then(() => Promise.all(playlist.tracks.map(this.findInSpotify)))
    .then(allDone => {
      playlist.tracks = allDone.filter(it => it !== false)
      return this.setPlaylistSpotify(playlist.playlist)
    })
    .then(playlistWithinSpotify => {
      playlist.playlist_id = playlistWithinSpotify.id
      return this.addToPlaylist(playlist.tracks.map(it => it.uri), playlist.playlist_id)
    })
    .then(added => {
      resolve(true)
    })
    .catch(e => reject(e))
    })
  }
}

module.exports = Spotify
