<template>
  <div ref="legendArea" class='legend-container'>
    <!-- 带统计的是table形式 -->
    <template v-if="isStatistics">
      <div class="legend--table">
        <div class="legend--table-row table-header">
          <div class="legend--table-cell"></div>
          <div v-for="statistics in chartInfo.param.legend.values" :key="statistics" class="legend--table-cell">
            <span v-if="statisticsList.find(key=>key.value === statistics)" :title="$t(statisticsList.find(key=>key.value === statistics).label)">{{$t(statisticsList.find(key=>key.value === statistics).label)}}</span>
            <span v-else>--</span>
          </div>
        </div>
        <!-- 左y轴legend -->
        <div
          v-for="(item, index) in legends"
          :key="index"
          v-show="!isTimeSeries||series[index].yAxisIndex!=1"
          :class="{'row--inactive': isGrey[index]}"
          class="legend--table-row"
          @click="clickLegend(item.name, index)"
          @mouseenter="hoverLegend(item.name, index,'highlight')"
          @mouseleave="hoverLegend(item.name, index,'downplay')"
        >
          <div :title="item.alias ? item.alias : item.name" class="legend--table-cell">
            <i v-if="isTimeSeries&&series[index].yAxisIndex==0" :style="{color: item.color}" class="yAxis-icon nz-icon nz-icon-zuozongzhou"></i>
            <span v-else :style="{background: item.color}" class="legend-shape"></span>
            <span :title="item.alias ? item.alias : item.name">{{item.alias ? item.alias : item.name}}</span>
            <i class="nz-icon nz-icon-override" @click.stop="onCopy(item.alias ? item.alias : item.name)" :title="$t('overall.copyText')"></i>
          </div>
          <div v-for="(statistics, index) in item.statistics" :key="index" :class="{'legend-item--inactive': isGrey[index]}" class="legend--table-cell">{{(keepTwoDecimalFull(statistics.value))}}</div>
        </div>
        <!-- 右y轴legend -->
        <div
          v-for="(item, index) in legends"
          :key="index+'right'"
          v-show="isTimeSeries&&series[index].yAxisIndex==1"
          :class="{'row--inactive': isGrey[index]}"
          class="legend--table-row"
          @click="clickLegend(item.name, index)"
          @mouseenter="hoverLegend(item.name, index,'highlight')"
          @mouseleave="hoverLegend(item.name, index,'downplay')"
        >
          <div :title="item.alias ? item.alias : item.name" class="legend--table-cell">
            <i v-if="isTimeSeries&&series[index].yAxisIndex==1" :style="{color: item.color}" class="yAxis-icon nz-icon nz-icon-youzongzhou"></i>
            <span v-else :style="{background: item.color}" class="legend-shape"></span>
            <span :title="item.alias ? item.alias : item.name">{{item.alias ? item.alias : item.name}}</span>
            <i class="nz-icon nz-icon-override" @click.stop="onCopy(item.alias ? item.alias : item.name)" :title="$t('overall.copyText')"></i>
          </div>
          <div v-for="(statistics, index) in item.statistics" :key="index" :class="{'legend-item--inactive': isGrey[index]}" class="legend--table-cell">{{(keepTwoDecimalFull(statistics.value, 'right'))}}</div>
        </div>
      </div>
    </template>
     <!-- 否则是普通形式 -->
    <template v-else>
      <!-- 左y轴legend -->
      <div
        v-for="(item, index) in legends"
        :key="index"
        v-show="!isTimeSeries||series[index].yAxisIndex!=1"
        :class="{'legend-item--inactive': isGrey[index]}"
        :title="item.alias ? item.alias : item.name"
        class="legend-item"
        @click="clickLegend(item.name, index)"
        @mouseenter="hoverLegend(item.name, index,'highlight')"
        @mouseleave="hoverLegend(item.name, index,'downplay')"
      >
        <i v-if="isTimeSeries&&series[index].yAxisIndex==0" :style="{color: item.color}" class="yAxis-icon nz-icon nz-icon-zuozongzhou"></i>
        <span v-else :style="{background: item.color}" class="legend-shape"></span>
        <span>{{item.alias ? item.alias : item.name.split('-')[0]}}</span>
        <i class="nz-icon nz-icon-override" @click.stop="onCopy(item.alias ? item.alias : item.name.split('-')[0])" :title="$t('overall.copyText')"></i>
      </div>
      <!-- 右y轴legend -->
      <div
        v-for="(item, index) in legends"
        :key="index+'right'"
        v-show="isTimeSeries&&series[index].yAxisIndex==1"
        :class="{'legend-item--inactive': isGrey[index]}"
        :title="item.alias ? item.alias : item.name"
        class="legend-item"
        @click="clickLegend(item.name, index)"
        @mouseenter="hoverLegend(item.name, index,'highlight')"
        @mouseleave="hoverLegend(item.name, index,'downplay')"
      >
        <i v-if="isTimeSeries&&series[index].yAxisIndex==1" :style="{color: item.color}" class="yAxis-icon nz-icon nz-icon-youzongzhou"></i>
        <span v-else :style="{background: item.color}" class="legend-shape"></span>
        <span>{{item.alias ? item.alias : item.name.split('-')[0]}}</span>
        <i class="nz-icon nz-icon-override" @click.stop="onCopy(item.alias ? item.alias : item.name.split('-')[0])" :title="$t('overall.copyText')"></i>
      </div>
    </template>
  </div>
</template>

<script>
import lodash from 'lodash'
import { getChart } from '@/components/common/js/common'
import chartDataFormat from '@/components/chart/chartDataFormat'
import { statisticsList } from '@/components/common/js/constants'
import * as chart from 'echarts'
import renderChart from '@/components/chart/renderChart'
export default {
  name: 'chartLegend',
  mixins: [renderChart],
  props: {
    chartInfo: Object,
    chartData: Array,
    legends: Array,
    isFullscreen: Boolean,
    series: Array
  },
  data () {
    return {
      statisticsList,
      isGrey: [],
      legendDefaultCount: 20, // 初始显示的legend条数
      showLegends: [], // 要显示的legend；若legend数量过多，初始时这个数据里只有前20条legend
      chartId: ''
    }
  },
  computed: {
    isStatistics () {
      return !lodash.isEmpty(this.chartInfo.param.legend.values)
    },
    // timeSeries类型图表联动
    isConnect () {
      return this.$store.state.panel.isConnect
    },
    isTimeSeries () {
      return this.chartInfo.type === 'line' || this.chartInfo.type === 'area' || this.chartInfo.type === 'point'
    }
  },
  methods: {
    clickLegend (legendName, index) {
      /* 点击legend
          * 1.当前如果是全高亮状态，则全部置灰，只留被点击的legend高亮
          * 2.如果点击的是唯一高亮的legend，则变为全高亮状态
          * 3.否则只改变被点击的legend状态
          * */
      let highlightNum = 0 // 高亮数量
      this.isGrey.forEach(g => {
        if (!g) {
          highlightNum++
        }
      })
      const hasGrey = highlightNum < this.isGrey.length // 是否有置灰的
      const curIsGrey = this.isGrey[index] // 当前legend的状态
      const currentIsTheOnlyOneHighlight = !curIsGrey && highlightNum === 1 // 当前legend是否是目前唯一高亮的
      const echarts = getChart(this.chartId)
      if (this.chartInfo.type === 'bar') {
        this.clickLegendBar(legendName, index, hasGrey, curIsGrey, currentIsTheOnlyOneHighlight)
        return
      }
      if (this.chartInfo.type === 'treemap') {
        this.clickLegendTreemap(legendName, index, hasGrey, curIsGrey, currentIsTheOnlyOneHighlight)
        return
      }
      if (this.chartInfo.type === 'pie' || this.chartInfo.type === 'doughnut' || this.chartInfo.type === 'rose') {
        this.clickLegendD3(legendName, index, hasGrey, curIsGrey, currentIsTheOnlyOneHighlight)
        return
      }
      if (echarts) {
        if (!hasGrey) { // 1.除当前legend外全置灰
          echarts.series.forEach((seriesItem, sindex) => {
            if (sindex > 0) {
              echarts.setSeries(sindex, { show: false, focus: false })
            }
          })
          echarts.setSeries(index + 1, { show: true, focus: false })
          this.isGrey = this.isGrey.map((g, i) => i !== index)
        } else if (currentIsTheOnlyOneHighlight) { // 2.全高亮
          echarts.series.forEach((seriesItem, sindex) => {
            if (sindex > 0) {
              echarts.setSeries(sindex, { show: true, focus: false })
            }
          })
          this.isGrey = this.isGrey.map(() => false)
        } else {
          echarts.setSeries(index + 1, { show: true, focus: false })
          this.$set(this.isGrey, index, !this.isGrey[index])
        }
        this.$emit('legendChange', this.isGrey)
      }
    },
    clickLegendBar (legendName, index, hasGrey, curIsGrey, currentIsTheOnlyOneHighlight) {
      const echarts = getChart(this.chartId)
      if (echarts) {
        let data = []
        const xAxis = {
          data: []
        }
        data = lodash.cloneDeep(this.series)
        if (!hasGrey) { // 1.除当前legend外全置灰
          this.isGrey = this.isGrey.map((g, i) => i !== index)
        } else if (currentIsTheOnlyOneHighlight) { // 2.全高亮
          this.isGrey = this.isGrey.map(() => false)
        } else { // 对应高亮
          this.$set(this.isGrey, index, !this.isGrey[index])
        }
        data[0].data = data[0].data.filter((item, i) => !this.isGrey[i])
        xAxis.data = data[0].data.map(item => {
          if (this.chartInfo.param.text == 'all' || this.chartInfo.param.text == 'legend') {
            return item.name
          } else {
            return ''
          }
        })
        echarts.setOption({
          series: data,
          xAxis: {
            data: xAxis.data
          }
        })
      }
    },
    clickLegendTreemap (legendName, index, hasGrey, curIsGrey, currentIsTheOnlyOneHighlight) {
      const echarts = getChart(this.chartId)
      if (echarts) {
        let data = []
        const xAxis = {
          data: []
        }
        data = lodash.cloneDeep(this.series)
        if (!hasGrey) { // 1.除当前legend外全置灰
          this.isGrey = this.isGrey.map((g, i) => i !== index)
        } else if (currentIsTheOnlyOneHighlight) { // 2.全高亮
          this.isGrey = this.isGrey.map(() => false)
        } else { // 对应高亮
          this.$set(this.isGrey, index, !this.isGrey[index])
        }
        data[0].data = data[0].data.filter((item, i) => !this.isGrey[i])
        echarts.setOption({
          series: data
        })
      }
    },
    clickLegendD3 (legendName, index, hasGrey, curIsGrey, currentIsTheOnlyOneHighlight) {
      if (!hasGrey) { // 1.除当前legend外全置灰
        this.isGrey = this.isGrey.map((g, i) => i !== index)
      } else if (currentIsTheOnlyOneHighlight) { // 2.全高亮
        this.isGrey = this.isGrey.map(() => false)
      } else { // 对应高亮
        this.$set(this.isGrey, index, !this.isGrey[index])
      }
      this.$emit('clickLegendD3', this.isGrey)
    },
    hoverLegend (legendName, index, type) {
      // legend 已经取消显示，鼠标悬浮，不开启 高亮效果
      if (this.isGrey[index]) {
        return false
      }
      if (this.chartInfo.type === 'pie' || this.chartInfo.type === 'doughnut' || this.chartInfo.type === 'rose') {
        this.$emit('hoverLegendD3', legendName, index, type)
      } else if (this.isTimeSeries) {
        const echarts = getChart(this.chartId)
        if (type == 'highlight') {
          echarts.setSeries(index + 1, { focus: true })
        } else {
          echarts.setSeries(null, { focus: true })
        }
      } else {
        getChart(this.chartId) && getChart(this.chartId).dispatchAction({
          type: type,
          name: legendName
        })
      }
    },
    // 四舍五入保留2位小数（不够位数，则用0替补）
    keepTwoDecimalFull (num, type = 'left') {
      let chartUnit = this.chartInfo.unit
      if (type === 'right') {
        chartUnit = this.$lodash.get(this, 'chartInfo.param.rightYAxis.unit', 2)
      }
      let result = parseFloat(num)
      if (isNaN(result)) {
        return '--'
      }
      result = chartDataFormat.getUnit(chartUnit || 2).compute(result, null, -1, 2)
      return result
    },
    getMaxValue (dataArg, chartInfo, params) {
      if (params && params.max && params.min) {
        const a = params.max
        if (params.max < params.min) {
          params.max = params.min
          params.min = a
        }
      }
      let maxValue = 0
      let minValue = 0
      if (dataArg.length > 0) {
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
      if (params) {
        if (params.max) {
          maxValue = params.max
        }
        if (params.min) {
          minValue = params.min
        }
      }
      const chartUnit = chartInfo.unit ? chartInfo.unit : 2
      const unit = chartDataFormat.getUnit(chartUnit)
      minValue = minValue > 0 ? 0 : minValue
      if (maxValue < 0) {
        maxValue = Math.abs(maxValue)
      }
      if (Math.abs(minValue) > Math.abs(maxValue)) {
        maxValue = Math.abs(minValue)
      }
      maxValue = maxValue - minValue
      maxValue = chartDataFormat.formatDatas(maxValue, unit, 'ceil', unit.ascii)
      let oldValue = maxValue
      if (maxValue < 0) {
        oldValue = Math.abs(maxValue)
      }
      if (minValue < 0) {
        oldValue = Math.abs(maxValue - minValue)
      }
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
  watch: {
    legends (n) {
      this.isGrey = n.map(() => false)
    }
  },
  mounted () {
    this.chartId = `${this.chartInfo.id}${this.isFullscreen ? '-fullscreen' : ''}`
  }
}
</script>
