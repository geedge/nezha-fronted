const panel = {
  state: {
    showRightBox: false,
    chart: '',
    delChart: false,
    groupId: '',
    type: '',
    timeRange: [],
    nowTimeType: {}
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
    setPanelTime (state, time) {
      state.timeRange = time
    },
    setPanelNowTimeType (state, nowTimeType) {
      state.nowTimeType = nowTimeType
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
    getTimeRange (state) {
      return state.timeRange
    },
    getNowTimeType (state) {
      return state.nowTimeType
    },
    getDelChart (state) {
      return state.delChart
    }
  },
  actions: {
    dispatchShowRightBox (store, flag) {
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
    dispatchPanelTime (store, playload) {
      store.commit('setPanelTime', playload.time)
      store.commit('setPanelNowTimeType', playload.nowTimeType)
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
