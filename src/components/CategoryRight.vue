<template>
	<div id="cate_right">
		<div class="category_right">
	            <div class="category_banner">
	                <a href="#">
	                    <img src="../assets/images/banner_1.png" alt="">
	                </a>
	            </div>
	            <div class="category_detail">
	                <h3 class="category_n">{{cateName}}</h3>
	                <ul>
	                    <li class="category_detail_item" v-for="item in cateGoodsData">
	                        <router-link :to="'/detail/'+item.product_id"class="category_detail_item_link">
	                            <img v-lazy="item.product_img_url" alt="" class="category_detail_item_pic">
	                            <p class="category_detail_item_name">{{item.product_name}}</p>
	                        </router-link>
	                    </li>
	                
	                </ul>
					<div class="bottomH"></div>
	            </div>
	        </div>
			
	</div>
</template>
<script>
export default{
		mounted(){
			this.fetchData(this.$route.params.id);
		},
		data(){
			return {
				cateGoodsData:[],
				cateName:''
			}
		},
		watch:{
			$route(to){
				//console.log(to);
				var reg=/catgory\/\d+/;
				if(reg.test(to.path)){
					var categotyId=this.$route.params.id || 0;
					this.fetchData(categotyId);
				}
			}
		},
		methods:{
			fetchData(id){
				var self=this;
				
				self.$http.get('/categorygoods',{
					params: {
						mId: id
					}
				}).then((res)=>{
					self.cateName = res.data.cateName?res.data.cateName:'-'
					self.cateGoodsData = res.data.list;
				},(err)=>{
					console.log(err);
				})
			}
		}
	}
</script>