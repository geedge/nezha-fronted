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
import "./permission";
import {hasPermission, hasButton} from "./permission";

import plTable from 'pl-table'
import 'pl-table/themes/index.css'

import {post, get, put, del} from './http.js'
import {clickoutside, bottomBoxWindow, stringTimeParseToUnix, unixTimeParseToString, chartResizeTool, tableSet} from './components/common/js/tools.js';
import * as tools from './components/common/js/tools.js';
import * as constants from './components/common/js/constants.js'


import Pagination from "./components/common/pagination"; //引入全局分页组件
import searchInput from "./components/common/searchInput"; //搜索框组件
import elementSet from "./components/common/elementSet"; //自定义表头组件

import projectBox from './components/common/rightBox/projectBox'; //project弹框组件
import moduleBox from './components/common/rightBox/moduleBox'; //module弹框组件
import editEndpointBox from './components/common/rightBox/editEndpointBox'; //endpoint弹框组件
import addEndpointBox from './components/common/rightBox/addEndpointBox'; //endpoint弹框组件
import assetBox from "./components/common/rightBox/assetBox"; //资产添加组件
import batchEditAsset from "./components/common/rightBox/batchEditAsset"; //资产批量修改组件
import alertConfigBox from "./components/common/rightBox/alertConfigBox"; //告警规则弹框组件
import panelBox from "./components/common/rightBox/panelBox"; //面板弹框组件
import moduleListPop from "./components/page/asset/moduleListPop"; //面板弹框组件
import cabinetConfigBox from "./components/common/popBox/cabinetConfig"; //面板弹框组件
import modelBox from "./components/common/rightBox/modelBox"; //model弹框
import bottomBox from "./components/common/bottomBox/bottomBox"; //上滑框
import loading from "./components/common/loading";
import mibBox from "./components/common/rightBox/mibBox";
import leftMenu from "./components/common/leftMenu";
import pickTime from "./components/common/pickTime";
import bus from "./libs/bus";

Vue.component("Pagination", Pagination);
Vue.component("searchInput", searchInput);
Vue.component("element-set", elementSet);
Vue.component("project-box", projectBox);
Vue.component("module-box", moduleBox);
Vue.component("edit-endpoint-box", editEndpointBox);
Vue.component("add-endpoint-box", addEndpointBox);
Vue.component("asset-box", assetBox);
Vue.component("batch-edit-asset", batchEditAsset);
Vue.component("alert-config-box", alertConfigBox);
Vue.component("panel-box", panelBox);
Vue.component("module-list-pop", moduleListPop);
Vue.component("cabinet-config-box", cabinetConfigBox);
Vue.component("model-box", modelBox);
Vue.component('loading',loading);
Vue.component('bottom-box', bottomBox);
Vue.component('mib-box',mibBox);
Vue.component('left-menu',leftMenu);
Vue.component('pick-time',pickTime);

Vue.prototype.$axios = axios;
Vue.prototype.$post = post;
Vue.prototype.$get = get;
Vue.prototype.$put = put;
Vue.prototype.$delete = del;
Vue.prototype.$CONSTANTS = constants;
Vue.prototype.$TOOLS = tools;
Vue.prototype.$bottomBoxWindow = bottomBoxWindow; //底部上滑框控制
Vue.prototype.$stringTimeParseToUnix = stringTimeParseToUnix;
Vue.prototype.$unixTimeParseToString = unixTimeParseToString;
Vue.prototype.$chartResizeTool = chartResizeTool;
Vue.prototype.$tableSet = tableSet;
Vue.prototype.$tableHeight = { //列表页表格的高度
  normal: 'calc(100% - 100px)',  //常规高度，特例在下方定义
  openSubList: { //打开二级列表后的高度
    mainList: 'calc(100% - 60px)',
    subList: 'calc(100% - 86px)',
    toTopBtnTop: 'calc(50% - 11px)'
  },
  toTopBtnTop: 'calc(100% - 73px)',
  noPagination: 'calc(100% - 60px)', //特例：没有翻页组件
};

Vue.mixin({
  data:function(){
    return {
      prevent_opt:{
        save:false,
        import:false,
        dumplicate:false,
        delete:false,
        refresh:false,
        query:false,
      }
    }
  },
  methods: {
    utcTimeToTimezone:function(time){
      if(time){
        return bus.UTCTimeToConfigTimezone(time)
      }
    },
    utcTimeToTimezoneStr:function(time,format='yyyy-MM-dd hh:mm:ss'){
      if(time){
        return bus.timeFormate(bus.UTCTimeToConfigTimezone(time),format)
      }else{
        return '-'
      }
    },
    timezoneToUtcTime:function(time){
      if(time){
        return bus.configTimezoneToUTCTime(time)
      }
    },
    timezoneToUtcTimeStr:function(time,format='yyyy-MM-dd hh:mm:ss'){
      if(time){
        return bus.timeFormate(this.timezoneToUtcTime(time),format)
      }
    },
    tableTitleReset:function(src,dist){
      dist.forEach(item=>{
        let title=src.find(t=>t.prop == item.prop)
        if(title&&title.label){
          item.label=title.label;
        }
      })
    },
    hasButton(code) {
      return hasButton(this.$store.getters.buttonList, code);
    },
    toTop(wrap) {
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
    },
    toTopBtnHandler(wrap) {
      let vm = this;
      wrap.addEventListener('scroll', bus.debounce(function() {
        vm.tools.showTopBtn = wrap.scrollTop > 50;
        vm.tools.tableHover = wrap.scrollTop > 50;
      }, 100));
    }
  },
  computed: {
    getMenuList() {
      return this.$store.state.user.menuList;
    },
    getButtonList() {
      return this.$store.state.buttonList;
    }
  }
});


Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.use(Vuex);
Vue.use(VueResource);
Vue.use(plTable);
Vue.use(hasPermission);

/*指令*/
Vue.directive('clickoutside', clickoutside);
window.resizing = false;
window.vm = new Vue({
  el: '#app',
  router,
  i18n,
  store,
  components: {App},
  template: '<App/>',
  mounted() {
    //store.commit()
  }
});

export default vm;

/* 重写组件内容 */
/*const elUi = require("element-ui");
const pl = require("pl-table");
//去掉el-table表头右侧的滚动条预留空间
elUi.Table.components.TableHeader.computed.hasGutter = () => {return false;};
pl.PlTable.components.ElTable.components.TableHeader.computed.hasGutter = () => {return false;};*/
