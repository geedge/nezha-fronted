export default {
  data () {
    return {
      isEdit: false
    }
  },
  mounted () {
    if( this.isEdit ) {
      window.onbeforeunload = () => {
        return "确认离开当前页面吗？未保存的数据将会丢失"
      }
    }
  },
  destroyed () {
    window.onbeforeunload = null
  }
}
