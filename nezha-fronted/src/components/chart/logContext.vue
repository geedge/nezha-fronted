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
        <div class="context-header" v-html="handlerLabels(rowData.labels)"></div>
        <div class="macth-before">
          <div>
            <p v-show="!loading">{{$t('explore.beforeMatch', { dataLength: beforeLength })}}</p>
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
          </div>
        </div>
        <div v-my-loading="loading" class="context-loading-wrap">
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
                    <pre>{{row.labels}}</pre>
                  </template>
                </el-table-column>
                <el-table-column
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
        </div>
        <div class="macth-after">
          <p v-show="!loading">{{$t('explore.afterMatch', { dataLength: afterLength })}}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'logContext',
  props: {
    contextVisible: {
      type: Boolean,
      default: false
    },
    rowData: {} // 当前行数据
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
    this.tableData = [this.rowData]
    this.queryContext()
  },
  methods: {
    queryContext () {
      this.loading = true
      const beforDate = this.rowData.secondTime - 2 * 60 * 60 // 向前查两个小时
      const nowDate = this.rowData.secondTime
      const afterDate = this.rowData.secondTime + 2 * 60 * 60 // 向后查两个小时
      const requestArr = []
      const expr = this.getExpression()
      requestArr.push(this.$get('/logs/loki/api/v1/query_range?format=1&query=' + encodeURIComponent(expr) + '&start=' + nowDate + '&end=' + afterDate + '&limit=' + this.lines + '&direction=forward')) // after
      requestArr.push(this.$get('/logs/loki/api/v1/query_range?format=1&query=' + encodeURIComponent(expr) + '&start=' + beforDate + '&end=' + nowDate + '&limit=' + this.lines + '&direction=backward')) // befor
      Promise.all(requestArr).then(res => {
        const logData = res.map(r => r.data)
        this.beforeLength = logData[1].result.length
        const beforData = this.filterLogType(logData[1].result)
        this.afterLength = logData[0].result.length
        const afterData = this.filterLogType(logData[0].result).reverse()
        this.tableData = [...afterData, this.rowData, ...beforData]
        this.loading = false
        this.currentRowCenter()
      }).catch(e => {
        this.loading = false
        this.$message.error(this.$t('config.terminallog.statusItem.unknownError'))
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
