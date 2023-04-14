<template>
  <div class="tooltip-box" style="width: 400px;height: 300px;display: flex;flex-direction: column">
    <div v-if="params.titleShow && params.title" style="margin-bottom: 5px" class="tooltip-box-title">{{params.title}}</div>

    <div
      v-if="params.chartType === 'text'"
    >
      {{params.content}}
    </div>
    <panelChart
      v-else
      style="flex: 1"
      ref="panelChart"
      :chart-info="chartInfo"
      :show-header="false"
    />
  </div>
</template>

<script>
import defaultLineData from '@/components/chart/defaultLineData'
import topoUtil from '@/components/common/project/meta2d/js/topoUtil'

export default {
  name: 'meta2dTooltip',
  props: {
    params: {},
    meta2dId: {}
  },
  mixins: [topoUtil],
  computed: {
    queryValues () {
      return this.$store.getters.getQueryValues
    }
  },
  components: {
    panelChart: () => import('@/components/chart/panelChart')
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
        if (this.params.chartType == 'text') {
          return
        }
        this.chartInfo.type = this.params.chartType || 'line'
        this.chartInfo.id = this.meta2dId + 'meta2DTooltip'
        const chartData = []
        const elements = []
        const obj = {}
        this.params.legends.forEach(item => {
          const findItem = this.queryValues.find(query => query.name === item.legend && query.parent === item.parent)
          // if (findItem) {
          //   // chartData.push([findItem])
          //   if (obj[findItem.elements.name]) {
          //     chartData[obj[findItem.elements.name].index].push(findItem)
          //   } else {
          //     chartData.push([findItem])
          //     obj[findItem.elements.name] = {
          //       index: chartData.length - 1
          //     }
          //     elements.push(findItem.elements)
          //   }
          // }
          if (findItem) {
            chartData.push([findItem])
            const element = {
              ...findItem.elements
            }
            if (item.alias) {
              element.legend = item.alias
            }
            elements.push(element)
          }
        })
        console.log(chartData)
        if (chartData && this.$refs.panelChart) {
          this.chartInfo.elements = elements
          this.$refs.panelChart.chartData = chartData
          this.$refs.panelChart.loading = false
          this.$nextTick(() => {
            this.$refs.panelChart.$refs.chart.$refs['chart' + this.chartInfo.id].chartLoading = true
            this.$refs.panelChart.$refs.chart.$refs['chart' + this.chartInfo.id].initChart()
            this.$refs.panelChart.$refs.chart.$refs['chart' + this.chartInfo.id].resize()
          })
        }
      }
    }
  }
}
</script>
