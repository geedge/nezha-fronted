<template>
  <div class="full-width-height">
    <el-table
      id="endpointTable"
      ref="dataTable"
      :data="tableData"
      v-loading="loading"
      :height="'100%'"
      border
      @header-dragend="dragend"
      @selection-change="selectChange"
    >
      <el-table-column
        :resizable="false"
        align="center"
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        prop="element"
        :resizable="true"
        :min-width="1000"
        column-key="element"
        :show-overflow-tooltip="true"
        :label="$t('project.endpoint.element')">
        <template v-slot="scope">
          <el-popover trigger="click" placement="right" v-if="typeof scope.row.metricTip != 'undefined' && scope.row.metricTip != null">
            <div>
              <ul>
                <li><span class="metirc-tip-list">metric&nbsp;:&nbsp;</span><span>{{scope.row.metricTip.metric?scope.row.metricTip.metric:'&#45;&#45;'}}</span></li>
                <li><span class="metirc-tip-list">type&nbsp;:&nbsp;</span><span>{{scope.row.metricTip.type?scope.row.metricTip.type:'unknown'}}</span></li>
                <li><span class="metirc-tip-list">help&nbsp;:&nbsp;</span><span>{{scope.row.metricTip.help?scope.row.metricTip.help:'&#45;&#45;'}}</span></li>
                <li><span class="metirc-tip-list">unit&nbsp;:&nbsp;</span><span>{{scope.row.metricTip.unit?scope.row.metricTip.unit:'&#45;&#45;'}}</span></li>
              </ul>
            </div>
            <span slot="reference"><i class="nz-icon nz-icon-info-normal metric-tip-icon"></i></span>
          </el-popover>
          <span style="word-break: break-all;" v-html="hideSameLabels?scope.row.colorSimpleElement: scope.row.colorElement"></span>
        </template>
      </el-table-column>
      <el-table-column
        :resizable="false"
        prop="value"
        column-key="value"
        :label="$t('project.endpoint.value')"
        min-width="180">
      </el-table-column>
    </el-table>
    <el-dialog class="line-chart-block-modal nz-dialog endpoint-dialog"
               :title="$t('project.endpoint.dialogTitle')"
               :visible.sync="graphShow"
               width="90%"
               height="80%"
               :modal-append-to-body="false"
               id="viewGraphDialog"
               @close="dialogClose">
      <div slot="title">
        {{$t("project.endpoint.dialogTitle")}}
        <div class="float-right panel-calendar dialog-tool" style="display: flex">
          <pick-time :refresh-data-func="queryChartDate" :use-refresh="false" v-model="searchTime" style="height: 28px;" @unitChange="chartUnitChange" id="endpoint-query-full-chart" :show-multiple="true" ref="pickTime"></pick-time>
          <button @click="saveChart" class="nz-btn nz-btn-size-large nz-btn-style-normal-new" v-has="'panel_chart_add'" id="endpoint-query-full-chart-save">{{$t('dashboard.metric.saveChart')}}</button>
        </div>
      </div>
      <chart ref="endpointChart" :unit="chartUnit" :minusTime="minusTime" v-if="graphShow"></chart>
    </el-dialog>
    <transition name="right-box">
      <chart-box :chart="chart" :panel-data="panelData" :show-panel="{id: -1, name: '', type: 'endpointQuery'}" @close="rightBox.show = false" @on-create-success="createSuccess" @reload="getPanelData" @reloadOnlyPanel="getPanelData" box-class="save-chart-box" from="project_endpoint_query" ref="addChartModal" v-if="rightBox.show" style="z-index: 2900" :fromEndpoint="true"></chart-box>
    </transition>
  </div>
</template>

<script>
import chartBox from '@/components/page/dashboard/chartBox'
import axios from 'axios'
import bus from '../../../../libs/bus'
import chart from '@/components/page/dashboard/overview/chart'

export default {
  name: 'endpointTable',
  components: {
    chartBox,
    chart
  },
  props: {
    from: {},
    obj: {},
    formatTime: {},
    hideSameLabels: {},
    queryExpression: {}
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      handler (n) {
        if (n) {
          this.currentEndpoint = JSON.parse(JSON.stringify(n))
          this.queryEndpoint()
        }
      }
    },
    queryExpression (n, o) {
      const temp = this
      setTimeout(function () {
        temp.tableFilter()
      }, 500)
    },
    formatTime (n, o) {
      const temp = this
      setTimeout(function () {
        temp.queryEndpoint()
      }, 100)
    }
  },
  data () {
    return {
      tableData: [],
      batchDeleteObjs: [],
      currentEndpoint: {},
      sameLabels: ['instance', 'module', 'project', 'asset', 'endpoint', 'datacenter'],
      loading: false,
      panelData: {},
      graphShow: false,
      chartUnit: 5,
      rightBox: { show: false },
      minusTime: 0,
      searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()]
    }
  },
  methods: {
    selectChange (selection) { // selection 选中的row的数组
      this.batchDeleteObjs = selection
      this.$emit('changSelection', selection)
    },
    queryEndpoint () {
      this.loading = true
      this.queryElementTips()
      this.queryData = []
      this.tableData = []
      this.tableDataCopy = ''
      setTimeout(() => {
        this.$get("/prom/api/v1/query?query={endpoint='" + this.currentEndpoint.id + "'}&time=" + new Date(this.formatTime).getTime()).then(response => {
          this.loading = false
          response = JSON.parse(localStorage.getItem('queryData'))
          if (response.status === 'success') {
            const results = response.data.result
            this.queryData = JSON.parse(JSON.stringify(results))
            this.tableData = this.handlerTableData(results)
            this.tableDataCopy = JSON.stringify(this.tableData)
            this.$nextTick(this.$refs.dataTable.doLayout())
            if (!this.scrollbarWrap) {
              this.$nextTick(() => {
                this.scrollbarWrap = this.$refs.dataTable.$refs.singleTable.bodyWrapper
                // this.toTopBtnHandler(this.scrollbarWrap)
              })
            }
          }
        })
      }, 450)
    },
    queryElementTips: async function () {
      this.elementMetricDatas = []
      // const response = await axios.get('/metric/metadata?endpointId=' + this.currentEndpoint.id)
      const response = JSON.parse(localStorage.getItem('endpointQueryData'))
      if (response && response.status === 200) {
        if (response.data.msg === 'success') {
          this.elementMetricDatas = response.data.data.list
        }
      }
    },
    getPanelData () { // 获取panel数据
      return new Promise((resolve, reject) => {
        this.$get('visual/panel?pageNo=1&pageSize=-1').then(response => {
          if (response.code === 200) {
            this.panelData = response.data.list
            resolve()
          }
        })
      })
    },
    handlerTableData (results) {
      const tableData = []
      for (const result of results) {
        const metricName = result.metric.__name__
        let temp = metricName
        let simpleTemp = metricName// 显示简略信息：隐藏same labels后的结果
        const metricColor = ''
        const bracketsColor = '#eb7b18'// #eb7b18
        const labelColor = '#65bbd1'// #66d9ef
        const valueColor = '#61c261'// #74e680
        let colorTemp = `<span style="${metricColor}">${metricName}</span>`
        let colorSimpleTemp = `<span>${metricName}</span>`
        let metricTip = {}
        const queryInfos = (this.elementMetricDatas.filter((item) => {
          return item.metric === temp
        }))
        if (queryInfos && queryInfos.length > 0) {
          metricTip = queryInfos[0]
        } else {
          metricTip.metric = temp
        }
        delete result.metric.__name__
        temp += '{'
        simpleTemp += '{'
        colorTemp += `<span style="color: ${bracketsColor}">{</span>`
        colorSimpleTemp += `<span style="color: ${bracketsColor}">{</span>`
        const keys = Object.keys(result.metric)
        for (const index in keys) {
          const key = keys[index]
          temp += key + "='" + result.metric[key] + "',"
          colorTemp += `<span style="color: ${labelColor}">${key}</span>=<span style="color: ${valueColor}">'${result.metric[key]}'</span>,`
          if (!this.sameLabels.some((i) => { return i == key })) {
            simpleTemp += key + "='" + result.metric[key] + "',"
            colorSimpleTemp += `<span style="color: ${labelColor}">${key}</span>=<span style="color: ${valueColor}">'${result.metric[key]}'</span>,`
          }
        }
        if (temp.indexOf(',') !== -1) {
          temp = temp.substr(0, temp.length - 1)
        }
        if (simpleTemp.indexOf(',') !== -1) {
          simpleTemp = simpleTemp.substr(0, simpleTemp.length - 1)
        }
        if (colorTemp.indexOf(',') !== -1) {
          colorTemp = colorTemp.substr(0, colorTemp.length - 1)
        }
        if (colorSimpleTemp.indexOf(',') !== -1) {
          colorSimpleTemp = colorSimpleTemp.substr(0, colorSimpleTemp.length - 1)
        }

        temp += '}'
        simpleTemp += '}'
        colorTemp += `<span style="color: ${bracketsColor}">}</span>`
        colorSimpleTemp += `<span style="color: ${bracketsColor}">}</span>`
        if (!/.+\{.+\}/.test(simpleTemp)) {
          simpleTemp = simpleTemp.substr(0, simpleTemp.length - 2)
        }

        if (!/.+\{<\/span><span.+?>.+?\}/.test(colorSimpleTemp)) {
          const metricReg = new RegExp('<span.*?>' + metricName + '<\/span>')
          colorSimpleTemp = metricReg.exec(colorSimpleTemp)[0]
        }

        const edpQueryData = { element: temp, simpleElement: simpleTemp, colorElement: colorTemp, colorSimpleElement: colorSimpleTemp, value: result.value[1], type: (result.metric.type ? result.metric.type : '2'), metricTip: metricTip }
        // this.tableData.push(edpQueryData);
        tableData.push(edpQueryData)
      }
      this.loading = false
      return tableData
    },
    tableFilter () {
      const temp = this
      const tableDatas = JSON.parse(this.tableDataCopy)
      this.tableData = tableDatas.filter((item) => {
        const element = temp.hideSameLabels ? item.simpleElement : item.element
        return element.indexOf(this.queryExpression) !== -1
      })
    },
    dragend () {
      this.$nextTick(() => {
        console.info(1)
        this.$refs.dataTable.doLayout()
      })
    },
    getTime (size, unit) { // 计算时间
      const now = !this.formatTime ? new Date(bus.computeTimezone(new Date().getTime())) : new Date(this.formatTime)
      if (unit) {
        switch (unit) {
          case 'y':
            now.setFullYear(now.getFullYear() + size)
            break
          case 'M':
            now.setMonth(now.getMonth() + size)
            break
          case 'd':
            now.setDate(now.getDate() + size)
            break
          case 'h':
            now.setHours(now.getHours() + size)
            break
          case 'm':
            now.setMinutes(now.getMinutes() + size)
            break
          case 's':
            now.setSeconds(now.getSeconds() + size)
            break
          default:
            console.error('unit error')
        }
      } else {
        now.setSeconds(now.getSeconds() + size)
      }
      const year = now.getFullYear()
      let month = now.getMonth() + 1
      month = month < 10 ? '0' + month : month
      let day = now.getDate()
      day = day < 10 ? '0' + day : day
      let hour = now.getHours()
      hour = hour < 10 ? '0' + hour : hour
      let minute = now.getMinutes()
      minute = minute < 10 ? '0' + minute : minute
      let second = now.getSeconds()
      second = second < 10 ? '0' + second : second
      return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
    },
    viewGraph () {
      if (this.batchDeleteObjs.length < 1) {
        return
      }
      this.chartDatas = []
      this.legend = []
      this.$refs.pickTime.$refs.multipleTime.searchTime = []
      this.$refs.pickTime.$refs.multipleTime.showTime = {
        id: 12,
        text: this.$t('dashboard.panel.noDate')
      }
      this.$refs.pickTime.$refs.multipleTime.showDropdown = false
      this.graphShow = true
      this.$nextTick(() => {
        this.$refs.endpointChart.startLoading()
        this.queryChartDate()
      })
    },
    chartUnitChange (unit) {
      this.chartUnit = unit
      this.$nextTick(() => {
        this.queryChartDate()
      })
    },
    queryChartDate () {
      const start = this.searchTime[0] ? this.searchTime[0] : this.getTime(-1, 'h')
      const end = this.searchTime[1] ? this.searchTime[1] : this.getTime(0, 'h')
      this.searchTime = [start, end]
      const timeDiff = (new Date(end).getTime() - new Date(start).getTime()) / 1000 / (24 * 60 * 60)
      // end - start < 1 day : 15s
      // end - start < 7 day : 5m
      // end - start < 30 day : 10m
      // end - start > 30 day : 30m
      let step = '15s'
      if (timeDiff < 1) {
        step = '15s'
      } else if (timeDiff < 7) {
        step = '5m'
      } else if (timeDiff < 30) {
        step = '10m'
      } else {
        step = '30m'
      }
      const axiosArr = []
      for (const endpoint of this.batchDeleteObjs) {
        axiosArr.push(axios.get('/prom/api/v1/query_range?query=' + endpoint.element + '&start=' + this.$stringTimeParseToUnix(start) + '&end=' + this.$stringTimeParseToUnix(end) + '&step=' + step))
      }
      if (this.$refs.pickTime && this.$refs.pickTime.$refs.multipleTime && this.$refs.pickTime.$refs.multipleTime.searchTime.length) { // 判断是否需要添加比较
        const startTime = bus.timeFormate(this.$refs.pickTime.$refs.multipleTime.searchTime[0], 'yyyy-MM-dd hh:mm:ss')
        const endTime = bus.timeFormate(this.$refs.pickTime.$refs.multipleTime.searchTime[1], 'yyyy-MM-dd hh:mm:ss')
        for (const endpoint of this.batchDeleteObjs) {
          axiosArr.push(axios.get('/prom/api/v1/query_range?query=' + endpoint.element + '&start=' + this.$stringTimeParseToUnix(startTime) + '&end=' + this.$stringTimeParseToUnix(endTime) + '&step=' + step))
        }
      }
      this.legend = []
      this.chartDatas = []
      axios.all(axiosArr).then(res => {
        res.forEach((response, promIndex) => {
          if (response.status == 200) {
            if (response.data.status == 'success') {
              const queryData = response.data.data.result[0]
              if (queryData) {
                const chartData = {
                  type: 'line',
                  symbol: 'none', // 去掉点
                  smooth: 0.2,
                  lineStyle: {
                    width: 1,
                    opacity: 0.9
                  }
                }
                chartData.name = queryData.metric.__name__
                let alias = queryData.metric.__name__
                delete queryData.metric.__name__
                chartData.name += '{'
                alias += '{'
                Object.keys(queryData.metric).forEach((item, index) => {
                  const label = item
                  const value = queryData.metric[label]
                  chartData.name += label + "='" + value + "',"
                  if (!this.sameLabels.some((i) => { return i == label })) {
                    alias += label + "='" + value + "',"
                  }
                })
                chartData.name = chartData.name.charAt(chartData.name.length - 1) === ',' ? chartData.name.substr(0, chartData.name.length - 1) : chartData.name
                alias = alias.charAt(alias.length - 1) === ',' ? alias.substr(0, alias.length - 1) : alias
                chartData.name += '}'
                alias += '}'
                if (!/.+\{.+\}/.test(alias)) {
                  alias = alias.substr(0, alias.length - 2)
                }
                const legend = {
                  name: chartData.name,
                  alias: alias,
                  // showText:this.formatLegend(chartData.name),
                  isGray: false
                }
                if (promIndex >= this.batchDeleteObjs.length) {
                  legend.name = 'Previous ' + legend.name
                  chartData.name = legend.name
                  legend.alias = 'Previous ' + legend.alias
                }
                this.legend.push(legend)
                chartData.data = queryData.values.map((dpsItem, dpsIndex) => {
                  return [dpsItem[0] * 1000, Number(dpsItem[1])]
                })
                this.chartDatas.push(chartData)
              }
            } else {
              this.$message.error(response.data.error)
              console.error(response.data)
            }
          }
        })

        if (this.$refs.pickTime.$refs.multipleTime && this.$refs.pickTime.$refs.multipleTime.searchTime.length && res.length > this.batchDeleteObjs.length) {
          const minusTime = (new Date(this.searchTime[0]).getTime() - new Date(this.$refs.pickTime.$refs.multipleTime.searchTime[0]).getTime())
          this.minusTime = minusTime
          let cutPoint = 0
          res.forEach((item, index) => {
            if (index < res.length / 2) {
              cutPoint += res[index].data.data.result.length
            }
          })
          this.chartDatas.forEach((item, index) => {
            if (index >= cutPoint) {
              this.chartDatas[index].data.forEach((item1, index1) => {
                item1[0] = item1[0] + minusTime
              })
            }
          })
        }
        this.$nextTick(() => {
          if (this.$refs.endpointChart) {
            this.$refs.endpointChart.setRandomColors(this.chartDatas.length)
            this.$refs.endpointChart.setLegend(this.legend)
            this.$refs.endpointChart.modifyOption('tooltip', 'backgroundColor', 'rgba(221,228,237,1)')
            this.$refs.endpointChart.modifyOption('tooltip', 'textStyle', { color: '#000' })
            this.$refs.endpointChart.modifyOption('grid', 'top', 30)
            this.$refs.endpointChart.modifyOption('grid', 'left', 0)
            this.$refs.endpointChart.modifyOption('grid', 'right', 30)
            this.$refs.endpointChart.modifyOption('grid', 'bottom', 8)
            this.$refs.endpointChart.modifyOption('grid', 'containLabel', true)
            this.$refs.endpointChart.setSeries(this.chartDatas)
            this.$refs.endpointChart.endLoading()
          }
          setTimeout(() => {
            this.$refs.endpointChart.resize()
          }, 100)
        })
      })
    },
    dialogClose () {
      this.$refs.pickTime.$refs.multipleTime.searchTime = []
      this.$refs.pickTime.$refs.multipleTime.showTime = {
        id: 12,
        text: this.$t('dashboard.panel.noDate')
      }
      this.$refs.pickTime.$refs.multipleTime.showDropdown = false
      this.chartUnit = 5
      this.graphShow = false
    },
    saveChart () { // 新增chart
      this.getPanelData().then(() => {
        const chart = {
          title: '',
          type: 'line',
          span: 12,
          height: '400',
          unit: this.chartUnit,
          param: {
            url: '',
            threshold: ''
          },
          elements: [],
          panel: '',
          sync: 0
        }
        for (let i = 0; i < this.batchDeleteObjs.length; i++) {
          if (this.batchDeleteObjs[i] && this.batchDeleteObjs[i].element !== '') {
            chart.elements.push({ chartId: '', expression: this.batchDeleteObjs[i].element, type: 'expert' })
          }
        }
        this.chart = chart
        this.rightBox.show = true
      })
    },
    createSuccess (type, response, param, panel) {
      this.$confirm(this.$t('dashboard.metric.goPanelTip'), this.$t('tip.saveSuccess'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'success'
      }).then(() => {
        bus.$emit('menu-change', 'panel')
        this.$store.state.showPanel.id = panel.id
        this.$store.state.showPanel.name = panel.name
        this.$router.push({
          path: '/panel',
          query: {
            t: +new Date()
          }
        })
      })
    }
  },
  computed: {
  },
  created () {
    // this.getPanelData()
  }
}
</script>
<style scoped>
  .full-width-height{
    width: 100%;
    height: 100%;
  }
  /deep/  .el-dialog__body{
    height: calc(100% - 48px)!important;
    padding-bottom: 0!important;
    width: calc(100% - 40px)!important;
  }
</style>
