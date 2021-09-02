export default {
  data () {
    return {
      chartDataList: false,
      timer: null
    }
  },
  methods: {
    // 鼠标移入加入class
    changeActive () {
      // 设置定时器
      this.timer = window.setTimeout(() => {
        this.chartDataList = true
      }, 500)
    },
    removeActive () {
      // 移除定时器
      window.clearInterval(this.timer)
      this.chartDataList = false
    }
  },
  beforeDestroy () {
    // 移除定时器
    window.clearInterval(this.timer)
  }
}
