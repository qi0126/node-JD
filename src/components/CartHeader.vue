<template>
		<div id="carttp">
			<header class="top_bar">
		    <a onclick="window.history.go(-1)" class="icon_back"></a>
		    <h3 class="cartname">购物车</h3>
			<van-icon name="shop-o" class="goCartIcon" :badge="cartNum" size="20" @click="goCart"/>
		</header>
		</div>

</template>
<script>
	export default{
		props: {
			//接收父组件的value
			cartNum: {
				type: Number,
				required: true
			},
		},
		data(){
			return {
			}
		},
		methods:{
			goCart(){
				this.$router.push('/cart')
			}
		}
	}
</script>