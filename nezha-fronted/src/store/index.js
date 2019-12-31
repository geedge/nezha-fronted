import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    assetData:{
      selectedData:'',
      moduleData:'',
      idcData:''
    },
    currentProject: {
      id: '',
      name: '',
      remark: ''
    },
    projectListChange: 0,
    moduleListChange: 0,
    flushDataSign: false,
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
    }
  },
  actions: {
  }
});

export default store;
