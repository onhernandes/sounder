const User = require('./schema')
const UserError = require('./error')

module.exports = async (params, body) => {
  let found = false

  try {
    found = await User.findOne({ _id: params.id }).exec()

    if (!found) {
      throw new UserError({
        error: 'not found'
      }, 404)
    }
  } catch (e) {
    throw new UserError({
      error: e.name,
      message: e.message,
      code: e.code
    }, 400)
  }

  let keys = ['name', 'username', 'email', 'password', 'active', 'admin', 'token']

  keys.map(k => {
    if (body.hasOwnProperty(k) && found.toObject().hasOwnProperty(k) && found[k] !== body[k]) {
      found[k] = body[k]
    }
  })

  try {
    return await found.save()
  } catch (e) {
    throw new UserError({
      error: e.name,
      message: e.message,
      code: e.code
    }, 400)
  }
}
