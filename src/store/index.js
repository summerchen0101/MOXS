import Vue from 'vue'
import Vuex from 'vuex'
import api from './modules/api'
import modal from './modules/modal'
import order from './modules/order'
import alertBox from './modules/modals/alertBox'
import productModal from './modules/modals/productModal'
import storeMapModal from './modules/modals/storeMapModal'


Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    api,
    modal,
    order,
    alertBox,
    productModal,
    storeMapModal,
  },
  state: {
    isLogin: null,
    account: {},
    menu: {},
    org: {},
    sev: {},
    imgs: {},
    colors: {},
    paySets: [],
    storeList: [],
    googleKey: 'AIzaSyCJwqPoYKWtOxe2xnb3tneHV1Vu9EdKZAQ'
  },
  getters: {
    isLogin: state => state.isLogin,
    account: state => state.account,
    menu: state => state.menu,
    storeList: state => state.storeList,
  },
  mutations: {
    switchLoginStatus(state, status) {
      state.isLogin = status
    },
    gotAccount(state, account) {
      state.account = account
    },
    GOT_CONFIG(state, data) {
      state.menu = data.modules_config
      state.org = data.organization
      state.sev = data.service
      state.imgs = data.sev_theme_res
      state.colors = data.sev_theme
      state.paySets = data.org_pay_set
    },
    GOT_STORE_LIST(state, storeList) {
      state.storeList = storeList
    }
  },
  actions: {
    async getSiteConfig({ state, commit, dispatch, rootState }) {
      var res = await dispatch("getConfig")
      if(res.code === 10) commit("GOT_CONFIG", res.data)
      var res = await dispatch("getStoreList")
      if(res.code === 10) commit("GOT_STORE_LIST", res.data.items)
    },
    async checkLoginStatus({ state, commit, dispatch, rootState }) {
      var res = await dispatch('checkLogin')
      if(res.code === 10) {
        commit('switchLoginStatus', true)
        commit('gotAccount', res.data)
      }else {
        commit('switchLoginStatus', false)
      }
      return res
    },
    async onLogout({ state, commit, dispatch, rootState }) {
      var res = await dispatch('logout')
      if(res.code === 10) {
        commit('setAlertBox', {msg: "登出成功"})
        commit('displayAlertBox', true)
        commit('switchLoginStatus', false)
      }
      return res
    },
    async onLogin({ state, commit, dispatch, rootState }, data) {
      var res = await dispatch('login', data)
      if(res.code === 10) {
        commit('CONTROL_MODAL', {target: 'login', boo: false})
        commit('setAlertBox', {msg: "登入成功"})
        commit('displayAlertBox', true)
        commit('switchLoginStatus', true)
        dispatch('checkLoginStatus')
      }
      return 
      
    }
  }
})
