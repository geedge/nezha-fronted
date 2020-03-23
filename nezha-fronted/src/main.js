//import "./assets/css/main.css";
import './assets/stylus/index.scss'
import "./assets/css/nzIcon.css";
import "./assets/css/main.css";
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
import assetBox from "./components/common/rightBox/assetBox"; //资产添加组件
import alertConfigBox from "./components/common/rightBox/alertConfigBox"; //告警规则弹框组件
import dcConfigBox from "./components/common/popBox/dcConfig"; //idc配置弹框组件
import panelBox from "./components/common/rightBox/panelBox"; //面板弹框组件
import moduleListPop from "./components/page/asset/moduleListPop"; //面板弹框组件
import cabinetConfigBox from "./components/common/popBox/cabinetConfig"; //面板弹框组件
import dcBox from "./components/common/rightBox/dcBox"; //dc弹框
import modelBox from "./components/common/rightBox/modelBox"; //model弹框
import selectArea from "./components/common/popBox/selectArea"; //dc弹框
import alertMessageBox from "./components/common/bottomBox/alertMessageBox"; //dc弹框
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import loading from "./components/common/loading";

Vue.component("Pagination", Pagination);
Vue.component("searchInput", searchInput);
Vue.component("element-set", elementSet);
Vue.component("project-box", projectBox);
Vue.component("module-box", moduleBox);
Vue.component("edit-endpoint-box", editEndpointBox);
Vue.component("add-endpoint-box", addEndpointBox);
Vue.component("asset-box", assetBox);
Vue.component("assetAddUnit", assetAddUnit);
Vue.component("assetEditUnit", assetEditUnit);
Vue.component("alert-config-box", alertConfigBox);
Vue.component("idc-config-box", dcConfigBox);
Vue.component("panel-box", panelBox);
Vue.component("module-list-pop", moduleListPop);
Vue.component("cabinet-config-box", cabinetConfigBox);
Vue.component("dc-box", dcBox);
Vue.component("model-box", modelBox);
Vue.component("select-area", selectArea);
Vue.component('loading',loading);
Vue.component('alert-message-box',alertMessageBox);

Vue.prototype.$axios = axios;
Vue.prototype.$post = post;
Vue.prototype.$get = get;
Vue.prototype.$put = put;
Vue.prototype.$delete = del;
Vue.prototype.$tableHeight = { //列表页表格的高度
  normal: 'calc(100% - 100px)',  //常规高度，特例在下方定义
  openSubList: { //打开二级列表后的高度
    mainList: 'calc(100% - 60px)',
    subList: 'calc(100% - 86px)'
  },
  noPagination: 'calc(100% - 60px)', //特例：endpoint query页，没有翻页组件
};
Vue.prototype.toTop = (type, wrap) => { //top按钮公共方法
  if (type == 'el') {
    let currentTop = wrap.scrollTop;
    let interval = currentTop/10;
    let intervalFunc = setInterval(function(){ //花200ms分10次回到顶部，模拟动画效果
      if (currentTop == 0) {
        clearInterval(intervalFunc);
      } else {
        currentTop = (currentTop - interval) < interval*0.5 ? 0 : currentTop - interval;
        wrap.scrollTop = currentTop;
      }
    }, 20);
  } else {
    let els = document.querySelectorAll(".el-table__body-wrapper");
    if (wrap || wrap == 0) {
      let currentTop = els[wrap].scrollTop;
      let interval = currentTop/10;
      let intervalFunc = setInterval(function(){ //花200ms分10次回到顶部，模拟动画效果
        if (currentTop == 0) {
          clearInterval(intervalFunc);
        } else {
          currentTop = (currentTop - interval) < interval*0.5 ? 0 : currentTop - interval;
          els[wrap].scrollTop = currentTop;
        }
      }, 20);
    } else {
      for (let i = 0; i < els.length; i++) {
        let currentTop = els[i].scrollTop;
        let interval = currentTop/10;
        let intervalFunc = setInterval(function(){ //花200ms分10次回到顶部，模拟动画效果
          if (currentTop == 0) {
            clearInterval(intervalFunc);
          } else {
            currentTop = (currentTop - interval) < interval*0.5 ? 0 : currentTop - interval;
            els[i].scrollTop = currentTop;
          }
        }, 20);
      }
    }
  }
};

Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.use(Vuex);
Vue.use(VueResource);

const el_scrollBar = el => {
  //在元素上加点私货，名字随便取，确保不会和已有属性重复即可，我取名叫做_ps_
  if (el._ps_ instanceof PerfectScrollbar) {
    el._ps_.update();
  } else {
    //el上挂一份属性
    el._ps_ = new PerfectScrollbar(el, {minScrollbarLength: 25});
  }
};
Vue.directive("scrollBar", {
  inserted(el, binding, vnode) {
    const { arg } = binding;
    if (arg === "el-table") {
      el = el.querySelector(".el-table__body-wrapper");
      !el && console.warn("未发现className为el-table__body-wrapper的dom");
    } else if (arg === "el-dropdown") {
      el = el.querySelector(".el-dropdown-menu");
      !el && console.warn("未发现className为el-dropdown-menu的dom");
    } else if (arg == "legend") {
      el = el.querySelector(".legend-container");
      !el && console.warn("未发现className为legend-container的dom");
    }

    // 启用x轴后不让原生滚动条出来作乱
    vnode.context.$nextTick(() => {
      if (arg === "xterm") {
        el = el.querySelector(".xterm-viewport");
        !el && console.warn("未发现className为xterm-viewport的dom");
      }
      el.classList.add("ps");
      el.addEventListener("ps-scroll-y", () =>
        el.classList.add("ps")
      );
      el.addEventListener("ps-scroll-x", () =>
        el.classList.add("ps")
      );
      //el上挂一份属性
      el_scrollBar(el);
    });

    const rules = ["fixed", "absolute", "relative"];
    if (!rules.includes(window.getComputedStyle(el, null).position)) {
      console.error(
        `perfect-scrollbar所在的容器的position属性必须是以下之一：${rules.join(
          "、"
        )}`
      );
    }
  },
  componentUpdated(el, binding, vnode, oldVnode) {
    const { arg } = binding;
    if (arg === "el-table") {
      el = el.querySelector(".el-table__body-wrapper");
      !el && console.warn("未发现className为el-table__body-wrapper的dom");
    } else if (arg === "el-dropdown") {
      el = el.querySelector(".el-dropdown-menu");
      !el && console.warn("未发现className为el-dropdown-menu的dom");
    }else if (arg === "xterm") {
      el = el.querySelector(".xterm-viewport");
      !el && console.warn("未发现className为xterm-viewport的dom");
    }
    setTimeout(() => {
      el.classList.add("ps");
      el.classList.add("ps--active-y");
      el._ps_.update();
    }, 1500)

    try {
      vnode.context.$nextTick(() => {
        el_scrollBar(el);
      });
    } catch (error) {
      console.error(error);
      el_scrollBar(el);
    }
  },
});

const exceptClassName = ["config-dropdown", "nz-pop", "el-picker", "chart-box-dropdown", 'metric-dropdown', 'el-cascader__dropdown', "asset-dropdown", "no-style-class", 'el-message-box']; //clickoutside排除的class(白名单)  no-style-class：没有任何样式的class
const clickoutside = {
  // 初始化指令
  bind(el, binding, vnode) {
    function documentHandler(e) {
      if (el.contains(e.target)) {
        return false;
      } else {
        //console.info(e)
        let flag = true;
        top: for (let i = 0; i < e.path.length; i++) {
          for (let j = 0; j < exceptClassName.length; j++) {
            if (e.path[i].className && e.path[i].className.indexOf(exceptClassName[j]) != -1) {
              flag = false;
              break top;
            }
          }
        }
        if (!flag) {
          return false;
        }
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
    document.addEventListener('mousedown', documentHandler);
  },
  unbind(el, binding) {
    // 解除事件监听
    document.removeEventListener('mousedown', el.__vueClickOutside__);
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

export default vm;
/*router.beforeEach((to, from, next) => {
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
})*/

/* 重写组件内容 */
const elUi = require("element-ui");
//去掉el-table表头右侧的滚动条预留空间
elUi.Table.components.TableHeader.computed.hasGutter = () => {return false;};
