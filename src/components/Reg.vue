<template>
	<div class="m_r">
		<header class="top_bar">
		    <a onclick="window.history.go(-1)" class="icon_back"></a>
		    <h3 class="cartname">商城注册</h3>
		</header>
		<main class="user_login_box">
		    <div class="login_dialog">
		        <div class="_username">
		            <input type="text" name="regname" placeholder="用户名/邮箱/手机号" class="user_input" v-model="regname">
		        </div>
				<div class="_username">
		            <input type="text" name="regnamesub" placeholder="用户别名" class="user_input" v-model="regnamesub">
		        </div>
		        <div class="_username u_passwd">
		            <input type="password" name="regpasswd" placeholder="请输入密码" class="user_input" v-model="regpasswd">
		        </div>
		        <div class="_username u_passwd">
		            <input type="password" name="regpasswd_ag" placeholder="请再次输入密码" class="user_input" v-model="regpasswd_ag">
		        </div>
		        <div class="login_box">
		            <a @click="goSearch()" class="btn_login">注册</a>
		        </div>
		    </div>
		</main>
	</div>
</template>
<script>
	import { Toast,Dialog } from 'vant';
	export default{
		components: {
			[Dialog.Component.name]: Dialog.Component,
		},
		data(){
			return{
				regname:'',
				regnamesub:'',
				regpasswd:'',
				regpasswd_ag:'',
				regInfo:{}
			}
		},
		methods:{
			goSearch(){
				let self = this;
				if(self.regname ==''){
					Toast( '请输入手机号' );
				}else if(self.regpasswd == '' || self.regpasswd_ag == ''){
					Toast( '请输入密码' );
				}else if(self.regpasswd!==self.regpasswd_ag){
					Toast( '两次输入的密码不一致' );
				}else if(self.regpasswd.length < 6){
					Toast( '密码长度不能小于6' );
				}else{
					self.$http.post('/reg',{
						regName:self.regname,
						regnamesub:self.regnamesub,
						regPasswd:self.regpasswd
					}).then((res)=>{
						if(res.status == 200){
							self.regInfo = res.data.data;
							if(self.regInfo.user_id){
								Dialog.alert({
									message: '注册成功，正在跳转！',
								}).then(() => {
									localStorage.userInfo = JSON.stringify(self.regInfo);
									localStorage.accesstoken ="111"
									//reg success, go to this login page
									self.$router.push({path:'mine'})
								});

							}else{
								Toast( res.data.msg );
							}
						}else{
							Toast( res.data.msg );
						}
					},(err)=>{
						console.log(err);
					});
				}
				
			}
		}
	}
</script>
<style>
@import '../assets/css/reg.css';
</style>