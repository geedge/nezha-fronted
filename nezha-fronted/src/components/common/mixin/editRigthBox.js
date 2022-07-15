import i18n from '@/components/common/i18n'
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
    // 开启计时器 对message赋值
    coutTime (msg, showNext, nextText, second) {
      if (!this.closeMessage) {
        return false
      }
      this.closeMessage.message =
      `<div class="custom-message">
        <div class="message-left">${msg}</div>
        <div class="message-right ${showNext ? '' : 'hidden'}">
          <span>，${i18n.t('tip.clickNext')}${i18n.t(nextText)}</span>
          <span id="assetAdd${this.uuid}" class="message-next">${i18n.t('tip.next')}
            <span>(${second}s)</span>
          </span>
        </div>
      </div>`
      this.$nextTick(() => {
        const assetAdd = document.getElementById(`assetAdd${this.uuid}`)
        assetAdd.addEventListener('click', this.saveNext)
      })
      setTimeout(() => {
        --second
        if (second === 0) {
          this.closeMessage.close()
        } else {
          this.coutTime(msg, showNext, nextText, second)
        }
      }, 1000)
    },
    messageShow (msg, route, params, showNext = false, nextText = '', emit) {
      this.messageParams.route = route
      this.messageParams.params = params
      this.messageParams.emit = emit
      this.closeMessage = this.$message({
        duration: showNext ? 30000 : 3000,
        dangerouslyUseHTMLString: true,
        type: 'success',
        message: '',
        onClose: () => {
          const assetAdd = document.getElementById(`assetAdd${this.uuid}`)
          assetAdd.removeEventListener('click', this.saveNext)
          this.closeMessage = null
        }
      })
      // 对message赋值
      this.coutTime(msg, showNext, nextText, 30)
    },
    saveNext () {
      this.closeMessage.close()
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
