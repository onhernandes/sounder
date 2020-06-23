import { createConnection } from 'typeorm'
import config from 'config'
import Koa from 'koa'
import 'reflect-metadata'
import path from 'path'
import bodyparser from 'koa-bodyparser'
import songs from './routes/songs'

const connect = () => {
  const entitiesPath: string = path.join(
    __dirname,
    '/db/*'
  )

  return createConnection({
    type: 'mysql',
    host: config.get('mysql.host'),
    port: config.get('mysql.port'),
    username: config.get('mysql.username'),
    password: config.get('mysql.password'),
    database: config.get('mysql.database'),
    entities: [
      entitiesPath
    ],
    synchronize: true
  })
}

const init = async (): Promise<void> => {
  const app = new Koa()

  app.use(bodyparser())

  try {
    await connect()
  } catch (e) {
    console.error(e.errno)
  }

  app.use(songs.routes()).use(songs.allowedMethods())

  app.listen(
    config.get('app.port')
  )

  console.log('API is running freely')
}

init()
