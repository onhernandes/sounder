const InsufficientData = require('../errors/InsufficientData')
const NotFound = require('../errors/NotFound')
const InvalidProperty = require('../errors/InvalidProperty')

module.exports = async (ctx, next) => {
  let content

  try {
    await next()
    content = ctx.body
  } catch (e) {
    ctx.status = 500
    content = {
      id: e.id,
      message: e.message
    }

    if (e instanceof NotFound) {
      ctx.status = 404
    }

    if (e instanceof InsufficientData || e instanceof InvalidProperty) {
      ctx.status = 400
    }

    ctx.app.emit('error', e, ctx)
  }

  ctx.body = content
}
