let express = require('express')
let router = express.Router()
let _delete = require('./delete.js')
let _post = require('./post.js')
let _put = require('./put.js')
let _get = require('./get.js')
let logger = require('../helpers/logger.js')

/*
* logging middleware
*/
router.use((req, res, next) => {
  logger.log('info', 'API accessed :: ' + req.method)
  next()
})

/*
* POST: add a music to db
*/
router.post('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  _post(req.body)
    .then(result => {
      res.end(JSON.stringify(result))
    })
    .catch(err => {
      res.end(JSON.stringify(err))
    })
})

/*
* GET: get a specific music data using video_id
*/
router.get('/:video_id?', (req, res) => {
  _get(req.params, req.query)
    .then(result => {
      res.end(JSON.stringify(result))
    })
    .catch(err => {
      res.end(JSON.stringify(err))
    })
})

/*
* DELETE: deletes a music
*/
router.delete('/:video_id', (req, res) => {
  _delete(req.params)
    .then(result => {
      res.end(JSON.stringify(result))
    })
    .catch(err => {
      res.end(JSON.stringify(err))
    })
})

/*
* PUT: updates a music title, cover, album and author
*/
router.put('/:video_id', (req, res) => {
  _put(req.params, req.body)
    .then(result => {
      res.end(JSON.stringify(result))
    })
    .catch(err => {
      res.end(JSON.stringify(err))
    })
})

module.exports = router
