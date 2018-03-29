let express = require('express')
let router = express.Router()
let _delete = require('./delete.js')
let _post = require('./post.js')
let _put = require('./put.js')
let _get = require('./get.js')
let logger = require('../../helpers/logger.js')

/*
* logging middleware
*/
router.use((req, res, next) => {
  logger.log('info', 'API accessed :: ' + req.method)
  next()
})

/*
* Add application/json header
*/
router.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json')
  next()
})

/*
* GET: get a specific music data using video_id
*/
router.get('/:video_id?', (req, res) => {
  _get(req.params, req.query)
    .then(result => {
      res.end(JSON.stringify(result, null, 2))
    })
    .catch(err => {
      if (err.code && err.response) {
        res.status(err.code).end(JSON.stringify(err.response, null, 2))
      } else {
        res.status(500).end(JSON.stringify(err, null, 2))
      }
    })
})

/*
* POST: add a music to db
*/
router.post('/', (req, res) => {
  _post(req.body)
    .then(result => {
      res.end(JSON.stringify(result, null, 2))
    })
    .catch(err => {
      if (err.code && err.response) {
        res.status(err.code).end(JSON.stringify(err.response, null, 2))
      } else {
        res.status(500).end(JSON.stringify(err, null, 2))
      }
    })
})

/*
* DELETE: deletes a music
*/
router.delete('/:video_id', (req, res) => {
  _delete(req.params)
    .then(result => {
      res.end(JSON.stringify(result, null, 2))
    })
    .catch(err => {
      if (err.code && err.response) {
        res.status(err.code).end(JSON.stringify(err.response, null, 2))
      } else {
        res.status(500).end(JSON.stringify(err, null, 2))
      }
    })
})

/*
* PUT: updates a music title, cover, album and author
*/
router.put('/:video_id', (req, res) => {
  _put(req.params, req.body)
    .then(result => {
      res.status(204).end()
    })
    .catch(err => {
      if (err.code && err.response) {
        res.status(err.code).end(JSON.stringify(err.response, null, 2))
      } else {
        res.status(500).end(JSON.stringify(err, null, 2))
      }
    })
})

module.exports = router
