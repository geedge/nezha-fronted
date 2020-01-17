//import "./assets/css/main.css";
import './assets/stylus/index.scss'
import "./assets/css/nzIcon.css";
import 'element-ui/lib/theme-chalk/index.css';
import ElementUI from 'element-ui';
import 'xterm/dist/xterm.css'
import i18n from './components/common/i18n'

import Vue from 'vue'
import Vuex from 'vuex'
import store from './store/index';
import App from './App'
import router from './router'
import VueResource from 'vue-resource'
import axios from 'axios';
import {post, get, put, del} from './http.js'

import Pagination from "./components/common/pagination"; //引入全局分页组件
import searchInput from "./components/common/searchInput"; //搜索框组件
import elementSet from "./components/common/elementSet"; //自定义表头组件

import projectBox from './components/common/rightBox/projectBox'; //project弹框组件
import moduleBox from './components/common/rightBox/moduleBox'; //module弹框组件
import editEndpointBox from './components/common/rightBox/editEndpointBox'; //endpoint弹框组件
import addEndpointBox from './components/common/rightBox/addEndpointBox'; //endpoint弹框组件
import assetAddUnit from "./components/page/asset/assetAddUnit"; //资产添加组件
import assetEditUnit from "./components/page/asset/assetEditUnit"; //资产添加组件
import alertConfigBox from "./components/common/rightBox/alertConfigBox"; //告警规则弹框组件
import dcConfigBox from "./components/common/popBox/dcConfig"; //idc配置弹框组件
import panelBox from "./components/common/rightBox/panelBox"; //面板弹框组件
import moduleListPop from "./components/page/asset/moduleListPop"; //面板弹框组件
import cabinetConfigBox from "./components/common/popBox/cabinetConfig"; //面板弹框组件

Vue.component("Pagination", Pagination);
Vue.component("searchInput", searchInput);
Vue.component("element-set", elementSet);
Vue.component("project-box", projectBox);
Vue.component("module-box", moduleBox);
Vue.component("edit-endpoint-box", editEndpointBox);
Vue.component("add-endpoint-box", addEndpointBox);
Vue.component("assetAddUnit", assetAddUnit);
Vue.component("assetEditUnit", assetEditUnit);
Vue.component("alert-config-box", alertConfigBox);
Vue.component("idc-config-box", dcConfigBox);
Vue.component("panel-box", panelBox);
Vue.component("module-list-pop", moduleListPop);
Vue.component("cabinet-config-box", cabinetConfigBox);

Vue.prototype.$axios = axios;
Vue.prototype.$post = post;
Vue.prototype.$get = get;
Vue.prototype.$put = put;
Vue.prototype.$delete = del;

Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.use(Vuex);
Vue.use(VueResource);

const clickoutside = {
  // 初始化指令
  bind(el, binding, vnode) {
    function documentHandler(e) {
      // 这里判断点击的元素是否是本身，是本身，则返回
      if (el.contains(e.target)) {
        return false;
      }
      // 判断指令中是否绑定了函数
      if (binding.expression) {
        // 如果绑定了函数 则调用那个函数，此处binding.value就是handleClose方法
        if (binding.arg) {
          binding.value(e, binding.arg);
        } else {
          binding.value(e);
        }

      }
    }

    // 给当前元素绑定个私有变量，方便在unbind中可以解除事件监听
    el.__vueClickOutside__ = documentHandler;
    document.addEventListener('click', documentHandler);
  },
  unbind(el, binding) {
    // 解除事件监听
    document.removeEventListener('click', el.__vueClickOutside__);
    delete el.__vueClickOutside__;
  },
};

Vue.directive('clickoutside',
    clickoutside
)

/* eslint-disable no-new */
window.vm = new Vue({
  el: '#app',
  router,
  i18n,
  store,
  components: {App},
  template: '<App/>'
})

export default vm
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    next()
  } else {
    let token = sessionStorage.getItem('nz-token');
    if (token) {
      next()
    } else {
      next({ path: '/dashboard' })
    }
  }
})
