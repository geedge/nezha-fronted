const terminalFile = {
  state: {
    fileList: [],
    uploadItem: {}
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
    }
  },
  getters: {
    getFileList (state) {
      return state.fileList
    },
    getUploadItem (state) {
      return state.uploadItem
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
    }
  }
}
export default terminalFile
