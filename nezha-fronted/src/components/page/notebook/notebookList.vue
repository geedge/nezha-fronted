<template>
  <div class="notebook-list">
    <draggable
      v-model="copyDataList"
      :scroll-sensitivity="300"
      :options="{
        dragClass:'drag-chart-class',
        fallbackClass:'fallback-class',
        forceFallback:false,
        ghostClass:'chart-ghost',
        chosenClass:'choose-class',
        scroll:true,
        filter: '.drag-disabled',
        animation: 150,
        handle: '.chart-header'
      }"
      :disabled="!notebookEdit"
    >
      <div
        class="panel-chart-wrap"
        :class="{'text-chart-wrap':item.type==='text'}"
        v-for="item in copyDataList"
        :key="item.id">
        <panel-chart
          :from="from"
          :variablesInit="true"
          :ref="'chart' + item.id"
          :chart-info="item"
          :time-range="timeRange"
          :isExportHtml="isExportHtml"
          :dataJson="dataJson"
        ></panel-chart>
      </div>
    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import panelChart from '@/components/chart/panelChart'
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
    draggable,
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
          if (!this.$refs['chart' + item.id] || !this.$refs['chart' + item.id][0]) {
            return
          }
          const dom = this.$refs['chart' + item.id][0].$el
          if (dom) {
            const top = dom.offsetTop
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
          return {
            ...item,
            i: item.id
          }
        })
        this.$nextTick(() => {
          this.copyDataList = this.$lodash.cloneDeep(tempList)
          this.gridLayoutShow = true
          if (!this.isExportHtml) {
            this.onScroll()
          } else {
            setTimeout(() => {
              window.dataJson.AllChartDataLoad = true
            }, 1000)
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
