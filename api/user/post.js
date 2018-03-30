const User = require('./schema')
const mongofilter = require('../helpers/mongo_filter')
const UserError = require('./error')

async function _post (body) {
  let post = body
  let basic = ['name', 'username', 'email', 'password', 'active', 'admin', 'token']

  // simpliest (and dirty? idk) way to check and validate for parameters
  Object.keys(post).forEach(key => {
    // remove any either unused or not allowed parameters
    if (basic.indexOf(key) === -1) {
      delete post[key]
    }
  })

  try {
    let user = new User(post)
    return mongofilter((await user.save()).toObject())
  } catch (e) {
    if (e.code === 11000) {
      throw new UserError({
        error: 'User already exists'
      }, 409)
    }

    throw new UserError({
      error: e.name,
      message: e.message,
      code: e.code
    }, 400)
  }
}

module.exports = async (body) => {
  if (Array.isArray(body)) {
    let err = 0
    let promise = body.map(async it => {
      try {
        return await _post(it)
      } catch (e) {
        err++
        return (e.response || e)
      }
    })

    let all = await Promise.all(promise)

    if (err < body.length) {
      return all
    } else {
      throw new UserError(all, 409)
    }
  }

  let result = await _post(body)
  return result
}
