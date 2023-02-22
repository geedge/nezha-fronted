<template>
  <div>
    <el-dialog
      ref="diagnosisDialog"
      v-if="dialogVisible"
      id="diagnosisTab"
      class="diagnosisTab"
      :title="$t('overall.diagnosis')"
      :visible.sync="dialogVisible"
      @close='handleClose'
      width="780px"
      :modal-append-to-body="true"
      :append-to-body="true"
    >
    <div style="position: relative;">
      <!-- 头部 -->
      <div class="dialog-header" style="vertical-align:top;">
        <div class="dialog-header-l">
            <i class="nz-icon nz-icon-Diagnosis1"></i>
            <div>
              <div class="dialog-header-name">{{diagnosisTabData.row.name}}</div>
              <div v-html="fragment" class="dialog-header-item">
              </div>
            </div>
        </div>
        <div class="dialog-header-r">{{$t('overall.serviceTime')}}：{{secondFormatter(elapsedTime)}}</div>
      </div>
      <!-- 表格 -->
      <div class="diagnosis-table">
          <el-table
          id="diagnosisTable"
          ref="dataTable"
          :height="'286px'"
          :data="tableData"
          >
            <el-table-column
              v-for="(item, index) in tableTitle"
              :key="`col-${index}`"
              :label="item.label"
              :min-width="`${item.minWidth}`"
              :prop="item.prop"
              :resizable="true"
              :width="`${item.width}`"
              class="data-column"
            >
              <template slot="header">
                <span class="data-column__span">{{item.label}}</span>
                <div class="col-resize-area"></div>
              </template>
              <template slot-scope="scope" :column="item">
                <template v-if="item.prop === 'state'">
                  <div>
                    <i v-if="scope.row[item.prop] == 1" class="nz-icon nz-icon-import-success1 green"></i>
                    <i v-else-if="scope.row[item.prop] == 2" class="nz-icon nz-icon-import-failed1 red"></i>
                    <i v-else class="nz-icon nz-icon-stop" style="color:#BEBEBE;"></i>
                  </div>
                </template>
                <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
                <template v-else>-</template>
              </template>
            </el-table-column>
            <el-table-column type="expand">
                <template slot-scope="{ row }">
                  <div class="expand-details" v-html="converterData(row.resolution)">
                  </div>
                </template>
            </el-table-column>
            <template  slot="empty">
              <div class="table-no-data">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#nz-icon-no-data-list"></use>
                </svg>
                <div class="table-no-data__title">No results found</div>
              </div>
            </template>
          </el-table>
      </div>
      <loading ref="loading"></loading>
    </div>
    <!-- 底部按钮 -->
    <span slot="footer" class="dialog-footer right-box__footer batch-delete-footer">
        <div>
          <button id="diagnosis-cancel" class="footer__btn footer__btn--light" type="button" @click="dialogVisible = false">{{$t('overall.close')}}</button>
        </div>
    </span>
    </el-dialog>
  </div>
  </template>

<script>
import loading from '@/components/common/loading'
import showdown from 'showdown'

// 解决浏览器切换或者小化时定时器失效问题
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
  name: 'diagnosisTab',
  components: { loading },
  data () {
    return {
      dialogVisible: false,
      timer: null, // 运行定时器
      elapsedTime: 0, // 运行时间
      tableData: [],
      tableTitle: [ // table列
        {
          label: 'state',
          prop: 'state',
          minWidth: 24,
          width: 24
        }, {
          label: 'name',
          prop: 'item',
          minWidth: 200
        }],
      diagnoseUrl: '',
      fragment: '', // 头部提示部分
      agentState: {
        UP: 'green-bg',
        DOWN: 'red-bg',
        UNAVAILABLE: 'gray-bg'
      }
    }
  },
  props: {
    diagnosisTabData: Object
  },
  methods: {
    handleClose () {
      this.dialogVisible = false
    },
    getTableData () {
      this.$get(this.diagnoseUrl + '/diagnose/' + this.diagnosisTabData.row.id).then(response => {
        if (response.code == 200) {
          this.tableData = response.data.list
          // 关闭定时器 取消任务
          stopWorker(this.timer)
          this.$refs.loading.endLoading()
        } else {
          this.$message.error(response.msg)
        }
      })
    },
    // 给页面插入markdown数据
    converterData (text) {
      const converter = new showdown.Converter()
      return converter.makeHtml(text)
    },
    // 补零
    zeroize (num) {
      return num < 10 ? '0' + num : num
    },
    // 秒转为时-分-秒(00：00：00)
    secondFormatter (millisecond) {
      const secondTime = parseInt(millisecond / 1000)
      let time = '00:00:' + this.zeroize(secondTime)
      if (secondTime > 60) {
        const second = parseInt(secondTime % 60)
        let min = parseInt(secondTime / 60)
        time = '00:' + this.zeroize(min) + ':' + this.zeroize(second)

        if (min > 60) {
          min = parseInt(secondTime / 60 % 60)
          const hour = parseInt((secondTime / 60) / 60)
          time = this.zeroize(hour) + ':' + this.zeroize(min) + ':' + this.zeroize(second) + ':'
        }
      }
      return time
    },
    // 头部提示
    suspendedStr (status, from) {
      let str = ''
      if (from === 'endpoint') { // 10进制转为2进制 分别给对应的状态
        let arr = []
        if (!status || status === 1 || status == 0) {
          while (arr.length < 3) {
            arr.push('1')
          }
        } else {
          arr = status.toString(2).split('')
          while (arr.length < 4) {
            arr.unshift('0')
          }
          arr.pop()
        }
        arr.forEach((item, index) => {
          if (index === 0) {
            str += `<div><i class="active-icon inline-block ${item == '0' ? 'gray-bg' : 'green-bg'}"></i> DC</div>`
          }
          if (index === 1) {
            str += `<div><i class="active-icon inline-block ${item == '0' ? 'gray-bg' : 'green-bg'}"></i> ASSET</div>`
          }
          if (index === 2) {
            str += `<div><i class="active-icon inline-block ${item == '0' ? 'gray-bg' : 'green-bg'}"></i> ENDPOINT</div>`
          }
        })
      } else if (from === 'asset') {
        status.forEach((item, index) => {
          if (index === 0) {
            str += `<div><i class="active-icon inline-block ${item == '0' ? 'red-bg' : 'green-bg'}"></i> Ping</div>`
          }
          if (index === 1) {
            str += `<div><i class="active-icon inline-block ${item == '0' ? 'gray-bg' : (item == '1' ? 'green-bg' : 'red-bg')}"></i> TALON</div>`
          }
        })
      } else if (from === 'agent') {
        if (status.auth) {
          str += `<div><i class="active-icon inline-block ${status.auth ? 'green-bg' : 'red-bg'}"></i> Auth</div>`
        }
        if (status.prometheus) {
          str += `<div><i class="active-icon inline-block ${this.agentState[status.prometheus]}"></i> Prometheus</div>`
        }
        if (status.cortex) {
          str += `<div><i class="active-icon inline-block ${this.agentState[status.cortex]}"></i> Cortex</div>`
        }
        if (status.loki) {
          str += `<div><i class="active-icon inline-block ${this.agentState[status.loki]}"></i> Loki</div>`
        }
        if (status.snmp_exporter) {
          str += `<div><i class="active-icon inline-block ${this.agentState[status.snmp_exporter]}"></i> SNMP exporter</div>`
        }
        if (status.blackbox_exporter) {
          str += `<div><i class="active-icon inline-block ${this.agentState[status.blackbox_exporter]}"></i> Blackbox exporter</div>`
        }
      } else {
        str = ''
      }
      this.fragment = str
    }
  },
  computed: {
    showDiagnosisTab () {
      return this.$store.getters.getShowDiagnosisTab
    }
  },
  mounted () {
  },
  watch: {
    diagnosisTabData: {
      immediate: true,
      deep: true,
      handler (n) {
        switch (n.from) {
          case 'asset':
            this.diagnoseUrl = '/asset'
            this.suspendedStr([n.row.pingInfo.status, n.row.clientState], 'asset')
            break
          case 'endpoint':
            this.diagnoseUrl = n.url
            this.suspendedStr(n.row.configs[0].state, 'endpoint')
            break
          case 'agent':
            this.diagnoseUrl = n.url
            this.suspendedStr(JSON.parse(n.row.statusInfo), 'agent')
            break
          default:
            this.diagnoseUrl = n.url
            break
        }
      }
    },
    // 展示弹窗
    showDiagnosisTab (n) {
      if (n) {
        this.dialogVisible = true
        // 定时获取运行时间
        this.timer = createWorker(() => {
          this.elapsedTime += 100
        }, 100)
        this.$nextTick(() => {
          this.$refs.loading.startLoading()
          this.getTableData()
        })
      }
    },
    // 关闭弹窗
    dialogVisible (n) {
      if (!n) {
        this.$store.dispatch('dispatchShowDiagnosisTab', false)
        this.elapsedTime = 0
      }
    }
  },
  beforeDestroy () {
    stopWorker(this.timer)
  }
}
</script>

  <style>
  </style>
