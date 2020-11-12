import Home from './components/Home.vue'
import Category from './components/Category.vue'
import Cart from './components/Cart.vue'
import GoodsDetail from './components/GoodsDetail.vue'
import SearchPage from './components/SearchPage.vue'
import Mine from './components/Mine.vue'
import Login from './components/Login.vue'
import Reg from './components/Reg.vue'
import Flow from './components/Flow.vue'
import UserInfo from './components/UserInfo.vue'
import History from './components/History.vue'

export default [{
    path: '/home',
    component: Home
}, {
    path: '/catgory',
    component: Category
}, {
    path: '/cart',
    component: Cart
}, {
    path: '/search',
    component: SearchPage
}, {
    path: '/mine',
    component: Mine
},{
    path: '/flow',
    component: Flow
}, {
    path: '/history',
    component: History
}, {
    path: '/login',
    component: Login
}, {
    path: '/register',
    component: Reg
}, {
    path: '/userInfo',
    component: UserInfo
},{
    path: '/catgory/:id',
    component: Category
}, {
    path: '/detail/:id',
    component: GoodsDetail
}, {
    path: '/',
    redirect: '/home'
}, {
    path: '*',
    redirect: '/home'
}]
