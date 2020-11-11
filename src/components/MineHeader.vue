<template>
	<div class="mine_h">
		<header class="top_bar">
		    <a onclick="window.history.go(-1)" class="icon_back"></a>
		    <h3 class="cartname">我的商城</h3>
		    <van-icon name="shop-o" class="goCartIcon" :badge="cartNum" size="20" @click="goCart"/>
		</header>
	</div>
</template>
<script>
import { Dialog,Toast } from 'vant';
	export default{
		data(){
			return {
				cartNum:0
			}
		},
		mounted(){
			this.create_fun();
		},
		methods:{
			create_fun(){
				let self = this
				self.$http.get('/cartNum').then((res)=>{
					self.cartNum = res.data.cartNum
				},(err)=>{
					Toast( err.msg );
				});
			},
			goCart(){
				this.$router.push('/cart')
			}
		}
	}
</script>