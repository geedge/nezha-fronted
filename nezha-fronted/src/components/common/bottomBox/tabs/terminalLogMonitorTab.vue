<template>
 <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
    :layout="[]"
    :tabs="tabs"
      :targetTab="targetTab"
    @changeTab="changeTab"
    :title="'Session ID'"
  >
    <template v-slot:title><span :title="obj.uuid.substring(0, 8).toUpperCase()">{{obj.uuid.substring(0, 8).toUpperCase()}}</span></template>
    <template v-slot>
      <div ref="replayTab" class="replay-tab">
        <div class="replay-container">
          <div ref="recordConsole" class="record-console">
            <div :id="obj.uuid" class="record-terminal"></div>
          </div>
        </div>
      </div>
    </template>
  </nz-bottom-data-list>
</template>

<script>
import Terminal from '../../js/Xterm'
import { AttachAddon } from 'xterm-addon-attach'
import { FitAddon } from 'xterm-addon-fit'
import bus from '../../../../libs/bus'
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'
export default {
  name: 'terminalLogReplayTab',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList
  },
  data () {
    return {
      tableId: 'terminaLogMonitorTab',
      filter: {
        size: 1,
        uuid: ''
      },
      terminal: null,
      term: null,
      termFitAddon: null,
      terminalSocket: null,
      termAttachAddon: null,
      recordData: [],
      isNeedStop: false, // 是否需要停止
      playedCount: 0, // 当前已经播放完的数量
      isPlaying: true, // 是否正在播放
      isFinish: false, // 是否已结束
      isDragging: false, // 是否正在拖动进度条
      draggingOriginalX: 0, // 开始拖拽时鼠标的x
      draggingOriginalProgress: 0, // 开始拖拽时的进度
      recordTick: 50, // 输出间隔时间ms，默认50
      playerTimer: null, // 定时器
      playerCurrentTime: 0, // 当前时间进度
      speedTable: [ // 快进倍速选项
        { speed: 1, name: '×1' },
        { speed: 2, name: '×2' },
        { speed: 4, name: '×4' },
        { speed: 8, name: '×8' },
        { speed: 16, name: '×16' }
      ],
      speedOffset: 0, // 快进倍数index
      progress: 0, // 进度条进度
      needSkip: true, // 是否跳过无操作时间，为true时表示需要，即不跳过无操作时间
      timeUsed: 0,
      successBackContent: 'Connecting to',
      failBackContent: 'Sorry',
      connectFailContent: 'Connection failed',
      welcomeBackContent: 'Welcome',
      psdCont: 'password: '
    }
  },
  methods: {
    // 创建连接
    create () {
      const that = this
      if (this.terminalSocket) {
        this.terminalSocket.close()
      }
      if (this.terminal) {
        this.terminal.dispose()
      }
      this.terminal = new Terminal({
        rows: parseInt(this.$refs.recordConsole.offsetHeight / 18),
        cols: parseInt(this.$refs.recordConsole.offsetWidth / 11),
        cursorStyle: 'block', // 光标样式  null | 'block' | 'underline' | 'bar'
        // bellStyle:'sound',
        disableStdin: true// 是否应禁用输入
      })
      this.termFitAddon = new FitAddon()
      this.terminal.loadAddon(this.termFitAddon)
      this.terminal.open(document.getElementById(this.obj.uuid))
      this.termFitAddon.fut()
      const token = localStorage.getItem('nz-token')
      let baseUrl = this.$axios.defaults.baseURL
      if (baseUrl.startsWith('/')) {
        baseUrl = 'ws://' + window.location.host + baseUrl
      } else {
        baseUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'ws://')
      }
      /// monitor
      const url = baseUrl + '/terminal/monitor.ws?' + '&token=' + token + '&uuid=' + this.obj.uuid
      if (this.terminalSocket) { // 如果存在之前的链接 先断开 再链接新的
        this.terminalSocket.close()
      }
      this.terminalSocket = new WebSocket(url)
      // 连接成功
      this.terminalSocket.onopen = () => {
      }
      // 返回
      this.terminalSocket.onmessage = function (evt) {
        let backContent = evt.data
        /*
          if(that.inputSecret){//当前为密码输入状态
          }
          if(backContent.length>1){
            let pwdInput = backContent.endsWith(that.psdCont);
            if(pwdInput){//输入密码
              that.inputSecret = true;
            }
          } */

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
              const startIndex = successContentIndex + that.successBackContent.length + 1
              backContent = backContent.substring(startIndex)
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
        // 报错sorry的，还没来得及看信息就关闭
        // this.$emit("closeConsole",this.terminal.name);//应该调用父窗口
      }

      // 错误
      this.terminalSocket.onerror = (e) => {
      }
      this.termAttachAddon = new AttachAddon(this.terminalSocket)
      this.term.loadAddon(this.termAttachAddon)
      this.terminal._initialized = true
      this.termFitAddon.fit()// 自适应大小(使终端的尺寸和几何尺寸适合于终端容器的尺寸) 只是width
      // this.$nextTick(()=>{// 解决进入全屏和退出全屏是底部隐藏
      //   this.setFontSize(this.fontSize);
      // })
    },

    // 关闭连接
    closeSocket () {
      if (this.terminalSocket) {
        this.terminalSocket.close()
      }
      if (this.terminal) {
        this.terminal.dispose()
      }
    },
    // 切换tab
    changeTab (tab) {
      this.$emit('changeTab', tab)
    },

    getRecordData () {
      return new Promise(resolve => {
        this.$get('/terminal/record', this.filter).then(res => {
          if (res.code === 200) {
            this.recordData = res.data.list
            this.timeUsed = res.data.endTime
          }
          resolve()
        })
      })
    },

    consoleResize () {
      this.$nextTick(() => {
        this.terminal && this.termFitAddon.fit()
      })
    },
    shutdown () {
      this.$confirm(this.$t('tip.killTerm'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$put('/terminal/kill', { uuid: this.obj.uuid }).then(res => {
          if (res.code === 200) {
            this.$message.success(this.$t('overall.result.success'))
            this.$emit('exit')
          } else {
            this.$message.error(this.$t('config.terminallog.killErrorTip'))
          }
        })
      })
    }
  },
  watch: {
    // 入口，监听terminal session的变化，开始功能
    obj: {
      immediate: true,
      deep: true,
      handler (n) {
        if (n.uuid) {
          this.recordData = []
          this.filter.uuid = n.uuid
          this.playerCurrentTime = 0
          if (this.playerTimer) {
            clearTimeout(this.playerTimer)
          }
          setTimeout(() => {
            this.create()
          }, 200)
        }
      }
    },
    progress (n) {
      const progressController = document.getElementById('progressController')
      progressController.style.left = `${n}%`
    }
  },
  computed: {
    parseCurrentTime () {
      let currentTime = parseInt(this.playerCurrentTime / 1000)
      const totalTime = parseInt(this.timeUsed / 1000)
      if (currentTime > totalTime) {
        currentTime = totalTime
      }
      return `${currentTime} / ${totalTime}`
    }
  },
  created () {
    window.addEventListener('resize', bus.debounce(this.consoleResize, 1000))
  },
  mounted () {

  },
  beforeDestroy () {
    window.removeEventListener('resize', bus.debounce)
    this.closeSocket()
  }
}
</script>
