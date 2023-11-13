<template>
  <div class="logContext">
    <el-dialog
      class="logContext-dialog"
      :title="$t('explore.logContext')"
      destroy-on-close
      :append-to-body="true"
      :visible.sync="visible"
      @close="closeDialog"
    >
      <div class="log-detail">
        <div class="context-header">
          <copy :copyData='getExpression(rowData.labels)' :showInfo='getExpression(rowData.labels)'>
            <template slot="copy-text">
              <span v-html="handlerLabels(rowData.labels)"></span>
            </template>
          </copy>
        </div>
        <div class="context-loading-wrap" v-my-loading="loading">
          <div class="macth-before">
            <div>
              <p v-show="!loading&&setting.descending">{{$t('explore.afterMatch', { dataLength: afterLength })}}</p>
              <p v-show="!loading&&!setting.descending">{{$t('explore.beforeMatch', { dataLength: beforeLength })}}</p>
            </div>
            <div style="display:flex;align-items: center;">
              <div class="log-operation margin-r-20">
                <span class="operation-label">{{$t('dashboard.explore.wrapLines')}}</span>
                <el-switch
                  v-model="wrapLines"
                  @change="currentRowCenter"
                >
                </el-switch>
              </div>
              <div class="log-operation">
                <el-select v-model="lines" @change="queryContext" size="small" style="width: 100px;" :popper-append-to-body="false" popper-class="right-box-select-top right-public-box-dropdown-top select-auto">
                  <el-option v-for="option in linesOptions" :value="option" :label="option+' '+$t('explore.lines')" :key="option"></el-option>
                </el-select>
              </div>
              <button :class="{'nz-btn-disabled': loading}" class="top-tool-btn" style="cursor: pointer;z-index: 2;" type="button" @click="exportLog" :title="$t('overall.download')">
                <i class="nz-icon nz-icon-download"></i>
              </button>
            </div>
          </div>
          <div class="context-list">
            <div class="log-table">
              <el-table
                :cell-class-name="cellClassName"
                :data="tableData"
                :show-header="false"
                ref="logTable"
                class="nz-table-list"
                size="mini"
                :row-class-name="({row})=>{return row.current ? 'currentRow':''}"
              >
                <el-table-column
                  type="expand"
                >
                  <template slot-scope="{ row }">
                    <div class="log-pre-wrap" :class="'log-border--'+row.level">
                      <pre>{{row.labels}}</pre>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="setting.time"
                  prop="date"
                  width="160"
                >
                  <!-- <template slot-scope="{ row }">{{utcTimeToTimezoneStr(row.date)}}</template> -->
                  <template slot-scope="{ row }">{{momentTz(row.secondTime * 1000)}}</template>
                </el-table-column>
                <el-table-column
                  prop="message"
                >
                  <template slot-scope="{ row }">
                    <div style="width: 100%;" class="text-ellipsis" :title="row.message">{{row.message}}</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
          <div class="macth-after">
            <p v-show="!loading&&setting.descending">{{$t('explore.beforeMatch', { dataLength: beforeLength })}}</p>
            <p v-show="!loading&&!setting.descending">{{$t('explore.afterMatch', { dataLength: afterLength })}}</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import copy from '@/components/common/copy'
import axios from 'axios'
// 引入 BigNumber 库
import BigNumber from 'bignumber.js'
export default {
  name: 'logContext',
  components: { copy },
  props: {
    contextVisible: {
      type: Boolean,
      default: false
    },
    rowData: {}, // 当前行数据
    setting: Object // 根据传入的设置 显示数据
  },
  data () {
    return {
      visible: this.contextVisible, // 弹窗显示隐藏
      wrapLines: true,
      lines: 50,
      linesOptions: [10, 20, 50, 100, 200],
      loading: true,
      tableData: [],
      beforeLength: 0,
      afterLength: 0
    }
  },
  created () {
    this.wrapLines = this.setting.wrapLines
    this.tableData = [this.rowData]
    this.queryContext()
  },
  methods: {
    queryContext () {
      this.loading = true
      const twoHours = 2 * 60 * 60 * 1000 * 1000 * 1000// 纳秒
      const bigNum = new BigNumber(this.rowData.timestamp)

      const beforStart = bigNum.minus(twoHours) // 向前查两个小时
      const beforEnd = this.rowData.timestamp

      const afterStart = bigNum.plus(1) // start加一纳秒 防止出现重复数据
      const afterEnd = bigNum.plus(twoHours) // 向后查两个小时

      const requestArr = []
      const expr = this.getExpression()
      requestArr.push(this.$get('/logs/loki/api/v1/query_range?format=1&query=' + encodeURIComponent(expr) + '&start=' + afterStart + '&end=' + afterEnd + '&limit=' + this.lines + '&direction=forward')) // after
      requestArr.push(this.$get('/logs/loki/api/v1/query_range?format=1&query=' + encodeURIComponent(expr) + '&start=' + beforStart + '&end=' + beforEnd + '&limit=' + this.lines + '&direction=backward')) // befor
      Promise.all(requestArr).then(res => {
        const logData = res.map(r => r.data)
        this.beforeLength = logData[1].result.length
        const beforData = this.filterLogType(logData[1].result)
        this.afterLength = logData[0].result.length
        const afterData = this.filterLogType(logData[0].result).reverse()
        this.tableData = [...afterData, this.rowData, ...beforData]
        // 数据正序展示
        if (!this.setting.descending) {
          this.tableData.reverse()
        }
        this.loading = false
        this.currentRowCenter()
      }).catch(e => {
        this.loading = false
        this.$message.error(this.$t('config.terminallog.statusItem.unknownError'))
      })
    },
    exportLog () {
      const expr = this.getExpression()
      let start, end
      if (this.setting.descending) {
        start = this.$lodash.get(this.tableData[this.tableData.length - 1], 'timestamp')
        end = this.$lodash.get(this.tableData[0], 'timestamp')
      } else {
        start = this.$lodash.get(this.tableData[0], 'timestamp')
        end = this.$lodash.get(this.tableData[this.tableData.length - 1], 'timestamp')
      }
      const params = {
        logql: [expr],
        start,
        end,
        direction: this.setting.descending ? 'backward' : 'forward'
      }
      axios.get('/logs/loki/export', { responseType: 'blob', params: params }).then(res => {
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res.data])
          window.navigator.msSaveOrOpenBlob(blobObject, 'log')
        } else {
          const url = URL.createObjectURL(new Blob([res.data]))
          const a = document.createElement('a')
          document.body.appendChild(a) // 此处增加了将创建的添加到body当中
          a.href = url
          a.download = 'log'
          a.target = '_blank'
          a.click()
          a.remove() // 将a标签移除
        }
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
          }
        }
        reader.readAsText(error.response.data)
      })
    },
    filterLogType (data) {
      const logData = data.map(d => ({
        ...d,
        secondTime: Math.floor(this.toMillisecondTime(d.timestamp) / 1000)
      }))
      return logData
    },
    currentRowCenter () {
      this.$refs.logTable && this.$refs.logTable.doLayout()
      this.$nextTick(() => {
        document.querySelector('.currentRow').scrollIntoView({ block: 'center', inline: 'center' })
      })
    },
    toMillisecondTime (timestamp) {
      const timeLength = `${timestamp}`.length
      // 判断时间是秒/毫秒/微秒/纳秒
      let step = null
      switch (timeLength) {
        case 10:
          step = 1000
          break
        case 13:
          step = 1
          break
        case 16:
          step = 0.001
          break
        case 19:
          step = 0.000001
          break
        default: break
      }
      return Math.floor(timestamp * step)
    },
    cellClassName ({ row, column, rowIndex, columnIndex }) {
      const className = []
      !this.wrapLines && className.push('log-row-wrap--no-wrap')
      if (columnIndex === 0) {
        className.push(`log-border--${row.level}`)
      }
      return className.join(' ')
    },
    getExpression () {
      const metric = this.$lodash.cloneDeep(this.rowData.labels)
      let expr = '{'
      const keys = Object.keys(metric)
      for (const index in keys) {
        const key = keys[index]
        expr += key + '="' + metric[key] + '",'
      }
      if (expr.endsWith(',')) {
        expr = expr.substr(0, expr.length - 1)
      }
      expr += '}'
      return expr
    },
    handlerLabels (data) {
      const metric = this.$lodash.cloneDeep(data)
      const bracketsColor = '#eb7b18'// #eb7b18
      const labelColor = '#65bbd1'// #66d9ef
      const valueColor = '#61c261'// #74e680
      let colorElement = `<span style="color: ${bracketsColor}">{</span>`
      const keys = Object.keys(metric)
      for (const index in keys) {
        const key = keys[index]
        colorElement += `<span style="color: ${labelColor}">${key}</span>=<span style="color: ${valueColor}">"${metric[key]}"</span>`
        if (index < keys.length - 1) {
          colorElement += ','
        }
      }
      colorElement += `<span style="color: ${bracketsColor}">}</span>`
      return colorElement
    },
    // 关闭弹窗
    closeDialog () {
      this.$emit('update:contextVisible', false)
    }
  }
}
</script>
