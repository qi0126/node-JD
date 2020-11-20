
var db = require('../db')
var Sequelize = require('sequelize')
// 购物车表模型
const Product = db.define('product', {
    product_id: {
        type: Sequelize.INTEGER(100),
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    category_id: Sequelize.INTEGER(11),
    shop_id: Sequelize.INTEGER(11),
    product_name: Sequelize.CHAR(200),
    product_price:Sequelize.DECIMAL(8),
    product_uprice:Sequelize.DECIMAL(8),
    user_phone: Sequelize.CHAR(20),
    product_detail: Sequelize.TEXT(400)
})
// 同步表结构
// User.sync()   // 如果表存在 不会刷新结构
// User.sync({ force: true })   // 如果表存在 会删除表重新建表
module.exports = Product