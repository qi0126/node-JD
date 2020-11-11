
var db = require('../db')
var Sequelize = require('sequelize')
// 用户表模型
const Token = db.define('token', {
    token: {
        type: Sequelize.STRING(200),
        primaryKey: true
    },
    user_id: Sequelize.INTEGER(11),
    user_name: Sequelize.STRING(50),
    user_namesub: Sequelize.STRING(255),
    // login_password:Sequelize.STRING(50),
    // user_number:Sequelize.STRING(40)
})
// 同步表结构
// User.sync()   // 如果表存在 不会刷新结构
// User.sync({ force: true })   // 如果表存在 会删除表重新建表
module.exports = Token