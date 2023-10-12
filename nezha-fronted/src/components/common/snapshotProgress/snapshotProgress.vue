<template>
  <div>
    <el-dialog
      class="nz-dialog snapshot-dialog"
      width="472px"
      :title="$t('overall.snapshoot')"
      destroy-on-close
      append-to-body
      :close-on-click-modal="false"
      :visible.sync="visible"
      @close="closeDialog"
    >
    <div>
      <p class="snapshot-name">{{$t('overall.name')}}：{{showPanel.name}}</p>
      <p class="snapshot-time">{{$t('overall.time')}}：{{searchTime[0]}}—{{searchTime[1]}}</p>
      <el-progress :percentage="process" :stroke-width="20" :show-text="false" stroke-linecap="butt"></el-progress>
      <p class="snapshot-elapsed">
        <span>{{$t('dashboard.elapsedTime')}}：{{secondFormatter(elapsedTime)}}</span>
        <span v-if="total!=undefined">{{done}}/{{total}}</span>
      </p>
      <p class="snapshot-msg">{{$t('dashboard.snapshotTip1')}}{{$t('dashboard.snapshotTip2')}}</p>
    </div>
    <div slot="footer">
      <div class="el-message-box__btns">
        <button :class="{'nz-btn-disabled':prevent_opt.import}" :disabled="prevent_opt.import" class="nz-btn el-button--small nz-btn-style-normal" @click="startTimer">
          <span style="text-transform:Capitalize">{{$t('overall.exportExcel')}}</span>
        </button>
        <button class="nz-btn el-button el-button--small el-button--default" @click="closeDialog">
          <span>{{$t('overall.close')}}</span>
        </button>
      </div>
    </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import bus from '@/libs/bus'

function create (f) {
  const blob = new Blob(['(' + f + ')()'])
  const url = window.URL.createObjectURL(blob)
  const worker = new Worker(url)
  return worker
}
const createWorker = (callback, time) => {
  const pollingWorker = create(`function (e) {
    setInterval(function () {
      this.postMessage(null)
    }, ${time})
  }`)
  pollingWorker.onmessage = callback
  return pollingWorker
}
const stopWorker = (vm) => {
  try {
    vm && vm.terminate()
  } catch (err) {
    console.log(err)
  }
}

export default {
  name: 'snapshotProgress',
  props: {
    showPanel: {
      type: Object
    },
    searchTime: {
      type: Array,
      default: () => {
        return []
      }
    },
    snapshotVisible: {
      type: Boolean,
      default: false
    },
    api: String
  },
  data () {
    return {
      visible: this.snapshotVisible, // 弹窗显示隐藏
      timer: null, // 获取运行时间定时器
      task: null, // 获取任务进度定时器
      elapsedTime: 0, // 运行时间
      tid: undefined, // 任务id
      total: undefined,
      done: undefined,
      process: 0
    }
  },
  methods: {
    async startTimer () {
      this.prevent_opt.import = true
      const vars = this.$store.getters.getVariablesArr.map(item => {
        return {
          name: item.name,
          values: item.checked
        }
      })
      const params = {
        format: this.showPanel.format || 'html',
        start: this.$stringTimeParseToUnix(bus.formateTimeToTime(this.searchTime[0])),
        end: this.$stringTimeParseToUnix(bus.formateTimeToTime(this.searchTime[1]))
      }
      if (this.api === 'dashboard') {
        params.dashboardId = this.showPanel.id
        params.vars = vars
      } else {
        params.id = this.showPanel.id
      }
      // 创建任务
      const res = await this.$post(`/visual/${this.api}/snapshot/task`, params)
      if (res.code === 200) {
        // 定时获取运行时间
        this.timer = createWorker(() => {
          this.elapsedTime += 100
        }, 100)
        this.tid = res.data.tid
        this.getResult()
      } else {
        this.prevent_opt.import = false
        this.$message.error(res.msg)
      }
    },
    // 任务进度查询
    getResult () {
      this.task = setInterval(async () => {
        if (this.process < 100) {
          try {
            const res = await this.$get(`/visual/${this.api}/snapshot/result/` + this.tid)
            this.total = res.data.taskId.total
            this.done = res.data.taskId.done
            this.process = parseFloat(res.data.taskId.process)
          } catch (error) {}
        } else {
          this.downloadSnapshot()
          this.tid = undefined
          this.clearTimer()
        }
      }, 300)
    },
    // 导出快照
    downloadSnapshot () {
      let total = 10
      let loaded = 0
      axios.get(`/visual/${this.api}/snapshot/download/` + this.tid, {
        responseType: 'blob',
        onDownloadProgress: function (progressEvent) {
          // 处理原生进度事件
          total = progressEvent.total
          loaded = progressEvent.loaded
        }
      }).then(res => {
        const fileName = this.showPanel.name
        if (loaded < total) {
          this.$message.error(res.msg || res.error || this.$t('NetWork Error'))
          this.prevent_opt.import = false
          return
        }
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res.data])
          window.navigator.msSaveOrOpenBlob(blobObject, fileName + '.' + (this.showPanel.format || 'html'))
        } else {
          const blob = new Blob([res.data])
          const link = document.createElement('a')
          const href = window.URL.createObjectURL(blob) // 下载链接
          link.href = href
          link.download = fileName + '.' + (this.showPanel.format || 'html') // 下载后文件名
          document.body.appendChild(link)
          link.click() // 点击下载
          document.body.removeChild(link) // 下载完成移除元素
          window.URL.revokeObjectURL(href) // 释放blob对象
        }
        this.prevent_opt.import = false
        this.$emit('update:snapshotVisible', false)
      }, error => {
        const $self = this
        const reader = new FileReader()
        reader.onload = function (event) {
          const responseText = reader.result
          const exception = JSON.parse(responseText)
          if (exception.message) {
            $self.$message.error(exception.message)
          } else {
            console.error(error)
            $self.$message.error(error)
          }
        }
        reader.readAsText(error.response.data)
        this.prevent_opt.import = false
      })
    },
    // 关闭定时器 取消任务
    clearTimer () {
      stopWorker(this.timer)
      clearInterval(this.task)
    },
    // 关闭弹窗
    closeDialog () {
      this.$emit('update:snapshotVisible', false)
    },
    // 秒转为时-分-秒
    secondFormatter (millisecond) {
      // if (millisecond >= 1000) {
      const secondTime = parseInt(millisecond / 1000)
      let time = parseInt(secondTime) + 's'
      if (secondTime > 60) {
        const second = parseInt(secondTime % 60)
        let min = parseInt(secondTime / 60)
        time = min + 'min ' + second + 's'

        if (min > 60) {
          min = parseInt(secondTime / 60 % 60)
          const hour = parseInt((secondTime / 60) / 60)
          time = hour + 'h ' + min + 'min ' + second + 's'
        }
      }
      return time
      // } else {
      // return millisecond + 'ms'
      // }
    }
  },
  beforeDestroy () {
    this.clearTimer()
    if (this.tid) {
      this.$get(`/visual/${this.api}/snapshot/cancel/` + this.tid)
    }
  }
}
</script>
