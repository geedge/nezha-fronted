<template>
  <div class="nz-chart">
    <loading :loading="loading"></loading>
    <chart-no-data v-if="isNoData"></chart-no-data>
    <template v-else>
      <chart-time-series
        v-if="isTimeSeries(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
      ></chart-time-series>
      <chartHexagon
        :ref="'chart'+chartInfo.id"
        v-if="isHexagonFigure(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
      ></chartHexagon>
    </template>
  </div>
</template>

<script>
import loading from '@/components/common/loading'
import chartAssetInfo from './chart/chartAssetInfo'
import chartBar from './chart/chartBar'
import chartClock from './chart/chartClock'
import chartDiagram from './chart/chartDiagram'
import chartEndpointInfo from './chart/chartEndpointInfo'
import chartGauge from './chart/chartGauge'
import chartGroup from './chart/chartGroup'
import chartLog from './chart/chartLog'
import chartNoData from './chart/chartNoData'
import chartPie from './chart/chartPie'
import chartStat from './chart/chartStat'
import chartTable from './chart/chartTable'
import chartText from './chart/chartText'
import chartTimeSeries from './chart/chartTimeSeries'
import chartTreemap from './chart/chartTreemap'
import chartUrl from './chart/chartUrl'
import chartValue from './chart/chartValue'
import chartHexagon from './chart/chartHexagon'
import { getOption, isTimeSeries, isHexagonFigure } from './chart/tools'
import lodash from 'lodash'

export default {
  name: 'chart',
  components: {
    loading,
    chartAssetInfo,
    chartBar,
    chartClock,
    chartDiagram,
    chartEndpointInfo,
    chartGauge,
    chartGroup,
    chartLog,
    chartNoData,
    chartPie,
    chartStat,
    chartTable,
    chartText,
    chartTimeSeries,
    chartTreemap,
    chartUrl,
    chartValue,
    chartHexagon
  },
  props: {
    chartInfo: Object,
    chartData: [Object, Array, String], // 数据查询后传入chart组件，chart组件内不查询，只根据接传递的数据来渲染
    customChartOption: Object, // 需要自定义echarts的option时传入，非必须；传入该值时仍需传对应格式的chartData
    isFullscreen: Boolean,
    loading: Boolean
  },
  computed: {
    isNoData () {
      return !this.chartData || this.chartData.length === 0
    },
    chartOption () {
      if (this.customChartOption) {
        return lodash.cloneDeep(this.customChartOption)
      } else {
        return getOption(this.chartInfo.type)
      }
    }
  },
  methods: {
    isTimeSeries,
    isHexagonFigure,
    resize () {
      this.$refs['chart' + this.chartInfo.id].resize()
    }
  },
  mounted () {
  }
}
</script>
