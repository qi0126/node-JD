
var db = require('../db')
var Sequelize = require('sequelize')
// 用户表模型
const Flow = db.define('flows', {
    user_id: {
        type: Sequelize.BIGINT(11),
        primaryKey: true
    },
    product_id: Sequelize.INTEGER(11)
})
// 同步表结构
// User.sync()   // 如果表存在 不会刷新结构
// User.sync({ force: true })   // 如果表存在 会删除表重新建表
module.exports = Flow