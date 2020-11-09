<template>
	<div class="my_l">
		<header class="top_bar">
		    <a onclick="window.history.go(-1)" class="icon_back"></a>
		    <h3 class="cartname">商城登录</h3>
		</header>
		<main class="user_login_box">
		    <div class="login_dialog">
		        <div class="_username">
		            <input type="text" name="username" placeholder="请输入用户名" class="user_input" v-model="username"/>
		        </div>
		        <div class="_username u_passwd">
		            <input type="password" name="password" placeholder="请输入密码" class="user_input" v-model="password"/>
		        </div>

		        <div class="login_box">
		            <a @click="goLogin()" class="btn_login">登录</a>
		        </div>
		        <div class="go_reg_box">
		            <router-link tag="span" to="/register">快速注册</router-link>
		        </div>
		    </div>
		</main>
	</div>
</template>
<script>
import { Dialog,Toast } from 'vant';
	export default{
		components: {
			[Dialog.Component.name]: Dialog.Component,
		},
		data(){
			return{
				username:'',
				password:'',
				userInfo:{}
			}
		},
		methods:{
			goLogin(){
				let self = this;
				
				if(self.username ==''){
					alert('请输入用户名');
				}else if(self.password == ''){
					alert('请输入密码');
				}else{
					self.$http.post('/login',{
						loginName:self.username,
						loginPawd:self.password,
					}).then((res)=>{
						if(res.status == 200){
							self.userInfo = res.data;
							if(self.userInfo.status == 200){
								//LOGIN success
								localStorage.userInfo = JSON.stringify(self.userInfo);
								localStorage.accesstoken = self.userInfo.accesstoken
								console.log("用户信息：",self.userInfo)
								// console.log(self.$store);
								// self.$store.dispatch('setUserInfo', userInfo);
								// let redirect = decodeURIComponent(self.$route.query.redirect || '/');
								setTimeout(_=>{
									self.$router.push({
										path: "Mine"
									});
								},1000)
							}else{
								Toast( self.userInfo.msg );
							}
						}else{
							alert('请求出现错误');
						}
						console.log(res);
					},(err)=>{
						console.log(err);
					});
				}
				
			}
		}
	}
</script>
<style>
@import '../assets/css/login.css';
</style>