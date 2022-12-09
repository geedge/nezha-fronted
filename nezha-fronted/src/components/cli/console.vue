<style scoped>
  .console{
    height:270px;
    padding:5px 5px;
    background-color: black;
    position: relative;
  }
</style>
<template>
    <div :id="'ternimalContainer'+idIndex" class="console">
      <div class="ternimal-header">
        <span style="color: #fff">
          <div class="active-icon" :class="isLogin ? 'green-bg': 'red-bg'"></div>
          {{userName}}
        </span>
        <span  style="color: #fff">
          <i class="nz-icon nz-icon-reconnect"  v-show="isInit" style="margin-right: 22px" @click="reconnect"></i>
          <i class="nz-icon nz-icon-SFTP" v-show="isLogin" v-if="userName && terminalType == '1'" style="margin-right: 22px" @click="showFileDir(true)"></i>
        </span>
      </div>
        <div :id="'terminal'+idIndex" ></div>
      <fileDirectory v-clickoutside="closeFileDir" :uuid="terminal.uuid" v-show="fileDirectoryShow" @close="showFileDir(false)" :fileDirectoryShow="fileDirectoryShow" ref="fileDirectory"/>
    </div>
</template>
<script>
import Terminal from '../common/js/Xterm'
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
    fontSize: {}
  },
  data () {
    return {
      term: null,
      terminalSocket: null,
      termimalRows: 15,
      termimalHeight: 270,
      topMenuHeight: 30,
      dragHeigh: 8,
      minRow: 1,
      fontSpaceHeight: 2, // 一行高度=fontSize+fontSpaceHeight
      obj: {
        id: 2
      },
      isLogin: false,
      isInit:false,
      successBackContent: 'Connecting to',
      failBackContent: 'Sorry',
      connectFailContent: 'Connection failed',
      welcomeBackContent: 'Welcome',
      psdCont: 'password: ',
      conFinish: false,
      conSuccessNum: 0,
      inputSecret: false,
      userName: '',
      fileDirectoryShow: false
    }
  },
  watch: {
  },
  methods: {
    prompt (term) {
      term.write('\r\n ')// term.write('\r\n~$ ');
    },
    resize (consoleHeigt, consoleWidth) {
      this.resizeConsole(consoleHeigt, consoleWidth)
      this.resizeServiceConsole(consoleHeigt)
    },
    resizeConsole (consoleHeigt, consoleWidth) {
      // 调整终端容器高度
      const consoleBox = document.getElementById('ternimalContainer' + this.idIndex)
      consoleBox.style.height = `${consoleHeigt - 55}px`
      // 调整终端可视区域高度
      document.getElementsByClassName('xterm-screen')[this.idIndex].style.height = `${consoleHeigt - 10 - 30}px`
      this.$nextTick(() => { // 解决进入全屏和退出全屏是底部隐藏
        this.setFontSize(this.fontSize)
      })
    },
    resizeServiceConsole (height) {
      const width = document.body.clientWidth// 可视宽度
      const winStyle = {
        width: width,
        height: height - 100,
        cols: this.term.cols, // cols和rows在resizeConsole方法已经设置
        rows: this.term.rows
      }
      this.$post('terminal/resize', winStyle).then(response => {
        if (response.code === 200) {
          this.term.fit()
        } else {
          this.$message.error(response.msg)
        }
      })
    },
    fullScreenConsole (isFullScreen, resizeHeight) {
      if (resizeHeight) {
        this.termimalHeight = resizeHeight
      }
      let height = document.body.clientHeight - this.topMenuHeight// 可视高度
      const width = document.body.clientWidth// 可视宽度
      let rows = height / (this.fontSize + this.fontSpaceHeight)
      rows = parseInt(rows)
      if (isFullScreen) {
        // 容器高度设置100%
        const consoleBox = document.getElementById('ternimalContainer' + this.idIndex)
        consoleBox.style.height = `${height - 25}px`// 减去菜单的高度
      } else {
        // rows = this.termimalRows-this.minRow;
        height = this.termimalHeight
        // 容器高度设置
        const consoleBox = document.getElementById('ternimalContainer' + this.idIndex)
        consoleBox.style.height = `${this.termimalHeight + this.topMenuHeight - 55}px`
        rows = (height - 10) / (this.fontSize + this.fontSpaceHeight)// padding  5*2
        rows = parseInt(rows)
      }

      this.term.resize(this.term.cols, rows)// this.term.setOption('rows', rows);
      const winStyl = {
        width: width,
        height: height - 50,
        cols: this.term.cols,
        rows: parseInt(rows)
      }
      this.$post('terminal/resize', winStyl).then(response => {
        if (response.code === 200) {
          // this.term.fit();
          // this.term.scrollToBottom();
        } else {
          this.$message.error(response.msg)
        }
      })
      this.$nextTick(() => { // 解决进入全屏和退出全屏是底部隐藏
        this.setFontSize(this.fontSize)
      })
    },
    focusConsole () {
      this.term.focus()
    },
    beforeCreate () {
      let rows = this.termimalRows
      if (this.isFullScreen) {
        // 容器高度设置100%
        const consoleBox = document.getElementById('ternimalContainer' + this.idIndex)
        const height = document.body.clientHeight// 高度
        consoleBox.style.height = `${height - 55}px`
        rows = (height - this.topMenuHeight) / (this.fontSize + this.fontSpaceHeight)
        rows = parseInt(rows)
      } else {
        // 容器高度设置100%
        const consoleBox = document.getElementById('ternimalContainer' + this.idIndex)
        const height = this.terminal.height// 可视高度
        consoleBox.style.height = `${height}px`
        rows = (height - this.topMenuHeight - this.dragHeigh) / (this.fontSize + this.fontSpaceHeight)// menu 30 ,drag  8
        rows = parseInt(rows)
      }
      const terminalContainer = document.getElementById('terminal' + this.idIndex)
      this.term = new Terminal({
        rows: rows, // 15行大概300px高，无法设置heigh，只能设置rows
        cursorStyle: 'block', // 光标样式  null | 'block' | 'underline' | 'bar'
        disableStdin: false, // 是否应禁用输入
        fontSize: this.fontSize
      })
      this.term.open(terminalContainer)
      this.term.focus()
      const params = {
        width: this.terminal.width,
        height: this.terminal.height,
        cols: this.terminal.cols,
        rows: this.terminal.rows,
        host: this.$loadsh.get(this.terminal, 'custom.host', ''),
        port: this.$loadsh.get(this.terminal, 'custom.port', ''),
        assetId: this.$loadsh.get(this.terminal, 'assetId', ''),
        accountId: this.$loadsh.get(this.terminal, 'accountId', ''),
        authProtocol: this.$loadsh.get(this.terminal, 'custom.authProtocol', ''),
        authProtocolPort: this.$loadsh.get(this.terminal, 'custom.authProtocolPort', ''),
        authType: this.$loadsh.get(this.terminal, 'custom.authType', ''),
        authUsername: this.$loadsh.get(this.terminal, 'custom.authUsername', ''),
        authPin: this.$loadsh.get(this.terminal, 'custom.authPin', ''),
        authPriKey: this.$loadsh.get(this.terminal, 'custom.authPriKey', ''),
        authUserTip: this.$loadsh.get(this.terminal, 'custom.authUserTip', ''),
        authPinTip: this.$loadsh.get(this.terminal, 'custom.authPinTip', '')
      }
      this.$post('/terminal/login', params).then(res => {
        if (res.code == 200) {
          this.terminal.uuid = res.data.uuid
          this.userName = res.data.authUsername + '@' + res.data.host
          this.host = res.data.host
          this.create()
        } else {
          this.terminal.uuid = res.data.uuid
          this.userName = res.data.authUsername + '@' + res.data.host
          this.host = res.data.host
          params.name = this.terminal.name
          this.$emit('loginFail', params)
          this.$message.error(res.msg)
        }
      })
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
      if (this.terminal.type === 'asset') {
        url = baseUrl + '/terminal.ws?width=' + this.terminal.width + '&height=' + this.terminal.height + '&cols=' + this.terminal.cols + '&rows=' + this.terminal.rows + '&token=' + token + '&assetId=' + this.terminal.assetId + '&accountId=' + this.terminal.accountId + '&uuid=' + this.terminal.uuid
      } else if (this.terminal.type === 'custom') {
        url = baseUrl + '/terminal.ws?width=' + this.terminal.width + '&height=' + this.terminal.height + '&cols=' + this.terminal.cols + '&rows=' + this.terminal.rows + '&token=' + token + '&accountId=' + this.terminal.accountId + '&uuid=' + this.terminal.uuid
        Object.keys(this.terminal.custom).forEach(key => {
          if (this.terminal.custom[key]) {
            url += '&' + key + '=' + this.terminal.custom[key]
          }
        })
      }
      this.terminalSocket = new WebSocket(url)
      // 连接成功onclose
      this.terminalSocket.onopen = () => {
        this.isLogin = true
        this.isInit = true
      }
      // 登录后，你输入的内容从后台服务返回
      this.term.on('data', function (data) {
        /*
        let code = data.charCodeAt(0);
        if(code==13){
        }else {
          //that.term.write(data);
        } */
      })
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
        this.isLogin = false
        // 报错sorry的，还没来得及看信息就关闭
        // this.$emit("closeConsole",this.terminal.name);//
        this.term && this.term.setOption('disableStdin', true)
      }

      // 错误
      this.terminalSocket.onerror = (e) => {
        this.isLogin = false
      }
      // 选中 复制
      this.term.on('selection', function () {})
      this.term.attachCustomKeyEventHandler(function (ev) { })

      this.term.attach(this.terminalSocket)
      this.term._initialized = true
      this.term.fit()// 自适应大小(使终端的尺寸和几何尺寸适合于终端容器的尺寸) 只是width
      this.$nextTick(() => { // 解决进入全屏和退出全屏是底部隐藏
        this.setFontSize(this.fontSize)
      })
    },

    closeSocket () {
      if (this.terminalSocket) {
        this.terminalSocket.close()
      }
      if (this.term) {
        this.term.destroy()
      }
      // 初始化console的高度
      const consoleBox = document.getElementById('ternimalContainer' + this.idIndex)
      if (consoleBox) {
        consoleBox.style.height = `${this.termimalHeight}px`
      }
      this.conFinish = false
    },
    setFontSize (fontSize) {
      this.term && this.term.setOption('fontSize', fontSize)
      const consoleBox = document.getElementById('ternimalContainer' + this.idIndex)
      const width = document.body.clientWidth// 可视宽度
      let height = parseInt(consoleBox.style.height)
      if (height == null || !height) { height = this.termimalHeight }
      const winStyle = {
        width: width,
        height: height,
        cols: this.term.cols, // cols和rows在resizeConsole方法已经设置
        rows: this.term.rows
      }
      // 调整终端可视区域高度
      document.getElementsByClassName('xterm-screen')[this.idIndex].style.height = height - 30 + 'px'
      this.$nextTick(() => {
        this.term.resize(this.term.cols, this.term.rows)
        this.$post('terminal/resize', winStyle).then(response => {
          if (response.code === 200) {
            this.term.fit()
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    reconnect () {
      this.isLogin = false
      this.closeSocket()
      this.term.off('selection')
      this.term.off('data')
      this.beforeCreate()
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
      animationClass = show ? 'backInUp' : 'backOutDown'
      this.animateCSS(this.$refs.fileDirectory.$el, animationClass).then((message) => {
        this.fileDirectoryShow = show
      })
    }
  },
  mounted () {
    this.beforeCreate()
  },
  beforeDestroy () {
    this.closeSocket()
    this.term.off('selection')
    this.term.off('data')
  }
}
</script>
<style scoped lang="scss">

</style>
