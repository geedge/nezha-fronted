<template>
    <div :id="'ternimalContainer'+idIndex" class="console" v-watermark="{show: showWatermark,text: waterMarkText, text1: terminal.host || '',  textColor: 'rgba(215, 215, 215, 0.5)'}" v-clickoutside="clickHide">
      <div :id="'terminal'+idIndex" style="height: 100%;width: 100%"></div>
      <fileDirectory :host="host" v-clickoutside="closeFileDir" :uuid="terminal.uuid" v-show="fileDirectoryShow" @close="showFileDir(false)" :fileDirectoryShow="fileDirectoryShow" ref="fileDirectory"/>
      <div
        v-if="terminal.isLogin && showMenu"
        class="terminal-menu menus"
        :style="{
           left: menuPosition.left + 'px',
           top: menuPosition.top + 'px'
        }"
      >
        <div>
          <span @click="copySelection()">{{$t('overall.duplicate')}}</span>
        </div>
        <div v-if="showPaste">
          <span @click="paste()">{{$t('project.topology.paste')}}</span>
        </div>
        <div>
          <span @click="clearTerminal()">{{$t('terminal.clear')}}</span>
        </div>
        <div class="line"></div>
        <div>
          <span @click="showFileDir(true)">{{$t('terminal.sftp')}}</span>
        </div>
        <div>
          <span @click="closeTerminal(true)"> {{$t('overall.close')}}</span>
        </div>
      </div>
    </div>
</template>
<script>
import Terminal from '../common/js/Xterm'
import { AttachAddon } from 'xterm-addon-attach'
import { FitAddon } from 'xterm-addon-fit'
import { CanvasAddon } from 'xterm-addon-canvas'
import fileDirectory from './fileDirectory'
export default {
  name: 'console',
  components: {
    fileDirectory
  },
  props: {
    terminal: { },
    terminalType: { default: '1' },
    idIndex: {
      type: Number,
      default: 0
    },
    isFullScreen: {
      type: Boolean,
      default: false
    },
    terminalSetting: {
      type: Object,
      default: () => {}
    },
    fontSize: {}
  },
  data () {
    return {
      term: null,
      terminalSocket: null,
      termAttachAddon: null,
      termFitAddon: null,
      termimalRows: 15,
      termimalHeight: 270,
      topMenuHeight: 30,
      dragHeigh: 8,
      minRow: 1,
      fontSpaceHeight: 2, // 一行高度=fontSize+fontSpaceHeight
      obj: {
        id: 2
      },
      isInit: false,
      successBackContent: 'Connecting to',
      failBackContent: 'Sorry',
      connectFailContent: 'Connection failed',
      welcomeBackContent: 'Welcome',
      psdCont: 'password: ',
      conFinish: false,
      conSuccessNum: 0,
      inputSecret: false,
      userName: '',
      fileDirectoryShow: false,
      host: '',
      waterMarkText: 'Nezha',
      showWatermark: false,
      wordSeparator: "\\ :;~`!@#$%^&*()-=+|[]{}'\",.<>/?",
      showMenu: false,
      menuPosition: {
        left: 0,
        top: 0
      },
      showPaste: false
    }
  },
  // computed: {
  //   userInfo () {
  //     return this.$store.getters.getUserInfo
  //   }
  // },
  watch: {
  },
  methods: {
    prompt (term) {
      term.write('\r\n ')// term.write('\r\n~$ ');
    },
    resize (consoleHeigt, consoleWidth) {
      this.termFitAddon.fit()
      this.resizeServiceConsole()
    },
    resizeServiceConsole () {
      const consoleBox = document.getElementById('ternimalContainer' + this.idIndex)
      const width = document.body.clientWidth - 10// 可视宽度
      const height = parseInt(consoleBox.offsetHeight) - 10
      const winStyle = {
        width: width,
        height: height,
        cols: this.term.cols, // cols和rows在resizeConsole方法已经设置
        rows: this.term.rows
      }
      this.$post('terminal/resize', winStyle).then(response => {
        if (response.code === 200) {
          // this.term.resize()
          this.termFitAddon.fit()
        } else {
          this.$message.error(response.msg)
        }
      })
    },
    focusConsole () {
      this.term.focus()
    },
    beforeCreate () {
      let rows = this.termimalRows
      // const consoleBox = document.getElementById('ternimalContainer' + this.idIndex)
      const height = document.body.clientHeight// 高度
      // consoleBox.style.height = `${height - 120}px`
      rows = (height - this.topMenuHeight) / (this.fontSize + this.fontSpaceHeight)
      rows = parseInt(rows)
      const terminalContainer = document.getElementById('terminal' + this.idIndex)
      this.term = new Terminal({
        allowTransparency: true,
        allowProposedApi: true,
        overviewRulerWidth: 8,
        cursorStyle: 'block', // 光标样式  null | 'block' | 'underline' | 'bar'
        disableStdin: false, // 是否应禁用输入
        fontSize: 18,
        lineHeight: 1.2,
        letterSpacing: 0,
        background: 'transparent',
        scrollback: this.terminalSetting.scrollbackLines,
        wordSeparator: this.terminalSetting.wordSeparator
      })
      this.termFitAddon = new FitAddon()
      this.term.loadAddon(this.termFitAddon)
      // const attachAddon = new AttachAddon()
      // this.term.loadAddon(attachAddon)
      // this.term.loadAddon(fitAddon)
      setTimeout(() => {
        this.term.open(terminalContainer)
        this.term.loadAddon(new CanvasAddon())
        this.term.focus()
        this.termFitAddon.fit()
        this.create()
      }, 100)
    },
    create () {
      const that = this
      const token = localStorage.getItem('nz-token')
      let baseUrl = JSON.parse(JSON.stringify(this.$axios.defaults.baseURL))
      const protocol = window.location.protocol.indexOf('https') > -1 ? 'wss' : 'ws'
      if (baseUrl.startsWith('/')) {
        baseUrl = `${protocol}://` + window.location.host + baseUrl
      } else {
        baseUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://')
      }
      let url = ''
      this.terminal.height = document.body.clientHeight - 100
      this.terminal.width = document.body.clientWidth
      const userInfo = localStorage.getItem('nz-userInfo') ? JSON.parse(localStorage.getItem('nz-userInfo')) : ''
      if (userInfo) {
        this.waterMarkText = `${userInfo.username}(${userInfo.name})`
      }
      if (this.terminal.type === 'asset') {
        url = baseUrl + '/terminal.ws?width=' + this.terminal.width + '&height=' + this.terminal.height + '&cols=' + this.term.cols + '&rows=' + this.term.rows + '&token=' + token + '&assetId=' + this.terminal.assetId + '&accountId=' + this.terminal.accountId + '&uuid=' + this.terminal.uuid
      } else if (this.terminal.type === 'custom') {
        url = baseUrl + '/terminal.ws?width=' + this.terminal.width + '&height=' + this.terminal.height + '&cols=' + this.term.cols + '&rows=' + this.term.rows + '&token=' + token + '&accountId=' + this.terminal.accountId + '&uuid=' + this.terminal.uuid
        Object.keys(this.terminal.custom).forEach(key => {
          if (this.terminal.custom[key]) {
            url += '&' + key + '=' + this.terminal.custom[key]
          }
        })
      }
      this.terminalSocket = new WebSocket(url)
      this.termAttachAddon = new AttachAddon(this.terminalSocket)
      // 连接成功onclose
      this.terminalSocket.onopen = () => {
        this.terminal.isLogin = true
        this.showMenu = false
        this.isInit = true
        this.term.focus()
      }
      // 个性化配置
      this.initTerminalSetting()
      // 返回
      this.terminalSocket.onmessage = function (evt) {
        let backContent = evt.data
        const welComIndex = backContent.indexOf(that.welcomeBackContent)
        if (welComIndex > -1) { // 无服务器信息（只与nezha进行了连接）
          const connectResult = {
            title: '',
            color: 1
          }
          that.$emit('refreshConsoleTitle', connectResult)// 1:grey 2 green 3 red
        } else {
          const successContentIndex = backContent.indexOf(that.successBackContent)
          if (successContentIndex > -1) {
            // that.conFinish = true;
            const startIndex = successContentIndex + that.successBackContent.length + 1
            backContent = backContent.substring(startIndex)
            const endIndex = backContent.indexOf('\r\n')
            const title = backContent.substring(0, endIndex)
            const connectResult = {
              title: title,
              color: 2
            }
            that.$emit('refreshConsoleTitle', connectResult)// 1:grey 2 green 3 red
          } else { // 失败
            const failContentIndex = backContent.indexOf(that.failBackContent)
            const connectFailIndex = backContent.indexOf(that.connectFailContent)
            if (failContentIndex > -1) {
              // that.conFinish = true;
              const connectResult = {
                title: '',
                color: 3
              }
              that.$emit('refreshConsoleTitle', connectResult)// 1:grey 2 green 3 red
            } else if (connectFailIndex > -1) {
              const connectResult = {
                title: '',
                color: 3
              }
              that.$emit('refreshConsoleTitle', connectResult)// 1:grey 2 green 3 red
            }
          }
        }
      }
      // 关闭
      this.terminalSocket.onclose = () => {
        this.terminal.isLogin = false
        // 报错sorry的，还没来得及看信息就关闭
        // this.$emit("closeConsole",this.terminal.name);//
        this.term && (this.term.options.disableStdin = true)
      }

      // 错误
      this.terminalSocket.onerror = (e) => {
        this.terminal.isLogin = false
      }
      this.term.loadAddon(this.termAttachAddon)
      this.term._initialized = true
      // this.term.fit()// 自适应大小(使终端的尺寸和几何尺寸适合于终端容器的尺寸) 只是width
      this.$nextTick(() => { // 解决进入全屏和退出全屏是底部隐藏
        // this.setFontSize(this.fontSize)
      })
    },

    closeSocket () {
      if (this.terminalSocket) {
        this.terminalSocket.close()
        this.terminalSocket = ''
      }
      if (this.term) {
        this.term.dispose()
      }
      // 初始化console的高度
      this.conFinish = false
    },
    setFontSize (fontSize) {
      this.term && (this.term.options.fontSize = fontSize)
      const consoleBox = document.getElementById('ternimalContainer' + this.idIndex)
      const width = document.body.clientWidth// 可视宽度
      let height = parseInt(consoleBox.offsetHeight)
      if (height == null || !height) { height = this.termimalHeight }
      const winStyle = {
        width: width,
        height: height,
        cols: this.term.cols, // cols和rows在resizeConsole方法已经设置
        rows: this.term.rows
      }
      // 调整终端可视区域高度
      // document.getElementsByClassName('xterm-screen')[this.idIndex].style.height = height - 30 + 'px'
      this.$nextTick(() => {
        this.term.resize(this.term.cols, this.term.rows)
        this.$post('terminal/resize', winStyle).then(response => {
          if (response.code === 200) {
            this.termFitAddon.fit()
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    reconnect () {
      this.terminal.isLogin = false
      this.closeSocket()
      setTimeout(() => {
        this.beforeCreate()
      }, 100)
    },
    closeFileDir () {
      this.showFileDir(false)
    },
    showFileDir (show) {
      if (JSON.stringify(show) == JSON.stringify(this.fileDirectoryShow)) {
        return
      }
      if (show) {
        this.fileDirectoryShow = show
      }
      let animationClass = ''
      animationClass = show ? 'backInRight' : 'backOutRight'
      this.animateCSS(this.$refs.fileDirectory.$el, animationClass).then((message) => {
        this.fileDirectoryShow = show
      })
    },
    clearTerminal () {
      this.term.clear()
    },
    closeTerminal () {
      this.$emit('close')
    },
    enterStr (message) {
      if (this.terminalSocket && this.terminal.isLogin) {
        this.terminalSocket.send(message)
        setTimeout(() => {
          this.terminalSocket.send('\n')
        }, 100)
        this.term.scrollToBottom()
        this.historyChange(message)
      }
    },
    // 新增历史记录
    historyChange (message) {
      this.$emit('historyChange', message)
    },
    initTerminalSetting () { // 个性化配置
      // 1 render
      this.showWatermark = this.terminalSetting.watermark
      this.term.onSelectionChange((p, a) => {
        if (this.terminalSetting.copyOnSelect) {
          setTimeout(() => {
            this.copySelection()
          })
        }
      })
      // this.term.selectionManager._isCharWordSeparator = (charData) => {
      //   if (charData[2] === 0) {
      //     return false
      //   }
      //   return this.wordSeparator.indexOf(charData[1]) >= 0
      // }
    },
    renderTerminalSetting () {
      this.showWatermark = this.terminalSetting.watermark
      this.wordSeparator = this.terminalSetting.wordSeparator
      this.term.options = {
        scrollback: this.terminalSetting.scrollbackLines,
        wordSeparator: this.terminalSetting.wordSeparator
      }
    },
    copySelection () {
      let str = this.term.getSelection()
      if (!this.terminalSetting.copyWithFormatting) {
        str = str.replace(/[\r\n]/g, '')
      }
      if (this.terminalSetting.copyTrimEnd) {
        str = str.replace(/(\s*$)/g, '')
      }
      this.$copyText(str).then((res) => {
        console.log(res)
      })
    },
    async contextmenu (event) {
      event.preventDefault()
      event.stopPropagation()
      if (this.terminalSetting.rightClick === 'none') {
        return
      }
      if (this.terminalSetting.rightClick === 'menu') {
        this.tiggerMenu(true, event)
      }
      if (this.terminalSetting.rightClick === 'paste') {
        if (!document.execCommand('paste')) {
          const text = await navigator.clipboard.readText()
          this.term.write(text)
        }
      }
    },
    async paste () {
      if (!document.execCommand('paste')) {
        const text = await navigator.clipboard.readText()
        this.term.write(text)
      }
    },
    tiggerMenu (flag, event) {
      this.showMenu = false
      if (flag) {
        let top = 0
        let left = 0
        if (event.clientY < document.body.clientHeight / 2) {
          top = event.clientY + 10
        } else {
          top = event.clientY - 180 - 10
        }
        if (event.clientX < document.body.clientWidth / 2) {
          left = event.clientX + 10
        } else {
          left = event.clientX - 150 - 10
        }
        this.menuPosition = {
          left: left,
          top: top
        }
      }
      this.showMenu = flag
    },
    clickHide () {
      this.showMenu = false
    }
  },
  mounted () {
    this.beforeCreate()
    this.showWatermark = this.terminalSetting.watermark
    const dom = document.getElementById('ternimalContainer' + this.idIndex)
    dom.addEventListener('contextmenu', this.contextmenu)
    dom.addEventListener('click', this.clickHide)
    this.showPaste = navigator.clipboard
  },
  beforeDestroy () {
    this.closeSocket()
    const dom = document.getElementById('ternimalContainer' + this.idIndex)
    dom && dom.removeEventListener('contextmenu', this.contextmenu)
    dom && dom.removeEventListener('click', this.clickHide)
  }
}
</script>
