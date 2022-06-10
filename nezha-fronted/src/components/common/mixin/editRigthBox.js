export default {
  data () {
    return {
      isEdit: false,
      messageParams: {
        route: '',
        params: {}
      },
      closeMessage: ''
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
    messageShow (msg, route, params, showNext = false, nextText = 'setup.next') {
      this.messageParams.route = route
      this.messageParams.params = params
      this.closeMessage = this.$message({
        duration: 2000,
        dangerouslyUseHTMLString: true,
        type: 'success',
        message: `<div>${msg} <span class="message-next ${showNext ? '' : 'hidden'}"><span class="message-next-continue">${this.$t('overall.continue')}</span> <span id="assetAdd" class="message-next-content">${this.$t(nextText)}</span></span></div>`,
        onClose: () => {
          const assetAdd = document.getElementById('assetAdd')
          assetAdd.removeEventListener('click', this.saveNext)
          this.closeMessage = ''
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
      this.closeMessage.close()
    }
  },
  destroyed () {
    window.onbeforeunload = null
  }
}
