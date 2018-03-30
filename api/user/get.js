const User = require('./schema')
const mongofilter = require('../helpers/mongo_filter')
const UserError = require('./error')

module.exports = async (params, query) => {
  if (params.id) {
    try {
      let song = await User.findOne({ _id: params.id }).lean().exec()

      if (!song) {
        throw new UserError({
          error: 'not found'
        }, 404)
      }

      return mongofilter(song)
    } catch (e) {
      if (e instanceof UserError) {
        throw e
      }

      throw new UserError({
        error: e.name,
        message: e.message,
        code: e.code
      }, 400)
    }
  }

  if (typeof (query.name) !== 'undefined') {
    query.name = /query.name/
  }

  if (typeof (query.username) !== 'undefined') {
    query.username = /query.username/
  }

  if (typeof (query.email) !== 'undefined') {
    query.email = /query.email/
  }

  if (typeof (query.password) !== 'undefined') {
    query.password = /query.password/
  }

  if (typeof (query.active) !== 'undefined') {
    query.active = /query.active/
  }

  if (typeof (query.admin) !== 'undefined') {
    query.admin = /query.admin/
  }

  if (typeof (query.token) !== 'undefined') {
    query.token = /query.token/
  }

  if (typeof (query.next) !== 'undefined') {
    query._id = { $gte: query.next }
    delete query.next
  }

  try {
    let users = await User.find(query).lean().limit(20).exec()
    return mongofilter(users)
  } catch (e) {
    throw new UserError({
      error: e.name,
      message: e.message,
      code: e.code
    }, 400)
  }
}
