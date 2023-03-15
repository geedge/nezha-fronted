import Vue from 'vue'
import Vuex from 'vuex'
import user from './user'
import panel from './panel'
import terminalFile from './terminalFile'
import meta2dStore from '@/components/common/project/meta2d/js/meta2dStore'
// import topology from './topology'

Vue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    user,
    panel,
    terminalFile,
    meta2dStore
  },
  state: {
    /* 监听对象变化，用于顶部菜单与底部内容的同步 */
    currentProject: { id: '', name: '', remark: '' },
    currentDc: null,
    projectListChange: 0,
    reloadFacade: true, // 重新加载project
    showPanel: {
      id: 0,
      name: '',
      type: 'dashboard'
    },
    consoleShow: false, // 是否显示console窗口
    consoleCount: 0, // 当前console窗口数
    isAddConsole: false, // 是否增加窗口
    consoleParam: {}, // 新开console窗口参数
    linkData: [], // 导航数据
    projectFilter: {
      dashboardId: 0,
      start_time: '',
      end_time: '',
      searchName: ''
    },
    idcArr: [],
    overViewProject: {},
    dcDataRefresh: false,
    showTopoScreen: false,
    logo: '',
    isShrink: localStorage.getItem('nz-left-menu-shrink') == 'true',
    metricsList: [],
    langList: [],
    i18nReady: false,
    timeFormatMain: localStorage.getItem('nz-default-dateFormat') || 'YYYY-MM-DD HH:mm:ss',
    globalShow: false,
    globalSearchId: '',
    isRouteLive: true,
    nowPath: '',
    myEvent: new Event('resize'),
    deleteTableRel: {},
    showDeleteTableRel: false,
    diagnosisTab: {}, // 故障诊断
    showDiagnosisTab: false
  },
  getters: {
    getGlobalSearchId (state) {
      return state.globalSearchId
    },
    getTimeFormatMain (state) {
      return state.timeFormatMain
    },
    getGlobalShow (state) {
      return state.globalShow
    },
    getLinkData (state) {
      return state.linkData
    },
    getProjectFilter (state) {
      return state.projectFilter
    },
    getReloadFacade (state) {
      return state.reloadFacade
    },
    getIdcArr (state) {
      return state.idcArr
    },
    getOverViewProject (state) {
      return state.overViewProject
    },
    getDcDataRefresh (state) {
      return state.dcDataRefresh
    },
    getCurrentProject (state) {
      return state.currentProject
    },
    getShowTopoScreen (state) {
      return state.showTopoScreen
    },
    getLogo (state) {
      return state.logo
    },
    getIsShrink (state) {
      return state.isShrink
    },
    getMetricsList (state) {
      return state.metricsList
    },
    getLangList (state) {
      return state.langList
    },
    getIsRouteLive (state) {
      return state.isRouteLive
    },
    getNowPath (state) {
      return state.nowPath
    },
    i18nIsReady (state) {
      return state.i18nReady
    },
    getDeleteTableRel (state) {
      return state.deleteTableRel
    },
    getShowDeleteTableRel (state) {
      return state.showDeleteTableRel
    },
    getDiagnosisTab (state) {
      return state.diagnosisTab
    },
    getShowDiagnosisTab (state) {
      return state.showDiagnosisTab
    }
  },
  mutations: {
    /* 监听对象变化，用于顶部菜单与底部内容的同步 */
    projectListChange (state) {
      state.projectListChange++
    },
    currentProjectChange (state, project) {
      state.currentProject = project
    },
    setGlobalSearchId (state, id) {
      state.globalSearchId = id
    },
    panelShowPanelChange (state, panel) { // 用来panel页控制初始panel的
      state.showPanel.id = panel.id
      state.showPanel.name = panel.name
    },

    openConsole (state) { // 打开console，如果当前窗口数为0，则默认新建一个console
      state.consoleShow = true
    },
    addConsole (state, data) { // 打开console，并新建一个console
      state.consoleShow = true
      state.isAddConsole = true
      state.consoleParam = data
      setTimeout(() => {
        state.isAddConsole = false
      }, 100)
    },
    addConsoleNum (state) {
      state.consoleCount++
    },
    removeConsole (state) { // 移除一个console，如果是最后一个，则关闭窗口，否则不关闭窗口
      state.consoleCount--
      if (state.consoleCount === 0) {
        state.consoleShow = false
      }
    },
    closeConsole (state) { // 关闭console窗口
      state.consoleShow = false
      state.consoleCount = 0
      state.consoleParam = {}
    },
    minConsole (state) { // 最小化窗口
      state.consoleShow = false
    },
    setLinkData (state, data) {
      state.linkData = data
    },
    setProjectFilter (state, data) {
      state.projectFilter = data
    },
    setReloadFacade (state) {
      state.reloadFacade = false
      setTimeout(() => {
        state.reloadFacade = true
      })
    },
    setIdcArr (state, data) {
      state.idcArr = data
    },
    setCurrentDc (state, data) {
      state.currentDc = data
    },
    setOverViewProject (state, data) {
      state.overViewProject = data
    },
    setDcDataRefresh (state) {
      state.dcDataRefresh = true
      setTimeout(() => {
        state.dcDataRefresh = false
      }, 100)
    },
    setShowTopoScreen (state, boolean) {
      state.showTopoScreen = boolean
    },
    setLogo (state, logo) {
      state.logo = logo
    },
    isShrink (state) {
      state.isShrink = !state.isShrink
      localStorage.setItem('nz-left-menu-shrink', state.isShrink)
      window.dispatchEvent(state.myEvent)
    },
    setMetricsList (state, metricsList) {
      state.metricsList = [...metricsList]
    },
    setLangList (state, langList) {
      state.langList = langList
    },
    setTimeFormatMain (state, timeFormat) {
      state.timeFormatMain = timeFormat
    },
    setGlobalShow (state, globalShow) {
      state.globalShow = globalShow
    },
    setIsRouteLive (state) {
      state.isRouteLive = false
      setTimeout(() => {
        state.isRouteLive = true
      })
    },
    setNowPath (state, path) {
      state.nowPath = path
    },
    i18nReady (state, ready) {
      state.i18nReady = ready
    },
    setDeleteTableRel (state, payload) {
      state.deleteTableRel = payload
    },
    setShowDeleteTableRel (state, flag) {
      state.showDeleteTableRel = flag
      if (!flag) {
        state.deleteTableRel = {}
      }
    },
    setDiagnosisTab (state, payload) {
      state.diagnosisTab = payload
    },
    setShowDiagnosisTab (state, flag) {
      state.showDiagnosisTab = flag
    }
  },
  actions: {
    deleteTableRel (store, payload) { // 删除列表行
      store.commit('setDeleteTableRel', payload)
      store.commit('setShowDeleteTableRel', true)
    },
    dispatchShowDeleteTableRel (store, flag) {
      store.commit('setShowDeleteTableRel', flag)
    },
    diagnosisTab (store, payload) { // 故障诊断
      store.commit('setDiagnosisTab', payload)
      store.commit('setShowDiagnosisTab', true)
    },
    dispatchShowDiagnosisTab (store, flag) {
      store.commit('setShowDiagnosisTab', flag)
    }
  }
})

export default store
