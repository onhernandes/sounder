const Op = require('sequelize').Op
const Song = require('../../db/Song')
const NotFound = require('../../errors/NotFound')

module.exports = async (ctx, next) => {
  const found = await Song.findOne({
    where: {
      id: {
        [Op.eq]: ctx.params.id
      }
    },
    attributes: ['id']
  })

  if (!found) {
    throw new NotFound()
  }

  return next()
}
