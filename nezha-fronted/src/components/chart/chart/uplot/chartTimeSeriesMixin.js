import { initColor, Incrs } from '@/components/chart/chart/tools'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'
import chartDataFormat from '@/components/chart/chartDataFormat'
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
      chartData.forEach(series => { // 首先处理时间 对应点没有值（不包括null 则添加undefind）
        series.forEach(item => {
          let seriesObjTime = {}
          item.values.forEach(value => {
            seriesObjTime[value[0]] = value[1]
          })
          // 处理统计数据 statistics
          seriesObjTime = {
            ...ObjTime,
            ...seriesObjTime
          }
          console.log(seriesObjTime, seriesObjTime)
          seriesData.push(Object.keys(seriesObjTime).map(time => seriesObjTime[time]))
          seriesAll.push(this.renderSeries(item, chartIndex))
          chartIndex++
        })
      })
      seriesData.unshift(time)
      return {
        seriesData,
        seriesAll
      }
    },
    renderSeries (series, chartIndex) {
      const leftUnit = this.chartInfo.unit
      const leftUnitCompute = chartDataFormat.getUnit(leftUnit)
      const decimals = this.chartInfo.param.decimals || 2
      if (chartIndex > 19) {
        this.seriesColor.push(randomcolor())
      }
      const obj = {
        name: series.elements.name + JSON.stringify(series.metric),
        label: series.elements.name + JSON.stringify(series.metric),
        class: series.elements.name + JSON.stringify(series.metric),
        scale: 'left', // right
        // value: (u, v) => v == null ? null : (!v ? v : leftUnitCompute.compute(v, null, -1, decimals)),
        values: (u, v) => series.elements.name + JSON.stringify(series.metric),
        stroke: this.seriesColor[chartIndex],
        width: 1 / devicePixelRatio
      }
      const name = series.elements.name + JSON.stringify(series.metric)
      const alias = series.elements.name + JSON.stringify(series.metric)
      const statistics = series.statistics
      this.legends.push({ name, alias, statistics, color: this.seriesColor[chartIndex] })
      return obj
    }
  }
}
