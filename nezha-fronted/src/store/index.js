import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    assetData:{
      selectedData:'',
      step: 0
    },
    assetDcList: 0, //监听此值，改变则刷新dc列表
    assetForAlertList: '', //asset页跳转alertList时传递的assetId
    currentProject: {
      id: '',
      name: '',
      remark: ''
    },
    assetItemId:''  ,   //复选框ID
    assetAllId:[]  ,   //复选框allID
    projectListChange: 0,
    moduleListChange: 0,
    flushDataSign: false,
    panelListReload:false,
    eventfixed: {
      shezhi: 0,
      screen: 0
    },
    tablelable: [], //获取头部信息
    position: {
      event_positiony: 0,
      event_positionx: -200
    },
  },
  getters: {
  },
  mutations: {
    setProject(state, project) {
      state.currentProject = Object.assign({}, project);
    },
    projectRightBoxShow(state, show) {
      state.projectBoxShow = show;
    },
    projectListChange(state) {
      state.projectListChange = state.projectListChange + 1;
    },
    moduleListChange(state) {
      state.moduleListChange = state.moduleListChange + 1;
    },
    panelListChange(state,status){
      state.panelListReload = status;
    },
    assetDcListChange(state) {
      state.assetDcList++;
    },
    setHeaderTable(state, data) { //设置table头部
      state.tablelable = data;
    },
    assetItemIdChange(state,data){ //修改复选框
      state.assetItemId = data
    },
    assetAllIdChange(state,data){ //修改复选框
			state.assetAllId = data
    },
    setEventfixed(state, data) { //设置坐标
      state.eventfixed = data;
    },
    setPosition(state, data) { //设置坐标
      state.position = data;
    },
    assetForAlertListChange(state, data) { //asset跳转alertmsg时
      state.assetForAlertList = data;
    }
  },
  actions: {
  }
});

export default store;
