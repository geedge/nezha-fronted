
 <template>
  <!-- <div :style="showHeader&&chartInfo.param.showHeader ? '' : 'padding-top: 15px;'" class="nz-chart" :class="showHeader&&chartInfo.param.showHeader ? '' : 'no-header'" > -->
  <div class="nz-chart" :class="chartInfo.param.showHeader===0 ? 'no-header' : ''">
    <loading :loading="loading"></loading>
    <chart-no-data  v-if="isNoData || isError || chartChildrenData || (isExportHtml&&(isAutotopology(chartInfo.type) || isDiagram(chartInfo.type) || isMap(chartInfo.type)))"></chart-no-data>
    <template v-else>
      <chart-time-series
        v-if="isTimeSeries(chartInfo.type)"
        :ref="'chart' + chartInfo.id"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        :minusTime="minusTime"
        :multipleTime="multipleTime"
        :showAllData="showAllData"
        @chartIsNoData="chartIsNoData"
        :from="from"
      ></chart-time-series>
      <chart-doughnut
        :ref="'chart' + chartInfo.id"
        v-if="isChartPie(chartInfo.type)||isDoughnut(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-doughnut>
      <chart-rose
        :ref="'chart' + chartInfo.id"
        v-if="isRose(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-rose>
      <chart-bar
        :ref="'chart' + chartInfo.id"
        v-if="isChartBar(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-bar>
      <chartHexagonD3
        :ref="'chart'+chartInfo.id"
        v-if="isHexagon(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chartHexagonD3>
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
        @refreshLogs="refreshLogs"
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
        :from="from"
      ></chart-asset-info>
      <chart-endpoint-info
        :ref="'chart' + chartInfo.id"
        v-if="isEndpointInfo(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
        :from="from"
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
        :filter="filter"
        v-if="isGroup(chartInfo.type)"
        :panelLock="panelLock"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
        :chart-option="chartOption"
      ></chart-group>
      <chart-clock
        :ref="'chart' + chartInfo.id"
        v-if="isClock(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-clock>
      <chart-topology
        :ref="'chart' + chartInfo.id"
        v-if="isTopology(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-topology>
      <chart-bubble
        :ref="'chart' + chartInfo.id"
        v-if="isChartBubble(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-bubble>
      <chart-rank
        :ref="'chart' + chartInfo.id"
        v-if="isChartRank(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-rank>
      <chart-sankey
        :ref="'chart' + chartInfo.id"
        v-if="isSankey(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-sankey>
      <chart-funnel
        :ref="'chart' + chartInfo.id"
        v-if="isFunnel(chartInfo.type)"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :chart-option="chartOption"
        :is-fullscreen="isFullscreen"
        @chartIsNoData="chartIsNoData"
      ></chart-funnel>
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
import chartDoughnut from './chart/chartDoughnut'
import chartRose from './chart/chartRose'
import chartStat from './chart/chartStat'
import chartTable from './chart/chartTable'
import chartText from './chart/chartText'
import chartTimeSeries from './chart/chartTimeSeries'
import chartTreemap from './chart/chartTreemap'
import chartUrl from './chart/chartUrl'
import chartValue from './chart/chartValue'
import chartHexagonD3 from './chart/chartHexagonD3'
import chartMap from './chart/chartMap'
import chartTopology from './chart/chartTopology'
import chartBubble from './chart/chartBubble'
import chartRank from './chart/chartRank'
import chartSankey from './chart/chartSankey'
import chartFunnel from './chart/chartFunnelNew'
import { getOption, isTimeSeries, isHexagon, isUrl, isText, isChartPie, isDoughnut, isRose, isChartBar, isTreemap, isLog, isStat, isDiagram, isGroup, isAutotopology, isMap, isAssetInfo, isEndpointInfo, isTable, isGauge, isClock, isTopology, isChartBubble, isChartRank, isSankey, isFunnel } from './chart/tools'
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
    chartDoughnut,
    chartRose,
    chartStat,
    chartTable,
    chartText,
    chartTimeSeries,
    chartTreemap,
    chartUrl,
    chartValue,
    chartHexagonD3,
    chartMap,
    chartTopology,
    chartBubble,
    chartRank,
    chartSankey,
    chartFunnel
  },
  props: {
    chartInfo: Object,
    chartData: [Object, Array, String], // 数据查询后传入chart组件，chart组件内不查询，只根据接传递的数据来渲染
    customChartOption: Object, // 需要自定义echarts的option时传入，非必须；传入该值时仍需传对应格式的chartData
    isFullscreen: Boolean,
    loading: Boolean,
    panelLock: Boolean,
    from: String,
    isError: Boolean,
    filter: {},
    multipleTime: {},
    minusTime: {},
    showAllData: {
      type: Boolean,
      default: false
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    isExportHtml: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      chartChildrenData: false
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        if (n) {
          this.chartChildrenData = false
        }
      }
    }
  },
  computed: {
    isNoData () {
      return lodash.isEmpty(this.chartData) && ['text', 'url', 'clock'].indexOf(this.chartInfo.type) === -1
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
    isHexagon,
    isChartPie,
    isDoughnut,
    isRose,
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
    isClock,
    isTopology,
    isChartBubble,
    isChartRank,
    isSankey,
    isFunnel,
    chartIsNoData (flag) {
      this.chartChildrenData = flag
    },
    resize () {
      this.$refs['chart' + this.chartInfo.id] && this.$refs['chart' + this.chartInfo.id].resize()
    },
    refreshLogs (params) {
      this.$emit('refreshLogs', params)
    }
  },
  mounted () {
  }
}
</script>
