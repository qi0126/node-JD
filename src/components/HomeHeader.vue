<template>
	<div class="home_h">
		 <header class="m_header">
                <div class="m_header_box" id="my_search">
                    <a href="#" class="icon_logo"></a>
                    <form action="#">
                        <span class="icon_search"></span>
                        <input type="search" class="search" placeholder="点击搜索" @click="goSearch($event)">
                    </form>
                    <router-link to="/Mine" class="logo_btn" v-if="userInfo.user_namesub" style="font-size: 12px;line-height: 17px;width: 48px;margin-top: 5px;">
                        {{userInfo.user_namesub}}
                    </router-link>
                    <router-link to="/login" class="logo_btn" v-else>
                        "登录"
                    </router-link>
                </div>
            </header>
	</div>
</template>
<script>
    export default{
       data(){
			return {
				userInfo:{}
			}
		},
        mounted(){
			this.create_fun();
		},
        methods:{
            create_fun(){
                let self = this
                if(localStorage.accesstoken){
					let uObj = JSON.parse(localStorage.userInfo);
					let useId = uObj.user_id;
					self.$http.get('/userinfo',{
						params:{
							uId:useId
						}
					}).then((res)=>{
						if(res.status!=203){
							self.userInfo = res.data;
						}else{
							Toast( res.data.msg );
							setTimeout(_=>{
								self.$router.push('login')
							},1000)
						}
					},(err)=>{
						Toast( err.msg );
					});
                }else{
					self.$router.push({
						path:'/login',
					})
                }
            },
            goSearch(event){
                this.$router.push('/search');
                window.event? window.event.returnValue = false : event.preventDefault();
            }
        }
    }
</script>