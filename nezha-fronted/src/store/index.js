import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    assetData:{
      selectedData:'',
      moduleData:'',
    },
    projectData: {
      id: '',
      name: ''
    },
    projectBoxShow: false,
    projectListReload: false
  },
  getters: {
  },
  mutations: {
    setProject(state, project) {
      state.projectData = Object.assign({}, project);
      state.projectBoxShow = false;
    },
    projectRightBoxShow(state, show) {
      state.projectBoxShow = show;
    },
    projectListReloadChange(state, reload) {
      state.projectListReload = reload;
    }
  },
  actions: {
  }
});

export default store;
