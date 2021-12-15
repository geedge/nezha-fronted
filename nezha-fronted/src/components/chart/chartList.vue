<template>
  <div :id='`chartList${(isGroup ? "Group" : "") + timestamp}`' class="chart-list" :loading="gridLayoutLoading">
    <grid-layout
      ref="layout"
      v-if="gridLayoutShow"
      :col-num="12"
      :maxRows="12"
      :is-draggable="!panelLock"
      :is-resizable="!panelLock"
      :layout.sync="copyDataList"
      :margin="[10, 10]"
      :row-height="stepWidth"
      :use-css-transforms="true"
      :vertical-compact="true"
      :useCssTransforms="false"
      :style="{
        'margin-top':isGroup ? '0' : (-1 * (stepWidth + 12) + 'px')
      }"
    >
      <grid-item
        v-for="item in copyDataList"
        :key="item.id"
        :h="item.h"
        :i="item.i"
        :w="item.w"
        :x="item.x"
        :y="item.y"
        :min-h="headerH"
        :static="item.static"
        :class="{
          'group-hide-header':item.type === 'group' && item.param.collapse,
          'opacityItem': item.static
        }"
        :isResizable = "item.type === 'group' ? false: null"
        dragAllowFrom=".chart-header"
        dragIgnoreFrom=".chart-header__tools"
        @resize="resizeEvent"
        @resized="resizedEvent"
        @moveEvent="moveEvent"
        @moved="movedEvent"
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
        @groupShow="groupShow"
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
import groupData from '@/components/chart/tempGroup'

export default {
  name: 'chartList',
  props: {
    // TODO isModel
    from: { type: String },
    panelId: { },
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
    },
    rowHeight () {
      return this.$store.getters.getRowHeight
    }
  },
  data () {
    return {
      fromRoute,
      gridLayoutLoading: false,
      gridLayoutShow: false,
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
          const headerH = 50 / this.stepWidth
          const headerHPadding = 50 / this.stepWidth
          this.$store.commit('setHeaderH', { headerH, headerHPadding, rowHeight: this.stepWidth })
        } else {
          this.stepWidth = this.rowHeight - (10 / 12)
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
        // if (!this.isGroup) {
        //   this.moveChart()
        // } else {
        //   bus.$emit('groupMove', this.copyDataList, this.groupInfo)
        // }
        this.$put('/visual/panel/chart/modify', {
          id: i,
          span: newW,
          height: newH
        })
      }, 100)
    },
    moveEvent (i, newX, newY) {
      if (this.isGroup) {

      }
    },
    movedEvent (i, newX, newY) {
      if (!this.isGroup) {
        this.moveChart()
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
      // console.log(height,copyList, group, flag)
      // console.log(this.$refs.layout)
      const groupFind = this.copyDataList.find(item => item.id == group.id)
      console.log(groupFind)
      if (group && groupFind) {
        groupFind.height = groupFind.h = height + this.headerHPadding
        groupFind.children = copyList
        this.copyDataList = [...this.copyDataList]
      }
      if (flag) {
        this.copyDataList = [...this.copyDataList]
        // this.$refs.layout.layoutUpdate()
      }
      this.moveChart()
    },
    cleanData () {

    },
    groupShow (chart) {
      const index = this.copyDataList.findIndex(item => item.id === chart.id)
      this.$set(this.copyDataList, index, chart)
    },
    moveChart () {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
      this.timer = setTimeout(() => {
        const arr = this.copyDataList.filter(item => !item.staic)
        const charts = []
        let weight = 0
        arr.forEach(item => {
          charts.push({
            id: item.id,
            x: item.x,
            y: item.y,
            span: item.span,
            height: item.height,
            groupId: item.groupId,
            weight: weight
          })
          weight++
          if (item.type === 'group') {
            item.children && item.children.forEach(children => {
              charts.push({
                id: children.id,
                x: children.x,
                y: children.y,
                span: children.span,
                height: children.height,
                groupId: children.groupId,
                weight: weight
              })
              weight++
            })
          }
        })
        const params = {
          panelId: this.panelId,
          charts: charts
        }
        // console.log(this.copyDataList)
        this.$put('/visual/panel/chart/weights', params)
      }, 200)
    }
  },
  created () {

  },
  mounted () {
    this.init()
    if (!this.isGroup) {
      bus.$on('groupMove', this.changeGroupHeight)
      this.$store.commit('setChartListId', `chartList${this.timestamp}`)
    }
  },
  watch: {
    dataList: {
      deep: true,
      handler (n, o) {
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
          const height = (item.type === 'group' && item.param.collapse) ? this.headerH : item.height
          param.showHeader = true
          return {
            ...item,
            i: item.id,
            w: item.span,
            h: height,
            x: item.x || 0,
            y: item.y || 0,
            param
          }
        })
        if (tempList.length && !this.isGroup) { // 添加一个高1 宽12的元素占位 防止group消失
          tempList.push({
            ...groupData,
            i: -2,
            w: 12,
            h: 1,
            x: 0,
            y: 0,
            static: true
          })
        }
        this.$nextTick(() => {
          this.copyDataList = JSON.parse(JSON.stringify(tempList))
          setTimeout(() => {
            this.gridLayoutShow = true
          })
          this.gridLayoutLoading = false
        })
      }
    },
    copyDataList: {
      deep: true,
      handler (n) {
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
  .group-hide-header {
    height: 40px!important;
  }
</style>
