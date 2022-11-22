const terminalFile = {
  state: {
    fileList: [],
    uploadItem: {},
    updateUuid: '', // 根据uuid的变化 判断页面是否需要刷新
    updateIndex: 1
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
    setUpdateUuid (state, uuid) {
      state.updateUuid = uuid
      state.updateIndex++
      if (state.updateIndex == 10) {
        state.updateIndex = 1
      }
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
    }
  }
}
export default terminalFile
