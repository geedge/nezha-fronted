<template>
  <div class="nz-table-list" style="height: 100%;padding: 0 10px 10px 10px;box-sizing: border-box">
    <el-table
      ref="dataTable"
      class="chart-table"
      :data="tableData"
      :height="'calc(100% - 0px)'"
      :width="'100%'"
      border
      @sort-change="tableDataSort"
    >
      <el-table-column
        v-for="(col, index) in columns"
        :prop="col.title"
        :key="`col-${index}`"
        :min-width="160"
        :sort-orders="['ascending', 'descending']"
        class="data-column"
        class-name="costom-value"
        sortable
      >
        <template slot="header">
          <span class="data-column__span">{{col.title}}</span>
        </template>
        <template slot-scope="scope" :column="col">
          <div v-if="scope.row.valueMapping && scope.row.valueMapping[col.title + 'mapping']" :style="{
            background: scope.row.valueMapping[col.title + 'mapping'].color.bac,
            color: scope.row.valueMapping[col.title + 'mapping'].color.text + ' !important',
            clear: 'both',
          }"
               class="value-mapping-table"
          >
            <template v-if="scope.row.valueMapping && scope.row.valueMapping[col.title + 'mapping']">
              <i :class="scope.row.valueMapping[col.title + 'mapping'].icon" :style="{color: scope.row.valueMapping[col.title + 'mapping'].color.icon}"></i>
            </template>
            {{showValueMapping(scope.row,col.title, col)}}
          </div>
          <div class="value-mapping-table" v-else>
            {{scope.row.display[col.title + 'display'].display}}
          </div>
        </template>
      </el-table-column>
    </el-table>
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
      tableTimer: null
    }
  },
  methods: {
    initChart () {
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
        this.tableData = arr
        this.oldTableData = lodash.cloneDeep(arr)
        this.$refs.dataTable && this.$refs.dataTable.doLayout()
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
    filterShowData (source) {
      let orderBy = null
      let sourceData = null
      sourceData = this.oldTableData
      orderBy = this.orderBy
      if (!orderBy || !orderBy.order) { // 没有排序 恢复默认值
        source = Object.assign([], sourceData)
      } else { // 排序之后的顺序
        if (orderBy.order === 'ascending') {
          source = source.sort(this.asce(orderBy.prop))
        }
        if (orderBy.order === 'descending') {
          source = source.sort(this.desc(orderBy.prop))
        }
      }
      return source
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
        if (/\{\{.+\}\}/.test(column.display)) {
          column.display = this.globalVariablesReplace(column.display)
          const labelValue = column.display.replace(/(\{\{.+?\}\})/g, function (i) {
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
          const oldLabelValue = column.display.replace(/(\{\{.+?\}\})/g, function (i) {
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
            display: column.display,
            oldValue: column.display
          }
        }
      })
      return obj
    },
    showValueMapping (row, column, col) {
      const obj = lodash.cloneDeep(row)
      lodash.keys(obj).forEach(key => {
        if (obj[key].$value) {
          obj[key].$value = obj[key].showValue
        }
      })
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
      this.tableData = this.filterShowData(this.tableData)
    },
    // 本地正序
    asce (prop) {
      return function (obj1, obj2) {
        const val1 = obj1.display[prop + 'display'].display.replace(/\s*/g, '')
        const val2 = obj2.display[prop + 'display'].display.replace(/\s*/g, '')
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
        const val1 = obj1.display[prop + 'display'].display.replace(/\s*/g, '')
        const val2 = obj2.display[prop + 'display'].display.replace(/\s*/g, '')
        if (val1 < val2) {
          return -1
        } else if (val1 > val2) {
          return 1
        } else {
          return 0
        }
      }
    }
  },
  mounted () {
    this.chartInfo.loaded && this.initChart()
  },
  beforeDestroy () {
    clearTimeout(this.tableTimer)
    this.tableTimer = null
  }
}
</script>
