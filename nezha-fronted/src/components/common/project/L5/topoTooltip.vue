<template>
  <div class="tooltip-box" style="display: flex;" v-if="(isChart||chartData.tooltipShow)&&chartData.expressAllArr&&chartData.expressAllArr.length">
    <div class="tooltip-box-chart" style="" v-if="isChart||(chartData.displayChart&&chartData.tooltipShow&&chartData.expressAllArr&&chartData.expressAllArr.length)">
        <line-chart-block v-show="isChart || chartData.type !== 'table'"
                          :key="'inner' + chartData.id"
                          :class="isPanel? 'topology-tool-tip line-chart' : 'line-chart'"
                          id="listContainer"
                          :from="'topology'"
                          :ref="chartData.type !== 'table'?'editChart' + chartData.type:'editChart'"
                          :temp-dom="tempDom"
                          :panel-id="-1"
                          :is-lock="true"
                          :chart-index="-2"
                          :fromTopo="true"
                          :chartTitleShow="false"
                          :chart-data="chartData">
        </line-chart-block>
      <div v-if="chartData.remark" class="chart-remark">{{chartData.remark}}</div>
      <chart-table  v-show="isChart || chartData.type === 'table'"
                    :key="'inner' + 1"
                    :from="'project'"
                    ref="editCharttable"
                    :is-lock="true"
                    :panel-id="-1"
                    :chart-data="chartData"
                    :chart-index="0"></chart-table>
    </div>
<!--    <div class="tooltip-box-info" v-if="!isChart">-->
<!--      <expression-info :chart-data="chartData" :filterTime="filterTime"/>-->
<!--    </div>-->
  </div>
</template>

<script>
import lineChartBlock from '@/components/chart/chart/line-chart-block'
import chartTable from '@/components/chart/chart/chart-table'
import bus from '../../../../libs/bus'
import ExpressionInfo from '../popData/expressionInfo'
import { fromRoute } from '@/components/common/js/constants'
import chartTempData from '@/components/chart/chartTempData'
import axios from 'axios'
import chartDataFormat from '@/components/chart/chartDataFormat'
import { dealLegendAlias } from '@/components/common/js/tools'
export default {
  name: 'topoTooltip',
  components: {
    ExpressionInfo,
    lineChartBlock,
    chartTable
  },
  props: {
    chartDataParent: {
      type: Object
    },
    filterTime: {},
    isChart: {
      type: Boolean,
      default: false
    },
    isPanel: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    chartDataParent: {
      immediate: true,
      handler (n) {
        this.process(n)
      }

    }
  },
  data () {
    return {
      tempDom: { height: 250, width: '' },
      chartDataTemp: { id: 8832, prev: null, next: null, dashboardId: 0, title: '123', span: 12, height: 0, createAt: '2021-01-27 07:36:19', unit: 2, weight: 0, pid: null, buildIn: null, seq: null, param: { last: 0, legendValue: { total: 'off', min: 'off', avg: 'off', last: 'off', max: 'off' }, threshold: '', url: '', nullType: 'null' }, sync: null, asset: null, isLoaded: true, from: '__vue_devtool_undefined__', draggable: true, resizable: true, editable: true },
      chartData: {},
      filter: {
        end_time: bus.timeFormate(bus.getOffsetTimezoneData(), 'YYYY-MM-DD HH:mm:ss'),
        dashboardId: 0,
        searchName: '',
        start_time: bus.timeFormate(bus.getOffsetTimezoneData(-1), 'YYYY-MM-DD HH:mm:ss')
      }
    }
  },
  mounted () {
    this.tempDomInit()
  },
  methods: {
    tempDomInit () {
      this.tempDom.width = 250
    },
    process (item) {
      const chartData = { ...this.chartDataTemp, ...item, name: item.chartTitle }
      chartData.elements = []
      chartData.expressAllArr && chartData.expressAllArr.forEach((item1, index) => {
        chartData.elements.push({
          expression: item1,
          legend: chartData.legendsAll[index],
          type: 'expert',
          id: index,
          buildIn: null,
          seq: null
        })
      })
      chartData.id = 0
      chartData.param = {
        legendValue: { total: 'off', min: 'off', avg: 'off', last: 'off', max: 'off' },
        last: 0,
        nullType: 'null',
        threshold: '',
        url: '',
        valueMapping: { mapping: [{ color: { bac: '#fff', text: '#000' }, text: '', value: '' }], type: 'text' },
        statistics: chartData.aggregation
      }
      chartData.span = 12
      this.chartData = chartData
      this.getChartData(chartData, 0)
    },
    // 获取一个图表具体数据,图表信息，图表位置index
    getChartData (chartInfo, pos, filterType) {
      const chartItem = chartInfo
      // 没有数据的设置提示信息暂无数据-针对每一个图
      const len = chartItem.elements.length
      if (len === 0) {
        this.$nextTick(() => {
          if (this.$refs['editChart' + chartItem.type]) {
            this.$refs['editChart' + chartItem.type].setData(chartItem, [], this.filter.dashboardId, this.filter, [])
          }
        })
      } else {
        const dashboardTime = localStorage.getItem('dashboardTime') ? JSON.parse(localStorage.getItem('dashboardTime')) : ['', '']
        const endTime = dashboardTime[1] || bus.timeFormate(bus.getOffsetTimezoneData(), 'YYYY-MM-DD HH:mm:ss')
        const startTime = dashboardTime[0] || bus.timeFormate(bus.getOffsetTimezoneData(-1), 'YYYY-MM-DD HH:mm:ss')
        const step = bus.getStep(startTime, endTime)
        this.$nextTick(() => {
          const axiosArr = chartItem.elements.map((ele) => {
            const filterItem = ele
            let query = encodeURIComponent(filterItem.expression)
            if ((chartInfo.type === 'line' || chartInfo.type === 'bar' || chartInfo.type === 'stackArea' || chartInfo.type === 'table') && chartInfo.param) { // 如果是这三个 默认给null
              chartInfo.param.nullType = chartInfo.param.nullType || 'null'
              query += '&nullType=' + chartInfo.param.nullType
            }
            // if(chartInfo.type === 'table'&&chartInfo.param&&chartInfo.param.last == 1){
            //   return this.$get('/prom/api/v1/query_range?query=' + query + "&start=" + this.$stringTimeParseToUnix(endTime) + "&end=" + this.$stringTimeParseToUnix(endTime) + '&step=' + step);
            // }
            if (this.from === fromRoute.chartTemp) {
              return chartTempData
            }
            return this.$get('/prom/api/v1/query_range?query=' + query + '&start=' + this.$stringTimeParseToUnix(startTime) + '&end=' + this.$stringTimeParseToUnix(endTime) + '&step=' + step)
          })
          // 一个图表的所有element单独获取数据
          axios.all(axiosArr).then((res) => {
            if (res.length > 0) {
              const series = []
              let singleStatRlt = ''
              const legend = []
              const tableData = []
              /* let sumData = {
                  name: 'sum',
                  data: [],
                  visible: true,
                  threshold: null,
                }; */
              let errorMsg = ''
              let pieSeries
              if (chartInfo.type === 'pie') {
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
              if (chartInfo.type === 'bar' && chartInfo.param.statistics && chartInfo.param.statistics !== 'null') {
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
                  errorMsg = ''
                  if (response.data.result) {
                    // 循环处理每个elements下获取的数据列
                    if (chartItem.type === 'singleStat') {
                      if (response.data.result.length === 1) {
                        const statistics = chartItem.param.statistics || 'null'
                        if (response.data.result[0].values) {
                          singleStatRlt = bus.getSingleStatRlt(statistics, response.data.result[0].values)
                        }
                      } else if (response.data.result.length > 1) {
                        singleStatRlt = this.$t('dashboard.panel.singleStatErrorTip')
                      }
                    } else {
                      response.data.result.forEach((queryItem, resIndex) => {
                        let seriesItem = {
                          theData: {
                            name: '',
                            symbol: 'emptyCircle', // 去掉点
                            symbolSize: [2, 2],
                            smooth: 0.2, // 曲线变平滑
                            showSymbol: false,
                            data: [],
                            lineStyle: {
                              width: 1,
                              opacity: 0.9
                            },
                            animation: false,
                            type: chartInfo.type
                          },
                          metric_name: ''
                        }

                        if (chartInfo.type === 'stackArea') {
                          seriesItem.theData.type = 'line'
                          seriesItem.theData.stack = chartInfo.name
                          seriesItem.theData.areaStyle = { opacity: 0.3 }
                        }
                        if ((chartInfo.type === 'line' || chartInfo.type === 'stackArea' || chartInfo.type === 'bar') && chartInfo.param && chartInfo.param.threshold) {
                          seriesItem.theData.markLine = {
                            silent: true,
                            symbol: ['circle', 'circle'],
                            label: {
                              distance: this.computeDistance(chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(chartInfo.param.threshold)),
                              formatter (params) {
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
                        // 图表中每条线的名字,后半部分
                        let host = ''// up,
                        if (queryItem.metric.__name__) {
                          host = `${queryItem.metric.__name__}{`// up,
                        }
                        const tagsArr = Object.keys(queryItem.metric)// ["__name__","asset","idc","instance","job","module","project"]
                        // 设置时间-数据格式对
                        let tempArr = []
                        let dpsArr = []
                        tempArr = queryItem.values
                        dpsArr = Object.entries(queryItem.values)// [ ["0",[1577959830.781,"0"]], ["1",[1577959845.781,"0"]] ]
                        dpsArr = dpsArr.map(item => {
                          return [item[0], [item[1][0], Number(item[1][1])]]
                        })
                        // 判断是否有数据, && tagsArr.length > 0
                        if (dpsArr.length > 0 && this.$refs['editChart' + chartItem.type]) {
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
                          let alias = dealLegendAlias(host, chartItem.elements[innerPos].legend)
                          if (!alias || alias === '') {
                            alias = host
                          }
                          legend.push({ name: host + '-' + chartItem.elements[innerPos].id + '-' + resIndex, alias: alias })
                          // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c

                          seriesItem.theData.name = host + '-' + chartItem.elements[innerPos].id + '-' + resIndex
                          // alert(seriesItem.theData.name);
                          seriesItem.metric_name = seriesItem.theData.name
                          // 将秒改为毫秒
                          // alert('table=='+JSON.stringify(queryItem))
                          seriesItem.theData.data = tempArr.map((dpsItem, dpsIndex) => {
                            /* 曲线汇总暂不需要
                              if (sumData.data[dpsIndex]) {
                                const sumNum = sumData.data[dpsIndex][1] || 0;
                                sumData.data[dpsIndex][1] = sumNum + dpsItem[1];
                              } else {
                                sumData.data[dpsIndex] = [dpsItem[0] * 1000, dpsItem[1]];
                              }
                              */
                            // let t_date = new Date(dpsItem[0] * 1000);
                            // let timeTmp = bus.timeFormate(t_date, 'YYYY-MM-DD HH:mm:ss');
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
                          if (chartInfo.type === 'pie') {
                            pieSeries.data.push({ value: bus.getSingleStatRlt(chartInfo.param.statistics, seriesItem.theData.data), name: host + '-' + chartItem.elements[innerPos].id + '-' + resIndex })
                          } else if (chartInfo.type === 'bar' && chartInfo.param.statistics && chartInfo.param.statistics !== 'null') {
                            pieSeries.data.push({ value: bus.getSingleStatRlt(chartInfo.param.statistics, seriesItem.theData.data), name: host + '-' + chartItem.elements[innerPos].id + '-' + resIndex })
                          } else {
                            series.push(seriesItem.theData)
                            seriesItem = null
                          }
                        }
                      })
                    }
                  }
                } else {
                  if (response.msg) {
                    errorMsg = response.msg
                  } else if (response.error) {
                    errorMsg = response.error
                  } else {
                    errorMsg = response
                  }
                }
              })
              if (this.$refs['editChart' + chartItem.type]) {
                if (chartInfo.type === 'pie') {
                  series.push(pieSeries)
                }
                if (chartInfo.type === 'bar' && chartInfo.param.statistics && chartInfo.param.statistics !== 'null') {
                  series.push(pieSeries)
                }
                const chartData = {
                  chartItem: chartItem,
                  series: series,
                  singleStatRlt: singleStatRlt,
                  legend: legend,
                  tableData: tableData,
                  dashboardId: this.filter.dashboardId,
                  filter: this.filter,
                  filterType: filterType,
                  errorMsg: errorMsg
                }
                if (chartItem.type === 'table') { // 表格
                  if (filterType === 'showFullScreen') { // 全屏查询
                    this.$refs['editChart' + chartItem.type].setData(chartItem, tableData,
                      this.filter.dashboardId, this.filter, filterType, errorMsg)
                  } else {
                    this.$refs['editChart' + chartItem.type].setData(chartItem, tableData,
                      this.filter.dashboardId, this.filter, '', errorMsg)
                  }
                } else if (chartItem.type === 'line' || chartItem.type === 'bar' || chartItem.type === 'stackArea' || chartItem.type === 4 || chartItem.type == 'pie') {
                  if (series.length && chartItem.type === 4) { // 曲线汇总
                    // series.push(sumData);//后续需要
                  }
                  if (filterType === 'showFullScreen') { // 全屏查询
                    this.$refs['editChart' + chartItem.type].setData(chartItem, series,
                      this.filter.dashboardId, this.filter, legend, filterType, errorMsg)
                  } else {
                    this.$refs['editChart' + chartItem.type].setData(chartItem, series,
                      this.filter.dashboardId, this.filter, legend, '', errorMsg)
                  }
                } else if (chartItem.type === 'singleStat') {
                  if (filterType === 'showFullScreen') { // 全屏查询
                    this.$refs['editChart' + chartItem.type].setData(chartItem, singleStatRlt,
                      this.filter.dashboardId, this.filter, filterType, errorMsg)
                  } else {
                    this.$refs['editChart' + chartItem.type].setData(chartItem, singleStatRlt,
                      this.filter.dashboardId, this.filter, '', errorMsg)
                  }
                }
              }
            } else {
              const type = chartItem.type
              if (this.$refs['editChart' + chartItem.type]) {
                if (type === 'table') {
                  if (filterType === 'showFullScreen') { // table的全屏查询
                    this.$refs['editChart' + chartItem.type].setData(chartItem, [], this.filter.dashboardId,
                      this.filter, filterType)
                  } else {
                    this.$refs['editChart' + chartItem.type].setData(chartItem, [], this.filter.dashboardId,
                      this.filter)
                  }
                } else if (type === 'line' || type === 'bar' || type === 'stackArea' || chartItem.type === 4 || chartItem.type === 'pie') {
                  if (filterType === 'showFullScreen') { // table的全屏查询
                    this.$refs['editChart' + chartItem.type].setData(chartItem, [], this.filter.dashboardId,
                      this.filter, filterType)
                  } else {
                    this.$refs['editChart' + chartItem.type].setData(chartItem, [], this.filter.dashboardId,
                      this.filter)
                  }
                } else if (chartItem.type === 'singleStat') {
                  if (filterType === 'showFullScreen') { // 全屏查询
                    this.$refs['editChart' + chartItem.type].setData(chartItem, '',
                      this.filter.dashboardId, this.filter, filterType)
                  } else {
                    this.$refs['editChart' + chartItem.type].setData(chartItem, '',
                      this.filter.dashboardId, this.filter)
                  }
                }
              }
            }
          }).catch((error) => {
            if (error) {
              this.$message.error(error.toString())
              console.error(error)
            }
          })
        })
      }
    }
  }
}
</script>
