<template>
	<div class="mine_mm">
	<main class="mine_layout">
	    <section class="mine_infos clearfix">
	        <div class="mmm_info">
	            <div class="user_icon">
	                <img src="../assets/images/my_icon.jpg" alt="">
	            </div>
	            <div class="user_detal">
	                <p class="user_name">{{uInfs.user_namesub}}</p>
	                <div class="reg">
	                    <span  class="reg_link" @click="returnMain">返回首页</span>
	                    <div class="vip">
	                    <span class="vip_icon">
	                        <img src="../assets/images/vip.png" alt="">
	                    </span>
	                        <a href="#">
	                            立享PLUS特权 >
	                        </a>
	                    </div>
	                </div>
	            </div>
	            <div class="manage_account">
	                <span @click="editUser">
	                    账户管理 >
	                </span>
	            </div>
	        </div>
	        <div class="yguanzhu_box">
	            <ul class="gunzhuf">
	                <li class="item" @click="toFlow">
	                    <a class="item_link">
	                        <span>{{flowNum}}</span>
	                        <span>关注的商品</span>
	                    </a>
	                </li>
	                <li class="item">
	                    <a href="" class="item_link">
	                        <span>0</span>
	                        <span>关注的店铺</span>
	                    </a>
	                </li>
	                <li class="item" @click="toHistory">
	                    <a class="item_link">
	                        <span>{{historyNum}}</span>
	                        <span>浏览记录</span>
	                    </a>
	                </li>
	            </ul>
	        </div>
	    </section>
	    <section class="my_order_box">
	        <div class="order_top_box">
	            <div class="order_left">
	                <img src="../assets/images/my_order_icon.png" alt="">
	                <span>我的订单</span>
	            </div>
	            <div class="order_right">
	                <span>全部订单></span>
	            </div>
	        </div>
	        <div class="order_bottom_box">
	            <ul>
	                <li class="order_item">
	                    <a href="#" class="order_item_link">
	                        <img src="../assets/images/waitpay.png" alt="" class="order_item_pic">
	                        <span class="order_item_pay">待付款</span>
	                    </a>
	                </li>
	                <li class="order_item">
	                    <a href="#" class="order_item_link">
	                        <img src="../assets/images/wuliu.png" alt="" class="order_item_pic">
	                        <span class="order_item_pay">待收货</span>
	                    </a>
	                </li>
	                <li class="order_item">
	                    <a href="#" class="order_item_link">
	                        <img src="../assets/images/tuihuan.png" alt="" class="order_item_pic">
	                        <span class="order_item_pay">退换/售后</span>
	                    </a>
	                </li>
	            </ul>
	        </div>
	    </section>
	    <section class="my_order_box">
	        <div class="order_top_box">
	            <div class="order_left">
	                <img src="../assets/images/mypackage.png" alt="">
	                <span>我的钱包</span>
	            </div>
	            <div class="order_right">
	                <span>></span>
	            </div>
	        </div>
	        <div class="order_bottom_box">
	            <ul>
	                <li class="order_item">
	                    <a href="#" class="order_item_link">
	                        <span style="margin-top: -5px;display: block">0</span>
	                        <span class="order_item_pay">账户余额</span>
	                    </a>
	                </li>
	                <li class="order_item">
	                    <a href="#" class="order_item_link">
	                        <span style="margin-top: -6px;display: block">0</span>
	                        <span class="order_item_pay">优惠券</span>
	                    </a>
	                </li>
	                <li class="order_item">
	                    <a href="#" class="order_item_link">
	                        <span style="margin-top: -6px;display: block">0</span>
	                        <span class="order_item_pay">京豆</span>
	                    </a>
	                </li>
	                <li class="order_item">
	                    <a href="#" class="order_item_link">
	                        <span style="margin-top: -6px;display: block">0</span>
	                        <span class="order_item_pay">商城卡/E卡</span>
	                    </a>
	                </li>
	            </ul>
	        </div>
	    </section>
	    <section class="my_order_box my_b_info">
	        <div class="order_top_box">
	            <div class="order_left">
	                <img src="../assets/images/baitiao1.png" alt="">
	                <span>商城白条</span>
	            </div>
	            <div class="order_right">
	                <span>白条还款、激活获礼包></span>
	            </div>
	        </div>
	        <div class="order_top_box">
	            <div class="order_left">
	                <img src="../assets/images/baitiao2.png" alt="">
	                <span>客户服务</span>
	            </div>
	            <div class="order_right">
	                <span>返修/退换货、在线客服></span>
	            </div>
	        </div>
	        <div class="order_top_box">
	            <div class="order_left">
	                <img src="../assets/images/bai3.png" alt="">
	                <span>会员plus</span>
	            </div>
	            <div class="order_right">
	                <span>PLUS绝密攻略></span>
	            </div>
	        </div>
	        <div class="order_top_box">
	            <div class="order_left">
	                <img src="../assets/images/bai4.png" alt="">
	                <span>商城会员</span>
	            </div>
	            <div class="order_right">
	                <span>会员俱乐部></span>
	            </div>
	        </div>
	    </section>
	    <section class="my_order_box my_b_info">
	        <div class="order_top_box">
	            <div class="order_left">
	                <img src="../assets/images/huo1.png" alt="">
	                <span>商城火车票</span>
	            </div>
	            <div class="order_right">
	                <span>来商城轻松抢票></span>
	            </div>
	        </div>
	        <div class="order_top_box">
	            <div class="order_left">
	                <img src="../assets/images/huo2.png" alt="">
	                <span>1元抢宝</span>
	            </div>
	            <div class="order_right">
	                <span>1元成就梦想></span>
	            </div>
	        </div>
	        <div class="order_top_box">
	            <div class="order_left">
	                <img src="../assets/images/huo3.png" alt="">
	                <span>我的预约</span>
	            </div>
	            <div class="order_right">
	                <span>></span>
	            </div>
	        </div>
	        <div class="order_top_box">
	            <div class="order_left">
	                <img src="../assets/images/huo4.png" alt="">
	                <span>我的必购码</span>
	            </div>
	            <div class="order_right">
	                <span>></span>
	            </div>
	        </div>
	        <div class="order_top_box">
	            <div class="order_left">
	                <img src="../assets/images/huo5.jpg" alt="">
	                <span>应用推荐</span>
	            </div>
	            <div class="order_right">
	                <span>></span>
	            </div>
	        </div>
			<div class="bottomH"></div>
	    </section>
	</main>
	</div>
</template>
<script>
import { Dialog,Toast } from 'vant';
	export default{
		components: {
			[Dialog.Component.name]: Dialog.Component,
		},
		data(){
			return{
				uInfs:{},
				cartNum:0,//购物车产品数量
				flowNum:0,//关注数量
				historyNum:0,//浏览记录数量
			}
		},
		mounted(){
			this.getUDatas();
			this.flowNumFun();//关注数量调接口
			this.historyNumFun();//浏览记录数量调接口
		},
		methods:{
			getUDatas(){
				let self = this;
				let uObj ={};
				if(localStorage.accesstoken){
					let uObj = JSON.parse(localStorage.userInfo);
					let useId = uObj.user_id;
					self.$http.get('/userinfo',{
						params:{
							uId:useId
						}
					}).then((res)=>{
						if(res.status!=203){
							self.uInfs = res.data;
						}else{
							Toast( res.data.msg );
							setTimeout(_=>{
								self.$router.push('login')
							},1000)
						}
					},(err)=>{
						Toast( err.msg );
					});

				}else{
					self.$router.push({
						path:'/login',
					})
				}
			},
			//编辑用户
			editUser(){
				this.$router.push({path:'userInfo',query:{userId:JSON.parse(localStorage.userInfo).user_id}})
			},
			//关注数量调接口
			flowNumFun(){
				let self = this
				self.$http.get('/flowNum').then((res)=>{
					self.flowNum = res.data.flowNum
                },(err)=>{
                    // console.log(err);
                })
			},
			//去关注产品页面
			toFlow(){
				this.$router.push('/flow')
			},
			//浏览记录数量调接口
			historyNumFun(){
				let self = this
				self.$http.get('/historyNum').then((res)=>{
					self.historyNum = res.data.historyNum
                },(err)=>{
                    // console.log(err);
                })
			},
			//去浏览记录产品页面
			toHistory(){
				this.$router.push('/history')
			},
			//返回首页
			returnMain(){
				this.$router.push('/main')
			}
		}
	}
</script>