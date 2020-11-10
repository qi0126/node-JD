<template>
	<div id="caregoty_head">
		<header class="top_bar">
	        <a onclick="window.history.go(-1)" class="icon_back"></a>
	        <form action="" class="goods_search">
	            <input type="search" class="goods_search_content" placeholder="搜索">
	        </form>
	        <van-icon name="shop-o" class="goCartIcon" badge="9" size="20" @click="goCart"/>
	    </header>
	</div>
</template>
<script>
	export default{
		data(){
			return {}
		},
		methods:{
			goCart(){
				this.$router.push('/cart')
			}
		}
	}
</script>