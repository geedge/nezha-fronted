<template>
  <div class="chart-stat" :style="{background:stat.mapping ? stat.mapping.color.bac : false}">
    <span v-if="stat.mapping" :style="{color:stat.mapping.color.text}">
        {{handleDisplay(stat.mapping.display, { ...stat.label, value: stat.showValue })}}
    </span>
    <span v-else>{{stat.showValue}}</span>
  </div>
</template>

<script>
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import { getMetricTypeValue } from '@/components/common/js/tools'
import chartDataFormat from '@/components/charts/chartDataFormat'

export default {
  name: 'chart-stat',
  mixins: [chartMixin, chartFormat],
  data () {
    return {
      stat: {
        value: '',
        showValue: '',
        label: {},
        mapping: {

        }
      }
    }
  },
  methods: {
    initChart () {
      console.log(this.chartInfo, this.chartData)
      this.stat = this.initStatData(this.chartInfo, this.chartData)
      console.log(this.stat)
    },
    initStatData (chartInfo, originalDatas) {
      const stat = {
        value: '',
        showValue: '',
        label: {},
        mapping: {

        }
      }
      originalDatas.forEach((originalData, expressionIndex) => {
        originalData.forEach((data, dataIndex) => {
          stat.value = getMetricTypeValue(data.values, chartInfo.param.statistics)
          stat.label = data.metric
          stat.showValue = chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(stat.value, null, -1, 2)
          stat.mapping = this.selectMapping(stat.value, chartInfo.param.valueMapping)
        })
      })
      return stat
    }
  },
  mounted () {
    this.initChart()
  }
}
</script>

<style scoped>

</style>
