<template>
		<div id="carttp">
			<header class="top_bar">
		    <a onclick="window.history.go(-1)" class="icon_back"></a>
		    <h3 class="cartname">购物车</h3>
			<van-icon name="shop-o" class="goCartIcon" badge="9" size="20" @click="goCart"/>
		</header>
		</div>

</template>
<script>
	export default{
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