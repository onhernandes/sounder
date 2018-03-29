const music = require('./models/music/route.js')
const user = require('./models/user/route.js')

module.exports = {
    '/api/music': music,
    '/api/user': user
}
