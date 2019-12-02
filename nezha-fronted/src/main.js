import "./assets/css/main.css";
import 'element-ui/lib/theme-chalk/index.css';
import ElementUI from 'element-ui';

import i18n from './components/common/i18n'

import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios';
import { post, get, patch, put, del } from './components/common/js/http.js'

import Pagination from "./components/common/pagination"; //引入全局分页组件
Vue.component("Pagination", Pagination);

Vue.prototype.$axios = axios
Vue.prototype.$post = post;
Vue.prototype.$get = get;
Vue.prototype.$patch = patch;
Vue.prototype.$put = put;
Vue.prototype.$delete = del;

Vue.config.productionTip = false
Vue.use(ElementUI)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  i18n,
  components: { App },
  template: '<App/>'
})
