const instance = require('./index')
const Sequelize = require('sequelize')

const columns = {
  videoUrl: {
    type: Sequelize.STRING,
    allowNull: false
  },
  title: {
    type: Sequelize.STRING,
    allowNull: true
  },
  author: {
    type: Sequelize.STRING,
    allowNull: true
  },
  cover: {
    type: Sequelize.STRING,
    allowNull: true
  }
}

const options = {}

module.exports = instance.define('songs', columns, options)
