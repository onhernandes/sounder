function UserError (response, code) {
    this.response = (response || '')
    this.code = (code || 0)
    this.name = 'MusicError'
}

UserError.prototype = Error.prototype

module.exports = UserError
