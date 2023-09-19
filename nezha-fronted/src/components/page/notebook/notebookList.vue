<template>
  <div class="notebook-list">
    <grid-layout
      v-if="gridLayoutShow"
      ref="layout"
      :class="firstInit ? 'no-animation' : ''"
      :col-num="12"
      :is-draggable="notebookEdit"
      :is-resizable="notebookEdit"
      :layout.sync="copyDataList"
      :margin="[20, 20]"
      :vertical-compact="true"
      :use-css-transforms="false"
    >
      <grid-item
        v-for="item in copyDataList"
        :key="item.id"
        :h="item.h"
        :i="item.i"
        :w="item.w"
        :x="item.x"
        :y="item.y"
        :min-w="12"
        :static="item.static"
        :class="{
          'opacityItem': item.static,
        }"
        :ref="'grid-item' + item.id"
        dragAllowFrom=".chart-header"
        dragIgnoreFrom=".chart-header__tools"
        @resized="resizedEvent"
        @moved="movedEvent"
      >
        <panel-chart
          :from="from"
          :variablesInit="true"
          :ref="'chart' + item.id"
          :chart-info="item"
          :time-range="timeRange"
          :isExportHtml="isExportHtml"
          :dataJson="dataJson"
        ></panel-chart>
      </grid-item>
    </grid-layout>
  </div>
</template>

<script>
import GridLayout from '@/components/chart/chart/grid/GridLayout'
import GridItem from '@/components/chart/chart/grid/GridItem'
import panelChart from '@/components/chart/panelChart'
import groupData from '@/components/chart/tempGroup'
import { lineChartMove } from '@/components/common/js/common'
export default {
  name: 'notebookList',
  props: {
    from: { type: String },
    timeRange: Array, // 时间范围
    dataList: Array,
    variablesInit: {
      type: Boolean,
      default: true
    },
    isExportHtml: {
      type: Boolean,
      default: false
    },
    dataJson: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  components: {
    GridLayout: GridLayout,
    GridItem: GridItem,
    panelChart
  },
  computed: {
    notebookEdit () { // 是否是编辑状态
      return this.$store.getters.getNotebookEdit
    }
  },
  data () {
    return {
      gridLayoutShow: false,
      firstInit: true,
      copyDataList: [],
      noData: false, // no data
      scrollTop: 0,
      scrollTopTimer: null
    }
  },
  mounted () {
    window.addEventListener('resize', this.resize)
    if (!document.onmousemove) { // 添加鼠标移动事件监听
      document.onmousemove = lineChartMove
    }
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resize)
    document.onmousemove = null
  },
  methods: {
    addNotebook (position) {
      this.$emit('addNotebook', position)
    },
    refreshData (refreshData) {
      this.copyDataList.forEach(item => {
        this.$refs['chart' + item.id] && this.$refs['chart' + item.id][0] && this.$refs['chart' + item.id][0].getChartData(refreshData)
      })
    },
    resizedEvent (i, newH, newW, newHPx, newWPx) {
      // TODO 重新渲染图表，向后端发送put请求
      setTimeout(() => {
        this.$refs['chart' + i][0].resize()
        this.onScroll(this.scrollTop)
      }, 100)
    },
    movedEvent (i, newX, newY) {
      this.onScroll(this.scrollTop)
    },
    onScroll (scrollTop = 0) {
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
            top = Number(top.substring(0, top.length - 2))
            if (item.loaded) {
              return
            }
            const itemHeight = dom.offsetHeight
            const mainOffsetTop = top
            self.scrollTop = scrollTop
            // 4.浏览器可见区域的高度
            const windowHeight = (window.innerHeight || document.documentElement.clientHeight) - 50 - 70
            if ((mainOffsetTop + itemHeight / 4) < (scrollTop + windowHeight)) {
              item.loaded = true
              this.$refs['chart' + item.id] && this.$refs['chart' + item.id][0] && this.$refs['chart' + item.id][0].getChartData()
            }
          }
        })
      }, 200)
    },
    resize () {
      this.copyDataList.forEach(item => {
        if (item.type === 'group') {
          this.$refs['chart' + item.id] && this.$refs['chart' + item.id][0].groupShow(item.param.collapse)
          this.$refs['chart' + item.id] && this.$refs['chart' + item.id][0].$refs.chart && this.$refs['chart' + item.id][0].$refs.chart.$refs['chart' + item.id] && this.$refs['chart' + item.id][0].$refs.chart.$refs['chart' + item.id].$refs.chartList.resize()
        }
        try {
          this.$refs['chart' + item.id] && this.$refs['chart' + item.id][0].resize()
        } catch (error) {
        }
      })
    }
  },
  watch: {
    dataList: {
      immediate: true,
      deep: true,
      handler (n) {
        this.noData = !n || n.length < 1
        this.gridLayoutShow = false
        this.firstInit = true
        const cloneDataList = this.$lodash.cloneDeep(n)
        const tempList = cloneDataList.map((item, index) => {
          const height = item.height || ''
          const id = item.id || index
          return {
            ...item,
            id,
            i: id,
            w: 12,
            h: height || 4,
            x: item.x || 0,
            y: item.y || 0
          }
        })
        // 添加占位元素 防止向上塌陷
        tempList.push({
          ...groupData,
          i: -2,
          w: 12,
          h: 0,
          x: 0,
          y: 0,
          static: true
        })
        this.$nextTick(() => {
          console.log(tempList)
          this.copyDataList = this.$lodash.cloneDeep(tempList)
          this.gridLayoutShow = true
          if (!this.isExportHtml) {
            this.onScroll()
          } else {
            this.onScroll(999999)
          }
          setTimeout(() => {
            this.firstInit = false
          }, 2000)
        })
      }
    }
  }
}
</script>

<style>

</style>
