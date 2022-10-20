const panel = {
  state: {
    showRightBox: false,
    panelLock: true,
    chart: '',
    delChart: false,
    groupId: '',
    type: '',
    timeRange: [],
    nowTimeType: {},
    headerH: 0.5,
    headerHPadding: 0.5,
    rowHeight: 150,
    chartListId: '',
    chartLastPosition: {
      x: 0,
      y: 0
    },
    topologyShow: false,
    topologyChartInfo: {},
    // 查看模式
    mode: '',
    addCabinetBoxParams: { dcid: '', cabinetBoxShow: false },
    // timeSeries类型图表联动
    isConnect: 'none',
    // 当前鼠标所在的图表id
    currentMousemove: 0,
    variablesArr: [],
    timeBoxClass: '',
    homeLoading: false
  },
  mutations: {
    setShowRightBox (state, flag) {
      state.showRightBox = flag
    },
    setPanelLock (state, flag) {
      state.panelLock = flag
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
    setChartLastPosition (state, position) {
      state.chartLastPosition = position
    },
    setHeaderH (state, h) {
      state.headerH = h.headerH
      state.headerHPadding = h.headerHPadding
      state.rowHeight = h.rowHeight
    },
    setCabinet (state, params) {
      state.addCabinetBoxParams = params
    },
    cleanPanel (state) {
      state.showRightBox = false
      state.chart = ''
      state.delChart = false
      state.groupId = ''
      state.type = ''
    },
    setChartListId (state, id) {
      state.chartListId = id
    },
    setTopologyShow (state, topologyShow) {
      state.topologyShow = topologyShow
    },
    setTopologyChartInfo (state, topologyChartInfo) {
      state.topologyChartInfo = topologyChartInfo
    },
    // 设置查看模式
    setMode (state, mode) {
      state.mode = mode
    },
    // 设置timeSeries类型图表联动
    setConnect (state, value) {
      state.isConnect = value
    },
    // 设置当前鼠标所在的图表id (timeSeries类型图表联动)
    setCurrentMousemove (state, value) {
      state.currentMousemove = value
    },
    setVariablesArr (state, value) {
      state.variablesArr = value
    },
    setTimeBoxClass (state, value) {
      state.timeBoxClass = value
    },
    setHomeLoading (state, value) {
      state.homeLoading = value
    }
  },
  getters: {
    getShowRightBox (state) {
      return state.showRightBox
    },
    getPanelLock (state) {
      return state.panelLock
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
    },
    getHeaderH (state) {
      return state.headerH
    },
    getHeaderHPadding (state) {
      return state.headerHPadding
    },
    getRowHeight (state) {
      return state.rowHeight
    },
    getChartLastPosition (state, position) {
      return state.chartLastPosition
    },
    getChartListId (state, id) {
      return state.chartListId
    },
    getTopologyShow (state) {
      return state.topologyShow
    },
    getTopologyChartInfo (state) {
      return state.topologyChartInfo
    },
    getAddCabinetBoxParams (state) {
      return state.addCabinetBoxParams
    },
    getVariablesArr (state) {
      return state.variablesArr
    },
    getTimeBoxClass (state, value) {
      return state.timeBoxClass
    },
    getHomeLoading (state, value) {
      return state.homeLoading
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
    dispatchHeaderH (store, playload) {
      store.commit('setHeaderH', playload.headerH)
    },
    dispatchPanelLock (store, playload) {
      store.commit('setPanelLock', playload.flag)
    },
    addCabinet (store, playload) {
      store.commit('setCabinet', playload)
    },
    clearPanel (store) {
      store.commit('cleanPanel')
    },
    showTopology (store, chartInfo) {
      store.commit('setTopologyChartInfo', chartInfo)
      store.commit('setTopologyShow', true)
    },
    dispatchVariablesArr (store, variablesArr) {
      store.commit('setVariablesArr', variablesArr)
    },
    dispatchTimeBoxClass (store, timeBoxClass) {
      store.commit('setTimeBoxClass', timeBoxClass)
    },
    dispatchHomeLoading (store, homeLoading) {
      store.commit('setHomeLoading', homeLoading)
    },
  }
}
export default panel
