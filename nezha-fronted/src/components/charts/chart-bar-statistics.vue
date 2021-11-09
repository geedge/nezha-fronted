<style lang="scss">
  @import './chart.scss';
</style>
<template>
  <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box resize-box-echarts" ref="resizeBox">
      <div class="chart-single-stat"  :id="'chartPieChart'+chartIndex" @mouseenter="caretShow=true" @mouseleave="caretShow=false">
        <loading  :ref="'localLoading'+chartIndex"></loading>
        <div class="clearfix chartTitle" :class="{'dragTitle':dragTitleShow}" :id="'chartTitle'+chartIndex">
          <el-popover
            v-if="isError"
            :close-delay=10
            placement="top-start"
            trigger="hover"
            popper-class="chart-error-popper">
            <div >{{errorContent}}</div>
            <span slot="reference" style="" class="panel-info-corner panel-info-corner--error">
              <i class="nz-icon nz-icon-warning fa"></i>
              <span class="panel-info-corner-inner"></span>
            </span>
          </el-popover>
          <el-dropdown trigger="click" class="nz-chart-top" :key="'chartDropdown'+chartIndex"  v-clickoutside="clickos" :class="{'move-able':!isLock}">
            <el-dropdown-menu style="display: none"></el-dropdown-menu>
            <span class="el-dropdown-link chart-title">
<!--              <span class="chart-title-text">{{chartData.name}}</span>-->
              <span class="chart-title-text" v-on:mouseover="changeActive()" v-on:mouseout="removeActive()">{{chartData.name}}</span>
              <transition  name="el-fade-in-linear">
                <span v-show="chartDataList" class="chart-title-pit" >{{chartData.name}}</span>
              </transition>
              <span class="chart-title-icon"  :class="{'visible':caretShow,'hidden':!caretShow}">
                <span v-if="chartData.remark">
                  <el-tooltip :content="chartData.remark" placement="top" effect="light">
                     <i class="nz-icon nz-icon-info-normal"></i>
                  </el-tooltip>
                </span>
                <span  v-has="'panel_chart_edit'" :title="$t('dashboard.refresh')" class="" @click="refreshChart">
                  <i class="nz-icon nz-icon-replay"></i>
                </span>
                 <span  @click="showAllScreen"  v-if="from !== 'chartTemp'" class="" :title="$t('dashboard.screen')">
                  <i class="nz-icon nz-icon-maxview"></i>
                 </span>
                <span><i class="el-icon-more" @click.stop="dropdownMenuShow=!dropdownMenuShow"></i></span>
              </span>
            </span>
            <ul slot="dropdown" v-show="dropdownMenuShow"  :id="'dropdownUl'+chartIndex"  class="el-dropdown-menu nz-chart-dropdown"  style="" >
              <li  @click="editChart" class="el-dropdown-menu__item">
                <i class="nz-icon nz-icon-edit" style="font-size: 16px;"></i><span>{{$t('dashboard.edit')}}</span></li>
              <li  v-has="'panel_chart_delete'" class="el-dropdown-menu__item" @click="removeChart">
                <i class="nz-icon nz-icon-delete" style="font-size: 16px;"></i>{{$t('dashboard.delete')}}</li>
              <li  v-has="'panel_chart_add'" class="el-dropdown-menu__item" @click="duplicate">
                <i class="el-icon-copy-document" style="font-size: 16px;"></i>{{$t('dashboard.duplicate')}}</li>
              <li  v-has="'panel_chart_edit'"  v-if="from !== 'chartTemp'&&chartData.pid" class="el-dropdown-menu__item" @click="$emit('sync')">
                <i class="nz-icon nz-icon-sync" style="font-size: 16px;"></i>{{$t('overall.syncChart')}}</li>
            </ul>
          </el-dropdown>
        </div>
        <div :id="'pie-chart-local-'+chartIndex" ref="pieChartLocal" style="display: flex;justify-content: center"></div>
        <div class="chart-no-data" v-show="noData">No Data</div>
        <div class='legend-container' ref="legendArea" v-show="firstShow">
          <div v-for="(item, index) in legend" :title="item.alias?item.alias:item.name"  @click="clickLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGrey[index]}" :key="'legend_' + item.name+'_'+index">
            <span class="legend-shape" :style="{background:(isGrey[index]?'#D3D3D3':item.color)}"></span>{{item.alias?item.alias:item.name}}
          </div>
        </div>
        <!--全屏-->
        <el-dialog class="nz-dialog table-chart-dialog" :title="$t('dashboard.panel.view')" @opened="initChart('screen')"
                   :visible.sync="screenModal"
                   width="96%"  @close="screenModal = false" :modal-append-to-body="false">
          <div slot="title">
            <span class="nz-dialog-title">{{data.name}}</span>
            <div class="float-right panel-calendar dialog-tool">
              <!--              <time-picker ref="calendarPanel" class="nz-dashboard-picker" style="margin-top: -12px;" @change="dateChange"></time-picker>-->
              <pick-time :refresh-data-func="dateChange" v-model="searchTime" :use-chart-unit="false" ref="pickTime" style="height: 28px;" id="single-chart"></pick-time>
            </div>
            <!--            <span class="float-right  dialog-tool" @click="screenRefreshChart" style="margin-right: 15px"><i class="global-active-color nz-icon nz-icon-refresh"/></span>-->
          </div>
          <div class="single-stat-screen-container"  >
            <div :id="'pie-chart-screen-'+chartIndex" ref="pieChartScreen" style="width: 100%;height: 100%;"></div>
            <div :id="'screenLegendArea'+chartIndex"   class="legend-container legend-container-screen">
              <div v-for="(item, index) in legendScreen" :title="item.alias?item.alias:item.name"  @click="clickScreenLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGreyScreen[index]}"  :key="'legend_' + item.name+'_'+index">
                <span class="legend-shape" :style="{background:(isGreyScreen[index]?'#D3D3D3':item.color)}"></span>{{item.alias?item.alias:item.name}}
                <br/><!--bgColorList[index]-->
              </div>
            </div>
          </div>
          <loading  :ref="'localLoadingScreen'+chartIndex"></loading>
        </el-dialog>
      </div>
      <span class="vue-resizable-handle" @mousedown="startResize" v-if="!isLock"></span>
    </div>
  </div>
</template>

<script>
import chartDataFormat from './chartDataFormat'
import loading from '../common/loading'
import * as echarts from 'echarts'
import { getChart, setChart, getMousePoint } from '../common/js/common'
import chartConfig from '../page/dashboard/overview/chartConfig'
import { randomcolor } from '../common/js/radomcolor/randomcolor'
import { chartResizeTool, formatScientificNotation } from '@/components/common/js/tools'
import chartDataList from '@/components/common/mixin/chartDataList'
export default {
  name: 'pieChart', // 饼图 或者 柱状图的统计
  components: {
    loading: loading
  },
  props: {
    tempDom: Object,
    chartData: {
      type: Object
    },
    // 看板id
    panelId: {
      type: Number,
      default: 0
    },
    editChartId: {
      type: String,
      default: 'editChartId'
    },
    chartIndex: {
      type: Number,
      default: 0
    },
    from: { type: String },
    isLock: { type: Boolean, default: false }
  },
  mixins: [chartDataList],
  data () {
    return {
      data: {}, // 该图表信息,chartItem
      noData: false,
      unit: {},
      isError: false,
      errorContent: '',
      seriesItem: [], // 保存信息
      seriesItemScreen: [], // 全屏数据
      pieData: [],
      mapping: '', // 满足valueMapping时 mapping的值
      images: '',
      loading: Object,
      items: {
        metric_name: [], // 每条数据列名称
        xAxis: [],
        theData: [] // series数据组
      },
      panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
      firstLoad: false, // 是否第一次加载
      screenModal: false,
      // 查询数据使用
      filter: {
        start_time: '',
        end_time: ''
      },
      firstShow: false, // 默认不显示操作按钮,
      caretShow: false,
      dragTitleShow: false,
      dropdownMenuShow: false,
      divFirstShow: false,
      searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()], // 全屏显示的时间
      oldSearchTime: [],
      legend: [],
      legendScreen: [],
      isGrey: [],
      isGreyScreen: [],
      echart: null,
      echartScreen: null,
      bgColorList: [],
      stableFilter: {},
      option: {
        title: {
          show: false
        },
        legend: {
          show: false
        },
        grid: {
          top: 30,
          left: 10,
          right: 30,
          containLabel: true,
          bottom: 20// 156
        },
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(221,228,237,1)',
          borderColor: 'rgba(255,255,255,0)',
          textStyle: {
            color: '#000'
          },
          axisPointer: {
            snap: false,
            animation: false
          },
          extraCssText: 'z-index:1000;'
        },
        series: null,
        stepWidth: null,
        chartDot: 2
      }
    }
  },
  created () {
  },
  computed: {},
  watch: {
    dropdownMenuShow (n) {
      this.$emit('dropmenu-change', n)
    }
  },
  methods: {
    startResize (e) {
      const vm = this
      this.$chartResizeTool.start(vm, this.data, e, this.chartIndex)
    },
    startLoading (area) {
      if (area === 'screen') {
        this.$refs['localLoadingScreen' + this.chartIndex].startLoading()
      } else {
        // this.showLoading = true;
        this.$refs['localLoading' + this.chartIndex].startLoading()
      }
    },
    endLoading (area) {
      if (area === 'screen') {
        // this.showLoadingScreen = false;
        this.$refs['localLoadingScreen' + this.chartIndex].endLoading()
      } else {
        // this.showLoading = false;
        this.$refs['localLoading' + this.chartIndex].endLoading()
      }
    },
    showLoad (chartItem) {
      this.$nextTick(() => {
        const chartBox = document.getElementById('chartPieChart' + this.chartIndex)
        let height = Math.floor(chartItem.height / this.$chartResizeTool.stepHeight) * this.$chartResizeTool.stepHeight// 图表高度四舍五入
        if (height < this.$chartResizeTool.minHeight) {
          height = this.$chartResizeTool.minHeight
        }
        chartBox.style.height = `${height - this.$chartResizeTool.chartBlankHeight}px`
      })
      this.clearData()
      this.firstShow = false
      this.$refs['localLoading' + this.chartIndex].startLoading()
      this.divFirstShow = true
    },
    clearData () {
      if (getChart(this.chartIndex)) {
        getChart(this.chartIndex).clear()
        // getChart(this.chartIndex).dispose();//关闭销毁实例 不再占用内存
      }
    },
    screenRefreshChart () {
      this.$refs.calendarPanel.timeChange(this.$refs.calendarPanel.nowTimeType, 'chart')
    },
    // 重新请求数据 刷新操作-local
    refreshChart () {
      this.dropdownMenuShow = false
      const id = this.data.id
      this.clearChart()
      this.$refs['localLoading' + this.chartIndex].startLoading()
      this.firstShow = false
      this.$emit('on-refresh-data', id)
    },
    // 编辑图表
    editChart () {
      this.dropdownMenuShow = false
      this.$emit('on-edit-chart-block', this.data.id)
    },
    // 删除该图表
    removeChart () {
      this.dropdownMenuShow = false
      this.$emit('on-remove-chart-block', this.data.id)
    },
    // 全屏时间条件查询
    dateChange (time) {
      this.seriesItemScreen = []
      this.seriePieChart = ''
      this.startLoading('screen')
      this.$emit('on-search-data', this.data.id, this.searchTime)
    },
    clickos () {
      this.dropdownMenuShow = false
    },
    clearChart () {
      this.data = {}
    },
    duplicate () {
      this.dropdownMenuShow = false
      this.$emit('on-duplicate-chart-block', this.data.id)
    },
    // 全屏查看
    showAllScreen () {
      this.dropdownMenuShow = false
      this.searchTime = []
      this.$set(this.searchTime, 0, this.oldSearchTime[0])
      this.$set(this.searchTime, 1, this.oldSearchTime[1])
      this.$refs.pickTime.$refs.timePicker.setCustomTime(this.stableFilter)
      this.screenModal = true
    },
    resize (chartItem) {
      if (getChart(this.chartIndex)) {
        const divHeight = this.$refs.legendArea.offsetHeight
        getChart(this.chartIndex).resize({ height: (this.data.height * this.stepWidth - divHeight - chartResizeTool.titleHeight - chartResizeTool.chartBlankHeight) })
      }
    },
    // 设置数据, filter区分
    setData (chartItem, seriesItem, panelId, filter, legend, area, errorMsg) {
      this.data = chartItem
      if (chartItem.type === 'bar') {
        this.option.xAxis = {
          type: 'category',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          showAllSymbol: false,
          axisPointer: { // y轴上显示指针对应的值
            show: false
          },
          axisLabel: {
            margin: 8,
            formatter (params) {
              const dataLength = seriesItem.length || 1
              const chartWidth = (document.getElementById('chart-' + chartItem.id).offsetWidth - 80) / dataLength// 容器宽 - padding - 空余
              const length = Math.ceil((chartWidth) / 16)
              let val = ''
              if (params.length > length) {
                val = params.substr(0, length) + '...'
                return val
              } else {
                return params
              }
            }
          }
        }
        const maxValueCopies = this.getMaxValue(seriesItem, chartItem)
        let dot = this.chartDot = maxValueCopies.dot || 2
        const maxValue = maxValueCopies.maxValue
        const copies = maxValueCopies.copies
        const unit = maxValueCopies.unit
        this.option.yAxis = {
          type: 'value',
          // maxInterval:{},
          // 去掉y轴--start
          minInterval: chartDataFormat.Interval(maxValue, copies, unit.type, 'min'),
          maxInterval: chartDataFormat.Interval(maxValue, copies, unit.type, 'max') * Math.ceil(seriesItem.length / 5),
          // 去掉y轴--end
          axisLabel: {
            show: true,
            fontSize: 10,
            formatter (val, index) {
              const value = formatScientificNotation(val, 2)
              // const flag = JSON.stringify(value).length > JSON.stringify(chartDataFormat.Interval(maxValue, copies, unit.type)).length
              if (chartDataFormat.Interval(maxValue, copies, unit.type, 'min') < 1 && dot < 2) {
                dot = 2
              }
              if (dot == 0) {
                dot = 1
              }
              return unit.compute(value, index, -1, dot)
            }
          }
          // boundaryGap:[0,0.2]
        }
        const nweSeriesItem = []
        seriesItem[0].data.forEach((item, index) => {
          const obj = { ...seriesItem[0] }
          const legendShow = legend[index].alias ? legend[index].alias : legend[index].name
          obj.name = legend[index].name
          obj.data = [[legendShow, item.value]]
          obj.stack = true
          if (chartItem.param.threshold) {
            obj.markLine = {
              silent: true,
              symbol: ['circle', 'circle'],
              label: {
                distance: this.computeDistance(chartDataFormat.getUnit(chartItem.unit ? chartItem.unit : 2).compute(chartItem.param.threshold)),
                formatter (params) {
                  return chartDataFormat.getUnit(chartItem.unit ? chartItem.unit : 2).compute(params.value)
                }
              },
              lineStyle: {
                color: '#d64f40',
                width: 2,
                type: 'dotted'
              },
              data: [{
                yAxis: Number(chartItem.param.threshold)
              }]
            }
          }
          nweSeriesItem.push(obj)
        })
        seriesItem = nweSeriesItem
      }
      if (filter) {
        this.stableFilter = filter
      }
      if (errorMsg && errorMsg !== '') {
        this.isError = true
        this.errorContent = errorMsg
      } else {
        this.isError = false
        this.errorContent = ''
      }
      if (seriesItem || seriesItem.data.length < 1) { // 0 为false
        this.noData = false
      } else {
        this.noData = true
      }
      this.legend = legend
      this.legendScreen = legend
      legend && this.setColor(legend.length)
      legend && legend.forEach((t, i) => { t.color = this.bgColorList[i] })

      this.$set(this.option, 'color', this.bgColorList)
      this.pieData = seriesItem
      if (area === 'showFullScreen') { // 全屏按时间查询
        this.data = chartItem
        this.unit = chartDataFormat.getUnit(this.data.unit)
        this.initChart('screen')
        this.searchTime[0] = filter.start_time// 将列表的查询时间复制给全屏的查询时间
        this.searchTime[1] = filter.end_time
        this.endLoading('screen')
      } else {
        this.divFirstShow = true

        this.firstShow = true // 展示操作按键

        this.panelIdInner = panelId
        this.data = chartItem
        this.unit = chartDataFormat.getUnit(this.data.unit)
        this.initChart('local')
        if (filter) { // 保存数据,用于同步时间
          this.searchTime[0] = filter.start_time// 将列表的查询时间复制给全屏的查询时间
          this.searchTime[1] = filter.end_time
          this.oldSearchTime[0] = this.searchTime[0]
          this.oldSearchTime[1] = this.searchTime[1]
        }
        this.endLoading()
      }
    },
    computeDistance (str) {
      const span = document.querySelector('.temp-dom')
      span.textContent = str
      const txtWidth = parseFloat(window.getComputedStyle(span).width)
      return Number('-' + (txtWidth + 5))
    },
    formatLegend (chartWidth, name) {
      if (!name) {
        return ''
      }
      // 计算宽度
      const span = document.querySelector('.temp-dom')
      span.textContent = name
      const txtWidth = parseFloat(window.getComputedStyle(span).width) - this.tempDom.width
      if (txtWidth < chartWidth) {
        return name
      } else {
        const charNum = `${(chartWidth - 100) / (txtWidth / name.length)}`
        return name.slice(0, charNum) + '...'
      }
    },
    initChart (type) {
      this.option.series = this.pieData
      this.stepWidth = document.getElementById('listContainer').offsetWidth / 12
      if (type == 'local') {
        this.initLocal()
      } else {
        this.initScreen()
      }
    },
    initLocal () {
      const self = this
      const dom = document.getElementById('pie-chart-local-' + this.chartIndex)
      if (!this.echart) {
        this.echart = echarts.init(dom)
        setChart(this.chartIndex, this.echart)
      }
      if (this.legend) {
        this.isGrey = []
        this.legend.map((item, i) => {
          const legend = {
            name: item.name,
            alias: item.alias,
            color: item.color,
            showText: this.formatLegend(dom.clientWidth, item.name)
          }
          self.isGrey.push(false)
          return legend
        })
      }

      this.$nextTick(() => {
        const vm = this
        setTimeout(function () {
          const divHeight = self.$refs.legendArea.offsetHeight
          if (!self.chartData.height) {
            getChart(self.chartIndex).resize({ height: (400 - divHeight - self.$chartResizeTool.titleHeight - self.$chartResizeTool.chartBlankHeight) })
          } else {
            getChart(self.chartIndex).resize({ height: (self.chartData.height * vm.stepWidth - divHeight - self.$chartResizeTool.titleHeight - self.$chartResizeTool.chartBlankHeight) })
          }
          self.$set(self.option.tooltip, 'formatter', self.formatterFunc)
          self.$set(self.option.tooltip, 'position', function (point, params, dom, rect, size) {
            dom.style.transform = 'translateZ(0)'
            const windowWidth = window.innerWidth// 窗口宽度
            const windowHeight = window.innerHeight// 窗口高度
            const windowMouse = getMousePoint()
            // 提示框位置
            let x = 0
            let y = 0
            // 当前鼠标位置
            const pointX = point[0]
            const pointY = point[1]
            // 外层div大小
            const viewWidth = size.viewSize[0]
            // const viewHeight = size.viewSize[1]
            // 提示框大小
            const boxWidth = size.contentSize[0]
            const boxHeight = size.contentSize[1]
            if (!self.screenModal) { // 本地显示
              const chartDom = document.getElementById(self.chartData.name + '_' + self.chartData.id)
              if (chartDom) {
                // const parTop = document.getElementById(self.chartData.title + '_' + self.chartData.id).offsetTop
                const parleft = document.getElementById(self.chartData.name + '_' + self.chartData.id).offsetLeft

                const parent = document.getElementById('tableList')
                // const parClientHeight = parent.clientHeight// 可视高度
                const parClientWidth = parent.clientWidth// 可视宽度
                // const parScrollTop = parent.scrollTop
                if ((parClientWidth - pointX - parleft - 20) >= boxWidth) { // 说明鼠标在左边放不下提示框
                  x = pointX + 10
                } else {
                  x = pointX - boxWidth
                }
                if (windowMouse.y + 50 + boxHeight < windowHeight) { // 说明鼠标上面放不下提示框
                  y = pointY + 15
                } else {
                  y = pointY - boxHeight - 10
                }
                return [x, y]
              } else { // preview page
                if (windowMouse.x < (windowWidth / 2)) { // 说明鼠标在左边放不下提示框
                  x = pointX + 15
                } else {
                  x = pointX - boxWidth - 15
                }
                if (windowMouse.y + 50 + boxHeight < windowHeight) { // 说明鼠标上面放不下提示框
                  y = pointY + 15
                } else {
                  y = pointY - boxHeight - 10
                }
                return [x, y]
              }
            } else {
              if (pointX < (viewWidth / 2)) { // 说明鼠标在左边放不下提示框
                x = pointX + 10
              } else {
                x = pointX - boxWidth
              }
              if (windowMouse.y + 50 + boxHeight < windowHeight) { // 说明鼠标上面放不下提示框
                y = pointY + 15
              } else {
                y = pointY - boxHeight - 10
              }
              return [x, y]
            }
          })
          if (self.pieData[0]) {
            if (self.pieData[0].data.length > 0) {
              getChart(self.chartIndex).clear()
              getChart(self.chartIndex).setOption(self.option)// 创建图表
              self.noData = false
            } else {
              self.noData = true
              self.option = chartConfig.getOption('noData')
              getChart(self.chartIndex).clear()
              getChart(self.chartIndex).setOption(self.option)// 创建图表
            }
          }
          self.$refs['localLoading' + self.chartIndex].endLoading()
          self.firstShow = true // 展示操作按键
        }, 100)
      })
    },
    initScreen () {
      const self = this
      const dom = document.getElementById('pie-chart-screen-' + this.chartIndex)
      if (!this.echartScreen) {
        this.echartScreen = echarts.init(dom)
      }
      if (this.legendScreen) {
        this.isGreyScreen = []
        this.legendScreen = this.legendScreen.map((item, i) => {
          const legend = {
            name: item.name,
            alias: item.alias,
            color: item.color,
            showText: this.formatLegend(dom.clientWidth, item.name)
          }
          self.isGreyScreen.push(false)
          return legend
        })
      }
      if (self.echartScreen) {
        self.echartScreen.clear()
        self.showLegend = true
        self.$refs['localLoadingScreen' + self.chartIndex].endLoading()
      }
      this.$nextTick(() => {
        const legendDiv = document.getElementById('screenLegendArea' + self.chartIndex)
        const divHeight = legendDiv.offsetHeight
        const screenHeight = document.documentElement.clientHeight || document.body.clientHeight
        const sumHeight = Math.floor(screenHeight * 0.99 * 0.8)// margin-top:1vh; dailog:80%
        self.$refs.pieChartScreen.style.height = `${sumHeight - divHeight - 58}px`
        self.echartScreen.resize({ height: (sumHeight - divHeight - 58) })// 图表的高度
        setTimeout(function () {
          self.$set(self.option.tooltip, 'formatter', self.formatterFunc)
          if (self.pieData[0].data.length > 0) {
            self.echartScreen.setOption(self.option)// 显示全屏界面
            self.noData = false
          } else {
            self.noData = true
            self.option = chartConfig.getOption('noData')
            self.echartScreen.setOption(self.option)// 显示全屏界面
          }
          self.echartScreen.on('finished', function () {
            const legendDiv = document.getElementById('screenLegendArea' + self.chartIndex)
            const divHeight = legendDiv.offsetHeight
            const screenHeight = document.documentElement.clientHeight || document.body.clientHeight
            const sumHeight = Math.floor(screenHeight * 0.99 * 0.8)// margin-top:1vh; dailog:80%
            self.$refs.pieChartScreen.style.height = `${sumHeight - divHeight - 58}px`
            self.echartScreen.resize({ height: (sumHeight - divHeight - 58) })// 图表的高度
            self.echartScreen.off('finished')
          })
        }, 100)
      })
    },
    dealLegendAlias (legend, expression) {
      if (/\{\{.+\}\}/.test(expression)) {
        const labelValue = expression.replace(/(\{\{.+?\}\})/g, function (i) {
          const label = i.substr(i.indexOf('{{') + 2, i.indexOf('}}') - i.indexOf('{{') - 2)
          const reg = new RegExp(label + '=".+?"')
          let value = null
          if (reg.test(legend)) {
            const find = legend.match(reg)[0]
            value = find.substr(find.indexOf('"') + 1, find.lastIndexOf('"') - find.indexOf('"') - 1)
          }
          return value || label
        })
        return labelValue
      } else {
        return expression
      }
    },
    clickLegend (legendName, index) {
      /* 点击legend
          * 1.当前如果是全高亮状态，则全部置灰，只留被点击的legend高亮
          * 2.如果点击的是唯一高亮的legend，则变为全高亮状态
          * 3.否则只改变被点击的legend状态
          * */
      let highlightNum = 0 // 高亮数量
      this.isGrey.forEach(g => {
        if (!g) {
          highlightNum++
        }
      })
      const hasGrey = highlightNum < this.isGrey.length // 是否有置灰的
      const curIsGrey = this.isGrey[index] // 当前legend的状态
      const currentIsTheOnlyOneHighlight = !curIsGrey && highlightNum === 1 // 当前legend是否是目前唯一高亮的

      const echart = getChart(this.chartIndex)
      if (echart) {
        if (!hasGrey) { // 1.除当前legend外全置灰
          echart.dispatchAction({
            type: 'legendInverseSelect'
          })
          echart.dispatchAction({
            type: 'legendSelect',
            name: legendName
          })
          this.isGrey = this.isGrey.map((g, i) => i !== index)
        } else if (currentIsTheOnlyOneHighlight) { // 2.全高亮
          echart.dispatchAction({
            type: 'legendAllSelect'
          })
          this.isGrey = this.isGrey.map(() => false)
        } else {
          const type = curIsGrey ? 'legendSelect' : 'legendUnSelect'
          echart.dispatchAction({
            type: type,
            name: legendName
          })
          this.$set(this.isGrey, index, !this.isGrey[index])
        }
      }
    },
    clickScreenLegend (legendName, index) {
      /* 点击legend
          * 1.当前如果是全高亮状态，则全部置灰，只留被点击的legend高亮
          * 2.如果点击的是唯一高亮的legend，则变为全高亮状态
          * 3.否则只改变被点击的legend状态
          * */
      let highlightNum = 0 // 高亮数量
      this.isGreyScreen.forEach(g => {
        if (!g) {
          highlightNum++
        }
      })
      const hasGrey = highlightNum < this.isGreyScreen.length // 是否有置灰的
      const curIsGrey = this.isGreyScreen[index] // 当前legend的状态
      const currentIsTheOnlyOneHighlight = !curIsGrey && highlightNum === 1 // 当前legend是否是目前唯一高亮的

      const echart = this.echartScreen
      if (echart) {
        if (!hasGrey) { // 1.除当前legend外全置灰
          echart.dispatchAction({
            type: 'legendInverseSelect'
          })
          echart.dispatchAction({
            type: 'legendSelect',
            name: legendName
          })
          this.isGreyScreen = this.isGreyScreen.map((g, i) => i !== index)
        } else if (currentIsTheOnlyOneHighlight) { // 2.全高亮
          echart.dispatchAction({
            type: 'legendAllSelect'
          })
          this.isGreyScreen = this.isGreyScreen.map(() => false)
        } else {
          const type = curIsGrey ? 'legendSelect' : 'legendUnSelect'
          echart.dispatchAction({
            type: type,
            name: legendName
          })
          this.$set(this.isGreyScreen, index, !this.isGreyScreen[index])
        }
      }
    },
    setColor (colorNum) {
      this.bgColorList = [
        '#FF5200', '#3685FF', '#FF8D00', '#00DCA2',
        '#954Eff', '#FFCB01', '#f65A96', '#00BFD0',
        '#FF8BEA', '#4D7693', '#72577C', '#99D750',
        '#DD8270', '#C475EE', '#7E83FB', '#7EB090',
        '#FF9094', '#00CCF5', '#CF6684', '#4E55FF'
      ]
      for (let i = 0; i < colorNum - 19; i++) {
        this.bgColorList.push(randomcolor())
      }
    },
    formatterFunc (params, ticket, callback) {
      const chartInfo = this.chartData
      return `
                <div>
                    <div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;  min-width: 150px; max-width: 600px; line-height: 18px; font-size: 14px;">
                        <div style="max-width: 500px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom: 5px">${this.legend[params.seriesIndex].alias}</div>
                        <div style="font-size:12px;display:flex;justify-content: space-between;">
                            <div>value</div>
                            <div>${chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(params.value[1], null, -1, this.chartDot ? this.chartDot : 2)}</div>
                        </div>
                    </div>
                </div>
               `
    },
    getMaxValue (dataArg, chartInfo) {
      let maxValue = 0
      let minValue = 0
      if (chartInfo.unit && dataArg.length > 0) {
        maxValue = 0
        minValue = 0
        for (let j = 0; j < dataArg.length; j++) {
          for (let i = 0; i < dataArg[j].data.length; i++) {
            if (!isNaN(dataArg[j].data[i].value)) {
              maxValue = (maxValue < Number(dataArg[j].data[i].value) ? Number(dataArg[j].data[i].value) : maxValue)
              minValue = (minValue > Number(dataArg[j].data[i].value) ? Number(dataArg[j].data[i].value) : minValue)
            }
          }
        }
      }
      const chartUnit = chartInfo.unit ? chartInfo.unit : 2
      const unit = chartDataFormat.getUnit(chartUnit)
      minValue = minValue > 0 ? 0 : minValue
      maxValue = maxValue - minValue
      maxValue = chartDataFormat.formatDatas(maxValue, unit.type, 'ceil', unit.ascii)
      let oldValue = maxValue
      let dot = 0
      if (maxValue == 1) {
        dot++
      }
      if (oldValue > 10) {
        while (oldValue > 10) {
          oldValue = oldValue / 10
        }
      } else if (oldValue < 1 && maxValue !== 0) {
        while (oldValue < 1 && oldValue > 0) {
          oldValue = oldValue * 10
          dot++
        }
        maxValue = Math.floor(oldValue) / Math.pow(10, dot)
        dot++
      }
      const copies = chartDataFormat.copies(oldValue, unit.type)
      let oldDot = 2
      if (maxValue <= 1) {
        oldDot = dot > 6 ? 6 : dot
      }
      return {
        maxValue,
        dot,
        copies,
        minValue,
        unit,
        oldDot
      }
    }
  },
  mounted () {
    this.firstLoad = false
  },
  beforeDestroy () {
    this.clearChart()
  }
}
</script>
