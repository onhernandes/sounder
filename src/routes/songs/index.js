const router = require('koa-router')({ prefix: '/api/songs' })
const Op = require('sequelize').Op
const Song = require('../../db/Song')
const NotFound = require('../../errors/NotFound')
const InvalidProperty = require('../../errors/InvalidProperty')
const InsufficientData = require('../../errors/InsufficientData')
const checkSongMiddleware = require('./checkSongMiddleware')

router.get('/', async ctx => {
  const songs = await Song.findAll({
    attributes: ['id', 'title']
  })

  ctx.body = songs
})

router.get('/:id', async ctx => {
  const found = await Song.findOne({
    where: {
      id: {
        [Op.eq]: ctx.params.id
      }
    }
  })

  if (!found) {
    throw new NotFound()
  }

  const lastModified = (new Date(found.updatedAt)).getTime()
  ctx.set('Last-Modified', lastModified)
  ctx.set('ETag', found.version)

  delete found.version
  delete found.updatedAt

  ctx.body = found
})

router.post('/', async ctx => {
  const body = ctx.request.body

  if (Object.prototype.hasOwnProperty.apply(body, ['videoUrl']) === false) {
    throw new InvalidProperty('videoUrl')
  }

  const created = await Song.create(body)

  ctx.set('Location', `/api/songs/${created.id}`)
  const lastModified = (new Date(created.updatedAt)).getTime()
  ctx.set('Last-Modified', lastModified)
  ctx.set('ETag', created.version)

  ctx.status = 201
  ctx.body = created
})

router.put('/:id', checkSongMiddleware, async ctx => {
  const body = ctx.request.body
  const where = {
    id: {
      [Op.eq]: ctx.params.id
    }
  }

  const acceptableFields = ['title', 'author', 'cover']
  const toUpdate = {}

  acceptableFields.forEach(field => {
    if (Object.prototype.hasOwnProperty.apply(body, [field])) {
      toUpdate[field] = body[field]
    }
  })

  if (Object.keys(toUpdate).length === 0) {
    throw new InsufficientData()
  }

  await Song.update(
    toUpdate,
    { where }
  )

  const updatedInfo = await Song.findOne({
    where,
    attributes: ['updatedAt', 'version']
  })

  const lastModified = (new Date(updatedInfo.updatedAt)).getTime()
  ctx.set('Last-Modified', lastModified)
  ctx.set('ETag', updatedInfo.version)

  ctx.status = 204
})

router.delete('/:id', checkSongMiddleware, async ctx => {
  const where = {
    id: {
      [Op.eq]: ctx.params.id
    }
  }

  await Song.destroy(
    { where }
  )

  ctx.status = 204
})

module.exports = router
