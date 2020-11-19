
var db = require('../db')
var Sequelize = require('sequelize')
// 购物车表模型
const Address = db.define('address', {
    address_id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    user_id: Sequelize.INTEGER(11),
    addressinfo: Sequelize.CHAR(400),
    isdefault:Sequelize.CHAR(11),
    user_phone: Sequelize.CHAR(20),
    addressarea: Sequelize.CHAR(400),
    sname:Sequelize.CHAR(200),
})
// 同步表结构
// User.sync()   // 如果表存在 不会刷新结构
// User.sync({ force: true })   // 如果表存在 会删除表重新建表
module.exports = Address