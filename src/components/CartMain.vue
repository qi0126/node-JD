<template>
		<main class="cart_box">
			<CartHeaderView :cartNum="cartNum"></CartHeaderView>
		    <!-- <div class="cart_tip clearfix">
		        <span>登录后可同步电脑与手机购物车中的商品</span>
		        <a href="#" class="login">登录</a>
		    </div> -->
			<div v-if="!cartDatas || cartDatas.length == 0" class="cartNull">购物车为空,请返回首页添加产品！</div>
		    <div class="cart_content clearfix" v-for="(item,indOne) in cartDatas" v-else>
		        <div class="cart_shop clearfix">
		            <div class="cart_check_box">
						<!-- <van-checkbox v-model="checked" checked-color="#F23030" class="checkoutOne"></van-checkbox> -->
		            </div>
		            <div class="shop_info clearfix">
		                <img src="../assets/images/buy-logo.png" alt="" class="shop_icon">
		                <span class="shop_name">{{item.shop_name}}</span>
		            </div>
		            <div class="cart_free clearfix">
		                <span class="free_tip">优惠券></span>
		            </div>
		        </div>
		        <div class="cart_item">
		            <div class="cart_item_box">
						<van-checkbox v-model="item.checked" checked-color="#F23030" class="checkoutTwo" @click="changeProCheck"></van-checkbox>
		            </div>
		            <div class="cart_detial_box clearfix">
		                <a class="cart_product_link"  @click="toPro(item)">
		                    <img v-lazy="item.product_img_url" alt="">
		                </a>
		                <div class="item_names"  @click="toPro(item)">
		                    <a>
		                        <span>{{item.product_name}}</span>
		                    </a>
		                </div>
		                <div class="cart_weight">
		                    <i class="my_weigth">重量:0.45kg</i>
		                    <span class="my_color">颜色:AT800/16</span>
		                </div>
		                <div class="cart_product_sell">
		                    <span class="product_money">￥<strong class="real_money">{{item.product_sPrice}}</strong>.00</span>
		                    <div class="cart_add clearfix">
								<van-stepper v-model="item.goods_num" @change="changeNum(item)"/>
		                    </div>
		                </div>
		                <div class="cart_del clearfix" @click="delCart(item,indOne)">
		                    <div class="del_top" >
		                    </div>
		                    <div class="del_bottom">
		                    </div>
		                </div>
		            </div>
		        </div>
		      
		    </div>
			<div class="bottomH"></div>
			<CartFooterView :sumObj="sumObj" @checkedAll="changeCheckAllFun" @toConfirm="toConfirm"></CartFooterView>
		</main>
</template>
<script>
 import CartFooterView from './CartFooter.vue';
 import CartHeaderView from './CartHeader.vue';
	import { Dialog,Toast,Checkbox, CheckboxGroup } from 'vant';
	Vue.use(Checkbox);
	Vue.use(CheckboxGroup);
	export default{
		components: {
			[Dialog.Component.name]: Dialog.Component,
			CartFooterView,
			CartHeaderView
		},

		data(){
			return{
				cartDatas:[],
				cartNum:0,
				sumObj:{num:0,sumPrice:0},//总数量和总价格
				checkedAll:true,//全选多选框
				checkProList:[],//已选数组
			}
		},
		mounted(){
			this.getCartDatas()
		},
		methods:{

			//购物车读取属性
			getCartDatas(){
				let self = this;
				self.$http.get('/cart').then((res)=>{
					if(res.data.code ==200){
						self.cartDatas = res.data.data;
						self.cartDatas.forEach(ielem=>{
							ielem.checked = true
						})
						self.cartNum = res.data.cartNum;//购物车数量
						self.sumfun()//统计总数量和总价格的方法
					}else{
						Toast(res.data.msg)
						self.$router.push('/login')
					}

				},(err)=>{
					// console.log(err);
				})
			},
			//去计算事件
			toConfirm(){
				// console.log("去计算已选数组",this.checkProList)

			},
			//全选选择框选中状态
			changeCheckAllFun(e){
				this.checkedAll = e;
				this.cartDatas.forEach(ielem=>{
					ielem.checked = e
				})
				this.sumfun()
			},
			//多选框点击选择
			changeProCheck(){
				this.sumfun()
			},
			//修改购物车产品数量
			changeNum(e){
				let self = this
				let params={
					cart_id:e.cart_id,
					goods_num:e.goods_num
				}
				self.$http.post('/changeCartNum',params).then((res)=>{
					if(res.status == 200){
						self.sumfun()
					}else{
						Toast( res.data.msg );
					}
				},(err)=>{
					// console.log(err);
				});
				
			},
			//统计总数量和总价格的方法
			sumfun(){
				// console.log(this.cartDatas)
				this.sumObj={num:0,sumPrice:0}
				this.checkProList = []
				this.checkedAll = true
				this.cartDatas.forEach(ielem=>{
					if(ielem.checked){
						ielem.product_sPrice = ielem.product_price * ielem.goods_num
						this.sumObj.sumPrice += ielem.product_sPrice//总价格
						this.sumObj.num += ielem.goods_num//总数量
						this.checkProList.push(ielem)
					}else{
						this.checkedAll = false
					}
				})
				// console.log("总数量和总价格：",this.sumObj,this.checkProList)
				this.$forceUpdate()
			},
			//跳转到产品详情页
			toPro(e){
				Dialog.confirm({
					message: '确认跳转到产品详情面？'
				})
				.then(() => {
					this.$router.push({path:`/detail/${e.product_id}`})
				})
				.catch(() => {
					// on cancel
				});
			},
			//购物车删除
			delCart(e,ind){
				let self = this
				Dialog.confirm({
					message: '确认删除？',
				})
				.then(() => {
    
					let params={
						cart_id:e.cart_id,
					}
					self.$http.post('/delCart',params).then((res)=>{
						if(res.status == 200){
							Toast(res.data.msg);
							setTimeout(_=>{
								self.getCartDatas()
							},1000)
							
						}else{
							Toast( res.data.msg );
						}
					},(err)=>{
						// console.log(err);
					});
				})
				.catch(() => {
					// on cancel
				});

			}
		}
	}
</script>
