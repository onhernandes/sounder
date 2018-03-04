const http = require('http')
const fse = require('fs-extra')

/**
 * Downloads data from a given URL then writes to a file
 * @param {string} url - the URL
 * @param {string} file - the full file path
 * @param {function} validator - a function for validating the current url
 * @throws {Error} if URL doesn't pass the validator
 * @returns {Promise}
 */
module.exports = async (url, file, validator) => {
  if (typeof validator === 'function') {
    if (!validator(url)) {
      throw new Error('Given URL did not match the validation!')
    }
  }

  let binary = await new Promise((resolve, reject) => {
    http.get(url, (response) => {
      let data

      response.on('data', (chunk) => {
        data += chunk
      })

      response.on('end', () => {
        resolve(data)
      })
    }).on('error', reject)
  })

  return fse.outputFile(file, binary)
}
