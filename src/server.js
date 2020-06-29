const Koa = require('Koa')
const bodyParser = require('koa-bodyparser')
const app = new Koa()

app.use(bodyParser())

app.listen(8000)
