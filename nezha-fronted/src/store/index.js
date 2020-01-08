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
    panelListReload:false
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
    }
  },
  actions: {
  }
});

export default store;
