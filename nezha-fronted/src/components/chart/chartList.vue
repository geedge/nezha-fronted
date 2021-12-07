<template>
  <div :id='`chartList${timestamp}`' class="chart-list">
    <grid-layout
      :col-num="12"
      :is-draggable="!panelLock"
      :is-resizable="!panelLock"
      :layout.sync="copyDataList"
      :margin="[10, 10]"
      :row-height="stepWidth"
      :use-css-transforms="true"
      :vertical-compact="true"
    >
      <grid-item
        v-for="item in copyDataList"
        :key="item.id"
        :h="item.h"
        :i="item.i"
        :w="item.w"
        :x="item.x"
        :y="item.y"
        dragAllowFrom=".chart-header"
        dragIgnoreFrom=".chart-header__tools"
        @resize="resizeEvent"
        @resized="resizedEvent"
        @container-resized="containerResizedEvent"
      >
        <panel-chart
          :ref="'chart' + item.id"
          @edit-chart="$emit('edit-chart', item)"
          :chart-info="item"
          :time-range="timeRange"
          @showFullscreen="showFullscreen"
        ></panel-chart>
      </grid-item>
    </grid-layout>

    <div v-if="noData" class="no-data">
      <svg aria-hidden="true" class="icon">
        <use xlink:href="#nz-icon-no-data-panel"></use>
      </svg>
      <div class="no-data-div">No data</div>
    </div>
    <!-- 全屏查看 -->
    <el-dialog
      v-if="fullscreen.visible"
      :title="fullscreen.chartInfo.name"
      :visible.sync="fullscreen.visible"
      append-to-body
      class="nz-dialog chart-fullscreen"
      destroy-on-close
      fullscreen
    >
      <panel-chart
        :ref="'chart-fullscreen' + fullscreen.chartInfo.id"
        :chart-info="fullscreen.chartInfo"
        :is-fullscreen="true"
        :time-range="timeRange"
        @showFullscreen="showFullscreen"
      ></panel-chart>
    </el-dialog>
  </div>
</template>

<script>
import VueGridLayout from 'vue-grid-layout'
import { fromRoute } from '@/components/common/js/constants'
import panelChart from '@/components/chart/panelChart'

export default {
  name: 'chartList',
  props: {
    // TODO isModel
    from: { type: String },
    obj: Object,
    timeRange: Array, // 时间范围
    panelLock: { type: Boolean, default: true },
    dataList: Array // 看板中所有图表信息
  },
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    panelChart
  },
  data () {
    return {
      fromRoute,
      filter: {}, // chart列表查询条件
      copyDataList: [],
      noData: false, // no data
      // processedDataList: [], // 将dataList处理后的数据，组件中使用它不使用dataList
      tempDom: { height: '', width: '' },
      eventLog: [],
      stepWidth: null,
      timestamp: new Date().getTime(),
      fullscreen: {
        visible: false,
        chartData: [],
        chartInfo: {}
      }
    }
  },
  methods: {
    init () {
      const dom = document.getElementById(`chartList${this.timestamp}`)
      if (dom) {
        this.stepWidth = Math.floor(dom.offsetWidth / 12)
        const span = document.querySelector('.temp-dom')
        this.tempDom.width = span.offsetWidth
      }
    },
    resizeEvent (i, newH, newW, newHPx, newWPx) {
      // TODO 分段重新渲染图表，或者暂时隐藏图表
    },
    resizedEvent (i, newH, newW, newHPx, newWPx) {
      // TODO 重新渲染图表，向后端发送put请求
    },
    containerResizedEvent (i, newH, newW, newHPx, newWPx) {
      // TODO 重新渲染图表
      // this.$refs['chart' + i].resize()
    },
    showFullscreen (show, chartInfo) {
      this.fullscreen.chartInfo = chartInfo
      this.fullscreen.visible = show
    },
    cleanData () {

    }
  },
  mounted () {
    this.init()
  },
  watch: {
    dataList: {
      deep: true,
      handler (n, o) {
        this.noData = !n || n.length < 1
        this.copyDataList = n.map(item => {
          let param = item.param
          try {
            param = JSON.parse(item.param)
          } catch (e) {
            console.info(e)
          }
          console.log(param)
          param.showHeader = true
          return {
            ...item,
            i: item.id,
            w: item.span,
            h: item.height,
            x: item.x || 0,
            y: item.y || 0,
            param
          }
        })
      }
    }
  }
}
</script>

<style scoped>
.chart-list {
  height: 100%;
}
</style>
