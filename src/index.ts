import { createConnection } from 'typeorm'
import config from 'config'
import Koa from 'koa'
import 'reflect-metadata'
import path from 'path'

const init = async (): Promise<void> => {
  const app = new Koa()
  const entitiesPath: string = path.join(
    __dirname,
    `/db/*.${config.get('mysql.entitiesExtension')}`
  )

  await createConnection({
    type: 'mysql',
    host: config.get('mysql.host'),
    port: config.get('mysql.port'),
    username: config.get('mysql.usernambe'),
    password: config.get('mysql.password'),
    database: config.get('mysql.database'),
    entities: [
      entitiesPath
    ],
    synchronize: true
  })

  app.listen(
    config.get('app.port')
  )
}

init()
