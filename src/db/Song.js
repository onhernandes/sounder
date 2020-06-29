const instance = require('./index')
const Sequelize = require('sequelize')

const columns = {
}

const options = {}

module.exports = instance.define('songs', columns, options)
