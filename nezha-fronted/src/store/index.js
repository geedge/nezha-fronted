import Vue from 'vue'
import Vuex from 'vuex'
import user from "./user"

Vue.use(Vuex);
const store = new Vuex.Store({
  modules: {
    user
  },
  state: {
    /* 监听对象变化，用于顶部菜单与底部内容的同步 */
    currentProject: {id: "", name: "", remark: ""},
    currentDc:null,
    projectListChange: 0,
    reloadFacade:true,//重新加载project
    showPanel:{
      id: 0,
      name: '',
      type: "dashboard"
    },
    consoleShow: false,//是否显示console窗口
    consoleCount: 0,//当前console窗口数
    isAddConsole: false,//是否增加窗口
    consoleParam: {},//新开console窗口参数
    linkData: [],//导航数据
    projectFilter:{
      panelId: 0,
      start_time: '',
      end_time: '',
      searchName: ''
    },
    idcArr:[],
    overViewProject:{},
    dcDataRefresh:false,
  },
  getters: {
    getLinkData(state){
      return state.linkData
    },
    getProjectFilter(state){
      return state.projectFilter
    },
    getReloadFacade(state){
      return state.reloadFacade
    },
    getIdcArr(state){
      return state.idcArr
    },
    getOverViewProject(state){
      return state.overViewProject
    },
    getDcDataRefresh(state){
      return state.dcDataRefresh
    },
  },
  mutations: {
    /* 监听对象变化，用于顶部菜单与底部内容的同步 */
    projectListChange(state) {
      state.projectListChange++;
    },
    currentProjectChange(state, project) {
      state.currentProject = project;
    },

    panelShowPanelChange(state, panel) { //用来panel页控制初始panel的
      state.showPanel.id = panel.id;
      state.showPanel.name = panel.name;
    },

    openConsole(state) {//打开console，如果当前窗口数为0，则默认新建一个console
      state.consoleShow = true;
      if(state.consoleCount === 0){
        state.consoleCount++;
        state.isAddConsole = true;
      }else {
        state.isAddConsole = false;
      }
    },
    addConsole(state,data) {//打开console，并新建一个console
      state.consoleShow = true;
      state.consoleCount++;
      state.isAddConsole = true;
      state.consoleParam = data;
    },
    addConsoleNum(state) {
      state.consoleCount++;
    },
    removeConsole(state) {//移除一个console，如果是最后一个，则关闭窗口，否则不关闭窗口
      state.consoleCount--;
      if(state.consoleCount === 0){
        state.consoleShow = false;
      }
    },
    closeConsole(state) {//关闭console窗口
      state.consoleShow = false;
      state.consoleCount = 0;
      state.consoleParam ={};
    },
    minConsole(state) {//最小化窗口
      state.consoleShow = false;
    },
    setLinkData(state, data) {
      state.linkData = data;
    },
    setProjectFilter(state, data) {
      state.projectFilter = data;
    },
    setReloadFacade(state){
      state.reloadFacade=false;
      setTimeout(()=>{
        state.reloadFacade=true;
      })
    },
    setIdcArr(state,data){
      state.idcArr = data
    },
    setCurrentDc(state,data){
      state.currentDc = data
    },
    setOverViewProject(state,data){
      state.overViewProject=data;
    },
    setDcDataRefresh(state){
      state.dcDataRefresh=true;
      setTimeout(()=>{
        state.dcDataRefresh=false;
      },100)
    },
  },
  actions: {
  }
});

export default store;
