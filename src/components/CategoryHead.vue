<template>
	<div id="caregoty_head">
		<header class="top_bar">
	        <a onclick="window.history.go(-1)" class="icon_back"></a>
	        <form action="" class="goods_search">
	            <input type="search" class="goods_search_content" placeholder="搜索">
	        </form>
	        <van-icon name="shop-o" class="goCartIcon" :badge="cartNum" size="20" @click="goCart"/>
	    </header>
	</div>
</template>
<script>
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