<template>
  <div class="tooltip-box" style="display: flex;" v-if="(isChart||chartData.tooltipShow)&&chartData.expressArr.length">
    <div class="tooltip-box-chart" style="" v-if="isChart||(chartData.displayChart&&chartData.tooltipShow&&chartData.expressArr.length)">
      <line-chart-block v-show="isChart || chartData.type !== 'table'"
                        :key="'inner' + chartData.id"
                        :from="'project'"
                        :ref="chartData.type !== 'table'?'editChart' + chartData.type:'editChart'"
                        :temp-dom="tempDom"
                        :panel-id="-1"
                        :is-lock="true"
                        :chart-index="0"
                        :chartTitleShow="false"
                        :chart-data="chartData">
      </line-chart-block>
      <chart-table  v-show="isChart || chartData.type === 'table'"
                    :key="'inner' + 1"
                    :from="'project'"
                    ref="editCharttable"
                    :is-lock="true"
                    :panel-id="-1"
                    :chart-data="chartData"
                    :chart-index="0"></chart-table>
    </div>
    <div class="tooltip-box-info" v-if="!isChart">
      <expression-info :chart-data="chartData" :filterTime="filterTime"/>
    </div>
  </div>
</template>

<script>
import lineChartBlock from '../../../charts/line-chart-block'
import chartTable from '../../../charts/chart-table'
import bus from '../../../../libs/bus'
import ExpressionInfo from '../popData/expressionInfo'
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
      tempDom: { height: 400, width: '' },
      chartDataTemp: { id: 8832, prev: null, next: null, panelId: 0, title: '123', span: 12, height: 400, createAt: '2021-01-27 07:36:19', unit: 2, weight: 0, pid: null, buildIn: null, seq: null, param: { last: 0, legendValue: { total: 'off', min: 'off', avg: 'off', last: 'off', max: 'off' }, threshold: '', url: '', nullType: 'connected' }, sync: null, asset: null, isLoaded: true, from: '__vue_devtool_undefined__', draggable: true, resizable: true, editable: true },
      chartData: {},
      filter: {
        end_time: bus.timeFormate(bus.getOffsetTimezoneData(), 'yyyy-MM-dd hh:mm:ss'),
        panelId: 0,
        searchName: '',
        start_time: bus.timeFormate(bus.getOffsetTimezoneData(-1), 'yyyy-MM-dd hh:mm:ss')
      }
    }
  },
  mounted () {
    this.tempDomInit()
  },
  methods: {
    tempDomInit () {
      this.tempDom.width = 400
    },
    process (item) {
      const chartData = { ...this.chartDataTemp, ...item }
      chartData.elements = []
      chartData.expressArr.forEach((item1, index) => {
        chartData.elements.push({
          expression: item1,
          legend: chartData.legends[index],
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
        nullType: 'connected',
        threshold: '',
        url: '',
        valueMapping: { mapping: [{ color: { bac: '#fff', text: '#000' }, text: '', value: '' }], type: 'text' },
        statistics: chartData.aggregation
      }
      chartData.span = 12
      this.chartData = chartData
      setTimeout(() => {
        this.getChartData(chartData, 0)
      })
    },
    // 获取一个图表具体数据,图表信息，图表位置index
    getChartData (chartInfo, pos, filterType) {
      const chartItem = chartInfo
      // 没有数据的设置提示信息暂无数据-针对每一个图
      const len = chartItem.elements.length
      if (len === 0) {
        this.$nextTick(() => {
          if (this.$refs['editChart' + chartItem.type]) {
            this.$refs['editChart' + chartItem.type].setData(chartItem, [], this.filter.panelId, this.filter, [])
          }
        })
      } else {
        /* let startTime = ''
        let endTime = '' */
        /* if (filterType === 'refresh') { // 刷新
          const now = new Date(bus.computeTimezone(new Date().getTime()))
          const origin = new Date(this.filter.end_time)
          const numInterval = now.getTime() - origin.getTime()
          if (numInterval >= 60000) { // 大于1分钟，则start、end均往后移numInterval，否则时间不变
            startTime = this.getNewTime(this.filter.start_time, numInterval)
            endTime = bus.timeFormate(now, 'yyyy-MM-dd hh:mm:ss')
          } else {
            startTime = this.filter.start_time
            endTime = this.filter.end_time
          }
        } else if (filterType === 'showFullScreen') { // 全屏时间查询
          startTime = this.filter.start_time
          endTime = this.filter.end_time
          // this.$parent.refreshTime(startTime,endTime);全屏查询，不更新panel列表的时间条件
        } else {
          startTime = this.filter.start_time
          endTime = this.filter.end_time
        } */

        setTimeout(() => {
          this.$nextTick(() => {
            const res = chartItem.res
            if (res.length > 0) {
              const series = []
              const legend = []
              const tableData = []
              /* let sumData = {
                    name: 'sum',
                    data: [],
                    visible: true,
                    threshold: null,
                  }; */
              let errorMsg = ''
              res.forEach((response, innerPos) => {
                if (response.status === 'success') {
                  errorMsg = ''
                  if (response.data.result) {
                    // 循环处理每个elements下获取的数据
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

                      if ((chartInfo.type === 'line' || chartInfo.type === 'stackArea' || chartInfo.type === 'bar') && chartInfo.param && chartInfo.param.threshold) {
                        seriesItem.theData.markLine = {
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
                        let alias = this.$refs['editChart' + chartItem.type].dealLegendAlias(host, chartItem.elements[innerPos].legend)
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
                          const tData = new Date(dpsItem[0] * 1000)
                          const timeTmp = bus.timeFormate(tData, 'yyyy-MM-dd hh:mm:ss')
                          tableData.push({ // 表格数据
                            // label: host.slice(host.indexOf('{') + 1,host.indexOf('}')),//label
                            // metric: queryItem.metric.__name__?queryItem.metric.__name__:'',//metric列
                            element: { element: host, alias: alias },
                            time: timeTmp, // 采集时间
                            value: dpsItem[1], // 数值
                            data: [dpsItem[0] * 1000, dpsItem[1]]
                          })
                          return [dpsItem[0] * 1000, dpsItem[1]]
                        })
                        series.push(seriesItem.theData)
                        seriesItem = null
                      }
                    })
                  }
                } else {
                  if (response.msg) {
                    // this.$message.error(response.msg);
                    errorMsg = response.msg
                  } else if (response.error) {
                    // this.$message.error(response.error);
                    errorMsg = response.error
                  } else {
                    // this.$message.error(response);
                    errorMsg = response
                  }
                }
              })
              if (this.$refs['editChart' + chartItem.type]) {
                /* const chartData = {
                  chartItem: chartItem,
                  series: series,
                  singleStatRlt: singleStatRlt,
                  legend: legend,
                  tableData: tableData,
                  panelId: this.filter.panelId,
                  filter: this.filter,
                  filterType: filterType,
                  errorMsg: errorMsg
                } */
                if (chartItem.type === 'table') { // 表格
                  this.$refs['editChart' + chartItem.type].setData(chartItem, tableData, this.filter.panelId, this.filter, '', errorMsg)
                } else if (chartItem.type === 'line' || chartItem.type === 'bar' || chartItem.type === 'stackArea' || chartItem.type === 4) {
                  if (series.length && chartItem.type === 4) { // 曲线汇总
                    // series.push(sumData);//后续需要
                  }
                  this.$refs['editChart' + chartItem.type].setData(chartItem, series, this.filter.panelId, this.filter, legend, '', errorMsg)
                }
              }
            } else {
              const type = chartItem.type
              if (this.$refs['editChart' + chartItem.type]) {
                if (type === 'table') {
                  this.$refs['editChart' + chartItem.type].setData(chartItem, [], this.filter.panelId,
                    this.filter, filterType)
                } else if (type === 'line' || type === 'bar' || type === 'stackArea' || chartItem.type === 4) {
                  this.$refs['editChart' + chartItem.type].setData(chartItem, [], this.filter.panelId,
                    this.filter, filterType)
                }
              }
            }
          })
        }, 100)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .tooltip-box{
    background: #FFFFFF;
    box-shadow: 1px 2px 8px 0 rgba(0,0,0,0.11);
    border-radius: 4px;
    padding: 10px;
    max-height: 400px;
    min-height: 200px;
    height: 100%;
    .tooltip-box-chart{
      border: 1px solid #E7EAED;
      width: 400px;
      max-height: 400px;
      min-height: 200px;
      height: 100%;
      margin-right: 10px;
    }
    .tooltip-box-info{
      border: 1px solid #E7EAED;
      background: #FFFFFF;
      max-height: 400px;
      min-height: 200px;
      min-width: 186px;
      max-width: 300px;
    }
  }

</style>
