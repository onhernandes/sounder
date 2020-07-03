const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const errorMiddleware = require('./middlewares/errors')

const app = new Koa()

app.use(bodyParser())
app.use(errorMiddleware)

const routes = ['./routes/songs']

routes.forEach(routerPath => {
  const router = require(routerPath)

  app
    .use(router.routes())
    .use(router.allowedMethods())
})

app.listen(3000)
console.log('API running')
