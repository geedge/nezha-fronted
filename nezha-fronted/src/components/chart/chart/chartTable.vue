<template>
  <div class="nz-table2" style="height: 100%;padding: 0 10px 10px 10px;box-sizing: border-box">
    <el-table
      ref="dataTable"
      class="chart-table"
      :data="tableData"
      :height="'100%'"
      border
      @sort-change="tableDataSort"
    >
      <el-table-column
        v-for="(col, index) in columns"
        :key="`col-${index}`"
        :min-width="100"
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
            color: scope.row.valueMapping[col.title + 'mapping'].color.text,
            clear: 'both',
          }"
               class="value-mapping-table"
          >
            {{showValueMapping(scope.row,col.title)}}
          </div>
          <div class="value-mapping-table" v-else>
            {{scope.row.display[col.title + 'display']}}
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
import chartDataFormat from '@/components/charts/chartDataFormat'
import lodash from 'lodash'
export default {
  name: 'chart-table',
  mixins: [chartMixin, chartFormat],
  data () {
    return {
      tableData: [],
      columns: [],
      valueMapping: {}
    }
  },
  methods: {
    initChart () {
      this.columns = this.chartInfo.param.columns
      this.chartInfo.param.valueMapping.forEach((item) => {
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
      this.$refs.dataTable.doLayout()
    },
    initTableData (chartInfo, originalDatas) {
      let colorIndex = 0
      const returnData = {}
      const arr = chartInfo.param.indexs.split(',')
      originalDatas.forEach((originalData, expressionIndex) => {
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
          const value = getMetricTypeValue(data.values, chartInfo.param.statistics || 'last')
          const showValue = chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(value, null, -1, 2)
          // const mapping = this.selectTableMapping(value, chartInfo.param.valueMapping)
          data.$value = value
          data.values = value
          data.showValue = showValue
          data.$legend = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex)
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
              const rowValue = row.display[column.title + 'display']
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
        obj[column.title + 'display'] = ''
        if (/\{\{.+\}\}/.test(column.display)) {
          const labelValue = column.display.replace(/(\{\{.+?\}\})/g, function (i) {
            const label = i.substr(i.indexOf('{{') + 2, i.indexOf('}}') - i.indexOf('{{') - 2)
            let value = null
            if (lodash.get(params, label)) {
              value = lodash.get(params, label)
              if (label.indexOf('$value') !== -1) {
                value = chartDataFormat.getUnit(column.unit ? column.unit : 2).compute(value, null, -1, 2)
              }
            }
            return value || label
          })
          obj[column.title + 'display'] = labelValue
        } else {
          obj[column.title + 'display'] = column.display
        }
      })
      return obj
    },
    showValueMapping (row, column) {
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
          }
          return value || label
        })
        return labelValue
      } else {
        return display
      }
    },
    tableDataSort (orderBy) {

    }
  },
  mounted () {
    this.chartInfo.loaded &&  this.initChart()
  }
}
</script>

<style scoped>

</style>
