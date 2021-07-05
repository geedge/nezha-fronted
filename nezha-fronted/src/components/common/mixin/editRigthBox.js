export default {
  data () {
    return {
      isEdit: false
    }
  },
  mounted () {
    if( this.isEdit ) {
      window.onbeforeunload = () => {
        return window.confirm("确认操作吗？")
      }
    }
  },
  destroyed () {
    window.onbeforeunload = null
  }
}
