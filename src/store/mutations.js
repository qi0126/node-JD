import getters from './getter.js';
const state = {
    isShow: false,
    isNavShow: true,
    userInfo: {}
}
const mutations = {
    showLoading: (state) => {
        state.isShow = false
    },
    hideLoading: (state) => {
        state.isShow = false
    },
    showNav: (state) => {
        state.isNavShow = true
    },
    hideNav: (state) => {
        state.isNavShow = false
    },
    setUserInfo: (state, userInfo) => {
        state.userInfo = userInfo;
    }
}

export default {
    getters,
    state,
    mutations
}
