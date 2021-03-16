const express = require('express');
const mysql = require('mysql');
var multer = require('multer');
const common = require('../libs/common');
const User = require('./models/user')
const Cart = require('./models/cart')
const Token = require('./models/token')//token表，登录时token会更新
const Flow = require('./models/flow')//产品关注表
const History = require('./models/History')//浏览记录表
const Category = require('./models/Category')//产品主题表
const Shop = require('./models/Shop')//店铺表
const Address = require('./models/Address')//用户地址表
const Product = require('./models/Product')//产品表

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
                if (err) {   //如果tokenid过期则会执行err的代码块
                    reject(err) 
                } else {
                    resolve(decoded)
                }
            })
        })
    }
    const route = express.Router();
    const getHomeStr = `SELECT product_id,product_name,product_price,product_img_url,product_uprice FROM products`;
    const getCateNames = `SELECT * FROM categories ORDER BY category_id desc`;
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
        const sql = `select * from products,categories where products.category_id=categories.category_id and categories.category_id='${mId}'`;
        const categoryStr = `select category_name from categories where category_id='${mId}'`;
        getCateGoods(sql,categoryStr,res);
    });

    function getCateGoods(sql,categoryStr, res) {
        db.query(sql, (err, data) => {
            if (err) {
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
        const productStr = `
        SELECT
            product_id,
            products.category_id,
            shops.shop_id,
            product_name,
            product_price,
            product_img_url,
            product_uprice,
            product_detail,
            categories.category_name,
            shops.shop_name,
            shops.shop_address
        FROM
            products,
            categories,
            shops
        WHERE
            product_id=${produId}
        AND    
            products.category_id = categories.category_id
        AND
            products.shop_id = shops.shop_id
        `;
        
        db.query(imagesStr, (err, imgDatas) => {
            if (err) {
                console.error(err);
                res.status(500).send('database err').end();
            } else {
                db.query(productStr, (err, data) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('database err').end();
                    } else {
                        let proData = data[0]
                        proData.image = imgDatas
                        proData.flowTF = false
                        // 获取前端请求头发送过来的accesstoken
                        getToken(req.headers.accesstoken).then(userInfo=>{
                            Flow.findAll().then(flows=>{
                                flows.forEach(ielem=>{
                                    let flowObj = ielem.dataValues
                                    if(flowObj.user_id == userInfo.user_id && flowObj.product_id == proData.product_id){
                                        proData.flowTF = true//有关注
                                    }
                                })
                                res.status(200).send({code:200,msg:'查询成功！',data:proData}).end();
                            })
                            //浏览器表添加浏览纪录
                            addHistory(userInfo.user_id,proData.product_id)
                        }).catch(err=>{
                            res.status(203).send({code:203,msg:'用户token信息失效，请重新登录！'}).end();
                        })
                    }
                });
            }
        });

    });
    //浏览器表添加浏览纪录
    function addHistory(userId,productId){
        History.findAll().then(Historys=>{
            let addTF = true//浏览器有浏览过为false,没有浏览器添加浏览表记录为true
            
            let editHistoryObj
            Historys.forEach(ielem=>{
                let historyObj = ielem.dataValues
                if(historyObj.user_id == userId && historyObj.product_id == productId){
                    addTF = false//有关注
                    editHistoryObj = historyObj
                }
            })
            if(addTF){
                //浏览表没有浏览过新增
                History.create({
                    user_id:userId,
                    product_id:productId,
                    time:1
                }).then(histories=>{
                })
            }else{
                //浏览过就表里次数time+1
                History.update({
                    time:editHistoryObj.time+1
                },{
                    where:{
                        user_id:userId,
                        product_id:productId
                    }
                })
            }

        })

    }
    route.get('/cart', (req, res) => {
        // 获取前端请求头发送过来的accesstoken
        getToken(req.headers.accesstoken).then(userInfo=>{
            const cartStr = `
                SELECT
                    cart_id,
                    users.user_id,
                    products.product_id,
                    shops.shop_id,
                    product_name,
                    product_price,
                    product_uprice,
                    product_img_url,
                    goods_num,
                    product_num,
                    shop_name
                FROM
                    products,
                    users,
                    goods_carts,
                    shops
                WHERE
                    products.product_id = goods_carts.product_id
                AND users.user_id = goods_carts.user_id
                AND shops.shop_id = products.shop_id
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
        const keywordStr = `select  *  from products,shops where products.shop_id=shops.shop_id and products.product_name like '%${keyWord}%'`;
        const hotStr = `select  *  from products,shops where products.shop_id=shops.shop_id and products.product_name like '%${keyWord}%' order by product_comment_num desc`;
        const priceUpStr = `select  *  from products,shops where products.shop_id=shops.shop_id and products.product_name like '%${keyWord}%' order by product_uprice asc`;
        const priceDownStr = `select  *  from products,shops where products.shop_id=shops.shop_id and products.product_name like '%${keyWord}%' order by product_uprice desc`;
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
        console.log("mObj:",mObj)
        let username = mObj.loginName;
        let password = common.md5(mObj.loginPwd + common.MD5_SUFFXIE);;
        const selectUser = `SELECT * FROM users where user_name='${username}'`;
        db.query(selectUser, (err, data) => {
            if (err) {
                res.send({ 'msg': '服务器出错', 'code': 202 }).end();
            } else {
                if (data.length == 0) {
                    res.send({ 'msg': '该用户不存在', 'code': 202 }).end();
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
                        let tokenNew
                        Token.findAll().then(Tokens=>{
                            Tokens.forEach(ielem=>{
                                if(dataw.user_id === ielem.user_id){
                                    addTF = false
                                    tokenNew = ielem.token
                                }
                            })
                            let tokenT = jwt.sign({ user_name:dataw.user_name,user_id:dataw.user_id },PRIVATE_KEY,{expiresIn:JWT_EXPIRED})
                            if(addTF){
                                //没有就新建token表
                                //token时效
                                dataw.accesstoken = tokenT//token输
    
                                //没有就新建，有的就返回
                                Token.create({token:tokenT,user_name:dataw.user_name,user_id:dataw.user_id,user_namesub:dataw.user_namesub}).then(function (token1) {
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
                                    res.status(200).send({ 'msg': '登录成功！', 'code': 200,data:dataw }).end();
                                 })
                            }
                        })


                    } else {
                        res.send({ 'msg': '密码不正确', 'code': 202 }).end();
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
        // 查询所有关注有没有重复，没有就新建true，有就直接返回false
        let flowTF = true
        // 获取前端请求头发送过来的accesstoken
        getToken(req.headers.accesstoken).then(userInfo=>{
            Flow.findAll().then(flows=>{
                flows.forEach(ielem=>{
                    let flowObj = ielem.dataValues
                    if(flowObj.user_id == userInfo.user_id && flowObj.product_id == flowProObj.product_id){
                        flowTF = false//有关注，就取消关注，删除flow关注表记录
                    }
                })
                if(flowTF){
                    //无关注，添加flow关注表记录
                    Flow.create({user_id:userInfo.user_id,product_id:flowProObj.product_id}).then((FlowsOne)=> {
                        res.status(200).send({code:200,msg:'关注产品成功！'}).end();
                    })
                }else{
                    //有关注，就取消关注，删除flow关注表记录
                    Flow.destroy({
                        where:{
                            user_id:userInfo.user_id,
                            product_id:flowProObj.product_id
                        }
                    }).then(flow=>{
                        res.status(200).send({code:200,msg:'取消关注产品成功'}).end();
                    })
                }
                
            })
        }).catch(err=>{
            res.status(203).send({code:203,msg:'用户token信息失效，请重新登录！'}).end();
        })
    })
    //读取购物车产品数量
    route.get('/cartNum', (req, res) => {
        // 获取前端请求头发送过来的accesstoken
        getToken(req.headers.accesstoken).then(userInfo=>{
            const cartStr = `
                SELECT
                    cart_id,
                    users.user_id,
                    products.product_id,
                    shops.shop_id,
                    product_name,
                    product_price,
                    product_uprice,
                    product_img_url,
                    goods_num,
                    product_num,
                    shop_name
                FROM
                    products,
                    users,
                    goods_carts,
                    shops
                WHERE
                    products.product_id = goods_carts.product_id
                AND users.user_id = goods_carts.user_id
                AND shops.shop_id = products.shop_id
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
    //用户关注产品数量
    route.get('/flowNum', (req, res) => {
        // 获取前端请求头发送过来的accesstoken
        getToken(req.headers.accesstoken).then(userInfo=>{
            Flow.findAll({
                where:{user_id:userInfo.user_id,
            }}).then(flows=>{
                res.status(200).send({code:200,msg:'查询成功！',flowNum:flows.length}).end();
            })
        }).catch(err=>{
            res.status(200).send({code:200,msg:'用户未登录！',flowNum:0}).end();
        })

    });
    //用户关注产品
    route.get('/flow', (req, res) => {
        // 获取前端请求头发送过来的accesstoken
        getToken(req.headers.accesstoken).then(userInfo=>{
            const flowStr = `
            SELECT
                flows.user_id,
                products.product_id,
                product_name,
                product_price,
                product_uprice,
                product_img_url,
                product_num
            FROM
                products,
                flows
            WHERE
                flows.user_id = ${userInfo.user_id}
            AND flows.product_id = products.product_id

        `;
        db.query(flowStr, (err, data) => {
            
            if (err) {
                res.status(500).send('database err').end();
            } else {
                if (data.length == 0) {
                    res.status(200).send({code:200,msg:'查询成功！',flowNum:0,data:[]}).end();
                } else {
                    res.status(200).send({code:200,msg:'查询成功！',flowNum:data.length,data}).end();
                }
            }
        });
        }).catch(err=>{
            res.status(200).send({code:200,msg:'用户未登录！',flowNum:0}).end();
        })

    });
    
    //用户浏览产品数量
    route.get('/historyNum', (req, res) => {
        // 获取前端请求头发送过来的accesstoken
        getToken(req.headers.accesstoken).then(userInfo=>{
            History.findAll({
                where:{user_id:userInfo.user_id,
            }}).then(historys=>{
                res.status(200).send({code:200,msg:'查询成功！',historyNum:historys.length}).end();
            })
        }).catch(err=>{
            res.status(200).send({code:200,msg:'用户未登录！',historyNum:0}).end();
        })

    });
    //用户浏览产品
    route.get('/history', (req, res) => {
        // 获取前端请求头发送过来的accesstoken
        getToken(req.headers.accesstoken).then(userInfo=>{
            const flowStr = `
            SELECT
                histories.user_id,
                products.product_id,
                product_name,
                product_price,
                product_uprice,
                product_img_url,
                product_num,
                histories.time,
                histories.updatedAt
            FROM
                products,
                histories
            WHERE
            histories.user_id = ${userInfo.user_id}
            AND histories.product_id = products.product_id
            ORDER BY updatedAt DESC
        `;
        db.query(flowStr, (err, data) => {
            if (err) {
                res.status(500).send('database err').end();
            } else {
                if (data.length == 0) {
                    res.status(200).send({code:200,msg:'查询成功！',historyNum:0,data:[]}).end();
                } else {
                    res.status(200).send({code:200,msg:'查询成功！',historyNum:data.length,data}).end();
                }
            }
        });
        }).catch(err=>{
            res.status(200).send({code:200,msg:'用户未登录！',flowNum:0}).end();
            
        })

    });


    // 后台管理
    route.post('/proManage', (req, res) => {
        let flowProObj = {}
        for (let obj in req.body) {
            flowProObj = JSON.parse(obj)
        }
        let categorySQL = flowProObj.cateId != '' ? `products.category_id = ${flowProObj.cateId}`:`1=1`
        // 查询所有产品
        const proManageSQL = `
            SELECT
                products.product_id,
                products.category_id,
                shops.shop_id,
                products.product_name,
                products.product_price,
                products.product_img_url,
                products.product_uprice,
                products.product_detail,
                categories.category_name,
                shops.shop_name,
                shops.shop_address
            FROM
                products,
                categories,
                shops
            WHERE
                ${categorySQL}
            AND
               products.category_id = categories.category_id
            AND
                products.shop_id = shops.shop_id
            ORDER BY products.updatedAt desc
            limit ${(flowProObj.pageNum-1)*flowProObj.pageSize},${flowProObj.pageSize}
            
        `;
        let proNumSQL = `select COUNT(*) from products WHERE ${categorySQL}`
        getProFun(proManageSQL,proNumSQL, res);
    });
    function getProFun(proManageSQL,proNumSQL, res) {
        db.query(proManageSQL, (err, data) => {
            if (err) {
                res.status(500).send('database err').end();
            } else {
                db.query(proNumSQL, (err1, data1) => {
                    //产品数量
                    if (data.length == 0) {
                        res.status(200).send({code:200,msg:'查询成功！',data:[],proNum:data1[0]['COUNT(*)']}).end();
                    } else {
                        res.status(200).send({code:200,msg:'查询成功！',data,proNum:data1[0]['COUNT(*)']}).end();
                    }
                })

            }
        });
    }
    //产品主题列表
    route.get('/categoryList', (req, res) => {

        // 获取前端请求头发送过来的accesstoken
        getToken(req.headers.accesstoken).then(userInfo=>{
            Category.findAll().then(categories=>{
                res.status(200).send({code:200,msg:'查询成功！',data:categories}).end();
            })
        }).catch(err=>{
            res.status(200).send({code:200,msg:'用户未登录！',data:[]}).end();
        })

    });
    //产品主题列表
    route.post('/shoplist', (req, res) => {
        let shopProObj = {}
        for (let obj in req.body) {
            shopProObj = JSON.parse(obj)
        }
        const shopListSQL = `
        SELECT
            shop_id,
            shop_name,
            shop_address,
            categories.category_name
        FROM
            shops 
        LEFT JOIN categories ON shops.category_id = categories.category_id 
        limit ${(shopProObj.pageNum-1)*shopProObj.pageSize},${shopProObj.pageSize}
        `;
        let proNumSQL = 'select COUNT(*) from shops'
        db.query(shopListSQL, (err, data) => {
            if (err) {
                res.status(500).send('database err').end();
            } else {
                db.query(proNumSQL, (err1, data1) => {
                    if (data.length == 0) {
                        res.status(200).send({code:200,msg:'查询成功！',shopNum:0,data:[],shopNum:data1[0]['COUNT(*)']}).end();
                    } else {
                        res.status(200).send({code:200,msg:'查询成功！',shopNum:data.length,data,shopNum:data1[0]['COUNT(*)']}).end();
                    }
                })
            }
        });
    });
    //订单管理列表
    route.post('/orderList', (req, res) => {
        let userProObj = {}
        for (let obj in req.body) {
            userProObj = JSON.parse(obj)
        }
        const orderSQL = `
        SELECT
            orders.order_id,
            orders.user_id,
            orders.product_id,
            orders.price,
            orders.ocount,
            orders.total_price,
            orders.orderno,
            orders.address_id,
            products.product_name,
            products.product_img_url,
            addresses.addressinfo,
            addresses.addressarea,
            users.user_namesub
        FROM
            orders,
            products,
            addresses,
            users
        WHERE orders.product_id = products.product_id
        AND addresses.address_id = orders.address_id
        AND users.user_id = orders.user_id
        ORDER BY orders.updatedAt DESC
        `;
        let orderNumSQL = 'select COUNT(*) from orders'
        db.query(orderSQL, (err, data) => {
            if (err) {
                res.status(500).send('database err').end();
            } else {
                db.query(orderNumSQL, (err1, data1) => {
                    if (data.length == 0) {
                        res.status(200).send({code:200,msg:'查询成功！',data:[],orderNum:data1[0]['COUNT(*)']}).end();
                    } else {
                        res.status(200).send({code:200,msg:'查询成功！',data,orderNum:data1[0]['COUNT(*)']}).end();
                    }
                })
            }
        });
    });
    //用户管理列表
    route.post('/userList', (req, res) => {
        let userProObj = {}
        for (let obj in req.body) {
            userProObj = JSON.parse(obj)
        }
        const userSQL = `
        SELECT
            user_id,
            user_name,
            user_namesub,
            user_number
        FROM
            users
        limit ${(userProObj.pageNum-1)*userProObj.pageSize},${userProObj.pageSize}
        `;
        let userNumSQL = 'select COUNT(*) from users'
        db.query(userSQL, (err, data) => {
            if (err) {
                res.status(500).send('database err').end();
            } else {
                db.query(userNumSQL, (err1, data1) => {
                    if (data.length == 0) {
                        res.status(200).send({code:200,msg:'查询成功！',data:[],userNum:data1[0]['COUNT(*)']}).end();
                    } else {
                        res.status(200).send({code:200,msg:'查询成功！',data,userNum:data1[0]['COUNT(*)']}).end();
                    }
                })
            }
        });
    });
    //用户管理列表
    route.post('/userDetails', (req, res) => {
        let userProObj = {}
        for (let obj in req.body) {
            userProObj = JSON.parse(obj)
        }
        let userId = userProObj.userId
        const userSQL = `
        SELECT
            user_id,
            user_name,
            user_namesub,
            user_number
        FROM
            users
        where users.user_id = ${userId}
        `;
        db.query(userSQL, (err, data) => {
            if (err) {
                res.status(500).send('database err').end();
            } else {
                if (data.length == 0) {
                   
                    res.status(200).send({code:200,msg:'查询失改！'}).end();
                } else {
                    //用户订单查询
                    
                    orderSQL(userId).then(orderList=>{
                        //浏览过产品与次数
                        historySQL(userId).then(historylist=>{
                            //用户关注产品
                            flowSQL(userId).then(flowlist=>{
                                //购物车
                                cartSQL(userId).then(cartlist=>{
                                    //用户地址
                                    addressSQL(userId).then(addlist=>{
                                        res.status(200).send({code:200,msg:'查询成功！',data:data[0],addlist,cartlist,flowlist,historylist,orderList}).end();
                                    }).catch(err1=>{
                                        res.status(200).send({code:200,msg:'查询成功！',data:data[0],addlist:[],cartlist,flowlist,historylist,orderList}).end();
                                    })
                                })
                            })
                        })
                    })
                    
                }
            }
        });
    });
    //用户地址
    function addressSQL(userId){
        const addressSQL = `
        SELECT
            address_id,
            addressinfo,
            user_phone,
            addressarea,
            isdefault,
            sname
        FROM
            addresses
        where addresses.user_id = ${userId}
        `;
        return new Promise(function (resolve, reject) {
            db.query(addressSQL, (err, data) => {
                if (err) {
                    reject([])
                } else {
                    resolve(data)
                }
            })
        })
    }
    //用户购物车
    function cartSQL(userId){
        const cartSQL = `
        SELECT
            goods_carts.cart_id,
            goods_carts.product_id,
            goods_carts.goods_num,
            products.product_name,
            products.product_img_url
        FROM
            goods_carts,
            products
        WHERE
            goods_carts.user_id = ${userId}
        AND goods_carts.product_id = products.product_id
        `;
        return new Promise(function (resolve, reject) {
            db.query(cartSQL, (err, data) => {
                if (err) {
                    reject([])
                } else {
                    resolve(data)
                }
            })
        })
    }
    //用户关注产品
    function flowSQL(userId){
        const flowSQL = `
        SELECT
            flows.user_id,
            flows.product_id,
            products.product_name,
            products.product_img_url
        FROM
            flows,
            products
        WHERE
            flows.user_id = ${userId}
        AND flows.product_id = products.product_id
        `;
        return new Promise(function (resolve, reject) {
            db.query(flowSQL, (err, data) => {
                if (err) {
                    reject([])
                } else {
                    resolve(data)
                }
            })
        })
    }
    //用户浏览过产品
    function historySQL(userId){
        const historySQL = `
        SELECT
            histories.user_id,
            histories.product_id,
            histories.time,
            products.product_name,
            products.product_img_url
        FROM
            histories,
            products
        WHERE
            histories.user_id = ${userId}
        AND histories.product_id = products.product_id
        ORDER BY histories.updatedAt DESC
        limit 0,6
        `;
        return new Promise(function (resolve, reject) {
            db.query(historySQL, (err, data) => {
                if (err) {
                    reject([])
                } else {
                    resolve(data)
                }
            })
        })
}
    //用户浏览过产品
    function orderSQL(userId){
        const orderSQL = `
        SELECT
            orders.order_id,
            orders.user_id,
            orders.product_id,
            orders.price,
            orders.ocount,
            orders.total_price,
            orders.orderno,
            orders.address_id,
            products.product_name,
            products.product_img_url,
            addresses.addressinfo,
            addresses.addressarea
        FROM
            orders,
            products,
            addresses
        WHERE
            orders.user_id = ${userId}
        AND orders.product_id = products.product_id
        AND addresses.address_id = orders.address_id
        ORDER BY orders.updatedAt DESC
        `;
        return new Promise(function (resolve, reject) {
            db.query(orderSQL, (err, data) => {
                if (err) {
                    reject([])
                } else {
                    resolve(data)
                }
            })
        })
    }
    //用户删除关注产品
    route.post('/delCart', (req, res) => {
        let delCartObj = {}
        for (let obj in req.body) {
            delCartObj = JSON.parse(obj)
        }
        //有关注，就取消关注，删除flow关注表记录
        Cart.destroy({
            where:{
                cart_id:delCartObj.cart_id
            }
        }).then(cart=>{
            res.status(200).send({code:200,msg:'删除购物车产品成功'}).end();
        })
    });

    //用户删除关注产品
    route.post('/delFlow', (req, res) => {
        let delFlowObj = {}
        for (let obj in req.body) {
            delFlowObj = JSON.parse(obj)
        }
        //有关注，就取消关注，删除flow关注表记录
        Flow.destroy({
            where:{
                user_id:delFlowObj.user_id,
                product_id:delFlowObj.product_id
            }
        }).then(flow=>{
            res.status(200).send({code:200,msg:'取消关注产品成功'}).end();
        })
    });
    //用户添加地址
    route.post('/addAddr', (req, res) => {
        let addressObj = {}
        for (let obj in req.body) {
            addressObj = JSON.parse(obj)
        }
        //无关注，添加flow关注表记录
        Address.create({
            user_id:addressObj.user_id,
            addressinfo:addressObj.addressinfo,
            isdefault:addressObj.isdefault,
            user_phone:addressObj.user_phone,
            addressarea:addressObj.addressarea,
            sname:addressObj.sname,
        }).then((address)=> {
            res.status(200).send({code:200,msg:'地址添加成功！'}).end();
        })
    });
    //用户删除地址
    route.post('/delAddr', (req, res) => {
        let addressObj = {}
        for (let obj in req.body) {
            addressObj = JSON.parse(obj)
        }
        //无关注，添加flow关注表记录
        Address.destroy({
            where:{
                address_id:addressObj.address_id
            }
        }).then(flow=>{
            res.status(200).send({code:200,msg:'删除地址成功！'}).end();
        })
    });
    //用户编辑地址
    route.post('/editAddr', (req, res) => {
        let addressObj = {}
        for (let obj in req.body) {
            addressObj = JSON.parse(obj)
        }
        Address.update({
            user_id:addressObj.user_id,
            addressinfo:addressObj.addressinfo,
            isdefault:addressObj.isdefault,
            user_phone:addressObj.user_phone,
            addressarea:addressObj.addressarea,
            sname:addressObj.sname,
        }, {
            where: {
                address_id: addressObj.address_id
            }
          }).then(function (token) {
            res.status(200).send({ 'msg': '地址修改成功！', 'code': 200}).end();
         })
    });
    var Storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, "./Images");
        },
        filename: function (req, file, callback) {
            callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
        }
    });
    var upload = multer({ storage: Storage }).array("imgUploader", 3); //Field name and max count
    /* 上传 */
    route.post('/file/uploading',(req, res, next)=>{
        upload(req, res, (err)=> {
            if (err) {
                return res.end("Something went wrong!");
            }
            return res.end("File uploaded sucessfully!.");
        });
    })
    //产品编辑
    route.post('/editPro', (req, res) => {
        let productObj = {}
        for (let obj in req.body) {
            productObj = JSON.parse(obj)
        }
        Product.update({
            category_id:productObj.category_id,
            shop_id:productObj.shop_id,
            product_name:productObj.product_name,
            product_price:productObj.product_price,
            product_uprice:productObj.product_uprice,
            product_detail:productObj.product_detail
        }, {
            where: {
                product_id: productObj.product_id
            }
          }).then(function (product) {
            res.status(200).send({ 'msg': '产品修改成功！', 'code': 200}).end();
         })
    });
    //产品新建
    route.post('/addPro', (req, res) => {
        let productObj = {}
        for (let obj in req.body) {
            productObj = JSON.parse(obj)
        }
        //无关注，添加flow关注表记录
        Product.create({
            category_id:productObj.category_id,
            addressinfo:productObj.addressinfo,
            shop_id:productObj.shop_id,
            product_name:productObj.product_name,
            product_price:productObj.product_price,
            product_uprice:productObj.product_uprice,
            product_detail:productObj.product_detail
        }).then((product)=> {
            res.status(200).send({code:200,msg:'产品添加成功！'}).end();
        })
    });
    //产品编辑
    route.post('/delPro', (req, res) => {
        let productObj = {}
        for (let obj in req.body) {
            productObj = JSON.parse(obj)
        }
        Product.destroy({
            where:{
                product_id:productObj.product_id
            }
        }).then(product=>{
            res.status(200).send({code:200,msg:'删除产品成功'}).end();
        })
    });

    //用户新建
    route.post('/addUser', (req, res) => {
        let userObj = {}
        for (let obj in req.body) {
            userObj = JSON.parse(obj)
        }
        let editPassword = common.md5(userObj.password + common.MD5_SUFFXIE);
        let editObj = { user_name: userObj.user_name,user_namesub:userObj.user_namesub}
        if(userObj.password != ""){
            editObj.login_password = editPassword
        }
        User.create(editObj).then((user)=> {
            res.status(200).send({code:200,msg:'用户添加成功！'}).end();
        })
    });
    //用户编辑
    route.post('/delUser', (req, res) => {
        let userObj = {}
        for (let obj in req.body) {
            userObj = JSON.parse(obj)
        }
        User.destroy({
            where:{
                user_id:userObj.user_id
            }
        }).then(user=>{
            res.status(200).send({code:200,msg:'删除用户成功'}).end();
        })

    });

    return route;
}
