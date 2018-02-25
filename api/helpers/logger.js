const winston = require('winston')
const path = require('path')

let logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({
      name: 'info-logging',
      filename: path.resolve(__dirname, '../../log/info.log'),
      level: 'info'
    }),
    new (winston.transports.File)({
      name: 'debug-logging',
      filename: path.resolve(__dirname, '../../log/debug.log'),
      level: 'debug'
    }),
    new (winston.transports.File)({
      name: 'error-logging',
      filename: path.resolve(__dirname, '../../log/error.log'),
      level: 'error'
    })
  ]
})

module.exports = logger
