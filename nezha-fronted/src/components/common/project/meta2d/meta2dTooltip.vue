<template>
  <div class="tooltip-box" style="width: 400px;height: 300px">
    <div v-if="params.titleShow && params.title">{{params.title}}</div>

    <div
      v-if="params.chartType === 'text'"
    >
      {{params.content}}
    </div>
    <panelChart
      v-else
      ref="panelChart"
      :chart-info="chartInfo"
      :show-header="false"
    />
  </div>
</template>

<script>
import panelChart from '@/components/chart/panelChart'
import defaultLineData from '@/components/chart/defaultLineData'
import topoUtil from '@/components/common/project/meta2d/js/topoUtil'

export default {
  name: 'meta2dTooltip',
  props: {
    params: {},
  },
  mixins: [topoUtil],
  computed: {
    queryValues () {
      return this.$store.getters.getQueryValues
    }
  },
  components: {
    panelChart
  },
  data () {
    return {
      chartInfo: { ...defaultLineData, loaded: false }
    }
  },
  mounted () {
    // this.chartInfo.type = this.params.type || 'line'
  },
  watch: {
    params: {
      immediate: true,
      handler (n) {
        console.log(n, this.querysArray)
        this.chartInfo.type = this.params.chartType || 'line'
        const chartData = []
        const elements = []
        const obj = {}
        this.params.legends.forEach(item => {
          const findItem = this.queryValues.find(query => query.name === item.legend && query.parent === item.parent)
          if (findItem) {
            // chartData.push([findItem])
            if (obj[findItem.elements.name]) {
              chartData[obj[findItem.elements.name].index].push(findItem)
            } else {
              chartData.push([findItem])
              obj[findItem.elements.name] = {
                index: chartData.length - 1
              }
              elements.push(findItem.elements)
            }
          }
        })
        console.log(chartData)
        if (chartData.length && this.$refs.panelChart) {
          this.chartInfo.elements = elements
          console.log(elements)
          this.$refs.panelChart.chartData = chartData
          this.$refs.panelChart.loading = false
          this.$nextTick(() => {
            console.log(this.$refs.panelChart)
            console.log(this.$refs.panelChart.$refs.chart)
            console.log(this.$refs.panelChart.$refs.chart.$refs['chart' + this.chartInfo.id])
            this.$refs.panelChart.$refs.chart.$refs['chart' + this.chartInfo.id].initChart()
          })
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
