const topology = {
  state: {
    imgList: localStorage.getItem('nz-topology-imgList') || {}
  },
  mutations: {
    setImgList (state, imgList) {
      state.imgList = imgList
    },
    setImgListItem (state, item) {
      state.imgList[item.key] = item.img
    }
  },
  getters: {
    getImgList (state) {
      return state.imgList
    }
  },
  actions: {
    dispatchAddImgList (store, obj) {
      store.commit('setImgListItem', obj)
    }
  }
}
export default topology
