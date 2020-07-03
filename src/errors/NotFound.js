function NotFound () {
  this.id = 0
  this.message = 'Object not found'
}

NotFound.prototype = new Error()

module.exports = NotFound
