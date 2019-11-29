// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import "./assets/css/main.css";
import 'element-ui/lib/theme-chalk/index.css';
import ElementUI from 'element-ui';
import vueiInfinite from 'vue-infinite-scroll'


import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(vueiInfinite)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
