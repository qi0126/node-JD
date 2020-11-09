<template>
	<div class="m_r">
		<header class="top_bar">
		    <a onclick="window.history.go(-1)" class="icon_back"></a>
		    <h3 class="cartname">用户信息</h3>
		</header>
		<main class="user_login_box">
		    <div class="login_dialog">
				登录名：{{userInfo.user_name}}
		        <!-- <div class="_username">
					
		            <input type="text" name="regname" placeholder="用户名/邮箱/手机号" class="user_input" v-model="userInfo.user_name">
		        </div> -->
				<div class="_username">
		            <input type="text" name="regnamesub" placeholder="用户别名" class="user_input" v-model="userInfo.user_namesub">
		        </div>
		        <div class="_username u_passwd">
		            <input type="password" name="regpasswd" placeholder="请输入密码" class="user_input" v-model="userInfo.password">
		        </div>
		        <div class="_username u_passwd">
		            <input type="password" name="regpasswd_ag" placeholder="请再次输入密码" class="user_input" v-model="userInfo.passwordOne">
		        </div>
		        <div class="login_box">
		            <a @click="saveUserInfo()" class="btn_login">保存</a>
		        </div>
				<div class="login_boxOne">
		            <a @click="exitFun()" class="btn_login">切换用户</a>
		        </div>
		    </div>
		</main>
	</div>
</template>
<script>
	import { Dialog } from 'vant';
	export default{
		components: {
			[Dialog.Component.name]: Dialog.Component,
		},
		data(){
			return{
				userId:'',//用户Id
				userInfo:{password:'',passwordOne:''},//用户信息
			}
		},
		created(){
			this.create_fun()
		},
		methods:{
			create_fun(){
				this.userId = this.$route.query.userId//用户id
				this.userInfoFun(this.userId)//用户信息方法
			},
			userInfoFun(id){
				let self = this
				self.$http.get('/userinfo',{
					params:{
						uId:id
					}
				}).then((res)=>{
					if(res.status == 200){
						self.userInfo = Object.assign(res.data,self.userInfo);
						// console.log("用户信息：",self.userInfo)
					}else{
						Toast( res.data.msg );
						setTimeout(_=>{
							self.$router.push('login')
						},1000)
					}
				},(err)=>{
					Toast( err.msg );
				});
			},
			//修改用户保存
			saveUserInfo(){
				let self = this;
				if(self.userInfo.password !== self.userInfo.passwordOne){
					Toast( '两次输入的密码不一致' );
				}else if(self.userInfo.password != "" && self.userInfo.password.length < 6){
					Toast( '密码长度不能小于6' );
				}else{
					self.$http.post('/editUser',self.userInfo).then((res)=>{
						if(res.status == 200){
							Toast( res.data.msg );
							self.$router.push("mine")
						}else{
							Toast( '出现错误' );
						}
					},(err)=>{
						console.log(err);
					});
				}
				
			},
			//离开，切换用户
			exitFun(){
				Dialog.confirm({
					message: '确认退出该用户！',
				})
				.then(() => {
					localStorage.removeItem('userInfo')
					localStorage.removeItem('accesstoken')
					this.$router.push("login")
				})
				.catch(() => {
					// on cancel
				});

			}
		}
	}
</script>
<style>
@import '../assets/css/reg.css';
</style>