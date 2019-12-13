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
    projectListReload: false,
    createProject: false,
    createModule: false,
    createEndpoint: false,
    createAlertConfig: false,
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
    },
    toCreateProject(state, status) {
      state.createProject = status;
    },
    toCreateModule(state, status) {
      state.createModule = status;
    },
    toCreateEndpoint(state, status) {
      state.createEndpoint = status;
    },
    toCreateAlertConfig(state, status) {
      state.createAlertConfig = status;
    },
  },
  actions: {
  }
});

export default store;
