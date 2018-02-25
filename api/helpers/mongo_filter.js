module.exports = (item, list) => {
  if (Array.isArray(item)) {
    return item.map(cursor => {
      Object.keys(cursor).map(k => {
        if (list.indexOf(k) !== -1) {
          delete cursor[k]
        }
      })

      return cursor
    })
  }

  Object.keys(item).map(k => {
    if (list.indexOf(k) !== -1) {
      delete item[k]
    }
  })

  return item
}
