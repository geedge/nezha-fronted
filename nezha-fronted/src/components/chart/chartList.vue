<template>
  <div :id='`chartList${(isGroup ? "Group" : "") + timestamp}`' class="chart-list" :loading="gridLayoutLoading" ref="layoutBox">
    <grid-layout
      ref="layout"
      v-if="gridLayoutShow"
      :class="firstInit ? 'no-animation' : ''"
      :col-num="12"
      :is-draggable="!panelLock"
      :is-resizable="!panelLock"
      :layout.sync="copyDataList"
      :margin="[10, 10]"
      :row-height="stepWidth"
      :vertical-compact="true"
      :use-css-transforms="false"
      :style="{
        'margin-top': layoutMargintop
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
        :max-h="12"
        :static="item.static"
        :class="{
          'group-hide-header':item.type === 'group' && item.param.collapse,
          'opacityItem': item.static
        }"
        :ref="'grid-item' + item.id"
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
          :from="from"
          :time-range="timeRange"
          @groupShow="groupShow"
          :chart-detail-info="chartDetailInfo"
          @refreshPanel="refreshPanel"
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
      :visible.sync="fullscreen.visible"
      :show-close="false"
      class="nz-dialog chart-fullscreen"
      destroy-on-close
      fullscreen
      :modal-append-to-body="false"
    >
      <panel-chart
        :ref="'chart-fullscreen' + fullscreen.chartInfo.id"
        :chart-info="fullscreen.chartInfo"
        :from="from"
        :filter="filter"
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
import GridLayout from './chart/grid/GridLayout'
import GridItem from './chart/grid/GridItem'
import { fromRoute } from '@/components/common/js/constants'
import { getGroupHeight, getLayoutPosition, isGroup } from './chart/tools'
import panelChart from '@/components/chart/panelChart'
import bus from '@/libs/bus'
import groupData from '@/components/chart/tempGroup'

export default {
  name: 'chartList',
  props: {
    // TODO isModel
    panelId: {},
    chartDetailInfo: Object,
    timeRange: Array, // 时间范围
    isGroup: Boolean,
    groupInfo: {},
    from: String,
    dataList: Array // 看板中所有图表信息
  },
  components: {
    GridLayout: GridLayout,
    GridItem: GridItem,
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
    },
    layoutMargintop () {
      return this.isGroup ? '0' : (this.dataList.length ? (-1 * (this.stepWidth + 14) + 'px') : '0')
    },
    panelLock () {
      return this.$store.getters.getPanelLock
    }
  },
  data () {
    return {
      fromRoute,
      gridLayoutLoading: false,
      gridLayoutShow: false,
      firstInit: true,
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
      },
      scrollTop: 0,
      scrollTopTimer: null
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
        if (this.isGroup) {
          const findItem = this.copyDataList.find(item => item.i == i)
          findItem.height = newH
          findItem.h = newH
          // bus.$emit('groupMove', this.copyDataList, this.groupInfo)
        }
      }, 50)
    },
    resizedEvent (i, newH, newW, newHPx, newWPx) {
      // TODO 重新渲染图表，向后端发送put请求
      setTimeout(() => {
        this.$refs['chart' + i][0].resize()
        if (this.isGroup) {
          const findItem = this.copyDataList.find(item => item.i == i)
          findItem.height = newH
          findItem.h = newH
          // bus.$emit('groupMove', this.copyDataList, this.groupInfo)
        }
        this.$put('/visual/panel/chart/modify', {
          id: i,
          span: newW,
          height: newH
        })
        this.onScroll(this.scrollTop)
      }, 100)
    },
    moveEvent (i, newX, newY) {
      if (this.isGroup) {

      }
    },
    movedEvent (i, newX, newY) {
      if (!this.isGroup) {
        this.moveChart()
        this.onScroll(this.scrollTop)
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
      const groupFind = this.copyDataList.find(item => item.id == group.id)
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
      this.onScroll(this.scrollTop)
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
        if (charts && charts.length) {
          this.$put('/visual/panel/chart/weights', params).then(() => {
            const position = getLayoutPosition(this.copyDataList)
            this.$store.commit('setChartLastPosition', position)
          })
        }
      }, 1000)
    },
    onScroll (scrollTop = 0, groupTop = 0) {
      const self = this
      if (this.scrollTopTimer) {
        clearTimeout(this.scrollTopTimer)
        this.scrollTopTimer = null
      }
      this.scrollTopTimer = setTimeout(() => {
        this.copyDataList.forEach(item => {
          if (!this.$refs['grid-item' + item.id] || !this.$refs['grid-item' + item.id][0]) {
            return
          }
          const dom = this.$refs['grid-item' + item.id][0].$el
          if (dom) {
            let top = dom.style.top
            top = Number(top.substring(0, top.length - 2)) + groupTop
            if (item.type === 'group' && item.loaded) {
              this.$refs['chart' + item.id][0] && this.$refs['chart' + item.id][0].$refs.chart && this.$refs['chart' + item.id][0].$refs.chart.$refs['chart' + item.id] && this.$refs['chart' + item.id][0].$refs.chart.$refs['chart' + item.id].$refs.chartList.onScroll(scrollTop, top)
              return
            }
            if (item.type === 'group' && !item.loaded) {
              item.loaded = true
              this.$refs['chart' + item.id][0].getChartData()
              setTimeout(() => {
                this.$refs['chart' + item.id][0] && this.$refs['chart' + item.id][0].$refs.chart && this.$refs['chart' + item.id][0].$refs.chart.$refs['chart' + item.id] && this.$refs['chart' + item.id][0].$refs.chart.$refs['chart' + item.id].$refs.chartList.onScroll(scrollTop, top)
              },300)
            }
            if (item.loaded) {
              return
            }
            const itemHeight = dom.offsetHeight
            // 1.元素距离页面顶部的距离
            // console.log(dom.style.transform)

            // let top = dom.style.transform.split(',')[1]
            // top = top.substring(0, top.length - 2)
            const mainOffsetTop = top - this.stepWidth + 14// transform: grid组件 通过 tranfrom 控制位置 中间的为y的值 通过截取获得 - 父元素 marginTop的 值。
            // 2.元素的高度
            const mainHeight = itemHeight // ele.offsetHeight;//itemHeight;
            // 3.页面滚动的距离
            const windowScrollTop = scrollTop// document.documentElement.scrollTop || document.body.scrollTop;
            self.scrollTop = scrollTop
            // 4.浏览器可见区域的高度
            const windowHeight = (window.innerHeight || document.documentElement.clientHeight) - 50 - 70
            // console.log(this.$refs['chart' + item.id][0].$el.offsetHeight, scrollTop,'scrollTop',windowHeight,mainOffsetTop + mainHeight / 4,(windowScrollTop + windowHeight))
            if ((mainOffsetTop + mainHeight / 4) < (windowScrollTop + windowHeight)) {
              item.loaded = true
              this.$refs['chart' + item.id][0].getChartData()
            }
          }
        })
      }, 200)
    },
    refreshPanel () {
      bus.$emit('refreshPanel')
    }
  },
  created () {
    this.firstInit = true
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
        this.firstInit = true
        this.gridLayoutLoading = true
        this.noData = !n || n.length < 1
        if (!this.isGroup) {
          const position = getLayoutPosition(n)
          this.$store.commit('setChartLastPosition', position)
        }
        const tempList = n.map(item => {
          let param = ''
          let height = ''
          if (item.param) {
            param = item.param
            // try {
            //   param = JSON.parse(item.param)
            // } catch (e) {
            //   console.info(e)
            // }
            height = (item.type === 'group' && item.param.collapse) ? this.headerH : item.height
            param.showHeader = true
          }
          return {
            ...item,
            i: item.id,
            w: item.span,
            h: height || 4,
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
            if (!this.isGroup) {
              this.onScroll()
            }
          })
          setTimeout(() => {
            this.firstInit = false
          }, 2000)
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
