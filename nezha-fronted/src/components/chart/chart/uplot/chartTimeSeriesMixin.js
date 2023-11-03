import { initColor, Incrs } from '@/components/chart/chart/tools'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'
import chartDataFormat from '@/components/chart/chartDataFormat'
import lodash from "lodash";
import {getMetricTypeValue} from "@/components/common/js/tools";
export default {
  data () {
    return {
      seriesColor: initColor(),
      incrs: Incrs
    }
  },
  methods: {
    initSeriesData (chartData) { // 处理数据 以及 series
      let time = []
      const seriesData = [] // 返回的数据
      const seriesAll = [ // 返回的 series

      ]
      let chartIndex = 0
      chartData.forEach(series => { // 首先处理时间 对应点没有值（不包括null 则添加undefind）
        series.forEach(item => {
          time.push(...item.values.map(value => value[0]))
        })
      })
      const timeSet = new Set(time)
      time = [...timeSet]
      time = this.$lodash.sortBy(time, function (o) { return o })
      const ObjTime = {}
      time.forEach(item => {
        ObjTime[item] = undefined
      })
      chartData.forEach((series, expressionIndex) => { // 首先处理时间 对应点没有值（不包括null 则添加undefind）
        series.forEach((item, seriesIndex) => {
          let seriesObjTime = {}
          // 若需要统计，处理统计数据
          const statisticsTypes = this.chartInfo.param.legend ? this.chartInfo.param.legend.values : ''
          let statistics = []
          if (!lodash.isEmpty(statisticsTypes)) {
            statistics = statisticsTypes.map(type => {
              return { type, value: getMetricTypeValue(item.values, type) }
            })
          }
          item.statistics = statistics
          item.values.forEach(value => {
            seriesObjTime[value[0]] = value[1]
          })
          // 处理统计数据 statistics
          seriesObjTime = {
            ...ObjTime,
            ...seriesObjTime
          }
          seriesData.push(Object.keys(seriesObjTime).map(time => seriesObjTime[time]))
          seriesAll.push(this.renderSeries(item, expressionIndex, seriesIndex, chartIndex))
          chartIndex++
        })
      })
      seriesData.unshift(time)
      return {
        seriesData,
        seriesAll
      }
    },
    renderSeries (series, expressionIndex, dataIndex, chartIndex) {
      const leftUnit = this.chartInfo.unit
      const leftUnitCompute = chartDataFormat.getUnit(leftUnit)
      const decimals = this.chartInfo.param.decimals || 2
      if (chartIndex > 19) {
        this.seriesColor.push(randomcolor())
      }
      const legend = this.handleLegend(this.chartInfo, series, expressionIndex, dataIndex, chartIndex)
      console.log(legend)
      const obj = {
        name: series.elements.name + JSON.stringify(series.metric),
        label: series.elements.name + JSON.stringify(series.metric),
        class: series.elements.name + JSON.stringify(series.metric),
        scale: 'left', // right
        values: (u, v) => series.elements.name + JSON.stringify(series.metric),
        stroke: this.seriesColor[chartIndex],
        width: 1 / devicePixelRatio
      }
      const name = legend.name
      const alias = legend.alias
      const statistics = series.statistics
      this.legends.push({ name, alias, statistics, color: this.seriesColor[chartIndex] })
      return obj
    }
  }
}
