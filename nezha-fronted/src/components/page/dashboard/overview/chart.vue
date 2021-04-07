<template>
  <div class="chart-room" @mouseenter="mouseEnterChart" @mouseleave="mouseLeaveChart" ref="chartRoom" :style="{overflow: chartType == 'map' ? 'hidden' : ''}" :id="chartType == 'map' ? 'map' : ''">
    <loading  ref="loading"></loading>
    <div class="showMore" v-if="legendAll.length !== legend.length"><i class="nz-icon nz-icon-jinggao"></i>{{$t("dashboard.panel.moreTitle")}} <span class="moreChart" @click="showMore">{{$t("dashboard.panel.showAll")+legendAll.length}}</span></div>
    <div class="chart-header">{{chartTitle}}</div>

    <div class="chart-body" ref="chartBody" :id="chartId" ></div>
    <div class="chart-no-data" v-show="noData">No Data</div>

    <div class="legend-container legend-container-screen" id="legendArea" ref="legendArea" v-show="legend.length>0">
      <div v-for="(item, index) in legend" :title="item.alias?item.alias:item.name"  @click="clickLegend(item.name,index)" class="legend-item" :class="{'ft-gr':item.isGray}" :key="'legend_' + item.name+'_'+index">
        <span class="legend-shape" :style="{background:(item.isGray?'#D3D3D3':getBgColor(index))}"></span>{{item.alias?item.alias:item.name}}
      </div>
    </div>

  </div>
</template>

<script>
import * as echarts from 'echarts'
import chartDataFormat from '../../../charts/chartDataFormat'
import loading from '../../../common/loading'
import chartConfig from './chartConfig'
import bus from '../../../../libs/bus'
import EleResize from '../../../common/js/divResize'
import { randomcolor } from '../../../common/js/radomcolor/randomcolor'
// import * as mapGeoJson from "../../../common/js/world";

export default {
  name: 'chart',
  components: {
    loading: loading
  },
  props: {
    name: { type: String, default: 'chart' },
    unit: { type: Number, default: 5 },
    chartTitle: { type: String },
    showToolbox: { type: Boolean, default: true },
    chartType: { type: String, default: 'line' },
    tooltipFormatter: Function,
    yAxisFormatter: Function,
    map: {},
    axisTooltip: { type: String }, // x/y
    minusTime: {} // 用于比较图表时的时间差值
  },
  data () {
    return {
      chart: null,
      option: null,
      optionSeriesAll: null,
      chartId: this.name + '-' + this.guid() + '-' + new Date().getTime(),
      legend: [],
      legendAll: [],
      colors: chartConfig.getBgColorList(),
      noData: false,
      dataSize: 20
    }
  },
  created () {
    this.option = chartConfig.getOption(this.chartType)
    if (this.chartType === 'ruleBar') {
      this.option.yAxis.position = 'right'
      this.option.yAxis.axisLabel.formatter = function (value) {
        if (value.length > 15) {
          return value.substring(0, 15) + '...'
        } else {
          return value
        }
      }
    }
    if (this.showToolbox == false) {
      // this.option.grid.top = 10;
    }
  },
  methods: {
    modifyOption: function (target, name, obj) {
      if (!this.option) {
        this.option = chartConfig.getOption(this.chartType)
      }
      this.$set(this.option[target], name, obj)
    },
    setLegend: function (legend) {
      this.legendAll = legend
      this.legend = legend.filter((item, index) => index < this.dataSize)
      this.resize()
    },
    getOption: function () {
      return this.chart.getOption()
    },
    setOption: function (option) {
      this.chart.setOption(option)
    },
    setSeries: function (series, legend, legendData) {
      if (!this.chart) {
        this.chartInit()
      }
      this.series = series
      if (this.chartType == 'map') {
        if (this.map) {
          echarts.registerMap(this.map.name, this.map.geoJson)
          chartConfig.setMap(this.map.name)
        } else {
          console.error('map chart need map data')
        }
      }
      if (!this.option) {
        this.option = chartConfig.getOption(this.chartType)
      }
      if (legend && legendData && legendData.length > 0) {
        legend.formatter = function (name) {
          const type = legendData.find(item => {
            return item[0] == name
          })
          return type ? `${name} (${type[1]}%)` : null
        }
        this.$set(this.option, 'legend', legend)
      }

      if (this.chartType == 'map') {
        this.option.geo.regions = []

        const geoObj = this.map.geoJson.geoJson
        geoObj.features.forEach(item => {
          if (item.properties.NAME_0 == 'Kazakhstan') {
            this.option.geo.regions.push({
              name: item.properties.NAME_1,
              itemStyle: { areaColor: '#eee' },
              label: { show: true }
            })
          }
        })

        // const mapRoom = document.querySelector('#map')
        // const roomWidth = mapRoom.offsetWidth
        // const roomHeight = mapRoom.offsetHeight

        const windowWidth = window.innerWidth
        /* const windowHeight = window.innerHeight

          const scaleWidth = roomWidth / 1200
          const scaleHeight = roomHeight / 700 */

        const kazCenter = [67.45, 44]
        if (windowWidth > 2000) {
          this.option.geo.center = kazCenter
          this.option.geo.zoom = 6
        } else if (windowWidth > 1600) {
          this.option.geo.center = [kazCenter[0] * 1.15, kazCenter[1] * 0.93]
          this.option.geo.zoom = 5
        } else {
          this.option.geo.center = [kazCenter[0] * 1.15 * 1.15, kazCenter[1] * 0.93 * 0.93]
          this.option.geo.zoom = 4
        }
      }

      this.modifyOption('tooltip', 'position', this.defaultTooltipPosition)

      if (this.tooltipFormatter) {
        this.modifyOption('tooltip', 'formatter', this.tooltipFormatter)
      } else {
        this.modifyOption('tooltip', 'formatter', this.defaultTooltipFormatter)
      }

      if (this.chartType == 'line' || this.chartType == 'overviewLine') {
        this.option.xAxis.axisLabel.formatter = this.defaultXAxisFormatter
        this.option.toolbox.tooltip.formatter = this.defaultToolBoxFormatter

        if (this.yAxisFormatter) {
          this.option.yAxis.axisLabel.formatter = this.yAxisFormatter
        } else {
          this.option.yAxis.axisLabel.formatter = this.defaultYAxisFormatter
        }
      }
      if (this.series) {
        this.$set(this.option, 'series', this.series)
        this.noData = false
        this.chart.clear()
        this.optionSeriesAll = [...this.option.series]
        if (this.option.series instanceof Array) {
          this.option.series = this.option.series.filter((item, index) => index < this.dataSize)
        }
        this.chart.setOption(this.option)
      } else {
        this.noData = true
        const option = chartConfig.getOption('noData')
        this.chart.clear()
        this.chart.setOption(option)
      }

      // 坐标轴label鼠标悬浮提示
      if (this.axisTooltip) {
        const tooltipDom = document.querySelector('.axis-tooltip')
        this.chart.on('mouseover', (params) => {
          if (params.componentType == this.axisTooltip + 'Axis') {
            tooltipDom.style.display = 'block'
            tooltipDom.innerHTML = params.value
          }
          this.$refs.chartRoom.addEventListener('mousemove', this.chartRoomMouseMove.bind('', event, tooltipDom))
        })
        this.chart.on('mouseout', (params) => {
          if (params.componentType == this.axisTooltip + 'Axis') {
            tooltipDom.style.display = ''
          }
        })
      }
      this.resize()
    },
    chartRoomMouseMove (event, tooltipDom) {
      tooltipDom.style.top = event.pageY + 'px'
      tooltipDom.style.left = event.pageX - 15 + 'px'
    },
    resize () {
      this.$nextTick(() => {
        if (this.chart) {
          let height
          let width
          if (this.chartType == 'map') {
            height = 700
            width = 1200
          } else {
            height = this.$el.clientHeight - document.querySelector('#legendArea').offsetHeight
            width = this.$el.clientWidth
          }
          this.chart.resize({ width: width, height: height })
        }
      })
    },
    mouseEnterChart () {
      if (this.chart && this.showToolbox) {
        this.chart.setOption({
          toolbox: {
            show: true
          }
        })
      }
    },
    mouseLeaveChart () {
      if (this.chart) {
        this.chart.setOption({
          toolbox: {
            show: false
          }
        })
      }
    },
    getBgColor: function (index) {
      const color = this.colors[index]
      return color
    },
    clickLegend (legendName, index) {
      /* 点击legend
          * 1.当前如果是全高亮状态，则全部置灰，只留被点击的legend高亮
          * 2.如果点击的是唯一高亮的legend，则变为全高亮状态
          * 3.否则只改变被点击的legend状态
          * */
      let highlightNum = 0 // 高亮数量
      this.legend.forEach(g => {
        if (!g.isGray) {
          highlightNum++
        }
      })
      const hasGray = highlightNum < this.legend.length // 是否有置灰的
      const curIsGray = this.legend[index].isGray // 当前legend的状态
      const currentIsTheOnlyOneHighlight = !curIsGray && highlightNum === 1 // 当前legend是否是目前唯一高亮的

      const echart = this.chart
      if (echart) {
        if (!hasGray) { // 1.除当前legend外全置灰
          echart.dispatchAction({
            type: 'legendInverseSelect'
          })
          echart.dispatchAction({
            type: 'legendSelect',
            name: legendName
          })
          this.legend = this.legend.map((g, i) => {
            if (i === index) {
              g.isGray = false
            } else {
              g.isGray = true
            }
            return g
          })
        } else if (currentIsTheOnlyOneHighlight) { // 2.全高亮
          echart.dispatchAction({
            type: 'legendAllSelect'
          })
          this.legend = this.legend.map(g => {
            g.isGray = false
            return g
          })
        } else {
          const type = curIsGray ? 'legendSelect' : 'legendUnSelect'
          echart.dispatchAction({
            type: type,
            name: legendName
          })
          const vm = this
          this.$set(this.legend, index, (function () { const legend = vm.legend[index]; legend.isGray = !legend.isGray; return legend }()))
        }
      }
      /* let curIsGrey=this.legend[index].isGray;
          if(this.chart){
            if(curIsGrey){
              this.chart.dispatchAction({
                type: 'legendSelect',
                name: legendName
              });
            }else{
              this.chart.dispatchAction({
                type: 'legendUnSelect',
                name: legendName
              });
            }
            this.$set(this.legend[index],'isGray',!curIsGrey)
          } */
    },
    clickLegend2 (legendName, index) {
      const curIsGrey = this.legend[index].isGray
      if (this.chart) {
        this.legend.forEach((item, i) => {
          const isGrey = item.isGray
          if (index != i) { // 不是当前点击的
            if (!curIsGrey && !isGrey) {
              this.chart.dispatchAction({
                type: 'legendUnSelect',
                name: item.name
              })
              item.isGray = true
            } else if (!curIsGrey && isGrey) {
              this.chart.dispatchAction({
                type: 'legendSelect',
                name: item.name
              })
              item.isGray = false
            } else {
              this.chart.dispatchAction({
                type: 'legendUnSelect',
                name: item.name
              })
              item.isGray = true
            }
          } else { // 当前点击的
            this.chart.dispatchAction({
              type: 'legendSelect',
              name: item.name
            })
            if (item.isGray === true) {
              item.isGray = false
            }
          }
        })
      }
    },
    defaultTooltipPosition: function (point, params, dom, rect, size) {
      dom.style.transform = 'translateZ(0)'
      // 提示框位置
      let x = 0
      let y = 0
      // 当前鼠标位置
      const pointX = point[0]
      const pointY = point[1]
      // 外层div大小
      /* const viewWidth = size.viewSize[0]
        const viewHeight = size.viewSize[1] */
      // 提示框大小
      const boxWidth = size.contentSize[0]
      // const boxHeight = size.contentSize[1]
      const chartDom = document.getElementById(this.chartId)
      if (chartDom) {
        // const parTop = chartDom.offsetTop
        const parLeft = chartDom.offsetLeft

        const parent = chartDom.parentElement
        // const parClientHeight = parent.clientHeight// 可视高度
        const parClientWidth = parent.clientWidth// 可视宽度
        // const parScrollTop = parent.scrollTop
        if ((parClientWidth - pointX - parLeft - 20) >= boxWidth) { // 说明鼠标在左边放不下提示框
          x = pointX + 10
        } else {
          x = pointX - boxWidth
        }
        // if((parClientHeight-pointY-(parTop-parScrollTop)-20)>=boxHeight){//说明鼠标上面放不下提示框
        //   y = pointY+10;
        // }else {
        //   y = pointY-boxHeight;
        // }
        y = pointY + 10
        return [x, y]
      } else {
        x = pointX - boxWidth
        y = pointY + 10
        return [x, y]
      }
    },
    defaultXAxisFormatter: function (value, index) {
      value = bus.computeTimezone(value)
      const tData = new Date(value)
      const month = tData.getMonth() + 1 > 9 ? tData.getMonth() + 1 : '0' + (tData.getMonth() + 1)
      const day = tData.getDate() > 9 ? tData.getDate() : '0' + tData.getDate()
      const hour = tData.getHours() > 9 ? tData.getHours() : '0' + tData.getHours()
      const minute = tData.getMinutes() > 9 ? tData.getMinutes() : '0' + tData.getMinutes()
      return [month, day].join('-') + '\n' +
          [hour, minute].join(':')
    },
    defaultToolBoxFormatter (params) {
      if (params.name === 'stack') {
        return this.$t('overall.toolBox.stack')
      }
      return params.title
    },
    defaultTooltipFormatter: function (params) {
      let minusFlag = true
      let str = '<div>'
      params.forEach((item, i) => {
        const alias = this.queryAlias(i)
        if (i === 0 && alias.indexOf('Previous ') === -1) {
          const value = item.data[0]
          const tData = new Date(value)
          str += [tData.getFullYear(), tData.getMonth() + 1, tData.getDate()].join('-') + ' ' +
              [tData.getHours(), tData.getMinutes(), tData.getSeconds()].join(':')
          str += '<br/>'
        }
        if (alias.indexOf('Previous ') !== -1 && minusFlag) {
          if (i !== 0) {
            str += '<div style="border:1px dashed #333;width:100%;margin-top: 5px"></div>'
          }
          const value = item.data[0] - this.minusTime
          const tData = new Date(value)
          str += [tData.getFullYear(), tData.getMonth() + 1, tData.getDate()].join('-') + ' ' +
              [tData.getHours(), tData.getMinutes(), tData.getSeconds()].join(':')
          str += '<br/>'
          minusFlag = false
        }
        const val = Number(item.data[1])
        str += '<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">'
        str += `<div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${item.color};}'></span>${alias || item.seriesName}:  </div>`
        str += '<div style="padding-left: 10px;">'
        str += chartDataFormat.getUnit(this.unit).compute(val, null, 2)
        const previousItem = params.find((series) => ('Previous ' + item.seriesName) === series.seriesName)
        if (previousItem) {
          str += '<span style="padding-left: 10px; display: inline-block;width: 100px;text-align: right">'
          let previousval = parseFloat(Number(previousItem.data[1]).toFixed(2))
          if (previousval === 0) {
            previousval = Number(item.data[1]).toExponential(2)
          }
          let minusVal = 0
          if (previousval <= val) {
            minusVal = val - previousval
            str += '+'
          } else {
            minusVal = previousval - val
            str += '-'
          }

          str += chartDataFormat.getUnit(this.unit).compute(minusVal, null, 2)
          str += '</span>'
        } else if (alias.indexOf('Previous ') !== -1) {
          str += '<span style="padding-left: 10px; display: inline-block;width: 100px;text-align: right">'
          str += '</span>'
        }
        str += '</div>'

        str += '</div>'
      })
      str += '</div>'
      return str
    },
    queryAlias: function (i) {
      let alias = null
      if (this.legend && this.legend.length > 0) {
        const tempLegend = this.legend.find((item, index) => { return index === i })
        if (tempLegend) {
          alias = tempLegend.alias
        }
      }
      return alias
    },
    defaultYAxisFormatter: function (value, index) {
      const maxValueCopies = this.getMaxValue(this.series, { unit: this.unit })
      const maxValue = maxValueCopies.maxValue
      const copies = maxValueCopies.copies
      let dot = maxValueCopies.dot
      let chartUnit = this.unit
      chartUnit = chartUnit || 2
      const unit = chartDataFormat.getUnit(chartUnit)
      const flag = JSON.stringify(value).length > JSON.stringify(chartDataFormat.Interval(maxValue, copies, unit.type)).length
      if (dot === 0 || flag) {
        dot = 1
      }
      return unit.compute(value, index, -1, dot)
    },
    setRandomColors: function (num) { // 当线条过多，默认颜色数量不够时须使用此方法,num 颜色的数量，通常传递series的length即可
      const colors = []
      for (let i = 0; i < num; i++) {
        colors.push(randomcolor())
      }
      this.colors = Object.assign([], colors)
      this.$set(this.option, 'color', colors)
    },
    startLoading: function () {
      this.$refs.loading.startLoading()
      this.$emit('is-loading', true)
    },
    endLoading: function () {
      this.$refs.loading.endLoading()
      this.$emit('is-loading', false)
    },
    guid () {
      function S4 () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
      }

      return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
    },
    clearChart () {
      if (this.chart) {
        this.chart.clear()
      }
    },
    showMore () { // 显示更多
      this.legend = this.legendAll
      const option = {
        series: this.optionSeriesAll
      }
      this.chart.setOption(option)
      this.chart.resize()
    },
    chartInit () {
      this.chart = echarts.init(document.getElementById(this.chartId))
    },
    getMaxValue (dataArg, chartInfo) {
      let maxValue = 0
      let minValue = 0
      if (chartInfo.unit && dataArg.length > 0) {
        maxValue = 0
        minValue = 0
        for (let j = 0; j < dataArg.length; j++) {
          for (let i = 0; i < dataArg[j].data.length; i++) {
            if (!isNaN(dataArg[j].data[i][1])) {
              maxValue = (maxValue < Number(dataArg[j].data[i][1]) ? Number(dataArg[j].data[i][1]) : maxValue)
              minValue = (minValue > Number(dataArg[j].data[i][1]) ? Number(dataArg[j].data[i][1]) : minValue)
            }
          }
        }
      }
      const chartUnit = chartInfo.unit ? chartInfo.unit : 2
      const unit = chartDataFormat.getUnit(chartUnit)
      minValue = minValue > 0 ? 0 : minValue
      maxValue = maxValue - minValue
      maxValue = chartDataFormat.formatDatas(maxValue, unit.type, 'ceil', unit.ascii)
      let oldValue = maxValue
      let dot = 0
      if (maxValue == 1) {
        dot++
      }
      if (oldValue > 10) {
        while (oldValue > 10) {
          oldValue = oldValue / 10
        }
      } else if (oldValue < 1 && maxValue !== 0) {
        while (oldValue < 1 && oldValue > 0) {
          oldValue = oldValue * 10
          dot++
        }
        maxValue = Math.floor(oldValue) / Math.pow(10, dot)
        dot++
      }
      const copies = chartDataFormat.copies(oldValue, unit.type)
      let oldDot = 2
      if (maxValue <= 1) {
        oldDot = dot > 6 ? 6 : dot
      }
      return {
        maxValue,
        dot,
        copies,
        minValue,
        unit,
        oldDot
      }
    }
  },
  mounted () {
    this.chartInit()
    EleResize.on(this.$el, this.resize, this.chartType)
  },
  watch: {

  },
  beforeDestroy () {
    this.$refs.chartRoom.removeEventListener('mousemove', this.chartRoomMouseMove)
    if (this.chart) {
      this.chart.clear()
      /* this.chart.off('mouseover');
          this.chart.off('mouseout');
          EleResize.off(this.$el, this.resize, this.chartType); */
    }
  }
}
</script>
<!--<style>
 @import "../../../charts/chart.scss";
</style>-->
<style scoped>
  .showMore{
    text-align: center;
    font-size: 12px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
  }
  .nz-icon-jinggao{
    color: rgb(255, 133, 27);
    margin-right: 5px;
    font-size: 14px;
  }
  .moreChart{
    color: rgb(87, 148, 242);
    cursor: pointer;
  }
  .chart-room{
    width: 100%;
    height: 100%;
    position: relative;
  }
  .chart-room .legend-container{
    overflow: auto;
    width: calc(100% - 30px);
    max-height:80px;
    min-height:25px;
    /*height: 80px;*/
    font-size:12px;
    text-align:left;
    left: 10px;
    bottom: 5px;
    line-height: 18px;
    position: absolute;
  }
  .chart-room .legend-container .legend-item{
    text-overflow:ellipsis;
    white-space:nowrap;
    overflow-x:hidden;
    cursor:pointer;
    display:inline-block;
    float:left;
    line-height: 20px;
  }
  .chart-room .ft-gr{
    color:lightgray;
  }
  .chart-room .legend-shape{
    display:inline-block;
    margin-right:5px;
    border-radius:10px;
    width:15px;
    height:5px;
    vertical-align: middle;
  }
</style>
