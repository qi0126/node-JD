<template>
	<div class="home_m">
		 <main class="m_product">
                <div class="left_share_quality_content clearfix">
                    <div class="share_quality">
                        <div class="share_quality_top">
                            <div class="share_title">
                                <span class="titTxt mr10" @click="returnFun">返回</span>
                                <span class="titTxt">你所关注</span>
                            </div>
                        </div>
                        <div class="share_quality_left not_eng_box">
                            <ul>
                                <li class="not_eng_item" v-for="item in mainDatas">
                                    <router-link  class="not_eng_link" :to="'/detail/'+item.product_id">
                                        <img v-lazy="item.product_img_url" alt="" class="not_eng_pic lazy-img-fadein">
                                        <div class="not_eng_info">
                                            <p class="not_eng_title">{{item.product_name}}</p>
                                            <p class="not_eng_text">
                                                <i style="text-decoration: none;font-style: normal;font-size: 12px">¥</i>
                                                <span class="more_info_price_txt">{{item.product_price}}</span>
                                            </p>
                                        </div>
                                    </router-link>
                                </li>
                        
                            </ul>
                            
                        </div>
                    </div>
                </div>
                <div style="height:60px"></div>
            </main>
	</div>
</template>
<script>
    import { Toast  } from 'vant';
    export default{
        data(){
            return {
                homeDatas : [],
                mainDatas:[]
            }
        },
        mounted(){
            this.getData();
        },
        methods:{
            getData(){
                let self = this;
                self.$http.get('/flow').then((res)=>{
                    if(res.data.code == 200){
                        self.mainDatas = res.data.data
                        // console.log(self.mainDatas)
                    }else{
                        Toast(res.data.msg)
                    }

                },(err)=>{
                    Toast(err)
                })
            },
            //返回首页
            returnFun(){
                this.$router.go(-1)
            }
        }
    }
</script>
<style>
    img[lazy=error] {
    background: url('../assets/images/err.png');
  }
</style>