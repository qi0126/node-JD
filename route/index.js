const express = require('express');
const mysql = require('mysql');
const common = require('../libs/common');
const User = require('./models/user')
const Cart = require('./models/cart')
const Token = require('./models/token')//token表，登录时token会更新
const Flow = require('./models/flow')//产品关注表

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'batar123',
    database: 'minghuashop'
});



//token私钥
const PRIVATE_KEY = 'minghuaShopKey'
const jwt = require('jsonwebtoken')
const JWT_EXPIRED = 6 * 30 * 24 * 60 * 60


module.exports = () => {
    //验证token
    function getToken(token){
        return new Promise(function(resolve, reject) {
            jwt.verify(token, PRIVATE_KEY, (err, decoded)=>{ // decoded:指的是tokneid解码后用户信息
                // console.log("token用户:",err,decoded)
                if (err) {   //如果tokenid过期则会执行err的代码块
                    reject(err) 
                } else {
                    
                    resolve(decoded)
                }
            })
        })
    }
    const route = express.Router();
    const getHomeStr = `SELECT product_id,product_name,product_price,product_img_url,product_uprice FROM product`;
    const getCateNames = `SELECT * FROM category ORDER BY category_id desc`;
    //get homePage datas
    route.get('/home', (req, res) => {
      // 查询所有用户
        getHomeDatas(getHomeStr, res);
    });
    function getHomeDatas(getHomeStr, res) {
        db.query(getHomeStr, (err, data) => {
            if (err) {
                res.status(500).send('database err').end();
            } else {
                if (data.length == 0) {
                    res.status(500).send('no datas').end();
                } else {
                    res.send(data);
                }
            }
        });
    }

    route.get('/category', (req, res) => {
        getCateNamesDatas(getCateNames, res);
    });

    function getCateNamesDatas(getCateNames, res) {
        db.query(getCateNames, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send('database err').end();
            } else {
                if (data.length == 0) {
                    res.status(500).send('no datas').end();
                } else {
                    res.send(data);
                }
            }
        });
    };
    route.get('/categorygoods', (req, res) => {
        let mId = req.query.mId;
        const sql = `select * from product,category where product.category_id=category.category_id and category.category_id='${mId}'`;
        const categoryStr = `select category_name from category where category_id='${mId}'`;
        getCateGoods(sql,categoryStr,res);
    });

    function getCateGoods(sql,categoryStr, res) {
        db.query(sql, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send('database err').end();
            } else {
                db.query(categoryStr, (err1, data1) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('database err').end();
                    } else {

                        let cateName =data1 && data1.length>0 && data1[0].category_name?data1[0].category_name:'-'
                        if (data.length == 0) {
                            res.send({cateName:cateName,list:[]});
                        } else {
                            res.send({cateName:cateName,list:data});
                        }
                    }
                });
            }
        });
    }
    route.get('/detail', (req, res) => {
        let produId = req.query.mId;
        const imagesStr = `select image_url from product_image where product_id='${produId}'`;
        const productStr = `select * from product where product_id='${produId}'`;
        let detailDatas = [];
        db.query(imagesStr, (err, imgDatas) => {
            if (err) {
                console.error(err);
                res.status(500).send('database err').end();
            } else {
                detailDatas.push(imgDatas);
                db.query(productStr, (err, data) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('database err').end();
                    } else {
                        detailDatas.push(data);
                        res.send(detailDatas);
                    }
                });
            }
        });

    });
    route.get('/cart', (req, res) => {
        // 获取前端请求头发送过来的accesstoken
        getToken(req.headers.accesstoken).then(userInfo=>{
            const cartStr = `
                SELECT
                    cart_id,
                    users.user_id,
                    product.product_id,
                    shop.shop_id,
                    product_name,
                    product_price,
                    product_uprice,
                    product_img_url,
                    goods_num,
                    product_num,
                    shop_name
                FROM
                    product,
                    users,
                    goods_carts,
                    shop
                WHERE
                    product.product_id = goods_carts.product_id
                AND users.user_id = goods_carts.user_id
                AND shop.shop_id = product.shop_id
                AND goods_carts.user_id = ${userInfo.user_id}
            `;
            db.query(cartStr, (err, data) => {
                if (err) {
                    res.status(500).send('database err').end();
                } else {
                    if (data.length == 0) {
                        res.status(200).send({code:200,msg:'查询成功！',cartNum:0,data:[]}).end();
                    } else {
                        res.status(200).send({code:200,msg:'查询成功！',cartNum:data.length,data}).end();
                    }
                }
            });
        }).catch(err=>{
            res.status(203).send({code:203,msg:'用户token信息失效，请重新登录！'}).end();
        })

    })

    route.get('/search', (req, res) => {
        let keyWord = req.query.kw;
        let hot = req.query.hot;
        let priceUp = req.query.priceUp;
        let priceDown = req.query.priceDown;
        const keywordStr = `select  *  from product,shop where product.shop_id=shop.shop_id and product.product_name like '%${keyWord}%'`;
        const hotStr = `select  *  from product,shop where product.shop_id=shop.shop_id and product.product_name like '%${keyWord}%' order by product_comment_num desc`;
        const priceUpStr = `select  *  from product,shop where product.shop_id=shop.shop_id and product.product_name like '%${keyWord}%' order by product_uprice asc`;
        const priceDownStr = `select  *  from product,shop where product.shop_id=shop.shop_id and product.product_name like '%${keyWord}%' order by product_uprice desc`;
        if (keyWord != '') {
            if (hot != '') {
                getSearchDatas(hotStr, res);
            } else if (priceUp != '') {
                getSearchDatas(priceUpStr, res);
            } else if (priceDown != '') {
                getSearchDatas(priceDownStr, res);
            } else {
                getSearchDatas(keywordStr, res);
            }
        }

    });
    /**
        get search datas
    */
    function getSearchDatas(keywordStr, res) {
        db.query(keywordStr, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send('database err').end();
            } else {
                if (data.length == 0) {
                    // res.status(500).send('no datas').end();
                    res.send([])
                } else {
                    res.send(data);
                }
            }
        });
    }
    /*
     *user reg func
     */
    route.post('/reg', (req, res) => {

        let mObj = {};
        for (let obj in req.body) {
            mObj = JSON.parse(obj);
        }
        let addTF = true
        // 查询所有用户
        User.findAll().then(res1=>{
            res1.forEach(ielem=>{
                // console.log("ielem",ielem.dataValues,mObj.regName)
                if(ielem.dataValues.user_name == mObj.regName){
                    addTF = false//有登录名重新
                }
            })
            if(!addTF){
                res.status(202).send({ 'msg': '该用户已存在', 'code': 202 }).end();
            }else{
                let regPasswd = mObj.regPasswd;
                regPasswd = common.md5(regPasswd + common.MD5_SUFFXIE);
                User.create({user_name:mObj.regName,user_namesub:mObj.regnamesub, login_password:regPasswd,user_number:'123'}).then(function (user) {
                    const token = jwt.sign({ user_name:user.dataValues.user_name,user_id:user.dataValues.user_id },PRIVATE_KEY,{expiresIn:JWT_EXPIRED})
                    res.status(200).send({ 'msg': '创建用户成功！',"data":user,accesstoken:token, 'code': 200 }).end();
                 })
            }
        })
    });
    route.post('/login', (req, res) => {

        let mObj = {};
        for (let obj in req.body) {
            mObj = JSON.parse(obj);
        }
        let username = mObj.loginName;
        let password = common.md5(mObj.loginPawd + common.MD5_SUFFXIE);;
        const selectUser = `SELECT * FROM users where user_name='${username}'`;
        db.query(selectUser, (err, data) => {
            if (err) {
                console.log(err);
                res.send({ 'msg': '服务器出错', 'status': 0 }).end();
            } else {
                if (data.length == 0) {
                    res.send({ 'msg': '该用户不存在', 'status': -1 }).end();
                } else {
                    let dataw = data[0];
                    //login sucess
                    if (dataw.login_password === password) {
                        //save the session 
                        req.session['user_id'] = dataw.user_id;
                        dataw.msg = "登录成功";
                        dataw.status = 200;
                        // 查询所有token有没有重复，没有就新建true，有就直接返回false
                        let addTF = true;
                        Token.findAll().then(Tokens=>{
                            Tokens.forEach(ielem=>{
                                if(dataw.user_id === ielem.user_id){
                                    addTF = false
                                    token = ielem.token
                                }
                            })
                            let tokenT = jwt.sign({ user_name:dataw.user_name,user_id:dataw.user_id },PRIVATE_KEY,{expiresIn:JWT_EXPIRED})
                            if(addTF){
                                //没有就新建token表
                                //token时效
                                dataw.accesstoken = tokenT//token输
    
                                //没有就新建，有的就返回
                                Token.create({token,user_name:dataw.user_name,user_id:dataw.user_id,user_namesub:dataw.user_namesub}).then(function (token) {
                                    res.status(200).send(dataw).end();
                                 })
                                
                            }else{
                                Token.update({token:tokenT}, {
                                    where: {
                                      user_id: dataw.user_id
                                    }
                                  }).then(function (token) {
                                    //有就直接返回token表里的表里的token
                                    dataw.accesstoken = tokenT//token输
                                    res.status(200).send(dataw).end();
                                 })
                            }
                        })


                    } else {
                        res.send({ 'msg': '密码不正确', 'status': -2 }).end();
                    }
                }
            }
        });

    });
    route.get('/userinfo', (req, res) => {
        let uId = req.query.uId;
        const getU = `SELECT user_id,user_name,user_number,user_namesub FROM users where user_id='${uId}'`;
        db.query(getU, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send('database err').end();
            } else {
                if (data.length == 0) {
                    res.status(203).send({ 'msg': '用户不存在', 'code': 203} ).end();
                } else {
                    res.send(data[0]);
                }
            }
        });
    });
    //用户信息修改
    route.post('/editUser', (req, res) => {
        
        let userInfoObj = {}
        for (let obj in req.body) {
            userInfoObj = Object.assign(userInfoObj,JSON.parse(obj))
        }
        let editPassword = common.md5(userInfoObj.password + common.MD5_SUFFXIE);
        let editObj = { user_name: userInfoObj.user_name,user_namesub:userInfoObj.user_namesub}
        if(userInfoObj.password != ""){
            editObj.login_password = editPassword
        }
        User.update(editObj, {
            where: {
              user_id: userInfoObj.user_id
            }
          }).then(function (user) {
            res.status(200).send({ 'msg': '修改成功！', 'code': 200}).end();
         })
    });
    //产品加入购物车
    route.post('/addCart', (req, res) => {
        let cartObj = {}
        for (let obj in req.body) {
            cartObj = JSON.parse(obj)
        }
        let addTF = true//购物车没有此产品为true,有此产品为false，有产品累加
        // 查询所有用户
        Cart.findAll().then(res1=>{
            res1.forEach((ielem,indOne)=>{
                if(ielem.dataValues.product_id == cartObj.product_id && cartObj.user_id == ielem.dataValues.user_id){
                    addTF = false//有此产品并且user_id相同为false，有产品累加
                    updateCartFun(ielem.dataValues,cartObj,res)
                }
            })
            ////购物车没有此产品为true,新增产品
            if(addTF){
                Cart.create({
                    user_id:cartObj.user_id,
                    product_id:cartObj.product_id,
                    goods_num:cartObj.goods_num
                }).then(function (cart) {
                    res.status(200).send({ 'msg': '创建购物车成功！',"data":cart, 'code': 200 }).end();
                 })
            }
        })


    });
    function updateCartFun(ielem,cartObj,res){
        let goods_num = ielem.goods_num + cartObj.goods_num
        Cart.update({goods_num:goods_num}, {
            where: {
                cart_id: ielem.cart_id
            }
          }).then(function (cart) {
            res.status(200).send({ 'msg': '购物车已有产品，产品数量累加成功！',data:cart, 'code': 200}).end();
            return res
         })

    }
    //购物车删除产品
    route.post('/delCart', (req, res) => {
        let cartObj = {}
        for (let obj in req.body) {
            cartObj = JSON.parse(obj)
        }
        Cart.destroy({
            where:{
                cart_id:cartObj.cart_id
            }
        }).then(cart=>{
            res.status(200).send({ 'msg': '购物车删除成功！',"data":cart, 'code': 200 }).end();
        })
    });
    //购物车修改产品数量
    route.post('/changeCartNum', (req, res) => {
        let cartObj = {}
        for (let obj in req.body) {
            cartObj = JSON.parse(obj)
        }
        Cart.update({goods_num:cartObj.goods_num}, {
            where: {
                cart_id: cartObj.cart_id
            }
          }).then(function (cart) {
            res.status(200).send({ 'msg': '修改数量成功！',data:cart, 'code': 200}).end();
         })
    });
    //产品关注和取消关注
    route.post('/flowPro', (req, res) => {
        let flowProObj = {}
        for (let obj in req.body) {
            flowProObj = JSON.parse(obj)
        }
        // 查询所有token有没有重复，没有就新建true，有就直接返回false
        let addTF = true;
        Flow.findAll().then(Flows=>{
            // Flows.forEach(ielem=>{
            //     if(flowProObj.user_id === ielem.user_id ){
            //         addTF = false
            //     }
            // })
            // 获取前端请求头发送过来的accesstoken
            getToken(req.headers.accesstoken).then(userInfo=>{
                if(addTF){
                    //没有关注就新建
                    console.log("aaaa:",{user_id:userInfo.user_id,product_id:flowProObj.product_id})
                    Flow.create({user_id:userInfo.user_id,product_id:flowProObj.product_id}).then((FlowsOne)=> {
                        console.log("FlowsOne:",FlowsOne)
                        res.status(200).send({code:200,data:Flows,msg:'关注产品成功！'}).end();
                    })
                    
                }else{
                    // Token.update({token:tokenT}, {
                    //     where: {
                    //         user_id: dataw.user_id
                    //     }
                    //     }).then(function (token) {
                    //     //有就直接返回token表里的表里的token
                    //     dataw.accesstoken = tokenT//token输
                    //     res.status(200).send(dataw).end();
                    //     })
                }
            }).catch(err=>{
                res.status(203).send({code:203,msg:'用户token信息失效，请重新登录！'}).end();
            })

        })
        // Cart.update({goods_num:cartObj.goods_num}, {
        //     where: {
        //         cart_id: cartObj.cart_id
        // }
        // }).then(function (cart) {
        // res.status(200).send({ 'msg': '修改数量成功！',data:cart, 'code': 200}).end();
        // })
    });
    //读取购物车产品数量
    route.get('/cartNum', (req, res) => {
        // 获取前端请求头发送过来的accesstoken
        getToken(req.headers.accesstoken).then(userInfo=>{
            const cartStr = `
                SELECT
                    cart_id,
                    users.user_id,
                    product.product_id,
                    shop.shop_id,
                    product_name,
                    product_price,
                    product_uprice,
                    product_img_url,
                    goods_num,
                    product_num,
                    shop_name
                FROM
                    product,
                    users,
                    goods_carts,
                    shop
                WHERE
                    product.product_id = goods_carts.product_id
                AND users.user_id = goods_carts.user_id
                AND shop.shop_id = product.shop_id
                AND goods_carts.user_id = ${userInfo.user_id}
            `;
            db.query(cartStr, (err, data) => {
                if (err) {
                    res.status(500).send('database err').end();
                } else {
                    if (data.length == 0) {
                        res.status(200).send({code:200,msg:'查询成功！',cartNum:0}).end();
                    } else {
                        res.status(200).send({code:200,msg:'查询成功！',cartNum:data.length}).end();
                    }
                }
            });
        }).catch(err=>{
            res.status(200).send({code:200,msg:'用户未登录！',cartNum:0}).end();
        })

    });
    return route;
}
