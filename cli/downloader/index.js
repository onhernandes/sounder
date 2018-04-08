const db = require('../../api/init/db')

db('mongodb://localhost/soundman')
  .then(mongoose => {
    const cluster = require('cluster')
    const Music = mongoose.model('Music')
    let numCPUs = require('os').cpus().length

    if (cluster.isMaster) {
      Music.find({ status: 'pending' }).count().exec()
        .then(result => {
          if (result === 0) {
            console.log('There is no music to be processed.')
            process.exit(0)
          }

          console.log(`Got ${result} songs, sending to workers`)

          for (var i = 0; i < numCPUs; i++) {
            cluster.fork()
          }

          cluster.on('online', (worker) => {
            if (result > 0) {
              result--
            }
          })

          cluster.on('exit', (worker, code, signal) => {
            if (result > 0) {
              cluster.fork()
            }
          })
        })
        .catch(e => console.error(e))
    } else {
      require('./download')
    }
  })
  .catch(console.error)
