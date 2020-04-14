import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    assetData:{
      selectedData: [],
      step: 0,
      type: -1  //0: asset  1: header
    },
    assetDcList: 0, //监听此值，改变则刷新dc列表
    assetForAlertList: 0, //asset页跳转alertList时传递的assetId
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
    showPanel:{
      id:0,
      name:''
    },
    consoleShow:false,//是否显示console窗口
    consoleCount:0,//当前console窗口数
    isAddConsole:false,//是否增加窗口
    consoleParam:{},//新开console窗口参数
    leftMenuStat:false, //0展开状态，1隐藏状态
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
    },
    openConsole(state){//打开console，如果当前窗口数为0，则默认新建一个console
      state.consoleShow=true;
      if(state.consoleCount===0){
        state.consoleCount++;
        state.isAddConsole = true;
      }else {
        state.isAddConsole = false;
      }
    },
    addConsole(state,data){//打开console，并新建一个console
      state.consoleShow=true;
      state.consoleCount++;
      state.isAddConsole = true;
      state.consoleParam = data;
    },
    addConsoleNum(state){
      state.consoleCount++;
    },
    removeConsole(state){//移除一个console，如果是最后一个，则关闭窗口，否则不关闭窗口
      state.consoleCount--;
      if(state.consoleCount===0){
        state.consoleShow=false;
      }
    },
    closeConsole(state){//关闭console窗口
      state.consoleShow=false;
      state.consoleCount = 0;
      state.consoleParam ={};
    },
    minConsole(state){//最小化窗口
      state.consoleShow=false;
    },
    setLeftMenuStat:function(state,data){
      state.leftMenuStat=data
    }
  },
  actions: {
  }
});

export default store;
