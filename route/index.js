const express = require('express');
const mysql = require('mysql');
const common = require('../libs/common');
const User = require('./models/user')
const Cart = require('./models/cart')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'batar123',
    database: 'myigou'
});



//token私钥
const PRIVATE_KEY = 'tokenKey'

module.exports = () => {
    const route = express.Router();
    const getHomeStr = `SELECT product_id,product_name,product_price,product_img_url,product_uprice FROM product`;
    const getCateNames = `SELECT * FROM category ORDER BY category_id desc`;
    //get homePage datas
    route.get('/home', (req, res) => {
        // 获取前端请求头发送过来的accesstoken
        getToken(req.headers.accesstoken)
        getHomeDatas(getHomeStr, res);
    });
    //验证token
    function getToken(token){
        console.log('token:',token)
        // console.log('jwt:',jwt.verify(token,PRIVATE_KEY))
        // jwt.verify(token, PRIVATE_KEY, function(err, decoded) { // decoded:指的是tokneid解码后用户信息
        //     console.log(err);
        //         if (err) {   //如果tokenid过期则会执行err的代码块
        //             console.log("err:",err)
        //             // return res.send({ success: false, message: 'Failed to authenticate token.' });
        //         } else {
        //         // if everything is good, save to request for use in other routes
        //         // req.decoded = decoded; //将解码信息储存于req中方便其他路由使用
        //     console.log("decoded:",decoded)
        //         // res.send(decoded)
        //         }
        // })
        //token
        //解析token
        // let verifyToken = jwt.verify(token, PRIVATE_KEY)
        // console.log("verifyToken:",verifyToken)

    }

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
        const cartStr = "SELECT cart_id,user.user_id,product.product_id,product_name,product_price,product_uprice,product_img_url,goods_num,product_num,shop_name FROM product,user,goods_carts,shop where product.product_id=goods_carts.product_id and user.user_id=goods_carts.user_id and shop.shop_id = product.shop_id";
        db.query(cartStr, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send('database err').end();
            } else {
                if (data.length == 0) {
                    res.send([]);
                    // res.status(500).send('no datas').end();
                } else {
                    res.send(data);
                }
            }
        });
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
                   res.status(200).send({ 'msg': '创建用户成功！',"data":user, 'code': 200 }).end();
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
            console.log("err:",err,data)
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
                        const username = dataw.user_name
                        const userid = dataw.user_id
                        //token时效
                        // const JWT_EXPIRED = 60 * 60
                        // const jwt = require('jsonwebtoken')
                        // const token = jwt.sign({ username },{userid},PRIVATE_KEY,{expiresIn:JWT_EXPIRED})
                        // dataw.accesstoken = token//token输
                        res.send(dataw).end();
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
        Cart.create({
            user_id:cartObj.user_id,
            product_id:cartObj.product_id,
            goods_num:cartObj.goods_num
        }).then(function (cart) {
            res.status(200).send({ 'msg': '创建购物车成功！',"data":cart, 'code': 200 }).end();
         })
    });
    //购物车删除产品
    route.post('/delCart', (req, res) => {
        let cartObj = {}
        for (let obj in req.body) {
            cartObj = JSON.parse(obj)
        }
        console.log("cartObj:",cartObj,cartObj.cart_id)
        Cart.destroy({
            where:{
                cart_id:cartObj.cart_id
            }
        }).then(cart=>{
            res.status(200).send({ 'msg': '购物车删除成功！',"data":cart, 'code': 200 }).end();
        })
    });
    return route;
}
