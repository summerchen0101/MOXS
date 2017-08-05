import Vue from 'vue'
import Vuex from 'vuex'
import api from './modules/api'
import modal from './modules/modal'
import order from './modules/order'
import db from './modules/db'
import alertBox from './modules/modals/alertBox'
import productModal from './modules/modals/productModal'
import storeMapModal from './modules/modals/storeMapModal'
import {fakeHost, devMode, apiHost, apiModule, resHttpPath, setFakeType, fakeType } from '../cfg/apiBasic'


Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    db,
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
    menu: [],
    modules: {},
    pageMsgs: {
      title: ""
    },
    org: {},
    sev: {},
    resources: {},
    colors: {},
    paySets: [],
    storeList: [],
    googleKey: 'AIzaSyCJwqPoYKWtOxe2xnb3tneHV1Vu9EdKZAQ',
    checkoutType: "",
    resHttpPath,
  },
  getters: {
    isLogin: state => state.isLogin,
    account: state => state.account,
    menu: state => state.menu,
    modules: state => state.modules,
    storeList: state => state.storeList,
    checkoutType: state => state.checkoutType,
    pageMsgs: state => state.pageMsgs,
    resHttpPath: state => state.resHttpPath,
  },
  mutations: {
    switchLoginStatus(state, status) {
      state.isLogin = status
    },
    gotAccount(state, account) {
      state.account = account
    },
    GOT_CONFIG(state, data) {

      /*
        動態主題顏色
      */
      var link = document.createElement('link');
      // link.id = 'customLink';
      link.rel = 'stylesheet';
      link.href = `${resHttpPath}/${data.SEV_THEME.CSS_URL}`;
      document.head.appendChild(link);

      state.menu = data.MODULES_MENU_WEB
      state.modules = data.MODULES_CONFIG
      if(state.modules.ORD) {
        state.checkoutType = 'ord'
      }else {
        state.checkoutType = "resv"
      }

      if(setFakeType) {
        /*
          For Test
        */
        state.checkoutType = fakeType
      }

      state.org = data.ORGANIZATION
      state.sev = data.SERVICE
      state.resources = data.SEV_THEME_RES
      state.colors = data.SEV_THEME
      state.paySets = data.ORG_PAY_SET
      state.pageMsgs = _.assign({}, state.pageMsgs, {
        title: state.resources.INDEX_TITLE
      })

      sessionStorage.setItem("sevSn", state.sev.SEV_SN)
      sessionStorage.setItem("orgSn", state.org.ORG_SN)

      // TAB標題及TAB_ICON
      document.title = state.sev.SEV_NAME
    },
    GOT_STORE_LIST(state, storeList) {
      state.storeList = storeList
    }
  },
  actions: {
    async getSiteConfig({ state, commit, dispatch, rootState }) {
      var data = {
        domainType: devMode ? "SUBDOMAIN" : location.hostname.indexOf("moxs") > -1 ? "SUBDOMAIN" : "DOMAIN",
        domain: devMode ? fakeHost : location.hostname.split('.')[0]
      }
      var configRes = await dispatch("getDomainConfig", data)
      if(configRes.code === 10) commit("GOT_CONFIG", configRes.data)
      var storeRes = await dispatch("getStoreList")
      if(storeRes.code === 10) commit("GOT_STORE_LIST", storeRes.data.items)
      return configRes
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
