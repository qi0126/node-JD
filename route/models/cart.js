
var db = require('../db')
var Sequelize = require('sequelize')
// 购物车表模型
const User = db.define('goods_cart', {
    cart_id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    user_id: Sequelize.INTEGER(11),
    product_id: Sequelize.INTEGER(50),
    goods_num:Sequelize.INTEGER(50),
    deleted:Sequelize.INTEGER(4)
})
// 同步表结构
// User.sync()   // 如果表存在 不会刷新结构
// User.sync({ force: true })   // 如果表存在 会删除表重新建表
module.exports = User