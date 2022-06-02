export default {
  data () {
    return {
      isEdit: false,
      messageParams: {
        route: '',
        params: {}
      }
    }
  },
  mounted () {
    if (this.isEdit) {
      window.onbeforeunload = () => {
        return '确认离开当前页面吗？未保存的数据将会丢失'
      }
    }
  },
  methods: {
    messageShow (msg, route, params, showNext = false) {
      this.messageParams.route = route
      this.messageParams.params = params
      this.$message({
        duration: 2000,
        dangerouslyUseHTMLString: true,
        type: 'success',
        message: `<div>${msg} <span id="assetAdd" class="message-next ${showNext ? '' : 'hidden'}">Next</span></div>`,
        onClose: () => {
          const assetAdd = document.getElementById('assetAdd')
          assetAdd.removeEventListener('click', this.saveNext)
        }
      })
      const assetAdd = document.getElementById('assetAdd')
      assetAdd.addEventListener('click', this.saveNext)
    },
    saveNext () {
      this.$router.push({
        path: this.messageParams.route,
        query: this.messageParams.params
      })
    }
  },
  destroyed () {
    window.onbeforeunload = null
  }
}
