<template>
  <div :style="chartInfo.param.showHeader ? '' : 'padding-top: 15px;'" class="nz-chart" :class="chartInfo.param.showHeader ? '' : 'no-header'" >
    <loading :loading="loading"></loading>
    <chart-no-data v-if="isNoData || isError || chartChildrenData"></chart-no-data>
    <template v-else>
      <chart-time-series
        v-if="isTimeSeries(chartInfo.type)"
        :ref="'chart' + chartInfo.id"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-time-series>
      <chart-pie
        :ref="'chart' + chartInfo.id"
        v-if="isChartPie(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-pie>
      <chart-bar
        :ref="'chart' + chartInfo.id"
        v-if="isChartBar(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-bar>
      <chartHexagon
        :ref="'chart'+chartInfo.id"
        v-if="isHexagon(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chartHexagon>
      <chart-url
        :ref="'chart' + chartInfo.id"
        v-if="isUrl(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-url>
      <chart-text
        :ref="'chart' + chartInfo.id"
        v-if="isText(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-text>
      <chart-treemap
        :ref="'chart' + chartInfo.id"
        v-if="isTreemap(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-treemap>
      <chart-log
        :ref="'chart' + chartInfo.id"
        v-if="isLog(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-log>
      <chart-stat
        :ref="'chart' + chartInfo.id"
        v-if="isStat(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-stat>
      <chart-gauge
        :ref="'chart' + chartInfo.id"
        v-if="isGauge(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-gauge>
      <chart-diagram
        :ref="'chart' + chartInfo.id"
        v-if="isDiagram(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
        :chart-option="chartOption"
      ></chart-diagram>
      <chartAutotopology
        :ref="'chart' + chartInfo.id"
        v-if="isAutotopology(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chartAutotopology>
      <chartMap
        :ref="'chart' + chartInfo.id"
        v-if="isMap(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chartMap>
      <chart-asset-info
        :ref="'chart' + chartInfo.id"
        v-if="isAssetInfo(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-asset-info>
      <chart-endpoint-info
        :ref="'chart' + chartInfo.id"
        v-if="isEndpointInfo(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-endpoint-info>
      <chart-table
        :ref="'chart' + chartInfo.id"
        v-if="isTable(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-table>
      <chart-group
        :ref="'chart' + chartInfo.id"
        :from="from"
        v-if="isGroup(chartInfo.type)"
        :panelLock="panelLock"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
        :chart-option="chartOption"
      ></chart-group>
    </template>
  </div>
</template>

<script>
import loading from '@/components/common/loading'
import chartAssetInfo from './chart/chartAssetInfo'
import chartAutotopology from './chart/chartAutotopology'
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
import chartMap from './chart/chartMap'
import { getOption, isTimeSeries, isHexagon, isUrl, isText, isChartPie, isChartBar, isTreemap, isLog, isStat, isDiagram, isGroup, isAutotopology, isMap, isAssetInfo, isEndpointInfo, isTable, isGauge } from './chart/tools'
import lodash from 'lodash'

export default {
  name: 'chart',
  components: {
    loading,
    chartAssetInfo,
    chartAutotopology,
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
    chartHexagon,
    chartMap
  },
  props: {
    chartInfo: Object,
    chartData: [Object, Array, String], // 数据查询后传入chart组件，chart组件内不查询，只根据接传递的数据来渲染
    customChartOption: Object, // 需要自定义echarts的option时传入，非必须；传入该值时仍需传对应格式的chartData
    isFullscreen: Boolean,
    loading: Boolean,
    panelLock: Boolean,
    from: String,
    isError: Boolean
  },
  data () {
    return {
      chartChildrenData: false
    }
  },
  computed: {
    isNoData () {
      return lodash.isEmpty(this.chartData) && ['text', 'url'].indexOf(this.chartInfo.type) === -1
    },
    chartOption () {
      if (this.customChartOption) {
        return lodash.cloneDeep(this.customChartOption)
      } else {
        return getOption(this.chartInfo.type)
      }
    },
  },
  methods: {
    isTimeSeries,
    isHexagon,
    isChartPie,
    isChartBar,
    isUrl,
    isText,
    isTreemap,
    isLog,
    isStat,
    isDiagram,
    isGroup,
    isAutotopology,
    isAssetInfo,
    isEndpointInfo,
    isMap,
    isTable,
    isGauge,
    chartIsNoData (flag) {
      this.chartChildrenData = flag
    },
    resize () {
      this.$refs['chart' + this.chartInfo.id].resize()
    }
  },
  mounted () {
    console.log(this.chartInfo.type)
  }
}
</script>
