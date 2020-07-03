function InvalidProperty (prop) {
  this.id = 2
  this.message = `Propery ${prop} is either empty or invalid`
}

InvalidProperty.prototype = new Error()

module.exports = InvalidProperty
