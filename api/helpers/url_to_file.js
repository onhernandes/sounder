const http = require('http')
const https = require('https')
const fs = require('fs')

/**
 * Downloads data from a given URL then writes to a file
 * @param {string} url - the URL
 * @param {string} file - the full file path
 * @param {function} validator - a function for validating the current url
 * @throws {Error} if URL doesn't pass the validator
 * @returns {Promise}
 */
module.exports = (url, file, validator) => {
  if (typeof validator === 'function') {
    if (!validator(url)) {
      throw new Error('Given URL did not match the validation!')
    }
  }

  let wstream = fs.createWriteStream(file)

  return new Promise((resolve, reject) => {
    let cb = (response) => {
      response.pipe(wstream)
      wstream.on('finish', function () {
        wstream.close(() => resolve(file))
      })
    }

    let req

    if (url.indexOf('https') !== -1) {
      req = https.get(url, cb)
    } else {
      req = http.get(url, cb)
    }

    req.on('error', reject)
  })
}
