import Router from 'koa-router'
import service from './service'

const router = new Router({ prefix: '/api/songs' })

router.get('/', async ctx => {
  ctx.body = await service.create(ctx.request.body)
})

export default router
