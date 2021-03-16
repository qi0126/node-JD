<template>
	<div class="goods_detail">
		<header class="top_bar">
            <a onclick="window.history.go(-1)" class="icon_back"></a>
            <h3 class="cartname">商品详情</h3>
            <van-icon name="shop-o" class="goCartIcon" :badge="cartNum" size="20" @click="goCart"/>
        </header>
        <main class="detail_box">
            <section class="banner_box">
                <ul class="banner_child_box">
                    <li class="banner_item" v-for="item in goodsImages">
                        <img v-lazy="item.image_url" alt="" class="banner_pic">
                    </li>
                
                </ul>
                <div class="banner_count">
                        <em id="slide-nub" class="fz18">1</em>
                        <em class="nub-bg">/</em>
                        <em id="slide-sum" class="fz12">5</em>
                </div>
            </section>
            <section class="product_info clearfix">
                <div class="product_left">
                    <p class="p_name">{{goodsData.product_name}}</p>
                    <div class="product_pric">
                        <span>￥</span>
                        <span class="rel_price">{{goodsData.product_price}}</span>
                        <span>.00</span>
                    </div>
                    <div class="product_right">
                        降价通知
                    </div>
                </div>

            </section>
            <section class="product_intro">
                <p class="pro_det">
                    {{goodsData.product_detail}}
                </p>
           </section>
           <div class="bottomHOne">
               <van-stepper v-model="proNum" />
           </div>
          
        </main>
        <div class="bottomH"></div>
        <footer class="cart_d_footer">
            <div class="m">
                <ul class="m_box">
                    <li class="m_item">
                        <a class="m_item_link">
                            <!-- <em class="m_item_pic"></em> -->
                            <van-icon name="manager-o"  size="23"/>
                            <div class="m_item_name">卖家</div>
                        </a>
                        <a class="m_item_link"  @click="toFlow">
                            <!-- <em class="m_item_pic two"></em> -->
                            <van-icon :name="goodsData.flowTF?'like':'like-o'" :color="goodsData.flowTF?'#e6a23c':'#000'" size="23"/>
                            <div class="m_item_name" :style="{color:goodsData.flowTF?'#e6a23c':'#000'}">关注</div>
                        </a>
                        <a  class="m_item_link" @click="toCart">
                            <!-- <em class="m_item_pic three"></em> -->
                            <van-icon name="shopping-cart-o"  size="23"/>
                            <div class="m_item_name">购物车</div>
                        </a>
                    </li>
                </ul>
                <div class="btn_box clearfix" >
                    <a href="#" class="buy_now" @click="addCart">加入购物车</a>
                    <a href="#" class="buybuy">立即购买</a>
                </div>
            </div>
        </footer>
	</div>
</template>
<script>
    import { Toast,Dialog,Swipe, SwipeItem,Lazyload,Icon  } from 'vant';
    Vue.use(Swipe);
    Vue.use(SwipeItem);
    Vue.use(Icon);
    export default{
       	components: {
			[Dialog.Component.name]: Dialog.Component,
		},
        mounted(){
            this.fetchData(this.$route.params.id);
            this.getCartNum()//购物车产品数量

        },
        data(){
            return {
                cateGoodsAllData:[],
                goodsImages:[],
                goodsData:[{}],
                current: 0,
                proNum: 1,//产品数量订购或加入购物车
                cartNum:0
            }
        },
        watch:{
            $route(to){
                //console.log(to);
                var reg=/detail\/\d+/;
                if(reg.test(to.path)){
                    var categotyId=this.$route.params.id || 0;
                    this.fetchData(categotyId);
                }
            }
        },
        methods:{
            goCart(){
				this.$router.push('/cart')
			},
            onChange(index) {
                this.current = index;
            },
            //获取购物车产品数量
            getCartNum(){
				let self = this
				self.$http.get('/cartNum').then((res)=>{
					self.cartNum = res.data.cartNum
				},(err)=>{
					Toast( err.msg );
				});
			},
            fetchData(id){
                var self=this;
                self.$http.get('/detail',{
                    params: {
                        mId: id
                    }
                }).then((res)=>{
                    self.goodsImages = res.data.data.image;
                    self.goodsData = res.data.data;

                },(err)=>{
                    // console.log(err);
                })
            },
            //跳到购物车
            toCart(){
                this.$router.push('/cart')
            },
            //关注产品
            toFlow(){
                let self = this
                let params={
                    product_id:this.goodsData.product_id,
                }
                self.$http.post('/flowPro',params).then((res)=>{
                    if(res.status == 200){
                         this.goodsData.flowTF = !this.goodsData.flowTF 
                    }else{
                        Toast( res.data.msg );
                    }
                },(err)=>{
                    // console.log(err);
                });
            },
            //加入购物车
            addCart(){
                let self = this
                let params={
                    user_id:JSON.parse(localStorage.userInfo).user_id,
                    product_id:this.goodsData.product_id,
                    goods_num:this.proNum
                }
                self.$http.post('/addCart',params).then((res)=>{
                    if(res.status == 200){
                        self.addCartObj = res.data.data;
                        if(self.addCartObj.cart_id){
                            Toast('加入购物车成功！');

                        }else{
                            Toast( res.data.msg );
                        }
                    }else{
                        Toast( res.data.msg );
                    }
                    self.getCartNum()//购物车产品数量
                },(err)=>{
                    // console.log(err);
                });
            }

        }
    }
</script>
<style>
@import '../assets/css/detail.css';
.van-stepper{
    background: #fff;
}
</style>