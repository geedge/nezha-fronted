const meta2dStore = {
  state: {
    queryValues: []
  },
  mutations: {
    setQueryValues (state, arr) {
      state.queryValues = arr
    },
    delQueryValues (state, obj) {
      delete state.queryValues[obj.key]
    }
  },
  getters: {
    getQueryValues (state) {
      return state.queryValues
    }
  },
  actions: {
    dispatchSetQueryValues (store, arr) {
      store.commit('setQueryValues', arr)
    },
    dispatchDelQueryValues (store, arr) {
      store.commit('delQueryValues', arr)
    }
  }
}
export default meta2dStore
