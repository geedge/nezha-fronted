const timePicker = {
  state: {
    timePickerLocked: localStorage.getItem('nz-time-picker-locked') ? JSON.parse(localStorage.getItem('nz-time-picker-locked')) : false,
    timePickerRange: localStorage.getItem('nz-time-picker-range') ? JSON.parse(localStorage.getItem('nz-time-picker-range')) : {}
  },
  mutations: {
    setTimePickerLocked (state, flag) {
      state.timePickerLocked = flag
    },
    setTimePickerRange (state, range) {
      state.timePickerRange = range
      localStorage.setItem('nz-time-picker-range', JSON.stringify(range))
    }
  },
  getters: {
    getTimePickerLocked (state) {
      return state.timePickerLocked
    },
    getTimePickerRange (state) {
      return state.timePickerRange
    }
  },
  actions: {
    dispatchTimePickerLocked (store, flag) {
      store.commit('setTimePickerLocked', flag)
    },
    dispatchTimePickerRange (store, range) {
      console.log('dispatchTimePickerRange', range)
      store.commit('setTimePickerRange', range)
    }
  }
}
export default timePicker
