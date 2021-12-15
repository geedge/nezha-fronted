<template>
  <div class="nz-table2" style="height: 100%;padding: 0 10px 10px 10px;box-sizing: border-box">
    <el-table
      ref="dataTable"
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
        sortable
      >
        <template slot="header">
          <span class="data-column__span">{{col.title}}</span>
        </template>
        <template slot-scope="scope" :column="col">
          {{scope.row.values}}
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

export default {
  name: 'chart-table',
  mixins: [chartMixin, chartFormat],
  data () {
    return {
      tableData: [],
      columns: []
    }
  },
  methods: {
    initChart () {
      console.log(this.chartInfo, this.chartData)
      this.columns = this.chartInfo.param.columns
      const data = this.initTableData(this.chartInfo, this.chartData)
      const arr = []
      console.log(data)
      Object.keys(data).forEach(key => {
        Object.keys(data[key]).forEach(keys => {
          console.log(data[key][keys])
          arr.push(data[key][keys])
        })
      })
      this.tableData = arr
      this.$refs.dataTable.doLayout()
      console.log(data)
    },
    initTableData (chartInfo, originalDatas) {
      let colorIndex = 0
      const returnData = {}
      const arr = chartInfo.param.indexs.split(',')
      console.log(returnData)
      originalDatas.forEach((originalData, expressionIndex) => {
        const key = chartInfo.elements[expressionIndex].name || expressionIndex
        originalData.forEach((data, dataIndex) => {
          data.$labels = data.metric
          const value = getMetricTypeValue(data.values, chartInfo.param.statistics)
          const showValue = chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(value, null, -1, 2)
          const mapping = this.selectTableMapping(value, chartInfo.param.valueMapping)
          data.values = value
          data.showValue = showValue
          data.mapping = mapping
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
          if (data.keys && !returnData[data.keys]) {
            returnData[data.keys] = {}
            returnData[data.keys][key] = data
          }
          if (data.keys && !returnData[data.keys][key]) {
            returnData[data.keys][key] = data
          }
          colorIndex++
        })
      })
      return returnData
    },
    selectTableMapping () {

    },
    tableDataSort (orderBy) {

    },
  },
  mounted () {
    this.initChart()
  }
}
</script>

<style scoped>

</style>
