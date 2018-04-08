process.on('unhandledRejection', (reason) => {
  console.log('unhandledRejection', {
    code: reason.code,
    message: reason.message,
    stack: reason.stack
  })

  process.exit(0)
})

require('./api/init/db')('mongodb://localhost/soundman')
let path = require('path')
let express = require('express')
let app = express()
let bodyParser = require('body-parser')
let routes = require('./api/routes.js')

app.set('views', path.join(__dirname, '/public'))
app.engine('html', require('ejs').renderFile)

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// public data
app.use(express.static('public'))

// parse application/json
app.use(bodyParser.json())

Object.keys(routes).forEach(key => {
  app.use(key, routes[key])
})

app.listen(3000, () => {
  console.log('Started')
})
