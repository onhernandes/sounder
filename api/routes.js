const music = require('music/route.js')
const login = require('login/route.js')

module.exports = (app) => {
  app.use('/api/login', login)
  app.use('/api/music', music)
}
