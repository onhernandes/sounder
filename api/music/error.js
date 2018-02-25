function MusicError (response, code) {
  this.response = (response || '')
  this.code = (code || 0)
  this.name = 'MusicError'
}

MusicError.prototype = Error.prototype

module.exports = MusicError
