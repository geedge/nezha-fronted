<template>
  <div :id='`chartList${(isGroup ? "Group" : "") + timestamp}`' class="chart-list" :loading="gridLayoutLoading">
    <grid-layout
      ref="layout"
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
        :minH="headerH"
        dragAllowFrom=".chart-header"
        dragIgnoreFrom=".chart-header__tools"
        @resize="resizeEvent"
        @resized="resizedEvent"
        @moveEvent="moveEvent"
        @movedEvent="movedEvent"
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
    <!-- noData -->
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
        :panelLock="panelLock"
        :time-range="timeRange"
        @showFullscreen="showFullscreen"
      ></panel-chart>
    </el-dialog>
  </div>
</template>

<script>
import VueGridLayout from 'vue-grid-layout'
import { fromRoute } from '@/components/common/js/constants'
import { getGroupHeight } from './chart/tools'
import panelChart from '@/components/chart/panelChart'
import bus from '@/libs/bus'

export default {
  name: 'chartList',
  props: {
    // TODO isModel
    from: { type: String },
    obj: Object,
    timeRange: Array, // 时间范围
    panelLock: { type: Boolean, default: true },
    isGroup: { type: Boolean, default: false },
    groupInfo: {},
    dataList: Array // 看板中所有图表信息
  },
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    panelChart
  },
  computed: {
    headerH () {
      return this.$store.getters.getHeaderH
    },
    headerHPadding () {
      return this.$store.getters.getHeaderHPadding
    }
  },
  data () {
    return {
      fromRoute,
      gridLayoutLoading: false,
      gridLayoutShow: true,
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
      let dom = document.getElementById(`chartList${this.timestamp}`)
      if (this.isGroup) {
        dom = document.getElementById(`chartListGroup${this.timestamp}`)
      }
      if (dom) {
        this.stepWidth = Math.floor(dom.offsetWidth / 12)
        if (!this.isGroup) {
          const headerH = 40 / this.stepWidth
          const headerHPadding = 50 / this.stepWidth
          this.$store.commit('setHeaderH', { headerH, headerHPadding })
        }
        const span = document.querySelector('.temp-dom')
        this.tempDom.width = span.offsetWidth
      }
    },
    resizeEvent (i, newH, newW, newHPx, newWPx) {
      // TODO 分段重新渲染图表，或者暂时隐藏图表
      setTimeout(() => {
        this.$refs['chart' + i][0].resize()
      }, 50)
    },
    resizedEvent (i, newH, newW, newHPx, newWPx) {
      // TODO 重新渲染图表，向后端发送put请求
      setTimeout(() => {
        this.$refs['chart' + i][0].resize()
      }, 100)
    },
    moveEvent (i, newX, newY) {
      console.log(i)
      if (this.isGroup) {

      }
    },
    movedEvent (i, newX, newY) {
      if (this.isGroup) {
        bus.$emit('groupMove', this.copyDataList)
      }
    },
    containerResizedEvent (i, newH, newW, newHPx, newWPx) {
      // TODO 重新渲染图表
      // this.$refs['chart' + i].resize()
      // this.$refs['chart' + i][0].resize()
    },
    showFullscreen (show, chartInfo) {
      this.fullscreen.chartInfo = chartInfo
      this.fullscreen.visible = show
    },
    changeGroupHeight (copyList, group, flag) {
      const height = getGroupHeight(copyList)
      console.log(this.$refs.layout)
      const groupFind = this.copyDataList.find(item => item.id === group.id)
      if (group) {
        groupFind.height = groupFind.h = height + this.headerHPadding
        this.copyDataList = [...this.copyDataList]
      }
      if (flag) {
        this.copyDataList = [...this.copyDataList]
        this.$refs.layout.layoutUpdate()
      }
    },
    cleanData () {

    }
  },
  created () {

  },
  mounted () {
    this.init()
    if (!this.isGroup) {
      bus.$on('groupMove', this.changeGroupHeight)
    }
  },
  watch: {
    dataList: {
      deep: true,
      handler (n, o) {
        console.log(n)
        this.gridLayoutShow = false
        this.gridLayoutLoading = true
        this.noData = !n || n.length < 1
        const tempList = n.map(item => {
          const param = item.param
          // try {
          //   param = JSON.parse(item.param)
          // } catch (e) {
          //   console.info(e)
          // }
          param.showHeader = true
          return {
            ...item,
            i: item.id,
            w: item.span,
            h: item.height,
            x: item.x || 1,
            y: item.y || 1,
            param
          }
        })
        this.$nextTick(() => {
          this.copyDataList = JSON.parse(JSON.stringify(tempList))
          this.gridLayoutShow = true
          this.gridLayoutLoading = false
        })
      }
    },
    copyDataList: {
      deep: true,
      handler (n) {
        console.log(n)
        if (this.isGroup) {
          bus.$emit('groupMove', n, this.groupInfo)
        }
      }
    }
  }
}
</script>

<style scoped>
.chart-list {
  height: 100%;
  width: 100%;
}
</style>
