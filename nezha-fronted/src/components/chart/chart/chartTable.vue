<template>
  <div class="nz-table-list tabel-chart-box" ref="tabel-chart-box" style="height: 100%;padding: 0 10px 10px 10px;box-sizing: border-box">
    <el-table
      ref="dataTable"
      class="chart-table"
      :data="tableData"
      :height="'100%'"
      :width="'100%'"
      border
      @sort-change="tableDataSort"
      :show-header="showHeader"
    >
      <el-table-column
        v-for="(col, index) in columns"
        :prop="col.title"
        :key="`col-${index}`"
        class="data-column"
        class-name="custom-value"
        :sort-orders="['ascending', 'descending']"
        sortable="custom"
        :min-width="160"
      >
        <template slot="header">
          <span class="data-column__span">{{col.title}}</span>
        </template>
        <template slot-scope="scope" :column="col">
          <div
            v-if="scope.row.valueMapping && scope.row.valueMapping[col.title + 'mapping']"
            :style="{
              background: scope.row.valueMapping[col.title + 'mapping'].color.bac,
              color: scope.row.valueMapping[col.title + 'mapping'].color.text + ' !important',
              clear: 'both',
            }"
            class="value-mapping-table"
            :title="showValueMapping(scope.row,col.title, col)"
            :class="{'chart-cursor-pointer':(dataLink.length || chartInfo.datasource === 'metrics' || chartInfo.datasource === 'logs')}"
            @click="chartClick($event,col,scope.row)"
            @mousedown="chartMousedown($event)"
          >
            <template v-if="scope.row.valueMapping && scope.row.valueMapping[col.title + 'mapping']">
              <i :class="scope.row.valueMapping[col.title + 'mapping'].icon" :style="{color: scope.row.valueMapping[col.title + 'mapping'].color.icon}"></i>
            </template>
            {{showValueMapping(scope.row,col.title, col)}}
          </div>
          <div v-else class="value-mapping-table"  :title="scope.row.display[col.title + 'display'].display"  :class="{'chart-cursor-pointer':(dataLink.length || chartInfo.datasource === 'metrics' || chartInfo.datasource === 'logs')}" @click="chartClick($event,col,scope.row)" @mousedown="chartMousedown($event)">
            {{scope.row.display[col.title + 'display'].display}}
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- pagination -->
    <div class="tabel-chart-pagination" v-if="showPagination">
      <el-pagination
        @current-change="pageNo"
        :page-size="pageObj.pageSize"
        :current-page.sync="pageObj.pageNo"
        :total="pageObj.total"
        layout="prev, pager, next"
        :pager-count="5"
      >
      </el-pagination>
    </div>
    <div :id="`chart-canvas-tooltip-${chartId}`" class="chart-canvas-tooltip no-style-class" :class="{'chart-dataLink-tooltip':tooltip.dataLinkShow}" :style="{left:tooltip.x+'px',top:tooltip.y+'px'}" v-if="tooltip.show" v-clickoutside="clickout">
      <div class="chart-canvas-tooltip-title tooltip-title" :title="tooltip.title">{{tooltip.title}}</div>
      <div class="chart-canvas-tooltip-content">
        <div>value</div>
        <div>{{tooltip.value}}</div>
      </div>
      <!-- dataLink -->
      <div class="chart-dataLink-list" v-if="tooltip.dataLinkShow">
        <!-- 复制表达式 -->
        <div class="chart-dataLink-item select-series" v-if="chartInfo.datasource==='metrics'||chartInfo.datasource==='logs'" @click="copyExpr">
          <i class="nz-icon nz-icon-override"></i>
          <span v-if="chartInfo.datasource==='metrics'">{{$t('overall.copy')}} PromQL</span>
          <span v-else>{{$t('overall.copy')}} LogQL</span>
        </div>
        <div class="chart-dataLink-item" v-for="(item,index) in dataLink" :title='item.title' :key="index" @click="linkClick(item)">
          <i class="nz-icon nz-icon-link"></i>
          <span>{{item.title}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import { getMetricTypeValue } from '@/components/common/js/tools'
import chartDataFormat from '@/components/chart/chartDataFormat'
import lodash from 'lodash'
export default {
  name: 'chart-table',
  mixins: [chartMixin, chartFormat],
  data () {
    return {
      tableData: [],
      oldTableData: [],
      columns: [],
      valueMapping: {},
      tableTimer: null,
      pageObj: {
        pageNo: 1,
        pageSize: 1,
        total: 0
      },
      orderBy: {}
    }
  },
  computed: {
    showHeader () {
      if (this.chartInfo.param.tableOptions && this.chartInfo.param.tableOptions.showTableHeader === 'disabled') {
        return false
      } else {
        return true
      }
    },
    showPagination () {
      if (this.chartInfo.param.tableOptions && this.chartInfo.param.tableOptions.pagination === 'disabled') {
        return false
      } else {
        return true
      }
    }
  },
  methods: {
    resize () {
      this.$nextTick(async () => {
        this.$refs.dataTable && this.$refs.dataTable.doLayout()
        await this.setPageSize()
        this.tableData = this.sortShowData()
      })
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      this.tableData = this.sortShowData()
    },
    filterShowData (source, pageObj) {
      if (source) return source.slice((pageObj.pageNo - 1) * pageObj.pageSize, pageObj.pageNo * pageObj.pageSize)
    },
    // 设置默认排序
    setDefaultSort () {
      const columns = this.chartInfo.param.columns
      const defaultSortColumn = lodash.get(this, 'chartInfo.param.tableOptions.defaultSortColumn', columns[0].title)
      const defaultSort = lodash.get(this, 'chartInfo.param.tableOptions.defaultSort', 'asc')
      const order = defaultSort === 'asc' ? 'ascending' : 'descending'
      this.$refs.dataTable.sort(defaultSortColumn, order)
    },
    // 设置pageSize
    setPageSize () {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 有分页时根据表格高度计算显示条数
          if (this.showPagination) {
            const trHeight = 48
            const tableHeight = this.$refs.dataTable.bodyWrapper.clientHeight
            const pageSize = Math.floor(tableHeight / trHeight) || 1
            this.pageObj.pageSize = pageSize
          } else {
            this.pageObj.pageSize = this.oldTableData.length
          }
          resolve()
        }, 200)
      })
    },
    initChart () {
      this.setDataLink()
      if (this.tableTimer) {
        clearTimeout(this.tableTimer)
        this.tableTimer = null
      }
      this.tableTimer = setTimeout(() => {
        this.columns = this.chartInfo.param.columns
        this.chartInfo.param.valueMapping && this.chartInfo.param.valueMapping.forEach((item) => {
          if (this.valueMapping[item.column]) {
            this.valueMapping[item.column].push(item)
          } else {
            this.valueMapping[item.column] = [item]
          }
        })
        const data = this.initTableData(this.chartInfo, this.chartData)
        const arr = []
        Object.keys(data).forEach(key => {
          arr.push(data[key])
        })
        arr.forEach(item => {
          item.display = this.handleDisplayTable(item)
        })
        arr.forEach(item => {
          item.valueMapping = this.selectTableMapping(item, this.valueMapping)
        })
        this.oldTableData = lodash.cloneDeep(arr)
        this.pageObj.pageNo = 1
        this.$nextTick(async () => {
          this.$refs.dataTable && this.$refs.dataTable.doLayout()
          await this.setPageSize()
          this.setDefaultSort()
          this.pageObj.total = this.oldTableData.length
        })
        this.isInit = false
      }, 200)
    },
    initTableData (chartInfo, originalDatas) {
      let colorIndex = 0
      const returnData = {}
      const arr = chartInfo.param.indexs ? chartInfo.param.indexs.split(',') : []
      const tableInitialData = lodash.cloneDeep(originalDatas)
      tableInitialData.forEach((originalData, expressionIndex) => {
        let key = expressionIndex
        if (chartInfo.elements && chartInfo.elements[expressionIndex].name) {
          key = chartInfo.elements[expressionIndex].name
        }
        if (chartInfo.datasource == 'system' && chartInfo.param.datasource[0].name) {
          key = chartInfo.param.datasource[0].name
        }
        originalData.forEach((data, dataIndex) => {
          this.isNoData = false
          data.$labels = data.metric
          const value = getMetricTypeValue(data.values, chartInfo.param.statistics || 'last') + ''
          const showValue = chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(value, null, -1, 2)
          // const mapping = this.selectTableMapping(value, chartInfo.param.valueMapping)
          data.$value = value
          data.values = value
          data.showValue = showValue
          data.$legend = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex).alias
          data.name = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex).name
          data.expressionIndex = expressionIndex
          // data.mapping = mapping
          data.keys = ''
          // eslint-disable-next-line vue/no-mutating-props
          arr.forEach((item) => {
            if (item && data.$labels[item]) {
              data.keys += item + ':' + data.$labels[item]
            }
          })
          if (!data.keys) {
            Object.keys(data.$labels).forEach(key => {
              data.keys += key + ':' + data.$labels[key]
            })
          }
          if (!data.keys) {
            data.keys = ' '
          }
          if (!returnData[data.keys]) {
            returnData[data.keys] = {}
            returnData[data.keys][key] = data
          }
          if (!returnData[data.keys][key]) {
            returnData[data.keys][key] = data
          }
          colorIndex++
        })
      })
      this.$emit('chartIsNoData', this.isNoData)
      return returnData
    },
    selectTableMapping (row, valueMapping) {
      const obj = {}
      this.columns.forEach((column) => {
        if (valueMapping[column.title]) {
          obj[column.title + 'mapping'] = ''
          if (this.chartInfo.param.enable && this.chartInfo.param.enable.valueMapping) {
            valueMapping[column.title].forEach(item => {
              // const rowValue = row.display[column.title + 'display']
              const rowValue = row.display[column.title + 'display'].oldValue
              if (item.type === 'value') {
                if (rowValue == item.value) {
                  obj[column.title + 'mapping'] = item
                }
              }
              if (item.type === 'range') {
                if (rowValue >= item.from && rowValue <= item.to) {
                  obj[column.title + 'mapping'] = item
                }
              }
              if (item.type === 'regx') {
                const reg = new RegExp(item.regx)
                if (reg.test(rowValue)) {
                  obj[column.title + 'mapping'] = item
                }
              }
            })
          }
        }
      })
      return obj
    },
    handleDisplayTable (row) {
      const obj = {}
      const params = {
        ...row
      }
      this.columns.forEach((column) => {
        obj[column.title + 'display'] = {
          display: '',
          oldValue: ''
        }
        const display = this.globalVariablesReplace(column.display)
        if (/\{\{.+\}\}/.test(display)) {
          const labelValue = display.replace(/(\{\{.+?\}\})/g, function (i) {
            const label = i.substr(i.indexOf('{{') + 2, i.indexOf('}}') - i.indexOf('{{') - 2)
            let value = null
            if (lodash.get(params, label)) {
              value = lodash.get(params, label)
              if (label.indexOf('$value') !== -1) {
                value = chartDataFormat.getUnit(column.unit ? column.unit : 2).compute(value, null, -1, 2)
              }
              if (!((typeof value) == 'string' && value.constructor == String)) {
                let legend = ''
                if (value.__name__) {
                  legend += `${value.__name__}{`
                } else {
                  legend += '{'
                }
                const tagKeysArr = Object.keys(value)
                tagKeysArr.forEach(tagKey => {
                  if (tagKey !== '__name__') {
                    legend += `${tagKey}="${value[tagKey]}",`
                  }
                })
                if (legend.endsWith(',')) {
                  legend = legend.substr(0, legend.length - 1)
                }
                legend += '}'
                value = legend
              }
            }
            return value || ''
          })
          const oldLabelValue = display.replace(/(\{\{.+?\}\})/g, function (i) {
            const label = i.substr(i.indexOf('{{') + 2, i.indexOf('}}') - i.indexOf('{{') - 2)
            let value = null
            if (lodash.get(params, label)) {
              value = lodash.get(params, label)
              if (!((typeof value) == 'string' && value.constructor == String)) {
                let legend = ''
                if (value.__name__) {
                  legend += `${value.__name__}{`
                } else {
                  legend += '{'
                }
                const tagKeysArr = Object.keys(value)
                tagKeysArr.forEach(tagKey => {
                  if (tagKey !== '__name__') {
                    legend += `${tagKey}="${value[tagKey]}",`
                  }
                })
                if (legend.endsWith(',')) {
                  legend = legend.substr(0, legend.length - 1)
                }
                legend += '}'
                value = legend
              }
            }
            return value || ''
          })
          obj[column.title + 'display'] = {
            display: labelValue,
            oldValue: oldLabelValue
          }
        } else {
          obj[column.title + 'display'] = {
            display: display,
            oldValue: display
          }
        }
      })
      return obj
    },
    showValueMapping (row, column, col) {
      const obj = lodash.cloneDeep(row)
      // lodash.keys(obj).forEach(key => {
      //   if (obj[key].$value) {
      //     obj[key].$value = obj[key].showValue
      //   }
      // })
      const params = {
        ...obj
      }
      const display = row.valueMapping[column + 'mapping'].display
      if (/\{\{.+\}\}/.test(display)) {
        const labelValue = display.replace(/(\{\{.+?\}\})/g, function (i) {
          const label = i.substr(i.indexOf('{{') + 2, i.indexOf('}}') - i.indexOf('{{') - 2)
          let value = null
          if (lodash.get(params, label)) {
            value = lodash.get(params, label)
            if (label.indexOf('$value') !== -1) {
              value = chartDataFormat.getUnit(col.unit ? col.unit : 2).compute(value, null, -1, 2)
            }
            if (!((typeof value) == 'string' && value.constructor == String)) {
              let legend = ''
              if (value.__name__) {
                legend += `${value.__name__}{`
              } else {
                legend += '{'
              }
              const tagKeysArr = Object.keys(value)
              tagKeysArr.forEach(tagKey => {
                if (tagKey !== '__name__') {
                  legend += `${tagKey}="${value[tagKey]}",`
                }
              })
              if (legend.endsWith(',')) {
                legend = legend.substr(0, legend.length - 1)
              }
              legend += '}'
              value = legend
            }
          }
          return value || label
        })
        return labelValue
      } else {
        return display
      }
    },
    tableDataSort (orderBy) {
      this.orderBy = { order: orderBy.order, prop: orderBy.prop }
      this.tableData = this.sortShowData()
    },
    sortShowData () {
      const orderBy = this.orderBy
      const originalData = lodash.cloneDeep(this.oldTableData)
      let data = null
      if (!orderBy || !orderBy.order) { // 没有排序 恢复默认值
        data = Object.assign([], originalData)
      } else { // 排序之后的顺序
        if (orderBy.order === 'ascending') {
          data = originalData.sort(this.asce(orderBy.prop))
        }
        if (orderBy.order === 'descending') {
          data = originalData.sort(this.desc(orderBy.prop))
        }
      }
      return this.filterShowData(data, this.pageObj)
    },
    // 本地正序
    asce (prop) {
      return function (obj1, obj2) {
        let val1 = obj1.display[prop + 'display'].display.replace(/\s*/g, '')
        let val2 = obj2.display[prop + 'display'].display.replace(/\s*/g, '')
        if (!isNaN(val1) && !isNaN(val2)) {
          val1 = Number(val1)
          val2 = Number(val2)
        }
        if (val1 < val2) {
          return -1
        } else if (val1 > val2) {
          return 1
        } else {
          return 0
        }
      }
    },
    // 本地倒序
    desc (prop) {
      return function (obj1, obj2) {
        let val1 = obj1.display[prop + 'display'].display.replace(/\s*/g, '')
        let val2 = obj2.display[prop + 'display'].display.replace(/\s*/g, '')
        if (!isNaN(val1) && !isNaN(val2)) {
          val1 = Number(val1)
          val2 = Number(val2)
        }
        if (val1 < val2) {
          return 1
        } else if (val1 > val2) {
          return -1
        } else {
          return 0
        }
      }
    },
    datalinkPosition (e) {
      const windowWidth = window.innerWidth// 窗口宽度
      const windowHeight = window.innerHeight// 窗口高度
      this.$nextTick(() => {
        const box = document.getElementById(`chart-canvas-tooltip-${this.chartId}`)
        const left = e.pageX - this.$refs['tabel-chart-box'].getBoundingClientRect().left
        const top = e.pageY - this.$refs['tabel-chart-box'].getBoundingClientRect().top
        if (box) {
          const boxWidth = box.offsetWidth
          const boxHeight = box.offsetHeight
          if (e.pageX < (windowWidth / 2)) { // 说明鼠标在左边放不下提示框
            this.tooltip.x = left + 15
          } else {
            this.tooltip.x = left - boxWidth - 15
          }
          if (e.pageY + 50 + boxHeight < windowHeight) { // 说明鼠标上面放不下提示框
            this.tooltip.y = top + 15
          } else {
            this.tooltip.y = top - boxHeight - 10
          }
        }
      })
    },
    chartClick (e, col, row) {
      if (this.dataLink.length || this.chartInfo.datasource === 'metrics' || this.chartInfo.datasource === 'logs') {
        // 对象扁平化
        let flattenedObject
        for (const key in row) {
          if (key !== 'display' && key !== 'valueMapping') {
            flattenedObject = { ...row[key] }
          }
        }
        this.tooltip.title = col.title
        if (row.valueMapping && row.valueMapping[col.title + 'mapping']) {
          this.tooltip.value = this.showValueMapping(row, col.title, col)
        } else {
          this.tooltip.value = row.display[col.title + 'display'].display
        }
        this.tooltip.show = true
        this.tooltip.dataLinkShow = true
        this.tooltip.metric.labels = {
          ...flattenedObject.metric,
          legend: flattenedObject.$legend
        }
        this.tooltip.metric.expressionIndex = flattenedObject.expressionIndex
        this.datalinkPosition(e)
      }
    },
    chartMousedown (e) {
      if (this.dataLink.length || this.chartInfo.datasource === 'metrics' || this.chartInfo.datasource === 'logs') {
        e.stopPropagation()
      }
    },
    clickout () {
      if ((this.dataLink.length || this.chartInfo.datasource === 'metrics' || this.chartInfo.datasource === 'logs') && this.tooltip.dataLinkShow) {
        this.tooltip.show = false
        this.tooltip.dataLinkShow = false
      }
    }
  },
  mounted () {
    this.chartInfo.loaded && this.initChart()
    if (this.isFullscreen) {
      window.addEventListener('resize', this.resize)
    }
  },
  beforeDestroy () {
    clearTimeout(this.tableTimer)
    this.tableTimer = null
    window.removeEventListener('resize', this.resize)
  }
}
</script>
