<template>
	<div id="cate_left">
		 <div class="category_left">
	            <ul class="childbox">
	                <li class="" v-for="item in leftDatas">
	                	<router-link :to="'/catgory/'+item.category_id">
	                	{{item.category_name}}
	                	</router-link>
	                </li>
	            </ul>
				<div class="bottomH"></div>
	        </div>
	</div>
</template>
<script>
export default{
	data(){
		return{
			leftDatas:[]
		}
	},
	mounted(){
		this.getLeftDatas();
	},
	methods:{
		getLeftDatas(){
			let self = this;
			self.$http.get('/category').then((res)=>{
				self.leftDatas = res.data;
				if(self.leftDatas && self.leftDatas.length>0){
					self.$router.push(`/catgory/${self.leftDatas[0].category_id}`)//默认分类的第一个
				}
			},(err)=>{
				console.log(err);
			})
		},
	}
}
</script>