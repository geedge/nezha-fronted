<template>
  <div class="chart-gauge-box" :ref="'chart-gauge-box' + chartInfo.id">
    <div
      v-for="(item,index) in gaugeData" :key="index"
      class="chart-gauge-item"
      :style="{height:item.height+'px',width:item.width + 'px'}"
    >
      <div
        :id="isFullscreen?('chart-gauge-screen-' + chartInfo.id + '-' + index):('chart-gauge-' + chartInfo.id + '-' + index)"
        class="chart-gauge-content"
      ></div>
      <div
        v-if="item.height > 48 && chartInfo.param &&( chartInfo.param.text === 'legend' || chartInfo.param.text === 'all' )"
        class="chart-gauge-legend"
      >
        {{item.alias}}
      </div>
    </div>
  </div>
</template>

<script>
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import { getMetricTypeValue } from '@/components/common/js/tools'
import chartDataFormat from '@/components/chart/chartDataFormat'
import * as echarts from 'echarts'
import lodash from 'lodash'
import { initColor } from '@/components/chart/chart/tools'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'

export default {
  name: 'chart-gauge',
  mixins: [chartMixin, chartFormat],
  data () {
    return {
      gaugeData: [],
      boxWidth: 0,
      boxHeight: 0,
      boxPadding: 5,
      chartInstances: [],
      timer: null
    }
  },
  methods: {
    initChart () {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
      this.timer = setTimeout(() => {
        this.initGaugeData(this.chartInfo, this.chartData).then(() => {
          this.getLayout().then(layout => {
            this.renderGauge(layout).then(() => {
              this.gaugeChartInit()
            })
          })
        })
      }, 200)
    },
    initGaugeData (chartInfo, originalDatas) {
      this.gaugeData = []
      this.isInit = false
      const decimals = this.chartInfo.param.decimals || 2
      this.isNoData = true
      return new Promise(resolve => {
        let colorIndex = 0
        originalDatas.forEach((originalData, expressionIndex) => {
          originalData.forEach((data, dataIndex) => {
            this.isNoData = false
            const gauge = {
              value: '',
              showValue: '',
              label: {},
              width: '',
              height: '',
              legend: '',
              oldValue: '',
              mapping: {

              }
            }
            const legend = this.handleLegend(chartInfo, data, expressionIndex, dataIndex, colorIndex)
            gauge.value = getMetricTypeValue(data.values, chartInfo.param.statistics || 'last')
            gauge.max = chartInfo.param.max || 100
            gauge.min = chartInfo.param.min || 0
            if (gauge.min === gauge.max) {
              gauge.min = gauge.max / 2
            }
            gauge.label = data.metric
            gauge.legend = legend.alias
            gauge.label.legend = gauge.legend
            gauge.name = legend.name
            gauge.alias = legend.alias
            gauge.showValue = chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(gauge.value, null, -1, decimals)
            // gauge.value = gauge.showValue
            gauge.mapping = this.selectMapping(gauge.value, chartInfo.param.valueMapping, chartInfo.param.enable && this.chartInfo.param.enable.valueMapping)
            this.gaugeData.push(gauge)
            colorIndex++
          })
        })
        this.$emit('chartIsNoData', this.isNoData)
        resolve()
      })
    },
    getLayout () {
      this.boxWidth = this.$refs['chart-gauge-box' + this.chartInfo.id].offsetWidth - 2 * this.boxPadding
      this.boxHeight = this.$refs['chart-gauge-box' + this.chartInfo.id].offsetHeight - 2 * this.boxPadding
      return new Promise(resolve => {
        let rateMax = 0
        let col = 0
        let row = 0
        for (let i = 1; i <= this.gaugeData.length; i++) {
          const cols = Math.ceil(this.gaugeData.length / i)
          const w = this.boxWidth / i
          const h = this.boxHeight / cols
          const rate = w > h ? h / w : w / h
          if (rate > rateMax) {
            rateMax = rate
            col = cols
            row = i
          }
        }
        if (this.gaugeData.length) {
          while (col * row >= this.gaugeData.length) { // 避免出现空白
            row--
          }
        }
        row++
        if (col === 1 || row === 1) { // 行 或 列有一个为1时 需要调换位置 显示才会好看
          const temp = col
          col = row
          row = temp
        }
        resolve({ col, row })
      })
    },
    renderGauge (layout) {
      return new Promise(resolve => {
        const width = this.boxWidth / layout.col
        const height = this.boxHeight / layout.row
        const integer = Math.floor(this.gaugeData.length / layout.col)
        const remainder = this.gaugeData.length % layout.col
        const specialIndex = integer * layout.col
        const specialWidth = this.boxWidth / remainder
        this.gaugeData.forEach((item, index) => {
          item.height = height
          if (remainder && index >= specialIndex) {
            item.width = specialWidth
          } else {
            item.width = width
          }
        })
        resolve()
      })
    },
    gaugeChartInit () {
      this.chartInstances.forEach(item => {
        if (item) {
          item.dispose()
        }
      })
      this.chartInstances = []
      const self = this
      this.gaugeData.forEach((item, index) => {
        const chartId = this.isFullscreen ? 'chart-gauge-screen-' : 'chart-gauge-'
        const myChart = echarts.init(document.getElementById(chartId + this.chartInfo.id + '-' + index))
        const option = lodash.cloneDeep(this.chartOption)
        // option.tooltip = {}
        option.series[0].data.push(item)
        option.series[0].max = item.max
        option.series[0].detail = {
          fontSize: 24,
          fontWeight: 'bolder',
          offsetCenter: [0, '20%'],
          formatter: (params) => {
            let showValue = chartDataFormat.getUnit(self.chartInfo.unit ? self.chartInfo.unit : 2).compute(params, null, -1, 2).trim()
            if (item.mapping) {
              showValue = self.handleDisplay(item.mapping.display, { ...item.label, value: showValue })
            }
            let str = ''
            if (this.chartInfo.param.text === 'all' || this.chartInfo.param.text === 'value' || !this.chartInfo.param.text) {
              str += showValue
            }
            if (this.chartInfo.param.text === 'none' || this.chartInfo.param.text === 'legend') {
              str += ''
            }
            str += ''
            return str
          },
          color: lodash.get(item, 'mapping.color.text', 'auto')
        }
        if (index < 20) {
          option.series[0].itemStyle = {
            color: lodash.get(item, 'mapping.color.bac', this.colorList[index])
          }
        } else {
          option.series[0].itemStyle = {
            color: lodash.get(item, 'mapping.color.bac', randomcolor())
          }
        }
        option.tooltip.formatter = this.formatterFunc
        if (navigator.userAgent.match(/Mobi/i) ||
          navigator.userAgent.match(/Android/i) ||
          navigator.userAgent.match(/iPhone/i)) {
          option.tooltip.confine = true
          option.tooltip.appendToBody = false
          delete option.tooltip.position
        }
        // option.tooltip.position = this.formatterFunc
        option.series[0].min = item.max == item.min ? 0 : item.min
        myChart.setOption(option)
        this.chartInstances.push(myChart)
      })
    },
    gaugeChartResize () {
      this.chartInstances.forEach(item => {
        if (item && item.resize) {
          item.resize()
        }
      })
    },
    resize () {
      setTimeout(() => {
        this.getLayout().then(layout => {
          this.renderGauge(layout).then(() => {
            this.gaugeChartResize()
          })
        })
      })
    },
    formatterFunc: function (params, ticket, callback) {
      const self = this
      return `<div>
                    <div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;  min-width: 150px; max-width: 600px; line-height: 18px; font-size: 14px;">
                        <div class="tooltip-title" style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;margin-bottom: 5px">${params.data.alias}</div>
                        <div style="font-size:12px;display:flex;justify-content: space-between;">
                            <div>value</div>
                            <div>
                              <div style="display: ${params.data.mapping && params.data.mapping.icon ? 'inline-block' : 'none'}">
                                <i class="${params.data.mapping && params.data.mapping.icon}" style="color: ${params.data.mapping && params.data.mapping.color && params.data.mapping.color.icon}"></i>
                              </div>
                              <div style="display: ${params.data.mapping && params.data.mapping.display ? 'none' : 'inline-block'}">${params.data.showValue}</div>
                              <div style="display: ${params.data.mapping && params.data.mapping.display ? 'inline-block' : 'none'}">${self.handleDisplay(params.data.mapping.display, { ...params.data.labels, value: params.data.showValue })}</div>
                            </div>
                        </div>
                    </div>
                </div>
               `
    }
  },
  mounted () {
    this.chartOption.color || (this.chartOption.color = initColor(20))
    this.colorList = this.chartOption.color
    this.chartInfo.loaded && this.initChart()
  },
  beforeDestroy () {
    this.chartInstances.forEach(item => {
      if (item && item.dispose) {
        item.dispose()
      }
    })
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
}
</script>
