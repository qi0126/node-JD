<template>
	<div class="cart_fo">
		<footer class="cart_footer">
		    <div class="all_check_box">
				<van-checkbox v-model="checkedAll" checked-color="#F23030" class="checkoutAll" @click="checkedAllFun"></van-checkbox>全选
		    </div>
		    <div class="count_money_box">
		        <div class="heji">
		            <strong>合计:</strong>
		            <strong>￥</strong>
		            <strong>{{sumObj.sumPrice}}</strong>
		        </div>
		        <div class="total_money clearfix">
		            <span>总额:</span>
		            <i>￥</i>
		            <span>{{sumObj.sumPrice}}</span>
		            <span>数量:</span>
		            <i></i>
		            <span>{{sumObj.num}}</span>
		        </div>
		            <a class="go_pay"  @click="toConfirm">
		                <span>去计算</span>
		            </a>
		    </div>
		</footer>
	</div>
</template>
<script>
	import { Dialog,Toast,Checkbox, CheckboxGroup } from 'vant';
	Vue.use(Checkbox);
	Vue.use(CheckboxGroup);
	export default{
		props: {
			//接收父组件的value
			sumObj: {
				type: Object,
				required: true
			},
		},
		data(){
			return{
				checkedAll:false
			}
		},
		methods:{
			checkedAllFun(e){
				this.$emit("checkedAll", this.checkedAll)
			},
			toConfirm(){
				this.$emit("toConfirm")
			}
		}

	}
</script>
<style>
	.checkoutAll .van-icon{
		margin-top: -10px;
	}
</style>