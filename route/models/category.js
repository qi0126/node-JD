
var db = require('../db')
var Sequelize = require('sequelize')
// 用户表模型
const Flow = db.define('categories', {
    category_id: {
        type: Sequelize.INTEGER(100),
        primaryKey: true
    },
    category_pid: Sequelize.INTEGER(11),
    category_name: Sequelize.CHAR(200)
})
// 同步表结构
// User.sync()   // 如果表存在 不会刷新结构
// User.sync({ force: true })   // 如果表存在 会删除表重新建表
module.exports = Flow