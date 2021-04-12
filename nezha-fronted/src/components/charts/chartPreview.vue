<style scoped>
    .chart-preview-dialog{
    }
    .nz-preview-picker{
    }
    .hidden{
      visibility: hidden;
    }
    .visible{
      visibility: visible;
    }
    .chart-title {
      display: flex;
      justify-content: space-between;
    }
    .chart-title-text{
      max-width:calc(100% - 20px);
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
</style>
<style>
  .char-url-preview html{

  }
  #chartPreviewDailog .el-dialog__body {
    padding-bottom:20px !important;
  }

  #chartPreviewDailog .el-dialog__header{
    padding: 20px 20px 0px !important;
  }

</style>
<template>
    <el-dialog class="chart-preview-dialog nz-dialog" id="chartPreviewDailog"
               :visible.sync="screenModal"
               :width="dailogWidth"
               :modal-append-to-body='false'
               :modal="!fromEndpoint"
               @close="handleClose"
               @opened="initDialog">
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
      <div slot="title" class="chart-title">
        <span class="nz-dialog-title chart-title-text">{{chart.name}}</span>
        <div class="float-right panel-calendar dialog-tool"  v-if="chart.type!=='url' && chart.type !=='alertList'">

<!--          <time-picker ref="calendarPanel" class="nz-dashboard-picker" style="margin-top: -12px;" @change="dateChange" v-if="chart.type !='text'"></time-picker>-->
          <pick-time :refresh-data-func="dateChange" v-model="searchTime" :use-chart-unit="false" ref="pickTime" style="height: 28px;" id="chart-preview"></pick-time>
          <!--
          <el-date-picker ref="calendar" prefix-icon=" " size="mini" class="nz-preview-picker"
                          format="yyyy/MM/dd HH:mm"
                          @change="dateChange"
                          v-model="searchTime"
                          type="datetimerange"
                          :picker-options="pickerOptions"
                          :range-separator="$t('dashboard.panel.to')"
                          :start-placeholder="$t('dashboard.panel.startTime')"
                          :end-placeholder="$t('dashboard.panel.endTime')"
                          align="right">
          </el-date-picker>-->
        </div>
      </div>

      <template v-if="chart.type==='line' || chart.type==='bar'||chart.type==='stackArea' || chart.type == 'endpointInfo' ||chart.type =='pie'">
        <div id="chartEchartPreview" @mouseenter="mouseEnterFullChart" @mouseleave="mouseLeaveFullChart">
          <div class="line-area" ref="screenShowArea"  id="screenShowArea" style="margin-top:0px"></div>
          <div class="chart-no-data" v-show="noData">No Data</div>

          <template v-if="!hasLegendOptions">
            <div @mouseenter="mouseEnterFullChart" @mouseleave="mouseLeaveFullChart"  class="legend-container legend-container-screen" ref="screenLegendArea" v-show="showLegend">
              <div v-for="(item, index) in screenLegendList" :title="item.alias?item.alias:item.name"  @click="clickScreenLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGreyScreen[index]}"  :key="'legend_' + item.name+'_'+index">
                <span class="legend-shape" :style="{background:(isGreyScreen[index]?'#D3D3D3':item.color)}"></span>{{item.alias?item.alias:item.name}}
                <br/><!--bgColorList[index]-->
              </div>
            </div>
          </template>
          <template v-else>
            <div @mouseenter="mouseEnterFullChart" @mouseleave="mouseLeaveFullChart" class="legend-container legend-container-screen" ref="screenLegendArea" v-show="showLegend">
              <table style="width: 100%" border="0" cellpadding="0" cellspacing="0">
                <th style="width: 100%"></th>
                <template v-for="(legendOption, index) in screenLegendOptions">
                  <th v-if="legendOption.value == 'on'" :key="index" class="option-th legend-option-cell" >
                    <span @click="legendValueSort(legendOption,screenLegendList,screenLegendOptions)">{{legendOption.option}}</span>
                    <span ><i style="font-size: 12px !important;" :class="{'nz-icon nz-icon-arrow-down':legendOption.sort =='asc','nz-icon nz-icon-arrow-up':legendOption.sort=='desc'}" ></i></span>
                  </th>
                </template>
                <tbody>
                <tr v-for="(item, index) in screenLegendList" :key="'legend_' + item.name+'_'+index">
                  <td>
                    <div :title="item.alias?item.alias:item.name"  @click="clickScreenLegend(item.name,index)" class="legend-item" :class="{'ft-gr':isGreyScreen[index]}" >
                      <span class="legend-shape" :style="{background:(isGreyScreen[index]?'#D3D3D3':item.color)}"></span>{{item.alias?item.alias:item.name}}
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

        </div>
      </template>

      <template v-if="chart.type==='singleStat'">
        <div id="chartSingleStatPreview" @mouseenter="mouseEnterFullChart" @mouseleave="mouseLeaveFullChart"
         style=" height:100%;display:table;text-align:center;width:calc(100% - 16px);color:#000;" >
          <div class="line-area" ref="singleStatArea"  id="singleStatArea"  :style="{color:mapping&&mapping.color?mapping.color.text:'#000',background:mapping&&mapping.color?mapping.color.bac:'#fff'}" style="margin-top:0px; text-align:center;
      vertical-align: middle;
      display:table-cell;
      font-size:30px;">
            {{serieSingleStat}}
            <div class="chart-no-data" v-show="noData">No Data</div>
          </div>
        </div>
      </template>

      <template  v-if="chart.type==='table'">
        <div id="chartTablePreview" :class="{'visible':tableShow,'hidden':!tableShow}" >
        <el-table :data="seriesItemScreen" border class="nz-table" height="95%" id="tableContainer" style="margin-top: 10px;"  tooltip-effect="light">
          <!--                    <el-table-column sortable :show-overflow-tooltip="true" prop="metric" :label="$t('dashboard.panel.chartTableColumn.metric')" ></el-table-column>-->
          <!--                    <el-table-column sortable :show-overflow-tooltip="true" prop="label" :label="$t('dashboard.panel.chartTableColumn.label')" ></el-table-column>-->
          <el-table-column sortable prop="time" :label="$t('dashboard.panel.chartTableColumn.time')" width="145" ></el-table-column>
          <el-table-column sortable prop="element" :show-overflow-tooltip="true" :label="$t('dashboard.panel.chartTableColumn.element')" >
            <template slot-scope="scope">
              {{ scope.row.element.alias?scope.row.element.alias:scope.row.element.element}}
            </template>
          </el-table-column>
          <el-table-column sortable prop="value" :label="$t('dashboard.panel.chartTableColumn.value')" width="90" class-name="costom-value">
            <template slot-scope="scope">
              <div :style="{color:scope.row.mapping?scope.row.mapping.color.text:'#000',background:scope.row.mapping?scope.row.mapping.color.bac:'#fff'}">
                <span style="padding: 0px 10px;">{{ scope.row.value}}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <Pagination :pageObj="screenPageObj" @pageNo='screenPageNo' @pageSize='screenPageSize' ref="Pagination" ></Pagination>
        </div>
      </template>

      <template  v-if="chart.type==='url'">
        <div id="chartUrlPreview" :class="{'visible':urlShow,'hidden':!urlShow}" class="char-url-preview">
          <iframe id="chartUrlFrame" frameborder="0" width="100%" height="100%" name="showHere" scrolling=auto
                  style="z-index:5000;"
          ></iframe>
        </div>
      </template>

      <chart-alert-list v-if="chart.type === 'alertList'" ref="alertListChart" id="chartAlertListPreview" :chart-info="chart"></chart-alert-list>

      <template v-if="chart.type==='text'">
          <div  id="chartTextPreview" class="chart-text-preview">
            <div style="height: 100%; overflow: auto;">
              <div style="height: 100%;" v-html="chart.param.text" ></div>
            </div>
          </div>
      </template>

      <loading  ref="loadingPreview"></loading>
    </el-dialog>
</template>
<script>
import axios from 'axios'
import * as echarts from 'echarts'
import bus from '../../libs/bus'
import loading from '../common/loading'
import chartDataFormat from './chartDataFormat'
import { randomcolor } from '../common/js/radomcolor/randomcolor.js'
import chartAlertList from './chart-alert-list'
import chartConfig from '../page/dashboard/overview/chartConfig'
export default {
  name: 'chartPreview',
  components: {
    loading: loading,
    'chart-alert-list': chartAlertList
  },
  props: {
    panelId: Number,
    fromEndpoint: Boolean
  },
  data () {
    return {
      chart: {},
      noData: false,
      // data: {}, // 该图表信息,chartItem
      dailogWidth: '80%',
      // seriesItem: [], // 保存信息
      isError: false,
      errorContent: '',
      serieSingleStat: '',
      seriesItemScreen: [],
      screenPageObj: {
        pageNo: 1,
        pageSize: this.$CONSTANTS.defaultPageSize,
        total: 0
      },
      unit: {},
      // images: '',
      // toolbox: false,
      items: {
        metric_name: [], // 每条数据列名称
        xAxis: [],
        theData: [] // series数据组
      },
      isStackArea: false,
      echartModalStore: null, // 全屏查看时数据
      chartType: 'line', // 图表类型
      screenModal: false,
      // 查询数据使用
      stableFilter: {}, // 保存数据使用,初始化起止时间,单图or多图等
      legend: [],
      legendList: [],
      screenLegendList: [],
      isGrey: [],
      isGreyScreen: [],
      bgColorList: ['#7bbfea', '#b3424a', '#f05b72', '#596032', '#bd6758',
        '#cd9a5b', '#918597', '#70a19f', '#005344', '#FF00FF',
        '#f7acbc', '#5f5d46', '#66ffff', '#ccFF66', '#f47920',
        '#769149', '#1d953f', '#abc88b', '#7f7522', '#9b95c9',
        '#f3715c', '#ea66a6', '#d1c7b7', '#9d9087', '#77787b',
        '#f58220', '#c37e00', '#00ae9d', '#f26522', '#76becc',
        '#76624c', '#d71345', '#2468a2', '#ca8687', '#1b315e'
      ],
      // firstShow: false, // 默认不显示操作按钮,
      // dropdownMenuShow:false,
      showLegend: true,
      tableShow: true,
      urlShow: true,
      searchTime: bus.getTimezontDateRange(),
      // oldSearchTime:[],
      minHeight: 200,
      chartSpaceHeight: 5, // top-border: 1,bottom-border: 1,padding-bottome:3
      titleHeight: 58,
      legendHeight: 80,
      pageHeight: 40,
      hasLegendOptions: false,
      screenLegendOptions: [],
      mapping: {}
    }
  },
  computed: {
  },
  watch: {},
  methods: {
    // 全屏查看
    show (chartInfo) {
      this.isError = false
      this.searchTime = bus.getTimezontDateRange()
      this.chart = JSON.parse(JSON.stringify(chartInfo))
      const chartType = chartInfo.type
      let chartContainerId = 'chartEchartPreview'
      if (chartType === 'table') {
        this.tableShow = false
        chartContainerId = 'chartTablePreview'
      } else if (chartType === 'line' || chartType === 'bar' || chartType === 'stackArea' || chartType === 4 || chartType == 'pie') {
        this.isGreyScreen = []
        this.showLegend = false
        chartContainerId = 'chartEchartPreview'
      } else if (chartType === 'url') {
        this.urlShow = false
        chartContainerId = 'chartUrlPreview'
      } else if (chartType === 'singleStat') {
        chartContainerId = 'chartSingleStatPreview'
      } else if (chartType === 'alertList') {
        chartContainerId = 'chartAlertListPreview'
      } else if (chartType == 'text') {
        chartContainerId = 'chartTextPreview'
      }

      // 设置高度 chart-table
      this.$nextTick(() => {
        // const chartBox = document.getElementById('chartPreviewDailog');
        // let height = this.chart.height;
        let height = Math.round(this.chart.height / 10) * 10
        if (height < this.minHeight) {
          height = this.minHeight
        }

        const dailogBox = document.querySelector('#chartPreviewDailog  .el-dialog')
        dailogBox.style.height = `${height}px`

        // const addChartBox = document.querySelector('.right-box-add-chart')
        // addChartBox.style.cssText =  'z-index:1500 !important';
        if (chartType === 'table') {
          const chartDiv = document.getElementById(chartContainerId)
          chartDiv.style.height = `${height - this.chartSpaceHeight - this.titleHeight - 25}px`
          const tableBox = document.getElementById('tableContainer')
          tableBox.style.height = `${height - this.titleHeight - this.pageHeight - 25}px`// -75-32+25
        } else {
          const chartDiv = document.getElementById(chartContainerId)
          chartDiv.style.height = `${height - this.chartSpaceHeight - this.titleHeight - 15}px`
        }
      })

      this.screenModal = true
    },
    setLoadFrame () {
      if (this.chart.type === 'url') {
        const that = this
        this.$nextTick(() => {
          // const iframeBox = document.querySelector('#chartUrlPreview')
          const iframe = document.querySelector('#chartUrlFrame')

          // 处理兼容行问题
          if (iframe.attachEvent) {
            iframe.attachEvent('onload', function () {
              // iframe加载完毕以后执行操作
              that.$refs.loadingPreview.endLoading()
            })
          } else {
            iframe.onload = function () {
              // iframe加载完毕以后执行操作
              that.$refs.loadingPreview.endLoading()
            }
          }
          iframe.src = this.chart.param.url
        })
      }
    },
    filterShowData (source, pageObj) {
      return source.slice((pageObj.pageNo - 1) * pageObj.pageSize, pageObj.pageNo * pageObj.pageSize)
    },
    initDialog () {
      // 此时初始化，才能获得screenShowArea对象，否则此对象为undefined，无法初始化图表
      const chartType = this.chart.type
      if (chartType === 'table') {
        //
      } else if (chartType === 'line' || chartType === 'bar' || chartType === 'stackArea' || chartType === 4 || chartType == 'endpointInfo' || chartType == 'pie') {
        if (this.echartModalStore) {
          this.echartModalStore.clear()
        }
      } else if (chartType === 'url') {
        //
      }
      // 后台获得数据
      if (this.chart.type !== 'url' && this.chart.type !== 'text') {
        this.$refs.loadingPreview.startLoading()
        this.getChartData()
      } else if (this.chart.type == 'url') {
        this.$refs.loadingPreview.startLoading()
        this.urlShow = true
        this.setLoadFrame()
      }
    },
    getAlertListChartData: function (chartInfo, filterType) {
      this.$refs.alertListChart.getAlertList(filterType, true, this.chart)
      this.$refs.loadingPreview.endLoading()
    },
    // 获取一个图表具体数据
    getChartData () {
      const chartItem = this.chart
      if (chartItem.type === 'alertList') {
        this.getAlertListChartData(chartItem, null)
        return
      }
      const len = chartItem.elements.length
      // 没有数据的设置提示信息暂无数据-针对每一个图
      if (len === 0) {
        this.noData = true
        this.$nextTick(() => {
          if (chartItem.type === 'table') { // 表格
            this.setTableData([])
          } else if (chartItem.type === 'line' || chartItem.type === 'bar' || chartItem.type === 'stackArea' || chartItem.type === 4 || chartItem.type === 'endpointInfo' || chartItem == 'pie') {
            this.setData(chartItem, [], [])
          } else if (chartItem.type === 'singleStat') {
            this.serieSingleStat = ''
            this.$refs.loadingPreview.endLoading()
          }
        })
      } else {
        let startTime = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss')
        let endTime = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss')
        if (!startTime || !endTime) { // 如果时间为空，则默认取最近1小时
          const now = new Date(bus.computeTimezone(new Date().getTime()))
          startTime = bus.timeFormate(now, 'yyyy-MM-dd hh:mm:ss')
          endTime = bus.timeFormate(now.setHours(now.getHours() - 1), 'yyyy-MM-dd hh:mm:ss')
          this.searchTime[0] = startTime
          this.searchTime[1] = endTime
        }
        const step = bus.getStep(startTime, endTime)
        this.$nextTick(() => {
          const axiosArr = chartItem.elements.map((ele) => {
            const filterItem = ele
            const query = encodeURIComponent(filterItem.expression)
            // if(chartItem.type === 'table'&&chartItem.param&&chartItem.param.last == 1){
            //   return this.$get('/prom/api/v1/query_range?query=' + query + "&start=" + this.$stringTimeParseToUnix(endTime) + "&end=" + this.$stringTimeParseToUnix(endTime) + '&step=' + step);
            // }
            return this.$get('/prom/api/v1/query_range?query=' + query + '&start=' + this.$stringTimeParseToUnix(startTime) + '&end=' + this.$stringTimeParseToUnix(endTime) + '&step=' + step)
          })
          // 一个图表的所有element单独获取数据
          axios.all(axiosArr).then((res) => {
            if (res.length > 0) {
              const series = []
              let singleStatRlt = ''
              const legend = []
              const tableData = []
              let pieSeries
              if (chartItem.type === 'pie') {
                pieSeries = {
                  type: 'pie',
                  radius: '100%',
                  center: ['50%', '50%'],
                  top: '20%',
                  bottom: '20%',
                  // roseType: 'radius',
                  minAngle: 10,
                  itemStyle: {
                    borderRadius: 5,
                    borderColor: '#fff',
                    borderWidth: 1
                  },
                  label: {
                    show: false
                  },
                  emphasis: {
                    label: {
                      show: false
                    }
                  },
                  data: []
                }
              }
              if (chartItem.type === 'bar' && chartItem.param.statistics && chartItem.param.statistics !== 'null') {
                pieSeries = {
                  type: 'bar',
                  // roseType: 'radius',
                  itemStyle: {
                    borderRadius: 5,
                    borderColor: '#fff',
                    borderWidth: 1
                  },
                  label: {
                    show: false
                  },
                  emphasis: {
                    label: {
                      show: false
                    }
                  },
                  data: []
                }
              }
              res.forEach((response, innerPos) => {
                if (response.status === 'success') {
                  this.isError = false
                  this.errorContent = ''
                  if (response.data.result) {
                    if (chartItem.type === 'singleStat') {
                      if (response.data.result.length === 1) {
                        const statistics = chartItem.param.statistics
                        if (response.data.result[0].values) {
                          singleStatRlt = bus.getSingleStatRlt(statistics, response.data.result[0].values)
                          this.noData = false
                        } else {
                          this.noData = true
                        }
                      } else if (response.data.result.length > 1) {
                        this.noData = true
                        singleStatRlt = this.$t('dashboard.panel.singleStatErrorTip')
                      }
                    } else {
                      // 循环处理每个elements下获取的数据列
                      response.data.result.forEach((queryItem, resInnerPos) => {
                        const seriesItem = {
                          theData: {
                            name: '',
                            symbol: 'emptyCircle', // 去掉点
                            symbolSize: [2, 2],
                            smooth: 0.2, // 曲线变平滑
                            showSymbol: false,
                            data: [],
                            type: chartItem.type,
                            lineStyle: {
                              width: 1,
                              opacity: 0.9
                            }
                          },
                          metric_name: ''
                        }
                        if (chartItem.type === 'stackArea') {
                          seriesItem.theData.type = 'line'
                          seriesItem.theData.stack = chartItem.name
                          seriesItem.theData.areaStyle = { opacity: 0.3 }
                        }
                        if (chartItem.type === 'endpointInfo') {
                          seriesItem.theData.type = 'line'
                        }
                        // 图表中每条线的名字,后半部分
                        let host = ''// up,
                        if (queryItem.metric.__name__) {
                          host = `${queryItem.metric.__name__}{`// up,
                        }
                        const tagsArr = Object.keys(queryItem.metric)// ["__name__","asset","idc","instance","job","module","project"]
                        // 设置时间-数据格式对
                        const dpsArr = Object.entries(queryItem.values)// [ ["0",[1577959830.781,"0"]], ["1",[1577959845.781,"0"]] ]
                        // 判断是否有数据, && tagsArr.length > 0
                        if (dpsArr.length > 0) {
                          tagsArr.forEach((tag, i) => {
                            if (tag !== '__name__') {
                              host += `${tag}="${queryItem.metric[tag]}",`
                            }
                          })
                          if (host.endsWith(',')) {
                            host = host.substr(0, host.length - 1)
                          }
                          if (queryItem.metric.__name__) {
                            host += '}'
                          }
                          if (!host || host === '') {
                            host = chartItem.elements[innerPos].expression
                          }
                          // 处理legend别名
                          let alias = this.dealLegendAlias(host, chartItem.elements[innerPos].legend)
                          if (!alias || alias === '') {
                            alias = host
                          }
                          legend.push({ name: host + resInnerPos, alias: alias })
                          // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c
                          seriesItem.theData.name = host + resInnerPos
                          seriesItem.metric_name = seriesItem.theData.name
                          // 将秒改为毫秒
                          // alert('table=='+JSON.stringify(queryItem))
                          seriesItem.theData.data = queryItem.values.map((dpsItem, dpsIndex) => {
                            // const tData = new Date(dpsItem[0] * 1000)
                            // const timeTmp = bus.timeFormate(tData, 'yyyy-MM-dd hh:mm:ss')
                            tableData.push({ // 表格数据
                              // label: host.slice(host.indexOf('{') + 1,host.indexOf('}')),//label
                              // metric: queryItem.metric.__name__?queryItem.metric.__name__:'',//metric列
                              element: { element: host, alias: alias },
                              // time: timeTmp,//采集时间
                              // value: dpsItem[1],//数值
                              data: [dpsItem[0] * 1000, dpsItem[1]]
                            })
                            return [dpsItem[0] * 1000, dpsItem[1]]
                          })
                          if (chartItem.type === 'pie') {
                            pieSeries.data.push({ value: bus.getSingleStatRlt(chartItem.param.statistics, seriesItem.theData.data), name: host + resInnerPos })
                          } else if (chartItem.type === 'bar' && chartItem.param.statistics && chartItem.param.statistics !== 'null') {
                            pieSeries.data.push({ value: bus.getSingleStatRlt(chartItem.param.statistics, seriesItem.theData.data), name: host + resInnerPos })
                          } else {
                            series.push(seriesItem.theData)
                          }
                        } else if (chartItem.elements && chartItem.elements[innerPos]) {
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
              // if(this.$refs.editChart&&this.$refs.editChart[index]) {
              if (chartItem.type === 'table') { // 表格
                this.setTableData(tableData)
              } else if (chartItem.type === 'bar' && chartItem.param.statistics && chartItem.param.statistics !== 'null') {
                series.push(pieSeries)
                if (series[0].data.length < 1) {
                  this.noData = true
                } else {
                  this.noData = false
                }
                this.setData(chartItem, series, legend)
              } else if (chartItem.type === 'line' || chartItem.type === 'bar' || chartItem.type === 'stackArea' || chartItem.type === 4 || chartItem.from == 'endpoint') {
                if (series.length && chartItem.type === 4) { // 曲线汇总
                }
                if (series.length < 1) {
                  this.noData = true
                } else {
                  this.noData = false
                }
                const _chartItem = JSON.parse(JSON.stringify(chartItem))
                if (chartItem.from == this.$CONSTANTS.fromRoute.endpoint) {
                  _chartItem.type = 'line'
                }
                this.setData(_chartItem, series, legend)
              } else if (chartItem.type === 'singleStat') {
                if (Number(singleStatRlt)) {
                  const singleStatTmp = parseFloat(Number(singleStatRlt).toFixed(2))// parseFloat ：如果没有小数点，或者小数点后都是零，parseFloat() 会返回整数。
                  if (chartItem.param.valueMapping && chartItem.param.valueMapping.type) {
                    const type = chartItem.param.valueMapping.type
                    const mappings = chartItem.param.valueMapping.mapping ? chartItem.param.valueMapping.mapping : []
                    let mapping
                    if (type == 'value') {
                      mapping = mappings.find(item => { return item.value == singleStatTmp })
                    } else {
                      mapping = mappings.find(item => { return item.from <= singleStatTmp && item.to >= singleStatTmp })
                    }
                    this.mapping = mapping
                    if (this.mapping && !this.mapping.color) {
                      this.mapping.color = { bac: '#fff', text: '#000' }
                    }
                    this.serieSingleStat = mapping ? mapping.text.replace('{{value}}', singleStatTmp).replace('{{name}}', chartItem.elements[0].legend) : chartDataFormat.getUnit(chartItem.unit ? chartItem.unit : 2).compute(singleStatTmp, null, 2)
                  } else {
                    this.serieSingleStat = chartDataFormat.getUnit(chartItem.unit ? chartItem.unit : 2).compute(singleStatTmp, null, 2)
                  }
                } else {
                  this.serieSingleStat = singleStatRlt
                }
                this.$refs.loadingPreview.endLoading()
              } else if (chartItem.type == 'pie') {
                series.push(pieSeries)
                if (series[0].data.length < 1) {
                  this.noData = true
                } else {
                  this.noData = false
                }
                this.setData(chartItem, series, legend)
              }
              // }
            } else {
              const type = chartItem.type
              // if(this.$refs.editChart[index]) {
              if (type === 'table') {
                this.setTableData([])
              } else if (type === 'line' || type === 'bar' || type === 'stackArea' || type === 4 || chartItem.type == 'pie') {
                this.setData(chartItem, [])
              } else if (chartItem.type === 'singleStat') {
                this.serieSingleStat = ''
                this.$refs.loadingPreview.endLoading()
              }
              // }
            }
          }).catch((error) => {
            if (error) {
              this.$message.error(error.toString())
              console.error(error)
            }
          })
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
      }
      // 点击图表某一个legend，图表只显示当前点击的曲线或柱状图，其它隐藏，再次点击已选中的legend ，显示全部
      /* let curIsGrey=this.isGreyScreen[index];
        if(this.echartModalStore){
          this.screenLegendList.forEach((item,i)=>{
            let isGrey = this.isGreyScreen[i];
            if(index != i){
              if(!curIsGrey && !isGrey){
                this.echartModalStore.dispatchAction({
                  type: 'legendUnSelect',
                  name: item.name
                });
              }else if(!curIsGrey && isGrey){
                this.echartModalStore.dispatchAction({
                  type: 'legendSelect',
                  name: item.name
                });
              }else{
                this.echartModalStore.dispatchAction({
                  type: 'legendUnSelect',
                  name: item.name
                });
              }
            }else {
              this.echartModalStore.dispatchAction({
                type: 'legendSelect',
                name: item.name
              });
            }
          });
          this.isGreyScreen.forEach((item,i)=>{
            if(index != i){
              if(!curIsGrey && !item){
                this.$set(this.isGreyScreen, i, true);
              }else if(!curIsGrey && item){
                this.$set(this.isGreyScreen, i, false);
              }else{
                this.$set(this.isGreyScreen, i, true);
              }
            }else{
              if(item === true){
                this.$set(this.isGreyScreen, i, false);
              }
            }
          })
        } */
    },
    formatLegend (chartWidth, name) {
      if (!name) {
        return ''
      }
      // 计算宽度
      const span = document.createElement('span')
      const result = {}
      result.width = span.offsetWidth
      result.height = span.offsetHeight
      span.style.visibility = 'hidden'
      span.style.fontSize = 14
      span.style.fontFamily = 'Arial'
      span.style.display = 'inline-block'
      document.body.appendChild(span)
      if (typeof span.textContent !== 'undefined') {
        span.textContent = name
      } else {
        span.innerText = name
      }
      const txtWidth = parseFloat(window.getComputedStyle(span).width) - result.width
      document.body.removeChild(span)

      if (txtWidth < chartWidth) {
        return name
      } else {
        const charNum = `${(chartWidth - 100) / (txtWidth / name.length)}`
        return name.slice(0, charNum) + '...'
      }
    },
    // chartSite用于区分是全屏显示还是局部显示
    initChart (chartInfo, dataArg, ele, legend) {
      const self = this
      let minTime = null
      let maxTime = null
      if (dataArg.length > 0 && dataArg[0].data &&
          dataArg[0].data.length > 0 && dataArg[0].data[0].length > 0) {
        const len = dataArg[0].data.length - 1
        minTime = dataArg[0].data[0][0]
        maxTime = dataArg[0].data[len][0]
      }
      this.chartType = '' // 图表类型
      if (chartInfo.type === 4) { // line,bar
        this.chartType = 'line'
      }
      this.echartModalStore = echarts.init(ele)
      const chartWidth = ele.clientWidth
      /* const title = {
        show: false,
        text: chartInfo.title || null,
        textAlign: 'left',
        useHTML: true,
        textStyle: {
          width: '60%',
          fontStyle: 'normal',
          fontWeight: 'bold',
          color: '#333'

        }
      } */
      const stackIconBorderColor = (chartInfo.type === 'stackArea' ? '#53a3cb' : '#7e7e7e')
      const stackIconChooseBorderColor = (chartInfo.type === 'stackArea' ? '#7e7e7e' : '#53a3cb')
      const option = {
        title: {
          show: false
        },
        color: this.bgColorList,
        toolbox: {
          show: false,
          top: '0',
          showTitle: false,
          feature: {
            dataZoom: {
              yAxisIndex: false
            },
            magicType: {
              type: ['stack'],
              iconStyle: {
                borderColor: stackIconBorderColor
              },
              emphasis: {
                borderColor: stackIconChooseBorderColor
              }
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
          extraCssText: 'z-index:1000;',
          /* enterable:true, 导致tooltip不消失，显示多个tooltip */
          position: function (point, params, dom, rect, size) {
            dom.style.transform = 'translateZ(0)'
            // 提示框位置
            let x = 0
            let y = 0
            // 当前鼠标位置
            const pointX = point[0]
            const pointY = point[1]
            // 外层div大小
            const viewWidth = size.viewSize[0]
            const viewHeight = size.viewSize[1]
            // 提示框大小
            const boxWidth = size.contentSize[0]
            const boxHeight = size.contentSize[1]
            if (pointX < (viewWidth / 2)) { // 说明鼠标在左边放不下提示框
              x = pointX + 10
            } else {
              x = pointX - boxWidth
            }
            if (pointY < (viewHeight / 2)) { // 说明鼠标上面放不下提示框
              y = pointY + 10
            } else {
              y = pointY - boxHeight
            }
            return [x, y]
          },
          formatter: function (params) {
            let str = '<div>'
            let sum = 0
            params.forEach((item, i) => {
              const tip = legend[item.seriesIndex]
              const color = self.bgColorList[item.seriesIndex]
              if (i === 0) {
                const tData = new Date(item.data[0])
                str += [tData.getFullYear(), tData.getMonth() + 1, tData.getDate()].join('-') + ' ' +
                    [tData.getHours(), tData.getMinutes(), tData.getSeconds()].join(':')
                str += '<br/>'
              }
              let val = parseFloat(Number(item.data[1]).toFixed(2))
              if (val === 0) {
                val = Number(item.data[1]).toExponential(2)
              }
              sum += self.numberWithEConvent(val)
              str += '<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">'
              str += `<div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${color};}'></span>${tip ? (tip.alias ? tip.alias : tip.name) : item.seriesName}  </div>`
              str += '<div style="padding-left: 10px;">'
              str += (function () {
                if (chartInfo.from == 'endpoint') {
                  return val == 1 ? 'up' : 'down'
                }
                return chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(val, null, 2)
              }())
              str += '</div>'
              str += '</div>'
            })
            if (chartInfo.type === 'stackArea' || self.isStackArea) {
              sum = parseFloat(Number(sum).toFixed(2))
              str += '<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">'
              str += '<div style="line-height: 18px; font-size: 12px;padding-left:20px;">'
              str += self.$t('dashboard.panel.chartTotal')
              str += '</div>'
              str += '<div style="padding-left: 10px;">'
              str += chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(sum, null, 2)
              str += '</div>'
              str += '</div>'
            }
            str += '</div>'
            return str
          }
        },
        legend: {
          show: false
        },
        grid: {
          top: 30,
          left: 0,
          right: 30,
          containLabel: true,
          bottom: 8// 156
        },
        xAxis: {
          type: 'time',
          // boundaryGap: false,//line-false; bar-true;
          // data: ['20190101', '20190102', '周三', '周四', '周五', '周六', '周日']
          axisLabel: {
            interval: 0,
            rotate: 0,
            formatter: function (value) {
              value = bus.computeTimezone(value)
              const tData = new Date(value)
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
            show: true
          }
        },
        yAxis: {
          type: 'value',
          minInterval: 1,
          splitLine: {
            show: true
          },
          // 去掉y轴--start
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          // 去掉y轴--end
          axisLabel: {
            formatter: function (value, index) {
              if (self.chart.from == 'endpoint') {
                if (value == 1) {
                  return 'up'
                } else {
                  return 'down'
                }
              }
              let chartUnit = chartInfo.unit
              chartUnit = chartUnit || 2
              const unit = chartDataFormat.getUnit(chartUnit)
              return unit.compute(value, index)
            }
          }
          // boundaryGap:[0,0.2]
        },
        useUTC: false, // 使用本地时间
        series: dataArg
      }
      if (this.echartModalStore) {
        this.echartModalStore.clear()
      }
      option.title = {}
      // this.echartModalStore.setOption(option);//显示全屏界面
      this.showLegend = true
      if (legend) {
        this.screenLegendList = []
        legend.forEach((item, i) => {
          const _legend = {
            name: item.name,
            alias: item.alias,
            color: item.color,
            showText: this.formatLegend(chartWidth, item.alias ? item.alias : item.name)
          }
          this.screenLegendList.push(_legend)
          this.isGreyScreen.push(false)
        })
      }
      if (this.hasLegendOptions) {
        this.computeLegendData(this.screenLegendList, dataArg, 'screen')
      }
      this.$nextTick(() => {
        const divHeight = this.$refs.screenLegendArea.offsetHeight
        this.echartModalStore.resize({ height: (chartInfo.height - this.chartSpaceHeight - divHeight - this.titleHeight) })
        this.echartModalStore.clear()
        if (dataArg.length < 1) {
          this.echartModalStore.setOption(chartConfig.getOption('noData'))
        } else {
          this.echartModalStore.setOption(option)// 创建图表
        }

        this.$refs.loadingPreview.endLoading()
      })
      this.echartModalStore.on('magictypechanged', function (params) {
        self.isStackArea = !self.isStackArea
        if (self.isStackArea) {
          this.setOption({
            toolbox: {
              feature: {
                magicType: {
                  iconStyle: {
                    borderColor: '#7e7e7e'
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
                let str = '<div>'; let sum = 0
                params.forEach((item, i) => {
                  const tip = legend[item.seriesIndex]
                  const color = self.bgColorList[item.seriesIndex]
                  if (i === 0) {
                    const value = bus.computeTimezone(item.data[0])
                    const tData = new Date(value)
                    str += [tData.getFullYear(), tData.getMonth() + 1, tData.getDate()].join('-') + ' ' +
                        [tData.getHours(), tData.getMinutes(), tData.getSeconds()].join(':')
                    str += '<br/>'
                  }
                  let val = parseFloat(Number(item.data[1]).toFixed(2))
                  if (val === 0) {
                    val = Number(item.data[1]).toExponential(2)
                  }
                  sum += self.numberWithEConvent(val)
                  str += '<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">'
                  str += `<div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${color};}'></span>${tip ? (tip.alias ? tip.alias : tip.name) : item.seriesName}  </div>`
                  str += '<div style="padding-left: 10px;">'
                  str += chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(val, null, 2)
                  str += '</div>'
                  str += '</div>'
                })
                if (chartInfo.type === 'stackArea' || self.isStackArea) {
                  sum = parseFloat(Number(sum).toFixed(2))
                  str += '<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">'
                  str += '<div style="line-height: 18px; font-size: 12px;padding-left:20px;">'
                  str += self.$t('dashboard.panel.chartTotal')
                  str += '</div>'
                  str += '<div style="padding-left: 10px;">'
                  str += chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(sum, null, 2)
                  str += '</div>'
                  str += '</div>'
                }

                str += '</div>'
                return str
              }
            }
          })
        }
      })
    },
    initStaticsBar: function (chartInfo, dataArg, legend) {
      const self = this
      const option = {
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
          bottom: 8// 156
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
        series: null
      }
      option.xAxis = {
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
          formatter: function (params) {
            const dataLength = dataArg.length || 1
            const chartWidth = (document.getElementById('chartEchartPreview').offsetWidth - 80) / dataLength// 容器宽 - padding - 空余
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
      const nweSeriesItem = []
      dataArg[0].data.forEach((item, index) => {
        const obj = { ...dataArg[0] }
        const legendShow = legend[index].alias ? legend[index].alias : legend[index].name
        obj.name = legend[index].name
        obj.data = [[legendShow, item.value]]
        obj.stack = true
        if (chartInfo.param.threshold) {
          obj.markLine = {
            silent: true,
            symbol: ['circle', 'circle'],
            label: {
              distance: this.computeDistance(chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(chartInfo.param.threshold)),
              formatter: function (params) {
                return chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(params.value)
              }
            },
            lineStyle: {
              color: '#d64f40',
              width: 2,
              type: 'dotted'
            },
            data: [{
              yAxis: Number(chartInfo.param.threshold)
            }]
          }
        }
        nweSeriesItem.push(obj)
      })
      dataArg = nweSeriesItem
      option.yAxis = {
        type: 'value',
        minInterval: 1,
        splitLine: {
          show: true
        },
        // 去掉y轴--start
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        // 去掉y轴--end
        axisLabel: {
          formatter: function (value, index) {
            if (self.chart.from && self.chart.from == 'endpoint') {
              if (value == 1) {
                return 'up'
              } else {
                return 'down'
              }
            }
            let chartUnit = chartInfo.unit
            chartUnit = chartUnit || 2
            const unit = chartDataFormat.getUnit(chartUnit)
            return unit.compute(value, index)
          }
        }
        // boundaryGap:[0,0.2]
      }
      option.series = dataArg
      option.color = this.bgColorList
      option.tooltip.formatter = this.barFormatterFunc
      const dom = document.getElementById('screenShowArea')
      this.echartModalStore = echarts.init(dom)
      this.showLegend = true
      if (legend) {
        this.screenLegendList = []
        legend.forEach((item, i) => {
          const _legend = {
            name: item.name,
            alias: item.alias,
            color: item.color,
            showText: this.formatLegend(dom.clientWidth, item.alias ? item.alias : item.name)
          }
          this.screenLegendList.push(_legend)
          this.isGreyScreen.push(false)
        })
      }
      this.$nextTick(() => {
        const divHeight = this.$refs.screenLegendArea.offsetHeight
        this.echartModalStore.resize({ height: (chartInfo.height - this.chartSpaceHeight - divHeight - this.titleHeight) })
        this.echartModalStore.clear()
        if (dataArg[0].data.length < 1) {
          this.echartModalStore.setOption(chartConfig.getOption('noData'))
        } else {
          this.echartModalStore.setOption(option)// 创建图表
        }

        this.$refs.loadingPreview.endLoading()
      })
    },
    computeDistance: function (str) {
      const span = document.querySelector('.temp-dom')
      span.textContent = str
      const txtWidth = parseFloat(window.getComputedStyle(span).width)
      return Number('-' + (txtWidth + 5))
    },
    initPie: function (chartInfo, dataArg, legend) {
      const option = {
        title: {
          show: false
        },
        legend: {
          show: false
        },
        grid: {
          left: 'center',
          top: 'middle'
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
        series: null
      }
      option.series = dataArg
      option.color = this.bgColorList
      option.tooltip.formatter = this.pieFormatterFunc
      const dom = document.getElementById('screenShowArea')
      this.echartModalStore = echarts.init(dom)
      this.showLegend = true
      if (legend) {
        this.screenLegendList = []
        legend.forEach((item, i) => {
          const _legend = {
            name: item.name,
            alias: item.alias,
            color: item.color,
            showText: this.formatLegend(dom.clientWidth, item.alias ? item.alias : item.name)
          }
          this.screenLegendList.push(_legend)
          this.isGreyScreen.push(false)
        })
      }
      this.$nextTick(() => {
        const divHeight = this.$refs.screenLegendArea.offsetHeight
        this.echartModalStore.resize({ height: (chartInfo.height - this.chartSpaceHeight - divHeight - this.titleHeight) })
        this.echartModalStore.clear()
        if (dataArg[0].data.length < 1) {
          this.echartModalStore.setOption(chartConfig.getOption('noData'))
        } else {
          this.echartModalStore.setOption(option)// 创建图表
        }

        this.$refs.loadingPreview.endLoading()
      })
    },
    mouseEnterFullChart () {
      if (this.echartModalStore) {
        this.echartModalStore.setOption({
          toolbox: {
            show: true
          }
        })
      }
    },
    mouseLeaveFullChart () {
      if (this.echartModalStore) {
        this.echartModalStore.setOption({
          toolbox: {
            show: false
          }
        })
      }
    },
    setColor (colorNum) {
      this.bgColorList = []
      for (let i = 0; i < colorNum; i++) {
        this.bgColorList.push(randomcolor())
      }
    },
    // 设置数据
    setData (chartItem, seriesItem, legend) {
      this.setColor(legend.length)
      legend.forEach((t, i) => { t.color = this.bgColorList[i] })
      this.legend = legend
      // this.data = chartItem;
      // this.seriesItem = seriesItem;
      this.seriesItemScreen = seriesItem
      this.hasLegendOptions = this.findLegendOptions()
      if (this.hasLegendOptions) {
        const sortedOptionKeys = ['min', 'max', 'avg', 'last', 'total']
        this.screenLegendOptions = sortedOptionKeys.map(item => { return { option: item, sort: '', value: chartItem.param.legendValue[item] } })
      }
      if (chartItem.type == 'pie') {
        this.initPie(chartItem, seriesItem, legend)
        return
      }
      if (chartItem.type === 'bar' && chartItem.param.statistics && chartItem.param.statistics !== 'null') {
        this.initStaticsBar(chartItem, seriesItem, legend)
        return
      }
      this.initChart(chartItem, seriesItem, this.$refs.screenShowArea, legend)
    },
    // 设置数据
    setTableData (seriesItem) {
      this.unit = chartDataFormat.getUnit(this.chart.unit)
      const statistics = this.chart.param.statistics
      seriesItem = this.getStatisticsResult(statistics, seriesItem)
      seriesItem = seriesItem.map(item => {
        if (this.chart.param.valueMapping && this.chart.param.valueMapping.type) {
          const type = this.chart.param.valueMapping.type
          const mappings = this.chart.param.valueMapping.mapping ? this.chart.param.valueMapping.mapping : []
          const value = Number(item.value)

          let mapping
          if (type == 'value') {
            mapping = mappings.find(t => { return Number(t.value) == value })
          } else {
            mapping = mappings.find(t => { return Number(t.from) <= value && Number(t.to) >= value })
          }
          this.mapping = mapping
          item.mapping = mapping
          item.value = mapping ? mapping.text.replace('{{value}}', item.value).replace('{{name}}', item.element.alias) : this.unit.compute(value, null, 2)
        }
        return item
      })
      this.storedScreanTableData = seriesItem
      this.storedScreanTableData = Object.assign([], this.storedScreanTableData.reverse())
      this.screenPageObj.total = this.storedScreanTableData.length
      this.seriesItemScreen = this.filterShowData(this.storedScreanTableData, this.screenPageObj)

      this.tableShow = true
      this.$refs.loadingPreview.endLoading()
    },
    getStatisticsResult (statistics, seriesItem) {
      let copy = JSON.parse(JSON.stringify(seriesItem))
      const last = copy.sort((x, y) => { return parseFloat(y[0]) - parseFloat(x[0]) })[0]
      let result
      switch (statistics) {
        case 'null': {
          return copy.map(item => {
            return {
              element: item.element,
              time: bus.timeFormate(new Date(item.data[0]), 'yyyy-MM-dd hh:mm:ss'),
              value: item.data[1]
            }
          })
        }
        case 'min': {
          result = copy.sort((x, y) => { return parseFloat(x.data[1]) - parseFloat(y.data[1]) })[0]
          result = [{
            element: result.element,
            time: bus.timeFormate(new Date(result.data[0]), 'yyyy-MM-dd hh:mm:ss'),
            value: result.data[1]
          }]
          break
        }
        case 'max': {
          result = copy.sort((x, y) => { return parseFloat(y.data[1]) - parseFloat(x.data[1]) })[0]
          result = [{
            element: result.element,
            time: bus.timeFormate(new Date(result.data[0]), 'yyyy-MM-dd hh:mm:ss'),
            value: result.data[1]
          }]
          break
        }
        case 'average': {
          copy = copy.map(t => parseFloat(t.data[1]))
          const sum = eval(copy.join('+'))
          const avg = sum / copy.length
          result = [{
            element: last.element,
            time: bus.timeFormate(new Date(last.data[0]), 'yyyy-MM-dd hh:mm:ss'),
            value: avg
          }]
          break
        }
        case 'total': {
          copy = copy.map(t => parseFloat(t.data[1]))
          const total = eval(copy.join('+'))
          result = [{
            element: last.element,
            time: bus.timeFormate(new Date(last.data[0]), 'yyyy-MM-dd hh:mm:ss'),
            value: total
          }]
          break
        }
        case 'first': {
          result = copy.sort((x, y) => { return parseFloat(y.data[0]) - parseFloat(x.data[0]) })[copy.length - 1]
          result = [{
            element: result.element,
            time: bus.timeFormate(new Date(result.data[0]), 'yyyy-MM-dd hh:mm:ss'),
            value: result.data[1]
          }]
          break
        }
        case 'last': {
          result = last
          result = [{
            element: result.element,
            time: bus.timeFormate(new Date(result.data[0]), 'yyyy-MM-dd hh:mm:ss'),
            value: result.data[1]
          }]
          break
        }
        case 'range': {
          const sort = copy.sort((x, y) => { return parseFloat(y.data[1]) - parseFloat(x.data[1]) })
          const max = sort[0]
          const min = sort[sort.length - 1]
          result = [{
            element: last.element,
            time: bus.timeFormate(new Date(last.data[0]), 'yyyy-MM-dd hh:mm:ss'),
            value: max.data[1] - min.data[1]
          }]
          break
        }
        case 'different': {
          const first = copy.sort((x, y) => { return parseFloat(y.data[0]) - parseFloat(x.data[0]) })[copy.length - 1]
          result = [{
            element: last.element,
            time: bus.timeFormate(new Date(last.data[0]), 'yyyy-MM-dd hh:mm:ss'),
            value: last.data[1] - first.data[1]
          }]
          break
        }
      }
      return result
    },
    clearChart () {
      if (this.echartModalStore) {
        this.echartModalStore.clear()
      }
      this.chart = {}
      // this.seriesItem = [];
      this.seriesItemScreen = []
      this.searchTime[0] = new Date().setHours(new Date().getHours() - 1)
      this.searchTime[1] = new Date()

      const iframe = document.querySelector('#chartUrlFrame')
      if (iframe) {
        iframe.src = ''
      }
      this.isStackArea = false
      this.serieSingleStat = ''
    },
    // 重新请求数据 刷新操作
    /*
      refreshChart() {
        //this.dropdownMenuShow=false;
        this.clearChart();
        this.$refs['localLoading'+this.chartIndex].startLoading();
        //this.firstShow = false;
        this.$emit('on-refresh-data', this.data.id);
      },
      */
    dateChange (time) {
      const chartType = this.chart.type
      if (chartType === 'table') {
        this.seriesItemScreen = []
        for (let i = 0; i < 8; i++) {
          this.seriesItemScreen.push({ // 表格数据
            // label: '',//label
            // metric: '',//metric列
            element: '',
            time: '', // 采集时间
            value: ''// 数值
          })
        }
        this.tableShow = false
        this.$refs.loadingPreview.startLoading()
        this.getChartData()
      } else if (chartType === 'line' || chartType === 'bar' || chartType === 'stackArea' || chartType === 4 || this.chart.from == 'endpoint') {
        this.echartModalStore.clear()
        if (this.chart.from != this.$CONSTANTS.fromRoute.endpoint) {
          this.showLegend = false
        }
        this.$refs.loadingPreview.startLoading()
        this.getQueryChart()
      } else if (chartType === 'singleStat') {
        this.serieSingleStat = ''
        this.$refs.loadingPreview.startLoading()
        this.getChartData()
      }
    },
    // 查询数据,修改日期查询全屏数据
    getQueryChart (type) {
      let axiosArr = []
      const chartItem = this.chart
      this.$nextTick(() => {
        let startTime = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss')
        let endTime = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss')
        if (!startTime || !endTime) { // 如果时间为空，则默认取最近1小时
          const now = new Date()
          startTime = bus.timeFormate(now, 'yyyy-MM-dd hh:mm:ss')
          endTime = bus.timeFormate(now.setHours(now.getHours() - 1), 'yyyy-MM-dd hh:mm:ss')
          this.searchTime[0] = startTime
          this.searchTime[1] = endTime
        }
        const step = bus.getStep(startTime, endTime)
        axiosArr = this.chart.elements.map((ele) => {
          const filterItem = ele
          const query = encodeURIComponent(filterItem.expression)
          if (chartItem.type === 'table' && chartItem.param && chartItem.param.last == 1) {
            return this.$get('/prom/api/v1/query_range?query=' + query + '&start=' + this.$stringTimeParseToUnix(endTime) + '&end=' + this.$stringTimeParseToUnix(endTime) + '&step=' + step)
          }
          return this.$get('/prom/api/v1/query_range?query=' + query + '&start=' + this.$stringTimeParseToUnix(startTime) + '&end=' + this.$stringTimeParseToUnix(endTime) + '&step=' + step)
        })
        // 一个图表
        axios.all(axiosArr).then(res => {
          if (res.length > 0) {
            const series = []
            const legend = []
            /* const sumData = {
              name: 'sum',
              data: [],
              visible: true,
              threshold: null
            } */
            if (!this.chart.type || this.chart.from == 'endpoint') {
              this.chart.type = 'line'
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
                        symbolSize: [2, 2],
                        smooth: 0.2, // 曲线变平滑
                        showSymbol: false,
                        data: [],
                        type: this.chart.type,
                        lineStyle: {
                          width: 1,
                          opacity: 0.9
                        }
                        // visible: true,
                        // threshold: null,
                      },
                      metric_name: ''
                    }
                    if (this.chart.type === 'stackArea') {
                      seriesItem.theData.type = 'line'
                      seriesItem.theData.stack = this.chart.name
                      seriesItem.theData.areaStyle = { opacity: 0.3 }
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
                      if (host.endsWith(',')) { host = host.substr(0, host.length - 1) }
                      if (queryItem.metric.__name__) {
                        host += '}'
                      }
                      if (!host || host === '') {
                        host = this.chart.elements[pos].expression
                      }
                      let alias = this.dealLegendAlias(host, this.chart.elements[pos].legend)
                      if (!alias || alias === '') {
                        alias = host
                      }
                      legend.push({ name: host + innerPos, alias: alias })
                      // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c
                      seriesItem.theData.name = host + innerPos
                      seriesItem.metric_name = seriesItem.theData.name
                      // 将秒改为毫秒
                      // alert('table=='+JSON.stringify(queryItem))
                      seriesItem.theData.data = queryItem.values.map((dpsItem, dpsIndex) => {
                        return [dpsItem[0] * 1000, dpsItem[1]]
                      })
                      series.push(seriesItem.theData)
                    } else if (this.chart.elements && this.chart.elements[innerPos]) {
                      // 无数据提示
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
            this.initChart(this.chart, series, this.$refs.screenShowArea, legend)
          }
        }).catch(error => {
          if (error) {
            this.$message.error(error.toString())
          }
        })
      })
    },
    dealLegendAlias: function (legend, expression) {
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
    screenPageNo (val) {
      this.screenPageObj.pageNo = val
      this.seriesItemScreen = this.filterShowData(this.storedScreanTableData, this.screenPageObj)
    },
    screenPageSize (val) {
      this.screenPageObj.pageSize = val
      this.seriesItemScreen = this.filterShowData(this.storedScreanTableData, this.screenPageObj)
    },
    handleClose () {
      this.screenModal = false
      this.clearChart()
    },
    findLegendOptions: function () {
      if ((!this.chart.param) || (!this.chart.param.legendValue) || Object.keys(this.chart.param.legendValue) < 1) return false
      const legendOptions = this.chart.param.legendValue
      const onVal = Object.keys(legendOptions).find(item => { return legendOptions[item] == 'on' })

      return onVal
    },
    computeLegendData: function (legend, dataArr) {
      const options = this.screenLegendOptions
      const keys = options.filter(item => { return item.value == 'on' }).map(item => { return item.option })
      const $self = this
      keys.forEach(item => {
        switch (item) {
          case 'min':
            $self.legendMinValue(legend, dataArr)
            break
          case 'max':
            $self.legendMaxValue(legend, dataArr)
            break
          case 'avg':
            $self.legendAvgValue(legend, dataArr)
            break
          case 'last':
            $self.legendLastValue(legend, dataArr)
            break
          case 'total':
            $self.legendTotalValue(legend, dataArr)
            break
        }
      })
    },
    legendMinValue: function (legend, dataArr) {
      return new Promise(resolve => {
        legend.forEach(item => {
          const data = dataArr.find(t => t.name == item.name)
          if (data && data.data) {
            const copy = JSON.parse(JSON.stringify(data.data))
            const min = copy.sort((x, y) => { return parseFloat(x[1]) - parseFloat(y[1]) })[0][1]
            item.min = parseFloat(min)
          }
        })

        resolve()
      })
    },
    legendMaxValue: function (legend, dataArr) {
      return new Promise(resolve => {
        legend.forEach(item => {
          const data = dataArr.find(t => t.name == item.name)
          if (data && data.data) {
            const copy = JSON.parse(JSON.stringify(data.data))
            const max = copy.sort((x, y) => { return parseFloat(y[1]) - parseFloat(x[1]) })[0][1]
            item.max = parseFloat(max)
          }
        })
        resolve()
      })
    },
    legendAvgValue: function (legend, dataArr) {
      return new Promise(resolve => {
        legend.forEach(item => {
          const data = dataArr.find(t => t.name == item.name)
          if (data && data.data) {
            let copy = JSON.parse(JSON.stringify(data.data))
            copy = copy.map(t => parseFloat(t[1]))
            const sum = eval(copy.join('+'))
            const avg = sum / copy.length

            item.avg = avg
          }
        })
        resolve()
      })
    },
    legendLastValue: function (legend, dataArr) {
      return new Promise(resolve => {
        legend.forEach(item => {
          const data = dataArr.find(t => t.name == item.name)
          if (data && data.data) {
            const copy = JSON.parse(JSON.stringify(data.data))
            const last = copy.sort((x, y) => { return parseFloat(y[0]) - parseFloat(x[0]) })[0][1]
            item.last = parseFloat(last)
          }
        })
        resolve()
      })
    },
    legendTotalValue: function (legend, dataArr) {
      return new Promise(resolve => {
        legend.forEach(item => {
          const data = dataArr.find(t => t.name == item.name)
          if (data && data.data) {
            let copy = JSON.parse(JSON.stringify(data.data))
            copy = copy.map(t => parseFloat(t[1]))
            const sum = eval(copy.join('+'))

            item.total = sum
          }
        })
        resolve()
      })
    },
    formatLegendData: function (data) {
      return chartDataFormat.getUnit(this.chart.unit).compute(data, null, 2)
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
    pieFormatterFunc: function (params, ticket, callback) {
      const chartInfo = this.chart
      return `
                <div>
                    <div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;  min-width: 150px; max-width: 600px; line-height: 18px; font-size: 14px;">
                        <div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;margin-bottom: 5px">${this.legend[params.dataIndex].alias}</div>
                        <div style="font-size:12px;display:flex;justify-content: space-between;">
                            <div>value</div>
                            <div>${chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(params.value, null, -1, 2)}</div>
                        </div>
                        <div style="font-size:12px;display:flex;justify-content: space-between;">
                            <div>percent</div>
                            <div>${params.percent}%</div>
                        </div>
                    </div>
                </div>
               `
    },
    barFormatterFunc: function (params, ticket, callback) {
      const chartInfo = this.chart
      return `
                <div>
                    <div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;  min-width: 150px; max-width: 600px; line-height: 18px; font-size: 14px;">
                        <div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;margin-bottom: 5px">${this.legend[params.dataIndex].alias}</div>
                        <div style="font-size:12px;display:flex;justify-content: space-between;">
                            <div>value</div>
                            <div>${chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(params.value[1], null, -1, 2)}</div>
                        </div>
                    </div>
                </div>
               `
    }
  },
  beforeDestroy () {
    this.clearChart()
    if (this.echartModalStore) {
      this.echartModalStore.off('magictypechanged')
    }
  }
}

</script>
