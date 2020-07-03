function InsufficientData () {
  this.id = 1
  this.message = 'Insufficient data was provided to process this request'
}

InsufficientData.prototype = new Error()

module.exports = InsufficientData
