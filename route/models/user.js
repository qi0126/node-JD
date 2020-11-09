
var db = require('../db')
var Sequelize = require('sequelize')
// 创建表模型
const User = db.define('user', {
    user_id: {
        type: Sequelize.BIGINT(11),
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    user_name: Sequelize.STRING(50),
    user_namesub: Sequelize.STRING(50),
    login_password:Sequelize.STRING(50),
    user_number:Sequelize.STRING(40)
})
// 同步表结构
// User.sync()   // 如果表存在 不会刷新结构
// User.sync({ force: true })   // 如果表存在 会删除表重新建表
module.exports = User