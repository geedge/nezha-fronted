<template>
  <div :id='`chartList${(isGroup ? "Group" : "") + timestamp}`' class="chart-list" v-my-loading="gridLayoutLoading" ref="layoutBox">
    <grid-layout
      ref="layout"
      v-if="gridLayoutShow"
      class="pdfDom"
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
        :isGroup="isGroup"
        :class="{
          'group-hide-header':item.type === 'group' && item.param.collapse,
          'opacityItem': item.static,
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
          :isExportHtml="isExportHtml"
          :dataJson="dataJson"
          :chart-detail-info="chartDetailInfo"
          :hiddenText="showHidden[item.id]&&showHidden[item.id].hiddenText"
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
        :variablesInit="variablesInit"
        :from="from"
        :filter="filter"
        :is-fullscreen="true"
        @groupShow="groupShow"
        :dataJson="dataJson"
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
import { lineChartMove } from '@/components/common/js/common'

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
    dataList: Array, // 看板中所有图表信息
    isExportHtml: {
      type: Boolean,
      default: false
    },
    dataJson: {
      type: Object,
      default: () => {
        return {}
      }
    },
    variablesInit: {
      type: Boolean,
      default: true
    }
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
    },
    variablesArr () {
      return this.$store.state.panel.variablesArr
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
      scrollTopTimer: null,
      // 变量比较结果 图表是否显示/隐藏
      showHidden: {},
      tempList: [],
      isPhone: false
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
      if (this.isPhone) {
        this.stepWidth = 150
        const headerH = 50 / this.stepWidth
        const headerHPadding = 50 / this.stepWidth
        this.$store.commit('setHeaderH', { headerH, headerHPadding, rowHeight: this.stepWidth })
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
        this.moveChart(i, newX, newY)
        this.onScroll(this.scrollTop)
      } else {
        bus.$emit('groupChildMove')
      }
    },
    containerResizedEvent (i, newH, newW, newHPx, newWPx) {
      // TODO 重新渲染图表
      // this.$refs['chart' + i].resize()
      // this.$refs['chart' + i][0].resize()
    },
    showFullscreen (show, chartInfo) {
      this.fullscreen.chartInfo = JSON.parse(JSON.stringify(chartInfo))
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
      this.onScroll(this.scrollTop)
    },
    cleanData () {

    },
    groupShow (chart) {
      const index = this.copyDataList.findIndex(item => item.id === chart.id)
      this.$set(this.copyDataList, index, chart)
      this.onScroll(this.scrollTop)
    },
    moveChart (id, newX, newY) {
      if (!this.groupInfo) {
        const moveItem = this.copyDataList.find(item => item.id == id)
        const moveIndex = this.copyDataList.findIndex(item => item.id == id)
        let num = 1
        this.copyDataList.forEach((item, index) => {
          const moveId = String(id).split('-repeat-')[0]
          const repeatId = String(item.id).split('-repeat-')[0]
          if (moveId == repeatId && moveIndex != index) {
            item.y = moveItem.y + (num * 0.1)
            num++
          }
        })
      }
      this.onScroll(this.scrollTop)
      const arr = this.copyDataList.filter(item => !item.staic && !item.repeatIndex)
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
    },
    onScroll (scrollTop = 0, groupTop = 0) {
      const self = this
      if (this.scrollTopTimer) {
        clearTimeout(this.scrollTopTimer)
        this.scrollTopTimer = null
      }
      this.scrollTopTimer = setTimeout(() => {
        this.copyDataList.forEach(item => {
          if (this.$refs['chart' + item.id] && this.$refs['chart' + item.id][0] && this.$refs['chart' + item.id][0].$refs.chart && this.$refs['chart' + item.id][0].$refs.chart.$refs['chart' + item.id]) {
            if (this.$refs['chart' + item.id][0].$refs.chart.$refs['chart' + item.id].tooltip && this.$refs['chart' + item.id][0].$refs.chart.$refs['chart' + item.id].tooltip.show) {
              this.$refs['chart' + item.id][0].$refs.chart.$refs['chart' + item.id].tooltip.show = false
            }
          }
          if (!this.$refs['grid-item' + item.id] || !this.$refs['grid-item' + item.id][0]) {
            return
          }
          const dom = this.$refs['grid-item' + item.id][0].$el
          if (dom) {
            let top = dom.style.top
            top = Number(top.substring(0, top.length - 2)) + groupTop
            if (item.type === 'group' && item.loaded) {
              this.$refs['chart' + item.id] && this.$refs['chart' + item.id][0].$refs.chart && this.$refs['chart' + item.id][0].$refs.chart.$refs['chart' + item.id] && this.$refs['chart' + item.id][0].$refs.chart.$refs['chart' + item.id].$refs.chartList.onScroll(scrollTop, top)
              return
            }
            if (item.type === 'group' && !item.loaded) {
              item.loaded = true
              this.$refs['chart' + item.id] && this.$refs['chart' + item.id][0].getChartData()
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
              this.$refs['chart' + item.id] && this.$refs['chart' + item.id][0].getChartData()
            }
          }
        })
      }, 200)
    },
    resize () {
      this.init()
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
    },
    refreshPanel () {
      bus.$emit('refreshPanel')
    },
    createChartSuccess (params) {
      const arr = this.copyDataList.filter(item => !item.staic && !item.repeatIndex)
      const charts = []
      let weight = 0
      arr.forEach(item => {
        const chart = {
          id: item.id,
          x: item.x,
          y: item.y,
          span: item.span,
          height: item.height,
          groupId: item.groupId,
          weight: weight
        }
        if (!params.groupId && chart.y >= params.y) {
          chart.y = chart.y + 1
        }
        if (params.id == item.id) {
          chart.y = params.y
          chart.x = params.x
        }
        charts.push(chart)

        weight++
        if (item.type === 'group') {
          item.children && item.children.forEach(children => {
            const childrenChart = {
              id: children.id,
              x: children.x,
              y: children.y,
              span: children.span,
              height: children.height,
              groupId: children.groupId,
              weight: weight
            }
            if (item.id === params.groupId && children.y >= params.y) {
              childrenChart.y = childrenChart.y + 1
            }
            if (params.id == childrenChart.id) {
              childrenChart.y = params.y
              childrenChart.x = params.x
            }
            charts.push(childrenChart)
            weight++
          })
        }
      })
      const chartParams = {
        panelId: this.panelId,
        charts: charts
      }
      if (charts && charts.length) {
        this.$put('/visual/panel/chart/weights', chartParams).then(() => {
          if (params.cb) {
            params.cb()
          }
        })
      }
    },
    // 比较变量 图表是否显示/隐藏
    compareVariables () {
      // 防止group中的chartList执行
      if (this.groupInfo) {
        return
      }
      const isRegExp = (v) => {
        let isReg
        try {
          isReg = eval(v) instanceof RegExp
        } catch (e) {
          isReg = false
        }
        return isReg
      }
      this.showHidden = {}
      this.dataList.forEach(item => {
        const visibility = this.$loadsh.get(item, 'param.enable.visibility', false)
        const varName = this.$loadsh.get(item, 'param.visibility.varName')
        const operator = this.$loadsh.get(item, 'param.visibility.operator')
        const varValue = this.$loadsh.get(item, 'param.visibility.varValue')
        const result = this.$loadsh.get(item, 'param.visibility.result')
        // 相反结果 若result为show则contraryResult为hidden
        const contraryResult = result === 'show' ? 'hidden' : 'show'
        // 是否启用显示隐藏功能
        if (visibility) {
          this.variablesArr.forEach(subItem => {
            // 判断当前图表的变量
            if (subItem.name === varName) {
              let flag = false
              switch (operator) {
                case 'equal': {
                  flag = subItem.checked.some(value => {
                    return value == varValue
                  })
                  break
                }
                case 'notEqual': {
                  flag = subItem.checked.some(value => {
                    return value != varValue
                  })
                  // 判断选中的值是否为空
                  if (!subItem.checked.length) {
                    flag = true
                  }
                  break
                }
                case 'match': {
                  flag = subItem.checked.some(value => {
                    const reg = isRegExp(varValue) ? eval(varValue) : new RegExp(varValue)
                    return value.match(eval(reg))
                  })
                  break
                }
                case 'contains': {
                  flag = subItem.checked.some(value => {
                    return value.includes(varValue)
                  })
                  break
                }
              }
              if (flag === true) {
                this.$loadsh.set(this.showHidden, item.id + '.visibility', result)
              } else {
                this.$loadsh.set(this.showHidden, item.id + '.visibility', contraryResult)
              }

              // 隐藏图表的悬浮文字赋值
              if (this.$loadsh.get(this.showHidden[item.id], 'visibility') === 'hidden') {
                const hiddenText = `“${varName}=${varValue}”Hidden`
                this.$loadsh.set(this.showHidden, item.id + '.hiddenText', hiddenText)
              }
            }
          })
        }
      })
      if (!this.panelLock) {
        return false
      }
      for (let i = 0; i < this.copyDataList.length; i++) {
        const item = this.copyDataList[i]
        if ((this.$loadsh.get(this.showHidden[item.id], 'visibility') && this.$loadsh.get(this.showHidden[item.id], 'visibility') === 'hidden') && item.id !== -2) {
          this.copyDataList.splice(i, 1)
          i--
        }
      }
      this.tempList.forEach(item => {
        if ((!this.$loadsh.get(this.showHidden[item.id], 'visibility') || this.$loadsh.get(this.showHidden[item.id], 'visibility') === 'show') && item.id !== -2 && !this.copyDataList.find(chart => chart.id === item.id)) {
          this.copyDataList.push(item)
        }
      })
      this.onScroll(this.scrollTop)
    },

    // group设置repeat 便利变量重复渲染图表
    repeatVariableFn () {
      // 防止group中的chartList执行
      if (this.groupInfo) {
        return
      }
      // 先删除掉复制的数据
      for (let index = 0; index < this.copyDataList.length; index++) {
        const item = this.copyDataList[index]
        if (item.repeatIndex > 0) {
          this.copyDataList.splice(index, 1)
          index--
        } else if (item.repeatIndex == 0) {
          // 置为原来的数据
          delete item.repeatIndex
          delete item.repeatVariable
          delete item.repeatValue
          item.children.forEach(children => {
            delete children.repeatIndex
            delete children.repeatVariable
            delete children.repeatValue
          })
        }
      }
      this.$nextTick(() => {
        for (let index = 0; index < this.copyDataList.length; index++) {
          const item = this.copyDataList[index]
          if (this.$loadsh.get(this.showHidden[item.id], 'visibility') !== 'hidden' && this.$loadsh.get(item.param.enable, 'repeat')) {
            this.variablesArr.forEach((variables) => {
              const repeatVariable = this.$loadsh.get(item.param.repeat, 'variable')
              if (item.type === 'group' && variables.name === repeatVariable) {
                if (!variables.checked.length) {
                  item.children.forEach(children => {
                    this.$delete(children, 'repeatIndex')
                    this.$delete(children, 'repeatVariable')
                    this.$delete(children, 'repeatValue')
                  })
                  return
                }
                variables.checked.forEach((subItem, subIndex) => {
                  if (subIndex > 0) {
                  // 复制数据 重新设置id
                    const repeatItem = this.$loadsh.cloneDeep(item)
                    repeatItem.id = item.id + '-' + 'repeat-' + subIndex
                    repeatItem.i = repeatItem.id
                    repeatItem.repeatIndex = subIndex
                    repeatItem.repeatVariable = repeatVariable
                    repeatItem.repeatValue = subItem
                    repeatItem.children.forEach(children => {
                      children.id = children.id + '-' + 'repeat-' + subIndex
                      children.repeatIndex = subIndex
                      children.repeatVariable = repeatVariable
                      children.repeatValue = subItem
                    })
                    index += 1
                    // 复制数据
                    this.copyDataList.splice(index, 0, repeatItem)
                  } else {
                    this.$set(item, 'repeatIndex', 0)
                    this.$set(item, 'repeatVariable', repeatVariable)
                    this.$set(item, 'repeatValue', subItem)
                    item.children.forEach(children => {
                      this.$set(children, 'repeatIndex', 0)
                      this.$set(children, 'repeatVariable', repeatVariable)
                      this.$set(children, 'repeatValue', subItem)
                    })
                    this.$refs['chart' + item.id] && this.$refs['chart' + item.id][0] && this.$refs['chart' + item.id][0].getChartData()
                  }
                })
              }
            })
          }
        }
        this.onScroll(this.scrollTop)
      })
    }

  },
  created () {
    this.firstInit = true
  },
  mounted () {
    this.init()
    if (!this.isGroup) {
      bus.$on('groupMove', this.changeGroupHeight)
      bus.$on('creat-chart-success', this.createChartSuccess)
      bus.$on('groupChildMove', this.moveChart)
      this.$store.commit('setChartListId', `chartList${this.timestamp}`)
      window.addEventListener('resize', this.resize)
    }
    if (!document.onmousemove) { // 添加鼠标移动事件监听
      document.onmousemove = lineChartMove
    }
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resize)
  },
  watch: {
    // 监听查看模式变化
    '$store.state.panel.mode': {
      immediate: true,
      handler () {
        setTimeout(() => {
          this.resize()
        })
      }
    },
    // 监听变量数组
    variablesArr: {
      handler (newVal, oldVal) {
        // 比较变量 图表是否显示/隐藏
        this.compareVariables()

        this.repeatVariableFn()
      }
    },
    panelLock: {
      handler (flag) {
        if (!flag) {
          this.tempList.forEach(item => {
            if (!this.copyDataList.find(chart => chart.id === item.id)) {
              this.copyDataList.push(item)
            }
          })
          this.onScroll(this.scrollTop)
        } else {
          // 比较变量 图表是否显示/隐藏
          this.compareVariables()
        }
      }
    },
    dataList: {
      immediate: true,
      deep: true,
      handler (n) {
        if (window.dataJson && (
          navigator.userAgent.match(/Mobi/i) ||
          navigator.userAgent.match(/Android/i) ||
          navigator.userAgent.match(/iPhone/i)
        )) { // 判断当前设备是否是 移动端设备
          // 当前设备是移动设备
          this.isPhone = true
        }
        this.gridLayoutShow = false
        this.firstInit = true
        this.gridLayoutLoading = true
        this.noData = !n || n.length < 1
        if (!this.isGroup) {
          const position = getLayoutPosition(n)
          this.$store.commit('setChartLastPosition', position)
        }
        let tempList = n.map(item => {
          let param = ''
          let height = ''
          if (this.isPhone && item.type !== 'group') {
            item.x = 0
            item.y = 0
            item.span = 12
            item.height = 2
          }
          if (item.param) {
            param = JSON.parse(JSON.stringify(item.param))
            // try {
            //   param = JSON.parse(item.param)
            // } catch (e) {
            //   console.info(e)
            // }
            if (item.y < 0) {
              item.y = 0
            }
            height = (item.type === 'group' && item.param.collapse) ? this.headerH : item.height
            // param.showHeader = true
            if (param.valueMapping) {
              param.valueMapping.forEach(valueMapping => {
                if (!valueMapping.show) {
                  valueMapping.show = false
                }
                if (valueMapping.text && !valueMapping.display) {
                  valueMapping.display = valueMapping.text
                }
                if (valueMapping.columns && !valueMapping.column) {
                  valueMapping.column = valueMapping.columns
                }
              })
            }
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
          this.tempList = JSON.parse(JSON.stringify(tempList))
          this.copyDataList = JSON.parse(JSON.stringify(tempList))
          // 比较变量 图表是否显示/隐藏
          this.compareVariables()

          this.repeatVariableFn()
          tempList = null
          setTimeout(() => {
            this.gridLayoutShow = true
            if (!this.isGroup) {
              if (!this.isExportHtml) {
                this.onScroll()
              } else {
                this.onScroll(999999)
              }
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
  flex: 1;
  height: auto !important;
  width: 100%;
  border-top: 1px solid transparent;
  box-sizing: border-box;
}
.group-hide-header {
  height: 40px!important;
}
</style>
