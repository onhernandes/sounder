const Sequelize = require('sequelize')
const config = require('config')

module.exports = new Sequelize(
  config.get('mysql.database'),
  config.get('mysql.username'),
  config.get('mysql.password'),
  {
    host: config.get('mysql.host'),
    dialect: 'mysql'
  }
)
