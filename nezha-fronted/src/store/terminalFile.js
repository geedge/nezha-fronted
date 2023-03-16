import { post, get } from '@/http'
const terminalFile = {
  state: {
    fileList: [],
    uploadItem: {},
    updateUuid: '', // 根据uuid的变化 判断页面是否需要刷新
    updateIndex: 1,
    externalTerminal: false,
    messageFunction: false,
    externalTerminalWindow: ''
  },
  mutations: {
    setFileList (state, arr) {
      state.fileList = arr
    },
    addFileList (state, item) {
      state.fileList.push(item)
    },
    delFileList (state, item) {
      state.fileList = state.fileList.filter(file => file.myId !== item.myId)
    },
    setUploadItem (state, item) {
      state.uploadItem = item
    },
    setExternalTerminal (state, item) { // 第一次 关闭或者打开 termail
      state.externalTerminal = !state.externalTerminal
      let self = this
      if (!state.messageFunction) {
        state.messageFunction = true
        window.addEventListener('message', function (e) {
          try {
            const data = JSON.parse(e.data) // e.data  里面有自己所传的所有参数  可以根据参数做自己的判断
            if (data.close) {
              state.externalTerminal = false
            }
            if (data.isLogout) {
              get('logout').then(() => {
                self.commit('logoutSuccess')
                document.location.href = '/'
              })
            }
          } catch (error) {}
        })
        window.addEventListener('unload', () => {
          state.externalTerminal = false
          state.externalTerminalWindow.close()
        })
      }
      if (state.externalTerminal) {
        state.externalTerminalWindow = window.open('/ui/terminal', 'terminal')
      } else {
        state.externalTerminalWindow = ''
      }
      if (item && state.externalTerminal) {
        state.externalTerminalWindow.addEventListener('load', () => {
          setTimeout(() => {
            state.externalTerminalWindow.postMessage(
              JSON.stringify(item)
            )
          }, 3000)
        })
      }
    },
    openExternalTerminalWindow (state, item) { // 后续打开 termail
      if (state.externalTerminalWindow) {
        window.open('', 'terminal')
      } else {
        state.externalTerminalWindow = window.open('/ui/terminal', 'terminal')
      }
      if (item) {
        state.externalTerminalWindow.postMessage(
          JSON.stringify(item)
        )
      }
    },
    setUpdateUuid (state, uuid) {
      state.updateUuid = uuid
      state.updateIndex++
      if (state.updateIndex == 10) {
        state.updateIndex = 1
      }
    },
    closeTerminal (state) {
      if (state.externalTerminalWindow) {
        state.externalTerminalWindow.close()
      }
      state.externalTerminal = false
      state.messageFunction = false
      state.fileList = []
      state.uploadItem = {}
      state.updateUuid = '' // 根据uuid的变化 判断页面是否需要刷新
      state.updateIndex = 1
    }
  },
  getters: {
    getFileList (state) {
      return state.fileList
    },
    getUploadItem (state) {
      return state.uploadItem
    },
    getUpdateUuid (state) {
      return state.updateUuid
    },
    getUpdateIndex (state) {
      return state.updateIndex
    },
    getExternalTerminal (state) {
      return state.externalTerminal
    }
  },
  actions: {
    dispatchFileList (store, arr) {
      store.commit('setFileList', arr)
    },
    dispatchAddFileList (store, item) {
      store.commit('addFileList', item)
    },
    dispatchDelFileList (store, item) {
      store.commit('delFileList', item)
    },
    uploadFile (store, item) {
      store.commit('setUploadItem', item)
    },
    upDateConsole (store, uuid) {
      store.commit('setUpdateUuid', uuid)
    },
    // 打开外部termail
    dispatchExternalTerminal (store, item) { // 第一次打开termail
      store.commit('setExternalTerminal', item)
    },
    dispatchOpenExternalTerminalWindow (store, item) { // 后续操作termail
      store.commit('openExternalTerminalWindow', item)
    }
  }
}
export default terminalFile
