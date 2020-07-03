(async () => {
  const instance = require('./index')
  const tables = [
    require('./Song')
  ]

  const promises = tables.map(table => table.sync())

  await Promise.all(promises)

  await instance.close()
})()
