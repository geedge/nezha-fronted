<template>
  <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box resize-box-echarts" ref="resizeBox">
      <div class="line-chart-block" :id="'lineChartDiv'+chartIndex" @mouseenter="mouseEnterChart" @mouseleave="mouseLeaveChart">
        <loading :ref="'localLoading'+chartIndex"></loading>
        <div  v-if="from!=='project'&&from!=='topology'" :class="{'drag-disabled': this.filter.from == $CONSTANTS.fromRoute.alertRule}" :id="'chartTitle'+chartIndex" class="clearfix chartTitle topology-chart-title">
          <el-popover
            v-if="isError"
            placement="top-start"
            :close-delay=10
            trigger="hover"
            popper-class="chart-error-popper">
            <div >{{errorContent}}</div>
            <span slot="reference" class="panel-info-corner panel-info-corner--error">
              <i class="nz-icon nz-icon-warning fa"></i>
              <span class="panel-info-corner-inner"></span>
           </span>
          </el-popover>
          <span class="moreTitle">
            <el-popover
              v-if="seriesItem.length!==seriesItemArr.length"
              placement="top-start"
              :close-delay=10
              trigger="hover"
              popper-class="chart-warring-popper">
            <div class="moreTitle">{{$t('dashboard.dashboard.moreTitle')}}{{$t('dashboard.dashboard.showAll')}}{{seriesItem.length}}</div>
            <span slot="reference" class="panel-info-corner panel-info-corner--error"  @click="loadMore">
              <i class="nz-icon nz-icon-warning fa"></i>
              <span class="panel-info-corner-inner"></span>
           </span>
          </el-popover>
          </span>
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
                <span  v-has="'v_edit'" :title="$t('dashboard.refresh')" class="" @click="refreshChart">
                  <i class="nz-icon nz-icon-replay"></i>
                </span>
                 <span  @click="showAllScreen"  v-if="from !== 'chartTemp'" class="" :title="$t('dashboard.screen')">
                  <i class="nz-icon nz-icon-maxview"></i>
                 </span>
                <span  :title="$t('overall.more')"><i class="el-icon-more" @click.stop="dropdownMenuShow=!dropdownMenuShow"></i></span>
              </span>
            </span>
            <ul slot="dropdown" v-show="dropdownMenuShow"  :id="'dropdownUl'+chartIndex"  class="el-dropdown-menu nz-chart-dropdown"  style="" >
              <li  @click="editChart" class="el-dropdown-menu__item">
                <i class="nz-icon nz-icon-edit" style="font-size: 16px;"></i><span>{{$t('overall.edit')}}</span></li>
              <li  v-has="'main_delete'" class="el-dropdown-menu__item" @click="removeChart">
                <i class="nz-icon nz-icon-delete" style="font-size: 16px;"></i>{{$t('overall.delete')}}</li>
              <li  v-has="'main_add'" class="el-dropdown-menu__item" @click="duplicate">
                <i class="el-icon-copy-document" style="font-size: 16px;"></i>{{$t('overall.duplicate')}}</li>
              <li  v-has="'main_edit'"  v-if="from !== 'chartTemp'&&chartData.pid" class="el-dropdown-menu__item" @click="$emit('sync')">
                <i class="nz-icon nz-icon-sync" style="font-size: 16px;"></i>{{$t('overall.syncChart')}}</li>
            </ul>
          </el-dropdown>
        </div>
        <div  v-if="from==='topology'" :class="{'drag-disabled': this.filter.from == $CONSTANTS.fromRoute.alertRule}" :id="'chartTitle'+chartIndex" class="topology-chart-title">
<!--          <span class="topology-chart-title-text">{{chartData.name}}</span>-->
          <span class="topology-chart-title-text" v-on:mouseover="changeActive()" v-on:mouseout="removeActive()">{{chartData.name}}</span>
          <transition  name="el-fade-in-linear">
            <span v-show="chartDataList" class="chart-title-pit" >{{chartData.name}}</span>
          </transition>
        </div>
        <div class="line-area"  ref="lineChartArea"  :id="'lineChartArea'+chartIndex" v-show="firstShow" style="width:100%;"></div>
        <div class="chart-no-data" v-show="noData">No Data</div>
        <template v-if="!hasLegendOptions">
          <div class='legend-container' ref="legendArea" v-show="firstShow">
            <div v-for="(item, index) in legendListMore" :title="item.alias?item.alias:item.name"  @click="clickLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGrey[index]}" :key="'legend_' + item.name+'_'+index">
              <span class="legend-shape" :style="{background:(isGrey[index]?'#D3D3D3':item.color)}"></span><span class="legend-container__span">{{item.alias?item.alias:item.name}}</span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class='legend-container' ref="legendArea" v-show="firstShow&&legendListMore.length">
            <table style="width: 100%" border="0" cellpadding="0" cellspacing="0">
              <th style="width: 100%"></th>
              <template v-for="(legendOption, index) in legendOptions">
                <th v-if="legendOption.value == 'on'" :key="index" class="option-th legend-option-cell" >
                  <span @click="legendValueSort(legendOption,legendListMore,legendOptions)">{{legendOption.option}}</span>
                  <span ><i style="font-size: 12px !important;" :class="{'nz-icon nz-icon-arrow-down':legendOption.sort =='asc','nz-icon nz-icon-arrow-up':legendOption.sort=='desc'}" ></i></span>
                </th>
              </template>
              <tbody>
              <tr v-for="(item, index) in legendListMore" :key="'legend_' + item.name+'_'+index">
                <td>
                  <div :title="item.alias?item.alias:item.name"  @click="clickLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGrey[index]}" >
                    <span class="legend-shape" :style="{background:(isGrey[index]?'#D3D3D3':item.color)}"></span><span class="legend-container__span">{{item.alias?item.alias:item.name}}</span>
                  </div>
                </td>
                <template v-for="(legendOption, i) in legendOptions">
                  <td v-if="legendOption.value == 'on'" :key="i" class="legend-option-cell">{{formatLegendData(item[legendOption.option])}}</td>
                </template>
              </tr>
              </tbody>
            </table>
          </div>
        </template>
        <!--
        <Modal title="查看" v-model="screenModal" width="96%" class="line-chart-block-modal">-->
        <el-dialog class="line-chart-block-modal nz-dialog"
                   :title="$t('overall.view')"
                   :visible.sync="screenModal"
                   width="90%"
                   @close="screenModal = false;screenLegendListMore=[]"
                   style="margin-top: 1vh !important;"
                   @opened="initDialog"
                   @closed="closeDialog"
                   :modal-append-to-body="false"
        >
          <el-popover
            v-if="isError"
            placement="top-start"
            :close-delay=10
            trigger="hover"
            popper-class="chart-error-popper">
            <div >{{errorContent}}</div>
            <span slot="reference"  class="panel-info-corner panel-info-corner--error">
                <i class="nz-icon nz-icon-warning fa-model" ></i>
                <span class="panel-info-corner-inner"></span>
            </span>
          </el-popover>
          <span class="moreTitle">
            <el-popover
              v-if="seriesItemScreen.length!==seriesItemArrScreen.length"
              placement="top-start"
              :close-delay=10
              trigger="hover"
              popper-class="chart-warring-popper">
            <div class="moreTitle">{{$t('dashboard.dashboard.moreTitle')}}{{$t('dashboard.dashboard.showAll')}}{{seriesItemScreen.length}}</div>
            <span slot="reference" class="panel-info-corner panel-info-corner--error"  @click="loadScreenMore">
              <i class="nz-icon nz-icon-warning fa-model"></i>
              <span class="panel-info-corner-inner"></span>
           </span>
          </el-popover>
          </span>
          <div slot="title" >
            <span class="nz-dialog-title" v-show="!isExplore">{{data.name}}</span>
            <span class="nz-dialog-title" v-show="isExplore">&nbsp;</span>
            <div class="float-right panel-calendar dialog-tool">

              <pick-time :refresh-data-func="dateChange" v-model="searchTime" :use-chart-unit="false" :showMultiple="true" ref="pickTime" style="height: 28px;" id="line-chart"></pick-time>
            </div>
          </div>
          <div class="line-area" ref="screenShowArea"  id="screenShowArea"  style="margin-top:0px;" @mouseenter="mouseEnterFullChart" @mouseleave="mouseLeaveFullChart"></div>
          <div class="chart-no-data" v-show="noData">No Data</div>
          <template v-if="!hasLegendOptions">
            <div :id="'screenLegendArea'+chartIndex"  @mouseenter="mouseEnterFullChart" @mouseleave="mouseLeaveFullChart" class="legend-container legend-container-screen" v-show="showLegend">
              <div v-for="(item, index) in screenLegendListMore" :title="item.alias?item.alias:item.name"  @click="clickScreenLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGreyScreen[index]}"  :key="'legend_' + item.name+'_'+index">
                <span class="legend-shape" :style="{background:(isGreyScreen[index]?'#D3D3D3':item.color)}"></span><span class="legend-container__span">{{item.alias?item.alias:item.name}}</span>
                <br/><!--bgColorList[index]-->
              </div>
            </div>
          </template>
          <template v-else>
            <div :id="'screenLegendArea'+chartIndex"  @mouseenter="mouseEnterFullChart" @mouseleave="mouseLeaveFullChart" class="legend-container legend-container-screen" v-show="showLegend">
              <table style="width: 100%" border="0" cellpadding="0" cellspacing="0">
                <th style="width: 100%"></th>
                <template v-for="(legendOption, index) in screenLegendOptions">
                  <th v-if="legendOption.value == 'on'" :key="index" class="option-th legend-option-cell" >
                    <span @click="legendValueSort(legendOption,screenLegendListMore, screenLegendOptions)">{{legendOption.option}}</span>
                    <span ><i style="font-size: 12px !important;" :class="{'nz-icon nz-icon-arrow-down':legendOption.sort =='asc','nz-icon nz-icon-arrow-up':legendOption.sort=='desc'}" ></i></span>
                  </th>
                </template>
                <tbody>
                <tr v-for="(item, index) in screenLegendListMore" :key="'legend_' + item.name+'_'+index">
                  <td>
                    <div :title="item.alias?item.alias:item.name"  @click="clickScreenLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGreyScreen[index]}" >
                      <span class="legend-shape" :style="{background:(isGreyScreen[index]?'#D3D3D3':item.color)}"></span><span class="legend-container__span">{{item.alias?item.alias:item.name}}</span>
                    </div>
                  </td>
                  <template v-for="(legendOption, i) in screenLegendOptions">
                    <td v-if="legendOption.value == 'on'" :key="i" class="legend-option-cell">{{formatLegendData(item[legendOption.option])}}</td>
                  </template>
                </tr>
                </tbody>
              </table>
            </div>
          </template>

          <loading  :ref="'localLoadingScreen'+chartIndex"></loading>
        </el-dialog>
      </div>
      <span class="vue-resizable-handle" @mousedown="startResize" v-if="!isLock"></span>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import * as echarts from 'echarts'
import bus from '../../../libs/bus'
import loading from '../../common/loading'
import chartDataFormat from '../chartDataFormat'
import { randomcolor } from '../../common/js/radomcolor/randomcolor.js'
import chartConfig from '../../page/dashboard/overview/chartConfig'
import { getChart, setChart, lineChartMove, getMousePoint } from '../../common/js/common'
import { getMetricTypeValue, chartResizeTool, formatScientificNotation, dealLegendAlias } from '../../common/js/tools'
import moment from 'moment-timezone'
import chartDataList from '@/components/common/mixin/chartDataList'

export default {
  name: 'lineChartBlock',
  components: {
    loading: loading
  },
  props: {
    chartData: {
      type: Object
    },
    // 看板id
    dashboardId: {
      type: Number,
      default: 0
    },
    chartIndex: {
      type: Number,
      default: 0
    },
    // 展示设置内容
    showSetting: {
      type: Boolean,
      default: true
    },
    isExplore: {
      type: Boolean,
      default: false
    },
    tempDom: Object,
    from: { type: String },
    isLock: { type: Boolean, default: false },
    chartTitleShow: {
      type: Boolean,
      default: true
    },
    fromTopo: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    getButtonCode () {
      return function (from, type) {
        let code = ''
        switch (from) {
          case this.$CONSTANTS.fromRoute.dashboard:
            if (type == 'chartToEdit') {
              code = ''
            }
        }
        return code
      }
    }
  },
  mixins: [chartDataList],
  data () {
    return {
      data: {}, // 该图表信息,chartItem
      noData: false,
      seriesLength: 20,
      seriesItem: [], // 保存信息
      seriesItemArr: [], // 初次加载的数据
      seriesItemScreen: [],
      seriesItemArrScreen: [],
      legendListMore: [],
      screenLegendListMore: [],
      chartInfo: {},
      images: '',
      isStackArea: false,
      isError: false,
      errorContent: '',
      toolbox: false,
      items: {
        metric_name: [], // 每条数据列名称
        xAxis: [],
        theData: [] // series数据组
      },
      panelIdInner: '', // 看板id=dashboardId,原写作chart,由set_data获取
      chartName: '',
      firstLoad: false, // 是否第一次加载
      divFirstShow: false,
      /* highchartStore: null, // 保存图表数据
          echartStore:null,// 保存图表数据
          echartModalStore: null, // 全屏查看时数据 */
      chartType: 'line', // 图表类型
      screenModal: false,
      // 查询数据使用
      filter: {
        start_time: '',
        end_time: '',
        from: ''
      },
      stableFilter: {}, // 保存数据使用,初始化起止时间,单图or多图等
      /* legend:[],
          legendList:[],
          screenLegendList:[], */
      isGrey: [],
      isGreyScreen: [],
      bgColorList: [],
      stackTotalColor: null,
      firstShow: false, // 默认不显示操作按钮,
      caretShow: false,
      dropdownMenuShow: false,
      showLegend: true,
      searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()],
      oldSearchTime: [],
      screenTitleHeight: 58,
      hasLegendOptions: false,
      /* legendOptions:[], */
      screenLegendOptions: [],
      chartDot: 2,
      stepWidth: null
    }
  },
  watch: {
    dropdownMenuShow (n) {
      this.$emit('dropmenu-change', n)
    }
  },
  methods: {
    startResize (e) {
      const vm = this
      this.$chartResizeTool.start(vm, this.chartData, e, this.chartIndex)
    },
    setDivFirstShow (showDiv) {
      this.divFirstShow = showDiv
    },
    mouseEnterChart () {
      this.caretShow = true
      if (getChart(this.chartIndex)) {
        setTimeout(() => {
          getChart(this.chartIndex) && getChart(this.chartIndex).setOption({
            toolbox: {
              show: true
            }
          })
        }, 300)
      }
    },
    mouseLeaveChart () {
      this.caretShow = false
      if (getChart(this.chartIndex)) {
        setTimeout(() => {
          getChart(this.chartIndex) && getChart(this.chartIndex).setOption({
            toolbox: {
              show: false
            }
          })
        }, 300)
      }
    },
    mouseEnterFullChart () {
      if (this.echartModalStore) {
        setTimeout(() => {
          this.echartModalStore && this.echartModalStore.setOption({
            toolbox: {
              show: true
            }
          })
        }, 300)
      }
    },
    mouseLeaveFullChart () {
      if (this.echartModalStore) {
        setTimeout(() => {
          if (this.echartModalStore) {
            this.echartModalStore && this.echartModalStore.setOption({
              toolbox: {
                show: false
              }
            })
          }
        }, 300)
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
        const chartInfo = this.data
        const dataArg = this.seriesItem.filter((seriesItem, seriesIndex) => !this.isGrey[seriesIndex])
        const maxValueCopies = this.getMaxValue(dataArg, chartInfo)
        const maxValue = maxValueCopies.maxValue
        // const minValue = maxValueCopies.minValue
        // const dot = maxValueCopies.dot
        const copies = maxValueCopies.copies
        const unit = maxValueCopies.unit
        const option = {
          yAxis: {
            minInterval: chartDataFormat.Interval(maxValue, copies, unit.type, 'min'),
            maxInterval: chartDataFormat.Interval(maxValue, copies, unit.type, 'max') * Math.ceil(dataArg.length / 5)
          }
        }
        if (!maxValueCopies.copies) {
          option.yAxis.min = 0
          option.yAxis.max = 1
        } else {
          option.yAxis.max = undefined
        }
        if (unit.type == 'Time' || option.yAxis.maxInterval === 1) {
          delete option.yAxis.maxInterval
        }
        getChart(this.chartIndex) && getChart(this.chartIndex).setOption({
          yAxis: {
            ...option.yAxis
          }
        })
      }
    },
    clickLegend2 (legendName, index) {
      // 点击图表某一个legend，图表只显示当前点击的曲线或柱状图，其它隐藏，再次点击已选中的legend ，显示全部
      const curIsGrey = this.isGrey[index]
      if (getChart(this.chartIndex)) {
        this.legendListMore.forEach((item, i) => {
          const isGrey = this.isGrey[i]
          if (index != i) {
            if (!curIsGrey && !isGrey) {
              getChart(this.chartIndex).dispatchAction({
                type: 'legendUnSelect',
                name: item.name
              })
            } else if (!curIsGrey && isGrey) {
              getChart(this.chartIndex).dispatchAction({
                type: 'legendSelect',
                name: item.name
              })
            } else {
              getChart(this.chartIndex).dispatchAction({
                type: 'legendUnSelect',
                name: item.name
              })
            }
          } else {
            getChart(this.chartIndex).dispatchAction({
              type: 'legendSelect',
              name: item.name
            })
          }
        })
        this.isGrey.forEach((item, i) => {
          if (index != i) {
            if (!curIsGrey && !item) {
              this.$set(this.isGrey, i, true)
            } else if (!curIsGrey && item) {
              this.$set(this.isGrey, i, false)
            } else {
              this.$set(this.isGrey, i, true)
            }
          } else {
            if (item === true) {
              this.$set(this.isGrey, i, false)
            }
          }
        })
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
      const echart = this.echartModalStore
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
        const chartInfo = this.data
        const dataArg = this.seriesItemScreen.filter((seriesItem, seriesIndex) => !this.isGreyScreen[seriesIndex])
        const maxValueCopies = this.getMaxValue(dataArg, chartInfo)
        const maxValue = maxValueCopies.maxValue
        // const minValue = maxValueCopies.minValue
        // const dot = maxValueCopies.dot
        const copies = maxValueCopies.copies
        const unit = maxValueCopies.unit
        const option = {
          yAxis: {
            minInterval: chartDataFormat.Interval(maxValue, copies, unit.type, 'min'),
            maxInterval: chartDataFormat.Interval(maxValue, copies, unit.type, 'max') * Math.ceil(dataArg.length / 5)
          }
        }
        if (!maxValueCopies.copies) {
          option.yAxis.min = 0
          option.yAxis.max = 1
        } else {
          option.yAxis.max = undefined
        }
        if (unit.type == 'Time' || option.yAxis.maxInterval === 1) {
          delete option.yAxis.maxInterval
        }
        echart && echart.setOption({
          yAxis: {
            ...option.yAxis
          }
        })
      }
    },
    clickScreenLegend2 (legendName, index) {
      // 点击图表某一个legend，图表只显示当前点击的曲线或柱状图，其它隐藏，再次点击已选中的legend ，显示全部
      const curIsGrey = this.isGreyScreen[index]
      if (this.echartModalStore) {
        this.screenLegendListMore.forEach((item, i) => {
          const isGrey = this.isGreyScreen[i]
          if (index != i) {
            if (!curIsGrey && !isGrey) {
              this.echartModalStore.dispatchAction({
                type: 'legendUnSelect',
                name: item.name
              })
            } else if (!curIsGrey && isGrey) {
              this.echartModalStore.dispatchAction({
                type: 'legendSelect',
                name: item.name
              })
            } else {
              this.echartModalStore.dispatchAction({
                type: 'legendUnSelect',
                name: item.name
              })
            }
          } else {
            this.echartModalStore.dispatchAction({
              type: 'legendSelect',
              name: item.name
            })
          }
        })
        this.isGreyScreen.forEach((item, i) => {
          if (index != i) {
            if (!curIsGrey && !item) {
              this.$set(this.isGreyScreen, i, true)
            } else if (!curIsGrey && item) {
              this.$set(this.isGreyScreen, i, false)
            } else {
              this.$set(this.isGreyScreen, i, true)
            }
          } else {
            if (item === true) {
              this.$set(this.isGreyScreen, i, false)
            }
          }
        })
      }
    },
    clearData () {
      if (getChart(this.chartIndex)) {
        getChart(this.chartIndex).clear()
        // getChart(this.chartIndex).dispose();//关闭销毁实例 不再占用内存
      }
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
    // chartSite用于区分是全屏显示还是局部显示
    initChart (chartInfo, dataArg, ele, chartSite, legend) {
      this.legendMagicType = legend
      this.chartInfo = chartInfo
      const self = this
      self.isStackArea = false
      this.chartType = '' // 图表类型
      if (chartInfo.type === 4) { // line,bar
        this.chartType = 'line'
      }
      const minusTime = (new Date(this.searchTime[0]).getTime() - new Date(this.$refs.pickTime.$refs.multipleTime.searchTime[0]).getTime())
      this.minusTime = minusTime
      let minTime = null
      let maxTime = null
      if (dataArg.length > 0 && dataArg[0].data &&
          dataArg[0].data.length > 0 && dataArg[0].data[0].length > 0) {
        const len = dataArg[0].data.length - 1
        minTime = dataArg[0].data[0][0]
        maxTime = dataArg[0].data[len][0]
      }
      if (chartSite === 'local') {
        setChart(this.chartIndex, echarts.init(ele))
      } else if (chartSite === 'screen') {
        this.echartModalStore = echarts.init(ele)
      }
      const chartWidth = ele.clientWidth
      this.stepWidth = this.chartInfo.groupId ? (document.getElementById('listContainer').offsetWidth / 12) - 10 : document.getElementById('listContainer').offsetWidth / 12
      const stackIconBorderColor = (chartInfo.type === 'stackArea' ? '#53a3cb' : '#7e7e7e')
      const stackIconChooseBorderColor = (chartInfo.type === 'stackArea' ? '#7e7e7e' : '#53a3cb')
      let maxValueCopies = this.getMaxValue(dataArg, chartInfo)
      const maxValue = maxValueCopies.maxValue
      // let minValue = maxValueCopies.minValue
      if (chartInfo.unit && dataArg.length > 0) {
        // maxValue = dataArg[0].data[0][1]
        // minValue = dataArg[0].data[0][1]
        for (let j = 0; j < dataArg.length; j++) {
          dataArg[j].showAllSymbol = false
        }
      }
      let dot = this.chartDot = maxValueCopies.dot
      const copies = maxValueCopies.copies
      const unit = maxValueCopies.unit
      // const oldDot = maxValueCopies.oldDot
      let option = {
        title: {
          show: false
        },
        color: this.bgColorList,
        toolbox: {
          show: false,
          top: '0',
          right: '18',
          showTitle: false,
          feature: {
            dataZoom: {
              yAxisIndex: false,
              title: {
                zoom: self.$t('overall.toolBox.zoom'),
                back: self.$t('overall.toolBox.back')
              }
            },
            magicType: {
              type: ['stack'],
              title: {
                stack: self.$t('overall.toolBox.stack')
              },
              iconStyle: {
                borderColor: stackIconBorderColor
              },
              emphasis: {
                borderColor: stackIconChooseBorderColor
              }
            }
          },
          tooltip: { // 和 option.tooltip 的配置项相同
            show: true,
            position: 'bottom',
            formatter: function (param) {
              return param.title // 自定义的 DOM 结构
            },
            backgroundColor: 'rgba(255,255,255,0)',
            borderColor: 'rgba(255,255,255,0)',
            textStyle: {
              fontSize: 12,
              color: '#439AC6'
            }
          }
        },
        tooltip: {
          trigger: 'axis',
          confine: false,
          backgroundColor: 'rgba(221,228,237,1)',
          textStyle: {
            color: '#000'
          },
          axisPointer: {
            snap: false,
            animation: false
          },
          z: 9,
          animation: false,
          appendToBody: true,
          className: 'line-chart-block-Zindex',
          extraCssText: 'z-index:99999999;visibility:visible;',
          /* enterable:true, 导致tooltip不消失，显示多个tooltip */
          position: function (point, params, dom, rect, size) {
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
            if (chartSite === 'local') { // 本地显示
              const chartDom = document.getElementById(chartInfo.title + '_' + chartInfo.id)
              if (chartDom) {
                // const parTop = document.getElementById(chartInfo.title + '_' + chartInfo.id).offsetTop
                const parleft = document.getElementById(chartInfo.title + '_' + chartInfo.id).offsetLeft

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
          },
          formatter: function (params) {
            let str = '<div>'
            let sum = 0
            let showFlag = false
            let minusFlag = true
            params.forEach((item, i) => {
              const tip = legend[item.seriesIndex]
              const color = self.bgColorList[item.seriesIndex]
              if (i === 0 && tip.alias.indexOf('Previous ') === -1) {
                const value = bus.computeTimezone(item.data[0])
                const tData = new Date(value)
                str += '<div style="margin-bottom: 5px">'
                str += bus.timeFormate(tData)
                str += '</div>'
              }
              if (tip.alias.indexOf('Previous ') !== -1 && minusFlag) {
                if (i !== 0) {
                  str += '<div style="border:1px dashed #333;width:100%;margin-top: 5px"></div>'
                }
                const value = bus.computeTimezone(item.data[0] - self.minusTime)
                const tData = new Date(value)
                str += '<div style="margin-bottom: 5px;margin-top: 5px">'
                str += bus.timeFormate(tData)
                str += '</div>'
                minusFlag = false
              }
              showFlag = showFlag || item.data[1]
              if (!isNaN(item.data[1] + '')) {
                const previousItem = params.find((series) => ('Previous ' + item.seriesName) === series.seriesName)
                let paramsDot = bus.countDecimals(item.data[1])
                if (paramsDot < self.chartDot) {
                  paramsDot = self.chartDot
                } else if (paramsDot > 6) {
                  paramsDot = 6
                }
                const val = formatScientificNotation(item.data[1], paramsDot)
                sum += isNaN(self.numberWithEConvent(val)) ? 0 : Number(self.numberWithEConvent(val))

                str += '<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">'
                str += `<div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${color};}'></span>${tip ? (tip.alias ? tip.alias : tip.name) : item.seriesName}  </div>`
                str += '<div style="padding-left: 10px;min-width: 75px;text-align: right">'
                str += chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(val, null, -1, paramsDot)
                if (previousItem) {
                  str += '<span style="padding-left: 10px; display: inline-block;width: 65px;text-align: right;box-sizing: border-box;padding-right: 10px">'
                  const previousval = formatScientificNotation(previousItem.data[1], paramsDot)
                  let minusVal = 0
                  if (previousval <= val) {
                    minusVal = val - previousval
                    str += '+'
                  } else {
                    minusVal = previousval - val
                    str += '-'
                  }

                  str += chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(minusVal, null, -1, paramsDot)
                  str += '</span>'
                } else if (tip.alias.indexOf('Previous ') !== -1) {
                  str += '<span style="padding-left: 10px; display: inline-block;width: 65px;text-align: right">'
                  str += '</span>'
                }
                str += '</div>'
                str += '</div>'
              }
            })
            if (self.data.type === 'stackArea' || self.isStackArea) {
              if (!self.stackTotalColor || self.stackTotalColor == '') {
                self.stackTotalColor = randomcolor()
              }
              sum = parseFloat(Number(sum).toFixed(6))
              str += '<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">'
              str += '<div style="line-height: 18px; font-size: 12px;padding-left:0px;">'
              str += `<span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${self.stackTotalColor};}'></span>`
              str += self.$t('dashboard.dashboard.chartTotal')
              str += '</div>'
              str += '<div style="padding-left: 10px;">'
              str += chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(sum, null, self.chartDot)
              str += '</div>'
              str += '</div>'
            }

            str += '</div>'
            if (!showFlag) {
              return ''
            } else {
              return str
            }
          }
        },
        legend: {
          show: false
        },
        grid: {
          top: 30,
          left: 30,
          right: 30,
          containLabel: true,
          bottom: 30// 156
        },
        xAxis: {
          type: 'time',
          animation: false,
          showAllSymbol: false,
          axisLabel: {
            interval: '0',
            showMaxLabel: false,
            rotate: 0,
            show: true,
            fontSize: 10,
            formatter: function (value) {
              let offset = localStorage.getItem('nz-sys-timezone')
              offset = moment.tz(offset).format('Z')
              offset = Number.parseInt(offset)
              const localOffset = new Date().getTimezoneOffset() * 60 * 1000 * -1 // 默认 一分钟显示时区偏移的结果
              const tData = new Date(value - localOffset + offset * 60 * 60 * 1000)
              let hour = tData.getHours()
              hour = hour > 9 ? hour : '0' + hour // 加0补充为两位数字
              let minute = tData.getMinutes()
              minute = minute > 9 ? minute : '0' + minute // 如果分钟小于10,则在前面加0补充为两位数字
              if (minTime !== null && maxTime !== null) {
                const diffSec = (maxTime - minTime) / 1000
                const secOneDay = 24 * 60 * 60// 1天的秒数
                const secOneMonth = secOneDay * 30// 30天的秒数
                if (diffSec <= secOneDay) { // 同一天
                  return [hour, minute].join(':')
                } else if (diffSec < secOneMonth) { // 大于1天，小于30天
                  return [tData.getMonth() + 1, tData.getDate()].join('/') + ' ' + [hour, minute].join(':')
                } else { // 大于等于30天
                  return [tData.getMonth() + 1, tData.getDate()].join('/')
                }
              } else {
                return [tData.getFullYear(), tData.getMonth() + 1, tData.getDate()].join('/') + '\n' +
                    [hour, minute].join(':')
              }
            }
          },
          axisPointer: { // y轴上显示指针对应的值
            show: true
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#d9d9d9',
              opacity: 0.8,
              width: 1
            }
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          }
          // boundaryGap:['20%', '0'],
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: true,
            lineStyle: {
              color: '#d9d9d9',
              opacity: 0.8,
              width: 1
            }
          },
          // maxInterval:{},
          // 去掉y轴--start
          axisLine: {
            show: false
          },
          minInterval: chartDataFormat.Interval(maxValue, copies, unit.type, 'min'),
          maxInterval: chartDataFormat.Interval(maxValue, copies, unit.type, 'max') * Math.ceil(dataArg.length / 5),
          axisTick: {
            show: false
          },
          // 去掉y轴--end
          axisLabel: {
            show: true,
            fontSize: 10,
            formatter: function (val, index) {
              const value = formatScientificNotation(val, 2)
              let chartUnit = chartInfo.unit
              chartUnit = chartUnit || 2
              const unit = chartDataFormat.getUnit(chartUnit)
              if (chartDataFormat.Interval(maxValue, copies, unit.type, 'min') < 1 && dot < 2) {
                dot = 2
              }
              if (dot == 0) {
                dot = 1
              }
              dot = bus.countDecimals(value)
              if (dot < self.chartDot) {
                dot = self.chartDot
              }
              return unit.compute(value, index, -1, dot)
            }
          }
          // boundaryGap:[0,0.2]
        },
        useUTC: false, // 使用本地时间
        series: dataArg
      }
      if (!maxValueCopies.copies) {
        option.yAxis.min = 0
        option.yAxis.max = 1
      } else {
        option.yAxis.max = undefined
      }
      if (unit.type == 'Time') {
        delete option.yAxis.maxInterval
      }
      if (this.fromTopo) {
        const dashboardTime = localStorage.getItem('dashboardTime') ? JSON.parse(localStorage.getItem('dashboardTime')) : ['', '']
        if (dashboardTime[0]) {
          const numInterval = new Date(dashboardTime[1]).getTime() - new Date(dashboardTime[0]).getTime()
          if (numInterval >= 60 * 60 * 1000) {
            option.xAxis.minInterval = 20 * 60 * 1000
          } else if (numInterval >= 30 * 60 * 1000 && numInterval < 60 * 60 * 1000) {
            option.xAxis.minInterval = 10 * 60 * 1000
          } else if (numInterval >= 15 * 60 * 1000 && numInterval < 30 * 60 * 1000) {
            option.xAxis.minInterval = 5 * 60 * 1000
          } else if (numInterval >= 5 * 60 * 1000 && numInterval < 15 * 60 * 1000) {
            option.xAxis.minInterval = 1 * 60 * 1000
          } else {
            option.xAxis.minInterval = 15 * 1000
          }
        } else {
          option.xAxis.minInterval = 20 * 60 * 1000
        }
      } else {
        if (this.$refs.resizeBox.offsetWidth < 200) {
          option.xAxis.splitNumber = 1
        } else if (this.$refs.resizeBox.offsetWidth < 300) {
          option.xAxis.splitNumber = 3
        } else if (this.$refs.resizeBox.offsetWidth < 500) {
          option.xAxis.splitNumber = 5
        }
      }
      // params.series = dataArg;
      if (chartSite === 'local') { // 本地显示
        if (legend) {
          this.legendList = []
          this.isGrey = []
          legend.forEach((item, i) => {
            const legend = {
              name: item.name,
              alias: item.alias,
              color: item.color,
              showText: this.formatLegend(chartWidth, item.name)
            }
            this.legendList.push(legend)
            this.isGrey.push(false)
          })
        }
        this.legendListMore = this.legendList.filter((item, index) => index < this.seriesLength)
        if (this.hasLegendOptions) {
          this.computeLegendData(this.legendListMore, dataArg, 'local')
        }
        this.$nextTick(() => {
          const vm = this
          setTimeout(function () {
            const divHeight = self.$refs.legendArea && self.$refs.legendArea.offsetHeight > 20 ? self.$refs.legendArea.offsetHeight : 27
            if (!chartInfo.height) {
              getChart(self.chartIndex) && getChart(self.chartIndex).resize({ height: (250 - divHeight - chartResizeTool.titleHeight - chartResizeTool.chartBlankHeight) })
            } else {
              getChart(self.chartIndex) && getChart(self.chartIndex).resize({ height: (chartInfo.height * vm.stepWidth - divHeight - chartResizeTool.titleHeight - chartResizeTool.chartBlankHeight) })
            }
            if (dataArg && dataArg.length > 0) {
              getChart(self.chartIndex) && getChart(self.chartIndex).clear()
              getChart(self.chartIndex) && getChart(self.chartIndex).setOption(option)// 创建图表
              self.noData = false
            } else {
              self.noData = true
              option = chartConfig.getOptionNoData('noData')
              if (self.$refs.resizeBox && getChart(self.chartIndex)) {
                if (self.$refs.resizeBox.offsetWidth < 200) {
                  option.xAxis.splitNumber = 1
                } else if (self.$refs.resizeBox.offsetWidth < 300) {
                  option.xAxis.splitNumber = 3
                } else if (self.$refs.resizeBox.offsetWidth < 500) {
                  option.xAxis.splitNumber = 5
                }
                getChart(self.chartIndex) && getChart(self.chartIndex).clear()
                getChart(self.chartIndex) && getChart(self.chartIndex).setOption(option)// 创建图表
              }
            }
            self.$refs['localLoading' + self.chartIndex] && self.$refs['localLoading' + self.chartIndex].endLoading()
            self.firstShow = true // 展示操作按键
          }, 800)

          window.addEventListener('resize', this.chartResize)
          getChart(this.chartIndex).off('magictypechanged')
          getChart(this.chartIndex).on('magictypechanged', function (params) {
            self.isStackArea = !self.isStackArea
            if (self.isStackArea) {
              getChart(self.chartIndex) && getChart(self.chartIndex).setOption({
                toolbox: {
                  feature: {
                    dataZoom: {
                      yAxisIndex: false,
                      title: {
                        zoom: self.$t('overall.toolBox.zoom'),
                        back: self.$t('overall.toolBox.back')
                      }
                    },
                    magicType: {
                      type: ['stack'],
                      title: {
                        stack: self.$t('overall.toolBox.stack')
                      },
                      iconStyle: {
                        borderColor: '#7e7e7e'
                      },
                      emphasis: {
                        borderColor: stackIconChooseBorderColor
                      }
                    }
                  }
                },
                tooltip: {
                  axisPointer: {
                    snap: false,
                    animation: false
                  },
                  formatter: function (params) {
                    let str = '<div>'
                    let sum = 0
                    let showFlag = false
                    params.forEach((item, i) => {
                      const tip = self.legendMagicType[item.seriesIndex]
                      const color = self.bgColorList[item.seriesIndex]
                      let paramsDot = bus.countDecimals(item.data[1])
                      if (paramsDot < self.chartDot) {
                        paramsDot = self.chartDot
                      }
                      if (i === 0) {
                        const value = bus.computeTimezone(item.data[0])
                        const tData = new Date(value)
                        str += '<div style="margin-bottom: 5px">'
                        str += bus.timeFormate(tData)
                        str += '</div>'
                      }
                      showFlag = showFlag || item.data[1]
                      if (!isNaN(item.data[1] + '')) {
                        const val = formatScientificNotation(item.data[1], 2)
                        sum += isNaN(self.numberWithEConvent(val)) ? 0 : Number(self.numberWithEConvent(val))
                        str += '<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">'
                        str += `<div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${color};}'></span>${tip ? (tip.alias ? tip.alias : tip.name) : item.seriesName}  </div>`
                        str += '<div style="padding-left: 10px;">'
                        str += chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(val, null, -1, paramsDot)
                        str += '</div>'
                        str += '</div>'
                      }
                    })
                    if (self.data.type === 'stackArea' || self.isStackArea) {
                      sum = parseFloat(Number(sum).toFixed(6))
                      str += '<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">'
                      str += '<div style="line-height: 18px; font-size: 12px;padding-left:20px;">'
                      str += self.$t('dashboard.dashboard.chartTotal')
                      str += '</div>'
                      str += '<div style="padding-left: 10px;">'
                      str += chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(sum, null, self.chartDot)
                      str += '</div>'
                      str += '</div>'
                    }

                    str += '</div>'
                    if (!showFlag) {
                      return ''
                    } else {
                      return str
                    }
                  }
                }
              })
            } else {
              getChart(self.chartIndex) && getChart(self.chartIndex).setOption({
                toolbox: {
                  feature: {
                    dataZoom: {
                      yAxisIndex: false,
                      title: {
                        zoom: self.$t('overall.toolBox.zoom'),
                        back: self.$t('overall.toolBox.back')
                      }
                    },
                    magicType: {
                      type: ['stack'],
                      title: {
                        stack: self.$t('overall.toolBox.stack')
                      },
                      iconStyle: {
                        borderColor: '#7e7e7e'
                      },
                      emphasis: {
                        borderColor: stackIconChooseBorderColor
                      }
                    }
                  }
                }
              })
            }
          })
        })
      } else if (chartSite === 'screen') { // 全屏显示
        if (legend) {
          this.screenLegendList = []
          this.isGreyScreen = []
          legend.forEach((item, i) => {
            const legend = {
              name: item.name,
              alias: item.alias,
              color: item.color,
              showText: this.formatLegend(chartWidth, item.name)
            }
            this.screenLegendList.push(legend)
            this.isGreyScreen.push(false)
          })
        }
        if (this.screenLegendListMore.length !== this.screenLegendList.length) {
          this.screenLegendListMore = []
          const screenLegendListMore = this.screenLegendList.filter((item, index) => index < this.seriesLength)
          this.$set(this, 'screenLegendListMore', screenLegendListMore)
          this.$forceUpdate()
        }
        if (this.hasLegendOptions) {
          this.computeLegendData(this.screenLegendListMore, dataArg, 'screen')
        }
        if (self.echartModalStore) {
          self.echartModalStore.clear()
          option.title = {}
          self.showLegend = true
          self.$refs['localLoadingScreen' + self.chartIndex].endLoading()
        }
        this.$nextTick(() => {
          const legendDiv = document.getElementById('screenLegendArea' + self.chartIndex)
          const divHeight = legendDiv.offsetHeight
          const screenHeight = document.documentElement.clientHeight || document.body.clientHeight
          const sumHeight = Math.floor(screenHeight * 0.99 * 0.8)// margin-top:1vh; dailog:80%
          self.$refs.screenShowArea.style.height = `${sumHeight - divHeight - self.screenTitleHeight}px`
          self.echartModalStore.resize({ height: (sumHeight - divHeight - self.screenTitleHeight) })// 图表的高度
          setTimeout(function () {
            if (self.screenLegendListMore.length !== self.screenLegendList.length) {
              self.seriesItemArrScreen = self.seriesItemScreen.filter((item, index) => index < self.seriesLength)
            } else {
              self.seriesItemArrScreen = self.seriesItemScreen
            }
            option.series = self.seriesItemArrScreen
            if (dataArg && dataArg.length > 0) {
              self.echartModalStore && self.echartModalStore.setOption(option)// 显示全屏界面
              self.noData = false
            } else {
              self.noData = true
              option = chartConfig.getOptionNoData('noData')
              self.echartModalStore && self.echartModalStore.setOption(option)// 显示全屏界面
            }
            self.echartModalStore.on('finished', function () {
              const legendDiv = document.getElementById('screenLegendArea' + self.chartIndex)
              const divHeight = legendDiv.offsetHeight
              const screenHeight = document.documentElement.clientHeight || document.body.clientHeight
              const sumHeight = Math.floor(screenHeight * 0.99 * 0.8)// margin-top:1vh; dailog:80%
              self.$refs.screenShowArea.style.height = `${sumHeight - divHeight - self.screenTitleHeight}px`
              // self.echartModalStore.resize({ height: (sumHeight - divHeight - self.screenTitleHeight) })// 图表的高度
              self.echartModalStore.off('finished')
            })
          }, 100)
          this.echartModalStore.off('magictypechanged')
          this.echartModalStore.on('magictypechanged', function (params) {
            self.isStackArea = !self.isStackArea
            if (self.isStackArea) {
              this.setOption({
                toolbox: {
                  feature: {
                    dataZoom: {
                      yAxisIndex: false,
                      title: {
                        zoom: self.$t('overall.toolBox.zoom'),
                        back: self.$t('overall.toolBox.back')
                      }
                    },
                    magicType: {
                      type: ['stack'],
                      title: {
                        stack: self.$t('overall.toolBox.stack')
                      },
                      iconStyle: {
                        borderColor: '#7e7e7e'
                      },
                      emphasis: {
                        borderColor: stackIconChooseBorderColor
                      }
                    }
                  }

                },
                tooltip: {
                  axisPointer: {
                    snap: false,
                    animation: false
                  },
                  formatter: function (params) {
                    let str = '<div>'
                    let sum = 0
                    let showFlag = false
                    let minusFlag = true
                    params.forEach((item, i) => {
                      const tip = self.legendMagicType[item.seriesIndex]
                      const color = self.bgColorList[item.seriesIndex]
                      if (i === 0 && tip.alias.indexOf('Previous ') === -1) {
                        const value = bus.computeTimezone(item.data[0])
                        const tData = new Date(value)
                        str += '<div style="margin-bottom: 5px">'
                        str += bus.timeFormate(tData)
                        str += '</div>'
                      }
                      if (tip.alias.indexOf('Previous ') !== -1 && minusFlag) {
                        if (i !== 0) {
                          str += '<div style="border:1px dashed #333;width:100%;margin-top: 5px"></div>'
                        }
                        const value = bus.computeTimezone(item.data[0])
                        const tData = new Date(value)
                        str += '<div style="margin-bottom: 5px;margin-top: 5px">'
                        str += bus.timeFormate(tData)
                        str += '</div>'
                        minusFlag = false
                      }
                      showFlag = showFlag || item.data[1]
                      if (!isNaN(item.data[1] + '')) {
                        const previousItem = params.find((series) => ('Previous ' + item.seriesName) === series.seriesName)
                        const val = formatScientificNotation(item.data[1], 2)
                        sum += isNaN(self.numberWithEConvent(val)) ? 0 : Number(self.numberWithEConvent(val))
                        str += '<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">'
                        str += `<div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${color};}'></span>${tip ? (tip.alias ? tip.alias : tip.name) : item.seriesName}  </div>`
                        str += '<div style="padding-left: 10px;min-width: 75px;text-align: right">'
                        str += chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(val, null, self.chartDot)
                        if (previousItem) {
                          str += '<span style="padding-left: 10px; display: inline-block;width: 65px;text-align: right;box-sizing: border-box;padding-right: 10px">'
                          const previousval = formatScientificNotation(previousItem.data[1], 2)
                          let minusVal = 0
                          if (previousval <= val) {
                            minusVal = val - previousval
                            str += '+'
                          } else {
                            minusVal = previousval - val
                            str += '-'
                          }

                          str += chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(minusVal, null, self.chartDot)
                          str += '</span>'
                        } else if (tip.alias.indexOf('Previous ') !== -1) {
                          str += '<span style="padding-left: 10px; display: inline-block;width: 65px;text-align: right">'
                          str += '</span>'
                        }
                        str += '</div>'
                        if (previousItem) {
                          str += '<div style="padding-left: 10px;">'
                          const previousval = formatScientificNotation(previousItem.data[1], 2)
                          let minusVal = 0
                          if (previousval <= val) {
                            minusVal = val - previousval
                            str += '+'
                          } else {
                            minusVal = previousval - val
                            str += '-'
                          }

                          str += chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(minusVal, null, self.chartDot)
                          str += '</div>'
                        }
                        str += '</div>'
                      }
                    })
                    if (self.data.type === 'stackArea' || self.isStackArea) {
                      sum = parseFloat(Number(sum).toFixed(6))
                      str += '<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">'
                      str += '<div style="line-height: 18px; font-size: 12px;padding-left:20px;">'
                      str += self.$t('dashboard.dashboard.chartTotal')
                      str += '</div>'
                      str += '<div style="padding-left: 10px;">'
                      str += chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(sum, null, self.chartDot)
                      str += '</div>'
                      str += '</div>'
                    }

                    str += '</div>'
                    if (!showFlag) {
                      return ''
                    } else {
                      return str
                    }
                  }
                }
              })
            } else {
              this.setOption({
                toolbox: {
                  feature: {
                    dataZoom: {
                      yAxisIndex: false,
                      title: {
                        zoom: self.$t('overall.toolBox.zoom'),
                        back: self.$t('overall.toolBox.back')
                      }
                    },
                    magicType: {
                      type: ['stack'],
                      title: {
                        stack: self.$t('overall.toolBox.stack')
                      },
                      iconStyle: {
                        borderColor: '#7e7e7e'
                      },
                      emphasis: {
                        borderColor: stackIconChooseBorderColor
                      }
                    }
                  }
                }
              })
            }
          })
        })
      }
      maxValueCopies = null
      setTimeout(() => { option = null }, 1000)
    },
    handleLineFeed (str, chartWidth) {
      if (!str) {
        return ''
      }
      // 计算宽度
      const span = document.querySelector('.temp-dom')
      span.textContent = name
      const txtWidth = parseFloat(window.getComputedStyle(span).width) - this.tempDom.width
      if (txtWidth < chartWidth) {
        return str
      } else {
        const charNum = `${(chartWidth - 100) / (txtWidth / str.length)}`
        return str.slice(0, charNum) + '...'
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
    // 设置数据, filter区分
    setData (chartItem, seriesItem, dashboardId, filter, legend, area, errorMsg) {
      legend && this.setColor(legend.length)
      legend && legend.forEach((t, i) => { t.color = this.bgColorList[i] })
      this.filter.from = filter.from
      if (errorMsg && errorMsg !== '') {
        this.isError = true
        this.errorContent = errorMsg
      } else {
        this.isError = false
        this.errorContent = ''
      }
      if (area === 'showFullScreen') { // 全屏按时间查询
        /*
            this.legend = legend;
            this.data = chartItem;
            this.searchTime[0] = filter.start_time;//将列表的查询时间复制给全屏的查询时间
            this.searchTime[1] = filter.end_time;
            this.seriesItemScreen = seriesItem;
            //this.$refs['localLoadingScreen'+this.chartIndex].endLoading();
            this.initChart(chartItem, seriesItem, this.$refs.lineChartArea, 'screen',legend);
            */
      } else {
        this.legend = legend
        this.$refs['localLoading' + this.chartIndex].startLoading()
        this.divFirstShow = true
        this.firstShow = true // 展示操作按键
        this.panelIdInner = dashboardId
        this.data = chartItem
        this.seriesItem = seriesItem
        this.seriesItemScreen = seriesItem

        this.hasLegendOptions = this.findLegendOptions()
        if (this.hasLegendOptions) {
          const sortedOptionKeys = ['min', 'max', 'avg', 'last', 'total']
          this.legendOptions = sortedOptionKeys.map(item => { return { option: item, sort: '', value: chartItem.param.legendValue[item] } })
          this.screenLegendOptions = sortedOptionKeys.map(item => { return { option: item, sort: '', value: chartItem.param.legendValue[item] } })
        }

        if (filter) { // 保存数据,用于同步时间
          this.stableFilter = filter
          this.searchTime[0] = filter.start_time
          this.searchTime[1] = filter.end_time
          this.oldSearchTime[0] = this.searchTime[0]
          this.oldSearchTime[1] = this.searchTime[1]
        }
        // this.seriesItem=seriesItem;
        let seriesItemArr = seriesItem
        if (seriesItem.length > this.seriesLength) {
          seriesItemArr = seriesItem.filter((item, index) => index < this.seriesLength) // 只查看前seriesLength条
          this.seriesItemArr = seriesItemArr
          this.seriesItemArrScreen = seriesItemArr
        } else {
          this.seriesItemArr = seriesItem
        }

        this.initChart(chartItem, seriesItemArr, this.$refs.lineChartArea, 'local', legend)
      }
    },
    resize (chartItem) {
      const chartBox = document.getElementById('lineChartDiv' + this.chartIndex)
      chartBox.style.height = `${this.$chartResizeTool.calculateHeight(chartItem.height)}px`
    },
    clearChart () {
      if (getChart(this.chartIndex)) {
        getChart(this.chartIndex).clear()
      }
      if (this.echartModalStore) {
        this.echartModalStore.clear()
      }
      this.data = {}
    },
    clickos () {
      this.dropdownMenuShow = false
    },
    // 删除该图表
    removeChart () {
      this.dropdownMenuShow = false
      this.$emit('on-remove-chart-block', this.data.id)
    },
    // 编辑图表
    editChart () {
      this.dropdownMenuShow = false
      this.$emit('on-edit-chart-block', this.data.id)
    },
    // 重新请求数据 刷新操作
    refreshChart () {
      this.dropdownMenuShow = false
      const id = this.data.id
      this.clearChart()
      this.$refs['localLoading' + this.chartIndex].startLoading()
      this.firstShow = false
      this.$emit('on-refresh-data', id)
    },
    screenRefreshChart () {
      this.$refs.calendarPanel.timeChange(this.$refs.calendarPanel.nowTimeType, 'chart')
    },
    initDialog () {
      // 此时初始化，才能获得screenShowArea对象，否则此对象为undefined，无法初始化图表
      this.initChart(this.data, this.seriesItem, this.$refs.screenShowArea, 'screen', this.legend)
      // 日期组件同步时间
      /*
          this.$refs.calendar.initTime({
            start: this.stableFilter.start_time,
            end: this.stableFilter.end_time,
          });
          */
    },
    closeDialog () {
      this.$refs.pickTime.$refs.multipleTime.searchTime = []
      this.$refs.pickTime.$refs.multipleTime.showTime = {
        id: 12,
        text: this.$t('dashboard.dashboard.noDate')
      }
      this.$refs.pickTime.$refs.multipleTime.showDropdown = false
    },
    changeDate (st) {
      this.oldSearchTime = st
      this.searchTime = st
      this.filter.start_time = st[0]
      this.filter.end_time = st[1]
    },
    // 全屏查看
    showAllScreen () {
      this.dropdownMenuShow = false
      // 初始化同步时间
      this.filter.start_time = this.stableFilter.start_time
      this.filter.end_time = this.stableFilter.end_time
      // this.searchTime = this.oldSearchTime;
      this.$set(this.searchTime, 0, this.oldSearchTime[0])
      this.$set(this.searchTime, 1, this.oldSearchTime[1])
      this.screenModal = true
      this.isGreyScreen = []
      this.$refs.pickTime.$refs.multipleTime.searchTime = []
      this.$refs.pickTime.$refs.multipleTime.showTime = {
        id: 12,
        text: this.$t('dashboard.dashboard.noDate')
      }
      this.$refs.pickTime.$refs.multipleTime.showDropdown = false
      this.$refs.pickTime.$refs.timePicker.setCustomTime(this.stableFilter)
      this.seriesItemScreen = this.seriesItem
      // this.seriesItemScreen = this.seriesItem;
      /*
                  this.searchTime = [];
                  this.searchTime[0] = this.oldSearchTime[0];//将列表的查询时间复制给全屏的查询时间
                  this.searchTime[1] = this.oldSearchTime[1];
                  this.seriesItemScreen = this.seriesItem;
                  this.screenModal = true;
                  */
      // this.dateChange();
    },
    duplicate () {
      this.dropdownMenuShow = false
      this.$emit('on-duplicate-chart-block', this.data.id)
    },
    dateChange (time) {
      const nowTimeType = this.$refs.pickTime.$refs.timePicker.nowTimeType
      this.setSearchTime(nowTimeType.type, nowTimeType.value, nowTimeType)
      this.filter.start_time = bus.timeFormate(this.searchTime[0], 'YYYY-MM-DD HH:mm:ss')
      this.filter.end_time = bus.timeFormate(this.searchTime[1], 'YYYY-MM-DD HH:mm:ss')
      this.filter.value = this.searchTime[2]
      this.filter.id = this.$refs.pickTime.$refs.timePicker.showTime.id
      // this.echartModalStore.clear()
      this.showLegend = false
      this.$refs['localLoadingScreen' + this.chartIndex].startLoading()
      if (this.showSetting) {
        this.getQueryChart('list')
      } else {
        this.getQueryChart('dashboard')
      }
    },
    setSearchTime (type, val, nowTimeType) { // 设置searchTime
      if (type === 'minute') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setMinutes(new Date(bus.computeTimezone(new Date().getTime())).getMinutes() - val), 'YYYY-MM-DD HH:mm:ss')
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())), 'YYYY-MM-DD HH:mm:ss')
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'm')
      } else if (type === 'hour') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - val), 'YYYY-MM-DD HH:mm:ss')
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())), 'YYYY-MM-DD HH:mm:ss')
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'h')
      } else if (type === 'date') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setDate(new Date(bus.computeTimezone(new Date().getTime())).getDate() - val), 'YYYY-MM-DD HH:mm:ss')
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())), 'YYYY-MM-DD HH:mm:ss')
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'd')
      }
      this.$refs.pickTime.$refs.timePicker.searchTime = this.searchTime
    },
    // 查询数据,修改日期查询全屏数据
    getQueryChart (type) {
      /*
          if (this.echartModalStore) {
            this.echartModalStore.showLoading();
          }
          */
      const self = this
      let axiosArr = []
      this.$nextTick(() => {
        let startTime = bus.timeFormate(this.searchTime[0], 'YYYY-MM-DD HH:mm:ss')
        let endTime = bus.timeFormate(this.searchTime[1], 'YYYY-MM-DD HH:mm:ss')
        if (!startTime || !endTime) { // 如果时间为空，则默认取最近1小时
          const now = new Date()
          startTime = bus.timeFormate(now, 'YYYY-MM-DD HH:mm:ss')
          endTime = bus.timeFormate(now.setHours(now.getHours() - 1), 'YYYY-MM-DD HH:mm:ss')
          this.searchTime[0] = startTime
          this.searchTime[1] = endTime
        }
        const step = bus.getStep(startTime, endTime)
        if (type === 'list') { // 普通模式,主控台使用
          axiosArr = this.data.elements.map((ele) => {
            const filterItem = ele
            let query = encodeURIComponent(filterItem.expression)
            if (this.chartInfo.type === 'line' || this.chartInfo.type === 'bar' || this.chartInfo.type === 'stackArea') { // 如果是这三个 默认给null
              !this.chartInfo.param && (this.chartInfo.param = {})
              this.chartInfo.param.nullType = this.chartInfo.param.nullType || 'null'
              query += '&nullType=' + this.chartInfo.param.nullType
            }
            return this.$get('/prom/api/v1/query_range?query=' + query + '&start=' + this.$stringTimeParseToUnix(startTime) + '&end=' + this.$stringTimeParseToUnix(endTime) + '&step=' + step)
          })
          if (this.$refs.pickTime.$refs.multipleTime && this.$refs.pickTime.$refs.multipleTime.searchTime.length) { // 判断是否需要添加比较
            startTime = bus.timeFormate(this.$refs.pickTime.$refs.multipleTime.searchTime[0], 'YYYY-MM-DD HH:mm:ss')
            endTime = bus.timeFormate(this.$refs.pickTime.$refs.multipleTime.searchTime[1], 'YYYY-MM-DD HH:mm:ss')
            this.data.elements.forEach((ele) => {
              const filterItem = ele
              let query = encodeURIComponent(filterItem.expression)
              if (this.chartInfo.type === 'line' || this.chartInfo.type === 'bar' || this.chartInfo.type === 'stackArea') { // 如果是这三个 默认给null
                !this.chartInfo.param && (this.chartInfo.param = {})
                this.chartInfo.param.nullType = this.chartInfo.param.nullType || 'null'
                query += '&nullType=' + this.chartInfo.param.nullType
              }
              axiosArr.push(this.$get('/prom/api/v1/query_range?query=' + query + '&start=' + this.$stringTimeParseToUnix(startTime) + '&end=' + this.$stringTimeParseToUnix(endTime) + '&step=' + step))
            })
          }
        } else if (type === 'dashboard') { // 概览模式,指标概览中使用
          // 概览模式,需要区分单独一个和多个
          if (this.stableFilter.chartCount === 'multiple') {
            let query = encodeURIComponent(this.data.name)
            if (this.chartInfo.type === 'line' || this.chartInfo.type === 'bar' || this.chartInfo.type === 'stackArea') { // 如果是这三个 默认给null
              this.chartInfo.param.nullType = this.chartInfo.param.nullType || 'null'
              query += '&nullType=' + this.chartInfo.param.nullType
            }
            axiosArr = [this.$get('/prom/api/v1/query_range?query=' + query + '&start=' + this.$stringTimeParseToUnix(startTime) + '&end=' + this.$stringTimeParseToUnix(endTime) + '&step=' + step)]
          } else {
            let query = encodeURIComponent(this.data.elements[0].expression)
            if (this.chartInfo.type === 'line' || this.chartInfo.type === 'bar' || this.chartInfo.type === 'stackArea') { // 如果是这三个 默认给null
              this.chartInfo.param.nullType = this.chartInfo.param.nullType || 'null'
              query += '&nullType=' + this.chartInfo.param.nullType
            }
            axiosArr = [this.$get('/prom/api/v1/query_range?query=' + query + '&start=' + this.$stringTimeParseToUnix(startTime) + '&end=' + this.$stringTimeParseToUnix(endTime) + '&step=' + step)]
          }
        }
        // 一个图表
        axios.all(axiosArr).then((res) => {
          if (res.length > 0) {
            const series = []
            const legend = []
            /* const sumData = {
                name: 'sum',
                data: [],
                visible: true,
                threshold: null
              } */
            if (!this.data.type) {
              this.data.type = 'line'
            }
            res.forEach((response, pos) => {
              if (response.status === 'success') {
                this.isError = false
                this.errorContent = ''
                if (response.data.result) {
                  // 循环处理每个elements下获取的数据列
                  response.data.result.forEach((queryItem, innerPos) => {
                    const seriesItem = {
                      theData: {
                        name: '',
                        symbol: 'emptyCircle', // 去掉点
                        symbolSize: 8,
                        smooth: 0.2, // 曲线变平滑
                        showSymbol: false,
                        data: [],
                        type: this.data.type,
                        lineStyle: {
                          width: 2,
                          opacity: 0.9
                        }
                        // visible: true,
                        // threshold: null,
                      },
                      metric_name: ''
                    }
                    if (this.data.type === 'stackArea') {
                      seriesItem.theData.type = 'line'
                      seriesItem.theData.stack = this.data.title
                      seriesItem.theData.areaStyle = { opacity: 0.3 }
                    }

                    if ((this.data.type === 'line' || this.data.type === 'stackArea' || this.data.type === 'bar') && this.data.param && this.data.param.threshold) {
                      seriesItem.theData.markLine = {
                        silent: true,
                        symbol: ['circle', 'circle'],
                        label: {
                          distance: this.computeDistance(chartDataFormat.getUnit(this.data.unit ? this.data.unit : 2).compute(this.data.param.threshold)),
                          formatter: function (params) {
                            return chartDataFormat.getUnit(self.data ? self.data.unit : 2).compute(params.value)
                          }
                        },
                        lineStyle: {
                          color: '#d64f40',
                          width: 2,
                          type: 'dotted'
                        },
                        data: [{
                          yAxis: Number(this.data.param.threshold)
                        }]
                      }
                    }

                    // 图表中每条线的名字,后半部分
                    // let host = `${queryItem.metric.__name__}{`;//up,
                    let host = ''// up,
                    if (queryItem.metric.__name__) {
                      host = `${queryItem.metric.__name__}{`// up,
                    }
                    const tagsArr = Object.keys(queryItem.metric)// ["__name__","asset","idc","instance","job","module","project"]
                    // 设置时间-数据格式对
                    const dpsArr = Object.entries(queryItem.values)// [ ["0",[1577959830.781,"0"]], ["1",[1577959845.781,"0"]] ]
                    // 判断是否有数据,&& tagsArr.length > 0
                    if (dpsArr.length > 0) {
                      tagsArr.forEach((tag, i) => {
                        if (tag !== '__name__') {
                          host += `${tag}="${queryItem.metric[tag]}",`
                        }
                      })
                      const elements = this.data.elements[pos] || this.data.elements[pos - this.data.elements.length] // 处理添加对比时的legend
                      if (host.endsWith(',')) { host = host.substr(0, host.length - 1) }
                      if (queryItem.metric.__name__) {
                        host += '}'
                      }
                      if (!host || host === '') {
                        host = elements.expression
                      }
                      let alias = dealLegendAlias(host, elements.legend)
                      if (!alias || alias === '') {
                        alias = host
                      }
                      if (pos >= this.data.elements.length) {
                        legend.push({ name: 'Previous ' + host + '-' + elements.id + '-' + innerPos, alias: 'Previous ' + alias })
                        seriesItem.theData.name = 'Previous ' + host + '-' + elements.id + '-' + innerPos
                        seriesItem.metric_name = seriesItem.theData.name
                      } else {
                        legend.push({ name: host + '-' + elements.id + '-' + innerPos, alias: alias })
                        seriesItem.theData.name = host + '-' + elements.id + '-' + innerPos
                        seriesItem.metric_name = seriesItem.theData.name
                      }
                      // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c
                      // 将秒改为毫秒
                      // alert('table=='+JSON.stringify(queryItem))
                      seriesItem.theData.data = queryItem.values.map((dpsItem, dpsIndex) => {
                        return [dpsItem[0] * 1000, dpsItem[1]]
                      })
                      series.push(seriesItem.theData)
                    } else if (this.data.elements && this.data.elements[innerPos]) {
                      // 无数据提示
                      /*
                          const currentInfo = chartItem.elements[innerPos];
                          const errorMsg = `图表 ${chartItem.title} 中 ${currentInfo.metric},${currentInfo.tags} 无数据`;
                          this.$message.warning({
                            duration: 15,
                            content: errorMsg,
                            closable: true,
                          });
                          */
                    }
                  })
                }
              } else {
                this.isError = true
                if (response.msg) {
                  this.errorContent = response.msg
                } else if (response.error) {
                  this.errorContent = response.error
                } else {
                  this.errorContent = response
                }
              }
            })
            this.setColor(legend.length)
            legend.forEach((item, index) => {
              item.color = this.bgColorList[index]
            })
            if (this.$refs.pickTime.$refs.multipleTime && this.$refs.pickTime.$refs.multipleTime.searchTime.length && res.length > this.data.elements.length) {
              const minusTime = (new Date(this.searchTime[0]).getTime() - new Date(this.$refs.pickTime.$refs.multipleTime.searchTime[0]).getTime())
              this.minusTime = minusTime
              let cutPoint = 0
              res.forEach((item, index) => {
                if (index < res.length / 2) {
                  cutPoint += res[index].data.result.length
                }
              })
              series.forEach((item, index) => {
                if (index >= cutPoint) {
                  series[index].data.forEach((item1, index1) => {
                    item1[0] = item1[0] + minusTime
                  })
                }
              })
            }
            this.seriesItemScreen = series
            // this.seriesItemArrScreen=series.filter((item,index)=>index<this.seriesLength);
            this.initChart(this.data, series, this.$refs.screenShowArea, 'screen', legend)
          }
        }).catch((error) => {
          if (error) {
            this.$message.error(error.toString())
          }
        })
      })
    },
    computeDistance: function (str) {
      const span = document.querySelector('.temp-dom')
      span.textContent = str
      const txtWidth = parseFloat(window.getComputedStyle(span).width)
      return Number('-' + (txtWidth + 5))
    },
    showLoad (chartItem) {
      // 设置高度
      this.$nextTick(() => {
        const chartBox = document.getElementById('lineChartDiv' + this.chartIndex)
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
    // 获取格式
    getNumStr (num) {
      if (num >= 1000) {
        const kbNum = num / 1000
        if (kbNum >= 1000) {
          const mbNum = kbNum / 1000
          if (mbNum > 1000) {
            const gbNum = mbNum / 1000
            return `${gbNum.toFixed(2)}B`
          }
          return `${mbNum.toFixed(2)}M`
        }
        return `${kbNum.toFixed(2)}K`
      }
      return num.toFixed(2)
    },
    handleClose () {},
    // 加载更多
    loadMore () {
      this.seriesItemArr = this.seriesItem
      this.legendListMore = this.legendList
      const chartInfo = this.data
      const dataArg = this.seriesItem
      const maxValueCopies = this.getMaxValue(dataArg, chartInfo)
      const maxValue = maxValueCopies.maxValue
      // const minValue = maxValueCopies.minValue
      // const dot = maxValueCopies.dot
      const copies = maxValueCopies.copies
      const unit = maxValueCopies.unit
      // const oldDot = maxValueCopies.oldDot
      const option = {
        yAxis: {
          minInterval: chartDataFormat.Interval(maxValue, copies, unit.type, 'min'),
          maxInterval: chartDataFormat.Interval(maxValue, copies, unit.type, 'max') * Math.ceil(dataArg.length / 5)
        }
      }
      if (!maxValueCopies.copies) {
        option.yAxis.min = 0
        option.yAxis.max = 1
      } else {
        option.yAxis.max = undefined
      }
      if (unit.type == 'Time' || option.yAxis.maxInterval === 1) {
        delete option.yAxis.maxInterval
      }
      getChart(this.chartIndex) && getChart(this.chartIndex).setOption({
        series: this.seriesItem,
        yAxis: {
          ...option.yAxis
        }
      })
      if (this.hasLegendOptions) {
        this.computeLegendData(this.legendListMore, this.seriesItemArr, 'local')
      }
      this.$nextTick(() => {
        const divHeight = this.$refs.legendArea && this.$refs.legendArea.offsetHeight > 20 ? this.$refs.legendArea.offsetHeight : 27
        if (!this.chartInfo.height) {
          getChart(this.chartIndex).resize({ height: (400 - divHeight - this.$chartResizeTool.titleHeight - this.$chartResizeTool.chartBlankHeight) })
        } else {
          getChart(this.chartIndex).resize({ height: (this.chartInfo.height * this.stepWidth - divHeight - this.$chartResizeTool.titleHeight - this.$chartResizeTool.chartBlankHeight) })
        }
      })
    },
    // 加载更多
    loadScreenMore () {
      this.seriesItemArrScreen = this.seriesItemScreen
      this.screenLegendListMore = this.screenLegendList
      const chartInfo = this.data
      const dataArg = this.seriesItem

      const maxValueCopies = this.getMaxValue(dataArg, chartInfo)
      const maxValue = maxValueCopies.maxValue
      // const minValue = maxValueCopies.minValue
      // const dot = maxValueCopies.dot
      const copies = maxValueCopies.copies
      const unit = maxValueCopies.unit
      // const oldDot = maxValueCopies.oldDot
      const option = {
        yAxis: {
          minInterval: chartDataFormat.Interval(maxValue, copies, unit.type, 'min'),
          maxInterval: chartDataFormat.Interval(maxValue, copies, unit.type, 'max') * Math.ceil(dataArg.length / 5)
        }
      }
      if (!maxValueCopies.copies) {
        option.yAxis.min = 0
        option.yAxis.max = 1
      } else {
        option.yAxis.max = undefined
      }
      if (unit.type == 'Time' || option.yAxis.maxInterval === 1) {
        delete option.yAxis.maxInterval
      }
      this.echartModalStore && this.echartModalStore.setOption({
        series: this.seriesItemScreen,
        yAxis: {
          ...option.yAxis
        }
      })
      if (this.hasLegendOptions) {
        this.computeLegendData(this.screenLegendListMore, this.seriesItemArrScreen, 'screen')
      }
      this.$nextTick(() => {
        const legendDiv = document.getElementById('screenLegendArea' + this.chartIndex)
        const divHeight = legendDiv.offsetHeight
        const screenHeight = document.documentElement.clientHeight || document.body.clientHeight
        const sumHeight = Math.floor(screenHeight * 0.99 * 0.8)// margin-top:1vh; dailog:80%
        this.$refs.screenShowArea.style.height = `${sumHeight - divHeight - this.screenTitleHeight}px`
        this.echartModalStore.resize({ height: (sumHeight - divHeight - this.screenTitleHeight) })// 图表的高度
      })
    },
    findLegendOptions: function () {
      if (!this.data.param || !this.data.param.legendValue || Object.keys(this.data.param.legendValue) < 1) return false
      const legendOptions = this.data.param.legendValue
      const onVal = Object.keys(legendOptions).find(item => { return legendOptions[item] == 'on' })

      return onVal
    },
    computeLegendData: function (legend, dataArr, where) {
      const options = where == 'local' ? this.legendOptions : this.screenLegendOptions
      const keys = options.filter(item => { return item.value == 'on' }).map(item => { return item.option })
      keys.forEach(key => {
        return new Promise(resolve => {
          legend.forEach(item => {
            const data = dataArr.find(t => t.name == item.name)
            if (data && data.data) {
              const value = getMetricTypeValue(data.data, key)
              item[key] = parseFloat(value)
            }
          })
          resolve()
        })
      })
    },
    formatLegendData: function (data) {
      return chartDataFormat.getUnit(this.chartInfo.unit).compute(data, null, 2)
    },
    legendValueSort: function (option, legend, options) {
      options.forEach(item => {
        if (item.option != option.option) {
          item.sort = ''
        }
      })
      if (!option.sort || option.sort == 'asc') {
        legend.sort((x, y) => x[option.option] - y[option.option])
        option.sort = 'desc'
      } else {
        legend.sort((x, y) => y[option.option] - x[option.option])
        option.sort = 'asc'
      }
    },
    getMaxValue (dataArg, chartInfo) {
      let maxValue = 0
      let minValue = 0
      if (chartInfo.unit && dataArg.length > 0) {
        maxValue = 0
        minValue = 0
        for (let j = 0; j < dataArg.length; j++) {
          for (let i = 0; i < dataArg[j].data.length; i++) {
            if (!isNaN(dataArg[j].data[i][1])) {
              maxValue = (maxValue < Number(dataArg[j].data[i][1]) ? Number(dataArg[j].data[i][1]) : maxValue)
              minValue = (minValue > Number(dataArg[j].data[i][1]) ? Number(dataArg[j].data[i][1]) : minValue)
            }
          }
        }
      }
      const chartUnit = chartInfo.unit ? chartInfo.unit : 2
      const unit = chartDataFormat.getUnit(chartUnit)
      minValue = minValue > 0 ? 0 : minValue
      if (!isNaN(maxValue)) {
        maxValue = Number(maxValue)
      } else {
        maxValue = 0
      }
      if (maxValue < 0) {
        maxValue = Math.abs(maxValue)
      }
      if (Math.abs(minValue) > Math.abs(maxValue)) {
        maxValue = Math.abs(minValue)
      }
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
    },
    chartResize () {
      if (getChart(this.chartIndex)) {
        const divHeight = this.$refs.legendArea.offsetHeight
        getChart(this.chartIndex).resize({ height: (this.data.height * this.stepWidth - divHeight - chartResizeTool.titleHeight - chartResizeTool.chartBlankHeight) })
        if (!getChart(this.chartIndex).getOption()) {
          return
        }
        let minInterval = ''
        let splitNumber = ''
        if (this.fromTopo) {
          const dashboardTime = localStorage.getItem('dashboardTime') ? JSON.parse(localStorage.getItem('dashboardTime')) : ['', '']
          if (dashboardTime[0]) {
            const numInterval = new Date(dashboardTime[1]).getTime() - new Date(dashboardTime[0]).getTime()
            if (numInterval >= 60 * 60 * 1000) {
              minInterval = 20 * 60 * 1000
            } else if (numInterval >= 30 * 60 * 1000 && numInterval < 60 * 60 * 1000) {
              minInterval = 10 * 60 * 1000
            } else if (numInterval >= 15 * 60 * 1000 && numInterval < 30 * 60 * 1000) {
              minInterval = 5 * 60 * 1000
            } else if (numInterval >= 5 * 60 * 1000 && numInterval < 15 * 60 * 1000) {
              minInterval = 1 * 60 * 1000
            } else {
              minInterval = 15 * 1000
            }
          } else {
            minInterval = 20 * 60 * 1000
          }
          getChart(this.chartIndex) && getChart(this.chartIndex).setOption({ xAxis: { minInterval: minInterval } })
        } else {
          if (this.$refs.resizeBox.offsetWidth < 200) {
            splitNumber = 1
          } else if (this.$refs.resizeBox.offsetWidth < 300) {
            splitNumber = 3
          } else if (this.$refs.resizeBox.offsetWidth < 500) {
            splitNumber = 5
          }
          getChart(this.chartIndex) && getChart(this.chartIndex).setOption({ xAxis: { splitNumber: splitNumber } })
        }
      }
    }
  },
  created () {
    this.legendListMore = []
    this.screenLegendListMore = []
    this.chartInfo = {}
    this.seriesItem = [] // 保存信息
    this.seriesItemArr = []// 初次加载的数据
    this.seriesItemScreen = []
    this.seriesItemArrScreen = []
    this.legend = []
    this.legendList = []
    this.screenLegendList = []
    this.legendOptions = []
    this.screenLegendOptions = []

    // this.highchartStore = null, // 保存图表数据
    this.echartStore = null // 保存图表数据
    this.echartModalStore = null // 全屏查看时数据

    this.bgColorList = ['#7bbfea', '#b3424a', '#f05b72', '#596032', '#bd6758',
      '#cd9a5b', '#918597', '#70a19f', '#005344', '#FF00FF',
      '#f7acbc', '#5f5d46', '#66ffff', '#ccFF66', '#f47920',
      '#769149', '#1d953f', '#abc88b', '#7f7522', '#9b95c9',
      '#f3715c', '#ea66a6', '#d1c7b7', '#9d9087', '#77787b',
      '#f58220', '#c37e00', '#00ae9d', '#f26522', '#76becc',
      '#76624c', '#d71345', '#2468a2', '#ca8687', '#1b315e'
    ]
  },
  mounted () {
    this.firstLoad = false
    if (!document.onmousemove) { // 添加鼠标移动事件监听
      document.onmousemove = lineChartMove
    }
  },
  beforeDestroy () {
    this.clearChart()
    if (getChart(this.chartIndex)) {
      getChart(this.chartIndex).dispose()
    }
    if (!document.onmousemove) { // 移除鼠标移动事件监听
      document.onmousemove = null
    }
    setChart(this.chartIndex, null)
    window.removeEventListener('resize', this.chartResize)
  }
}

</script>
