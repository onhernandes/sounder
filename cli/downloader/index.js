require('../../api/init/db.js')()
const cluster = require('cluster')
const numCPUs = require('os').cpus().length
const Music = require('../../api/music/schema.js')
let songs

if (cluster.isMaster) {
  Music.find({ status: 'pending' }).exec()
    .then(result => {
      songs = result

      if (songs.length === 0) {
        console.log('There is no music to be processed.')
        process.exit(0)
      }

      console.log(`Got ${songs.length} songs, sending to workers`)

      for (var i = 0; i < numCPUs; i++) {
        cluster.fork()
      }

      cluster.on('online', (worker) => {
        if (songs.length > 0) {
          worker.send({ data: songs.shift() })
        }
      })

      cluster.on('exit', (worker, code, signal) => {
        if (songs.length > 0) {
          cluster.fork()
        }
      })
    })
    .catch(e => console.error(e))
} else {
  require('./download.js')
}
