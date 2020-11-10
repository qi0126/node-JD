<template>
	<div id="my_cart">
		
		<CartHeaderView></CartHeaderView>
		<CartMainView></CartMainView>
		<!-- <CartFooterView></CartFooterView> -->
	</div>
</template>
<script>
 import {check,animatDelBox} from '../assets/js/cart.js'	
 import CartHeaderView from './CartHeader.vue';
 import CartMainView from './CartMain.vue';
 import CartFooterView from './CartFooter.vue';

 export default{
 	components:{
 		CartHeaderView,
 		CartMainView,
 		CartFooterView
 	},
 	mounted(){
 		check();
 		animatDelBox();
 	}
 }
</script>
<style>
@import '../assets/css/cart.css';
</style>
