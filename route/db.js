
const Sequelize = require('sequelize')
const config = {
    database:'myigou',
    username:'root',
    password:'batar123',
    host:'localhost',
    port:3306
}
// connect db
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: 'mysql',
  operatorsAliases: false
})
//测试连接成功是否
sequelize
  .authenticate()
  .then(() => {
    console.log('连接成功！')
  })
  .catch(err => {
    console.error('连接失败:', err)
  })


  module.exports = sequelize