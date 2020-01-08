import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    assetData:{
      selectedData:'',
      step: 0
    },
    assetDcList: 0,
    currentProject: {
      id: '',
      name: '',
      remark: ''
    },
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
    setEventfixed(state, data) { //设置坐标
      state.eventfixed = data;
    },
    setPosition(state, data) { //设置坐标
      state.position = data;
    },
  },
  actions: {
  }
});

export default store;
