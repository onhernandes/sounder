function InvalidProperty (property) {
  this.name = 'InvalidProperty'
  this.id = 0
  this.message = `The ${property} is invalid or empty`
}

InvalidProperty.prototype = new Error()

module.exports = InvalidProperty
