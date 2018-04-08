const mongoose = require('mongoose')
const reqDir = require('require-directory')

module.exports = (url) => {
  return new Promise((resolve, reject) => {
    mongoose.Promise = Promise
    mongoose.connect(url)
    mongoose.connection.on('error', reject)

    mongoose.connection.once('open', () => {
      reqDir(module, '../', { include: /schema.js$/ })
      console.log('Mongoose is connected')
      resolve(mongoose)
    })
  })
}
