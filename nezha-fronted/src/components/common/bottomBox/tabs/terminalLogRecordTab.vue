<template>
  <nz-bottom-data-list
    :showTitle='showTitle'
    :obj='obj'
    :tableId="tableId"
    :layout="[]"
    :tabs="tabs"
    :targetTab="targetTab"
    @changeTab="changeTab"
    :title="'Session ID'"
  >
    <template v-slot:title><span :title="obj.uuid.substring(0, 8).toUpperCase()">{{obj.uuid.substring(0, 8).toUpperCase()}}</span></template>
    <template v-slot>
      <div class="replay-container">
        <div class="replay-operate">
          <div>
            <button v-show="isPlaying" id="terminal-replay-pause" :title="$t('config.terminallog.record.pause')" class="nz-btn nz-btn-style-light nz-btn-size-large" @click="pause"><i class="nz-icon nz-icon-suspend"></i></button>
            <button v-show="isFinish || !isPlaying" id="terminal-replay-play" :title="$t('config.terminallog.record.play')" class="nz-btn nz-btn-style-light nz-btn-size-large" @click="play"><i class="nz-icon nz-icon-play"></i></button>
            <button id="terminal-replay-restart" :title="$t('config.terminallog.record.replay')" class="nz-btn nz-btn-style-light nz-btn-size-large" @click="restart"><i class="nz-icon nz-icon-replay"></i></button>
            <button id="terminal-replay-speed-change" :title="$t('config.terminallog.record.plays')" class="nz-btn nz-btn-style-light nz-btn-size-large" @click="speedChange"><i class="nz-icon nz-icon-fast-forward"></i>&nbsp;{{speedTable[speedOffset].name}}</button>
            <el-checkbox id="terminal-replay-skip" v-model="needSkip" class="operate-skip">{{$t("config.terminallog.record.skipTip")}}</el-checkbox>
            <el-tag class="time-box" color="#23bf9a" effect="dark" size="medium">{{parseCurrentTime}}&nbsp;s</el-tag>
          </div>
          <div class="terminal-replay-progress" @click="jumpProgress">
            <el-progress ref="terminalProgress" :percentage="progress" :show-text="false" class="terminal-replay-progress-bar"></el-progress>
            <div id="progressController" ref="progressController" class="progress-controller" @mousedown="startDragging"></div>
          </div>
        </div>
        <div ref="recordConsole" class="record-console">
          <div :id="obj.uuid" class="record-terminal"></div>
        </div>
      </div>
    </template>
  </nz-bottom-data-list>
</template>

<script>
import Terminal from '../../js/Xterm'
import bus from '../../../../libs/bus'
// import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'

export default {
  name: 'terminalLogReplayTab',
  mixins: [subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList
  },
  data () {
    return {
      tableId: 'terminaLogRecordTab',
      filter: {
        size: 1,
        uuid: ''
      },
      terminal: null,

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
      detailType: 'list'
    }
  },
  methods: {
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
      this.terminal && this.terminal.resize(parseInt(this.$refs.recordConsole.offsetWidth / 11), parseInt(this.$refs.recordConsole.offsetHeight / 18))
      this.$nextTick(() => {
        this.terminal && this.terminal.fit()
      })
    },

    initAndPlay () {
      this.$nextTick(() => {
        // terminal初始化
        if (this.terminal) {
          this.terminal.reset(parseInt(this.$refs.recordConsole.offsetWidth / 11), parseInt(this.$refs.recordConsole.offsetHeight / 18))
        } else {
          this.terminal = new Terminal({
            rows: parseInt(this.$refs.recordConsole.offsetHeight / 18),
            cols: parseInt(this.$refs.recordConsole.offsetWidth / 11)
          })
          this.terminal.open(document.getElementById(this.obj.uuid))
        }

        if (this.recordData.length > 0) {
          this.isNeedStop = false
          this.isPlaying = true
          this.isFinished = false
          this.playedCount = 0
          this.doPlay()
        } else {
          const req = this.getRecordData()
          req.then(() => {
            if (this.recordData.length > 0) {
              // 请求得到数据后，开始播放
              this.isNeedStop = false
              this.isPlaying = true
              this.isFinished = false
              this.playedCount = 0
              this.doPlay()
            }
          })
        }
      })
    },

    /* 原理：利用setTimeout和数据的时间偏移量来模拟实现视频播放效果 */
    doPlay () {
      if (this.isNeedStop) {
        this.isPlaying = false
        return
      }

      if (this.recordData.length <= this.playedCount) {
        this.playerTimer = setTimeout(this.doPlay, this.recordTick)
        return
      }

      this.playerCurrentTime += this.recordTick * this.speedTable[this.speedOffset].speed

      let recordTick = this.recordTick

      let playData
      for (let i = this.playedCount; i < this.recordData.length; i++) {
        if (this.isNeedStop) {
          break
        }
        playData = this.recordData[i]
        if (playData.t < this.playerCurrentTime) {
          this.terminal.write(playData.c)

          if ((this.playedCount + 1) === this.recordData.length) {
            // 播放完成
            this.progress = 100
            this.isFinished = true
            this.isPlaying = false
            return
          } else {
            this.playedCount++
          }
        } else {
          break
        }
      }
      if (this.isNeedStop) {
        return
      }

      if (this.needSkip) {
        if (playData.t - this.playerCurrentTime > 800) {
          this.playerCurrentTime = playData.t // - this.record_tick * this.speed_table[this.speed_offset].speed;
          recordTick = 800
        }
      }
      // 同步进度条
      this.progress = parseInt(this.playerCurrentTime * 100 / this.timeUsed)

      if (this.playedCount >= this.recordData.length) {
        this.progress = 100
        // 播放完成
        this.isFinished = true
        this.isPlaying = false
      } else {
        if (!this.isNeedStop) { this.playerTimer = setTimeout(this.doPlay, recordTick) }
      }
    },
    play () {
      if (this.isPlaying) {
        return
      }

      if (this.isFinished) {
        this.restart()
        return
      }

      this.isNeedStop = false
      this.isPlaying = true
      this.playerTimer = setTimeout(this.doPlay, this.recordTick)
    },

    speedChange () {
      const length = this.speedTable.length
      this.speedOffset += 1
      if (this.speedOffset === length) {
        this.speedOffset = 0
      }
    },

    pause () {
      if (this.playerTimer) {
        clearTimeout(this.playerTimer)
      }
      this.isNeedStop = true
      this.isPlaying = false
    },

    restart () {
      if (this.playerTimer) {
        clearTimeout(this.playerTimer)
      }
      this.playerCurrentTime = 0
      this.initAndPlay()
    },
    jumpProgress (e) {
      e.preventDefault()
      if (this.playerTimer) {
        clearTimeout(this.playerTimer)
      }
      this.progress = parseInt(e.offsetX * 100 / 500)
      this.playerCurrentTime = parseInt(this.timeUsed * this.progress / 100)
      this.initAndPlay()
    },
    startDragging (e) {
      e.preventDefault()
      if (this.playerTimer) {
        clearTimeout(this.playerTimer)
      }
      const vm = this

      this.pause()
      this.draggingOriginalX = e.clientX
      this.draggingOriginalProgress = this.progress
      this.isDragging = true
      document.addEventListener('mousemove', dragging)
      document.addEventListener('mouseup', endDragging)

      function endDragging (e) {
        e.preventDefault()

        vm.isDragging = false
        document.removeEventListener('mousemove', dragging)
        document.removeEventListener('mouseup', endDragging)
        vm.initAndPlay()
      }
      function dragging (e) {
        e.preventDefault()

        if (vm.isDragging) {
          const nowX = e.clientX
          const diff = nowX - vm.draggingOriginalX // x变化量

          const diffProgress = parseInt(diff * 100 / 500)
          if ((diffProgress + vm.draggingOriginalProgress) > 100) {
            vm.progress = 100
          } else if ((diffProgress + vm.draggingOriginalProgress) < 0) {
            vm.progress = 0
          } else {
            vm.progress = diffProgress + vm.draggingOriginalProgress
          }
          vm.playerCurrentTime = parseInt(vm.timeUsed * vm.progress / 100)
        }
      }
    },

    dateFormat (time) {
      if (!time) {
        return '-'
      }
      const date = new Date(time * 1000)
      const year = date.getFullYear()
      const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
      const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
      const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
      const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()

      return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
    },
    formatUpdateTime (date) {
      const time = new Date(date)
      const hours = time.getHours() > 9 ? time.getHours() : '0' + time.getHours()
      const minutes = time.getMinutes() > 9 ? time.getMinutes() : '0' + time.getMinutes()

      return hours + ':' + minutes
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
          setTimeout(() => { this.initAndPlay() }, 200)
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
  beforeDestroy () {
    window.removeEventListener('resize', bus.debounce)
  }
}
</script>
