export default {
  data () {
    return {
      isEdit: false
    }
  },
  mounted () {
    if (this.isEdit) {
      window.onbeforeunload = function () {
        return window.confirm('还没有完成,确认退出吗?')
      }
    }
  },
  beforeDestroy () {
    window.onbeforeunload = null
  }
}
