const panel = {
  state: {
    showRightBox: false,
    chart: '',
    delChart: false
  },
  mutations: {
    setShowRightBox (state, flag) {
      state.showRightBox = flag
    },
    setChart (state, chart) {
      state.chart = chart
    },
    setDelChart (state, flag) {
      state.chart = flag
    },
    clean (state) {
      state.showRightBox = false
      state.chart = ''
      state.delChart = false
    }
  },
  getters: {
    getShowRightBox (state) {
      return state.showRightBox
    },
    getChart (state) {
      return state.chart
    },
    getDelChart (state) {
      return state.delChart
    }
  },
  actions: {
    dispatchShowRightBox (flag) {
      this.store.commit('setShowRightBox', flag)
    },
    dispatchChart (chart) {
      this.store.commit('setShowRightBox', chart)
    },
    dispatchDelChart (flag) {
      this.store.commit('setChart', flag)
    },
    dispatchEditChart (chart) {
      this.store.commit('setShowRightBox', true)
      this.store.commit('setChart', chart)
    }
  }
}
export default panel
