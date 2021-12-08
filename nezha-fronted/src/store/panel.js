const panel = {
  state: {
    showRightBox: false,
    chart: '',
    delChart: false,
    groupId: '',
    type: ''
  },
  mutations: {
    setShowRightBox (state, flag) {
      state.showRightBox = flag
    },
    setChart (state, chart) {
      state.chart = chart
    },
    setDelChart (state, flag) {
      state.delChart = flag
    },
    setType (state, type) {
      state.type = type
    },
    setGroupId (state, id) {
      state.groupId = id
    },
    cleanPanel (state) {
      state.showRightBox = false
      state.chart = ''
      state.delChart = false
      state.groupId = ''
      state.type = ''
    }
  },
  getters: {
    getShowRightBox (state) {
      return state.showRightBox
    },
    getChart (state) {
      return state.chart
    },
    getType (state) {
      return state.type
    },
    getGroupId (state) {
      return state.groupId
    },
    getDelChart (state) {
      return state.delChart
    }
  },
  actions: {
    dispatchShowRightBox (store,flag) {
      store.commit('setShowRightBox', flag)
    },
    dispatchChart (store, chart) {
      store.commit('setShowRightBox', chart)
    },
    dispatchDelChart (store, playload) {
      store.commit('setDelChart', true)
      store.commit('setChart', playload.chart)
      store.commit('setType', playload.type)
    },
    dispatchEditChart (store, playload) {
      store.commit('setShowRightBox', true)
      store.commit('setChart', playload.chart)
      store.commit('setType', playload.type)
    },
    clearPanel (store) {
      store.commit('cleanPanel')
    }
  }
}
export default panel
