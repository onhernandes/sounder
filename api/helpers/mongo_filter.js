module.exports = (item, list) => {
  if (!Array.isArray(list)) {
    list = []
  }

  if (typeof item.toObject === 'function') {
    item = item.toObject()
  }

  if (list.indexOf('__v') === -1) {
    list.push('__v')
  }

  if (list.indexOf('tries') === -1) {
    list.push('tries')
  }

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
