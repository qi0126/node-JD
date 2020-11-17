
var db = require('../db')
var Sequelize = require('sequelize')
// 用户表模型
const Shop = db.define('shops', {
    shop_id: {
        type: Sequelize.INTEGER(100),
        primaryKey: true
    },
    shop_name: Sequelize.CHAR(200),
    shop_address: Sequelize.CHAR(400),
    category_id: Sequelize.INTEGER(11),
})
// 同步表结构
// User.sync()   // 如果表存在 不会刷新结构
// User.sync({ force: true })   // 如果表存在 会删除表重新建表
module.exports = Shop