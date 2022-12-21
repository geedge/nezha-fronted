import { getUUID } from '../js/common'
export default {
  data () {
    return {
      isEdit: false,
      messageParams: {
        route: '',
        params: {},
        emit: ''
      },
      closeMessage: null,
      uuid: getUUID()
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
    messageShow (msg, route, params, showNext = false, nextText = '', emit) {
      this.messageParams.route = route
      this.messageParams.params = params
      this.messageParams.emit = emit
      this.closeMessage = this.$message({
        duration: showNext ? 30000 : 3000,
        dangerouslyUseHTMLString: true,
        type: 'success',
        message: `<div class="custom-message">
                    <div class="message-left">${msg}</div>
                    <div class="message-right ${showNext ? '' : 'hidden'}">
                      <span>，${this.$t('tip.clickNext')}${this.$t(nextText)}</span>
                      <span id="assetAdd${this.uuid}" class="message-next">${this.$t('tip.next')}</span>
                    </div>
                  </div>`,
        onClose: () => {
          const assetAdd = document.getElementById(`assetAdd${this.uuid}`)
          assetAdd.removeEventListener('click', this.saveNext)
        }
      })
      const assetAdd = document.getElementById(`assetAdd${this.uuid}`)
      assetAdd.addEventListener('click', this.saveNext)
    },
    saveNext () {
      this.closeMessage.close()
      this.closeMessage = null
      if (!this.messageParams.route) {
        this.$store.dispatch(this.messageParams.emit, this.messageParams.params)
        return
      }
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
