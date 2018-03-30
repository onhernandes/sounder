const music = require('./music/route.js')
const user = require('./user/route.js')

module.exports = {
  '/api/music': music,
  '/api/user': user
}
