<style scope>
.plTableBox.nz-table /deep/  .el-table{
  display: block !important;
}
.project-calendar{
  margin-top: 2px;
}
.control-icon-unchecked {
  color: #999999;
  cursor: not-allowed;
}
</style>
<style>
  .endpoint-dialog .el-dialog__body{
    height: calc(100% - 48px) !important;
    padding-bottom: 0 !important;
  }
</style>
<template>
  <span style="z-index: 1999;position: relative">
    <div class="sub-top-tools">
      <div class="sub-list-tabs">
        <div class="sub-list-tab-title">{{$t("project.endpoint.endpointId")}}: {{currentEndpoint ? currentEndpoint.id : ''}}</div><div
        class="sub-list-tab" @click="changeTab('panel')" id="endpoint-query-changepanel">{{$t("overall.detail")}}</div>
        <div class="sub-list-tab" @click="changeTab('alertMessage')" id="endpoint-query-alertMessage">{{$t("alert.alertMessage")}}</div>
        <div class="sub-list-tab sub-list-tab-active">{{$t("overall.query")}}</div>
      </div>
      <div class="top-tool-right">
        <div class="top-tool-search margin-r-20">
          <el-input ref="elementQuery" @clear="clearInput" id="elementQuery" @focus="focusInput"  @blur="blurInput" v-model="queryExpression" class="query-input-inactive" size="mini" clearable  :placeholder="$t('project.endpoint.promExpr')" >
            <i slot="suffix" class="el-input__icon nz-icon nz-icon-search" style="float:right" @click="focusInput"></i>
          </el-input>
        </div>
        <div class="margin-r-20 nz-btn-group nz-btn-group-size-small nz-btn-group-light">
          <button @click="changeTime(-10)" class="nz-btn nz-btn-size-normal nz-btn-style-light change-time-height nz-input-group-prepend" id="endpoint-query-changetime" :title="$t('overall.decreaseTime')"><i class="el-icon-d-arrow-left"></i></button>
          <my-date-picker
            v-model="formatTime"
            type="datetime"
            size="mini"
            class="project-calendar nz-input-group-middle"
            clearable
            :time-arrow-control="true"
            placeholder="Moment"
            :value-format="timeFormatStrToDatePickFormat(timeFormatMain)"
            :format="timeFormatStrToDatePickFormat(timeFormatMain)"
            @change="pickTime"
        >
          </my-date-picker>
          <button @click="changeTime(10)" class="nz-btn nz-btn-size-normal nz-btn-style-light change-time-height nz-input-group-append" :title="$t('overall.increaseTime')"><i class="el-icon-d-arrow-right"></i></button>
        </div>
        <div class="nz-btn-group nz-btn-group-size-normal nz-btn-group-light" style="height: 24px;">
          <button class="nz-btn nz-btn-size-normal nz-btn-style-light" @click="viewGraph" :title="$t('overall.showLineChart')">
            <i class="nz-icon nz-icon-chart"  :class="{'control-icon-unchecked':selectedEndpoints.length<1,'control-icon-checked':selectedEndpoints.length>0}"></i>
          </button><button @mouseenter="dropdownHandler(true)" @mouseleave="dropdownHandler(false)" class="nz-btn nz-btn-size-normal nz-btn-style-light export-dropdown-btn" id="browser-go">
            <i class="nz-icon nz-icon-arrow-down"></i>
            <transition name="el-zoom-in-top">
              <div v-if="dropdownShow" class="endpoint-query-dropdown el-popover">
                <span style="padding-top: 2px">{{$t('project.endpoint.hideSameLabels')}}</span>
                <el-switch v-model="hideSameLabels" size="small"></el-switch>
              </div>
            </transition>
          </button>
        </div>
      </div>
    </div>
    <div class="table-header-inner" @click="clearSelectedMetrics"><span><i style="font-size: 12px;margin-left: 2px;" class="nz-icon nz-icon-close " :class="{'control-icon-unchecked':selectedEndpoints.length<1,'control-icon-checked':selectedEndpoints.length>0}" :title="$t('overall.close')"></i></span></div>
     <pl-table :row-height="28" use-virtual :datas="tableData" border :empty-text="$t('overall.noData')" :header-cell-class-name="cellClass" :style="{height: $tableHeight.noPagination}"
               :pagination-show="false" class="nz-table endpoint-query-table" ref="endpointQueryTable" style="width: 100%;" v-my-loading="loading"
               v-if="tableShow && plTableSHow" id="endpoint-list-table" :tooltip-effect="'light'" @selection-change="selectChange">
      <pl-table-column
        type="selection"
        width="39"
        align="center"
        column-key="sel"
        :selectable="selectable">
      </pl-table-column>
      <pl-table-column
        prop="element"
        :resizable="true"
        :min-width="1000"
        column-key="element"
        :show-overflow-tooltip="true"
        :label="$t('dashboard.panel.chartForm.element')">
        <template v-slot="scope">
          <el-popover trigger="hover" placement="right" v-if="typeof scope.row.metricTip != 'undefined' && scope.row.metricTip != null">
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
      </pl-table-column>
      <pl-table-column
        :resizable="false"
        prop="value"
        column-key="value"
        :label="$t('overall.value')"
        min-width="180">
      </pl-table-column>
    </pl-table>
    <button :class="{'to-top-is-hover': tools.tableHover}" @click="toTop(scrollbarWrap)" class="to-top" v-show="tools.showTopBtn" id="endpoint-list-totop" :title="$t('overall.backToTop')"><i class="nz-icon nz-icon-top"></i></button>

    <el-dialog
      class="line-chart-block-modal nz-dialog endpoint-dialog"
      :title="$t('project.endpoint.dialogTitle')"
      :visible.sync="graphShow"
      width="90%"
      :modal-append-to-body="false"
      @close="dialogClose">
      <div slot="title">
        {{$t("project.endpoint.dialogTitle")}}
        <div class="float-right panel-calendar dialog-tool" style="display: flex">
          <pick-time :refresh-data-func="queryChartDate" :use-refresh="false" v-model="searchTime" style="height: 28px;" @unitChange="chartUnitChange" id="endpoint-query-full-chart" :show-multiple="true" ref="pickTime"></pick-time>
          <button id="endpoint-query-full-chart-save" v-has="'project_endpoint_query_chart_toAdd'" class="nz-btn nz-btn-size-large nz-btn-style-normal" @click="saveChart">{{$t('dashboard.metric.saveChart')}}</button>
        </div>
      </div>
      <chart ref="endpointChart" :unit="chartUnit" :minusTime="minusTime"></chart>
    </el-dialog>
    <transition name="right-box">
      <chart-box :chart="chart" :panel-data="panelData" :show-panel="{id: -1, name: '', type: 'endpointQuery'}" @close="rightBox.show = false" @on-create-success="createSuccess" @reload="getPanelData" @reloadOnlyPanel="getPanelData" box-class="save-chart-box" from="project_endpoint_query" ref="addChartModal" v-if="rightBox.show" style="z-index: 2900" :fromEndpoint="true"></chart-box>
    </transition>
  </span>
</template>

<script>
import chartBox from '../../../page/dashboard/chartBox'
import axios from 'axios'
import bus from '../../../../libs/bus'
import chart from '../../../page/dashboard/overview/chart'

let timeout
let internal
export default {
  name: 'endpointQueryTab',
  components: {
    'chart-box': chartBox,
    chart: chart
  },
  props: {
    obj: Object, // 关联的实体对象
    from: String
  },
  data () {
    return {
      chart: {},
      tableShow: true,
      dropdownShow: false,
      loading: false,
      tools: {
        showTopBtn: false, // 主列表top按钮
        tableHover: false
      },
      currentEndpoint: {},
      queryData: [], // endpoint 查询列表数据
      tableData: [],
      tableDataCopy: '',
      queryExpression: '',
      elementMetricDatas: [], // element 列提示信息列表
      formatTime: '', // 查询endpoint的时间，
      selectedEndpoints: [], // 选中的metric{label='value'}
      chartDatas: [], // 从query_range查询到的数据
      legend: [], // echart legend
      graphShow: false,
      searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()],
      panelData: [], // chart-box的panel下拉框数据,
      hideSameLabels: true,
      sameLabels: ['instance', 'module', 'project', 'asset', 'endpoint', 'datacenter'],
      chartUnit: 5,
      rightBox: { show: false },
      plTableSHow: true,
      scrollTop: 0,
      scrollbarWrap: null,
      minusTime: 0
    }
  },
  methods: {
    changeTab (tab) {
      this.$emit('changeTab', tab)
    },
    saveChart () { // 新增chart
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
      for (let i = 0; i < this.selectedEndpoints.length; i++) {
        if (this.selectedEndpoints[i] && this.selectedEndpoints[i].element !== '') {
          chart.elements.push({ chartId: '', expression: this.selectedEndpoints[i].element, type: 'expert' })
        }
      }
      this.chart = chart
      this.rightBox.show = true
    },
    dropdownHandler (show) {
      if (show) {
        clearTimeout(timeout)
        this.dropdownShow = true
      } else {
        timeout = setTimeout(() => {
          this.dropdownShow = false
        }, 700)
      }
    },
    createSuccess (type, response, param, panel) {
      this.$confirm(this.$t('dashboard.metric.goDashboardTip'), this.$t('tip.saveSuccess'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'success'
      }).then(() => {
        bus.$emit('menu-change', 'panel')
        this.$store.state.showPanel.id = panel.id
        this.$store.state.showPanel.name = panel.name
        this.$router.push({
          path: '/dashboard',
          query: {
            t: +new Date()
          }
        })
      })
    },
    tableReload () {
      const table = this.$refs.endpointQueryTable
      internal = setInterval(() => {
        if (!window.resizing) {
          table.setHeight()
          clearInterval(internal)
        }
      }, 200)
    },
    queryEndpoint () {
      this.loading = true
      this.queryElementTips()
      this.queryData = []
      this.tableData = []
      this.tableDataCopy = ''
      setTimeout(() => {
        this.$get('/prom/api/v1/query?query=' + encodeURIComponent("{endpoint_id='" + this.currentEndpoint.id + "'}") + '&time=' + this.formatTime).then(response => {
          this.loading = false
          if (response.status === 'success') {
            const results = response.data.result
            this.queryData = JSON.parse(JSON.stringify(results))
            this.tableData = this.handlerTableData(results)
            this.tableDataCopy = JSON.stringify(this.tableData)
            this.$nextTick(this.$refs.endpointQueryTable.doLayout())
            if (!this.scrollbarWrap) {
              this.$nextTick(() => {
                this.scrollbarWrap = this.$refs.endpointQueryTable.$refs.singleTable.bodyWrapper
                this.toTopBtnHandler(this.scrollbarWrap)
              })
            }
          }
        })
      }, 450)
    },
    clearSelectedMetrics () {
      this.$refs.endpointQueryTable.clearSelection()
    },
    changeTime (size, unit) {
      this.formatTime = this.getTime(size, unit)
      this.showEndpoint()
    },
    pickTime () {
      this.showEndpoint()
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
      return tableData
    },
    selectChange (selection) { // selection 选中的row的数组
      this.selectedEndpoints = selection
    },
    selectable (row, index) {
      if (this.selectedEndpoints.length >= 20 && !this.selectedEndpoints.includes(row)) {
        return false
      } else {
        return true
      }
    },
    viewGraph () {
      if (this.selectedEndpoints.length < 1) {
        return
      }

      this.chartDatas = []
      this.legend = []
      this.graphShow = true
      this.$refs.pickTime.$refs.multipleTime.searchTime = []
      this.$refs.pickTime.$refs.multipleTime.showTime = {
        id: 12,
        text: this.$t('dashboard.panel.noDate')
      }
      this.$refs.pickTime.$refs.multipleTime.showDropdown = false
      this.$nextTick(() => {
        this.$refs.endpointChart.startLoading()
        this.queryChartDate()
      })
    },
    dialogClose () {
      this.$refs.pickTime.$refs.multipleTime.searchTime = []
      this.$refs.pickTime.$refs.multipleTime.showTime = {
        id: 12,
        text: this.$t('dashboard.panel.noDate')
      }
      this.$refs.pickTime.$refs.multipleTime.showDropdown = false
      this.graphShow = false
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
      for (const endpoint of this.selectedEndpoints) {
        axiosArr.push(axios.get('/prom/api/v1/query_range?query=' + encodeURIComponent(endpoint.element) + '&start=' + this.$stringTimeParseToUnix(start) + '&end=' + this.$stringTimeParseToUnix(end) + '&step=' + step))
      }
      if (this.$refs.pickTime && this.$refs.pickTime.$refs.multipleTime && this.$refs.pickTime.$refs.multipleTime.searchTime.length) { // 判断是否需要添加比较
        const startTime = bus.timeFormate(this.$refs.pickTime.$refs.multipleTime.searchTime[0], 'YYYY-MM-DD HH:mm:ss')
        const endTime = bus.timeFormate(this.$refs.pickTime.$refs.multipleTime.searchTime[1], 'YYYY-MM-DD HH:mm:ss')
        for (const endpoint of this.selectedEndpoints) {
          axiosArr.push(axios.get('/prom/api/v1/query_range?query=' + encodeURIComponent(endpoint.element) + '&start=' + this.$stringTimeParseToUnix(startTime) + '&end=' + this.$stringTimeParseToUnix(endTime) + '&step=' + step))
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
                if (promIndex >= this.selectedEndpoints.length) {
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

        if (this.$refs.pickTime.$refs.multipleTime && this.$refs.pickTime.$refs.multipleTime.searchTime.length && res.length > this.selectedEndpoints.length) {
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
        })
      })
    },
    cellClass (row) { // 给复选框那一列添加 类名为 ‘disabledCheck’
      if (row.columnIndex === 0) {
        return 'disabledCheck'
      }
    },
    getPanelData () { // 获取panel数据
      this.$get('panel?pageNo=1&pageSize=-1').then(response => {
        if (response.code === 200) {
          this.panelData = response.data.list
        }
      })
    },
    tableFilter () {
      const temp = this
      const tableDatas = JSON.parse(this.tableDataCopy)
      this.tableData = tableDatas.filter((item) => {
        const element = temp.hideSameLabels ? item.simpleElement : item.element
        return element.indexOf(this.queryExpression) !== -1
      })
    },
    tableFilterHistory (expression) {
      let metric = ''
      let labels = []
      if (/\w*\{.*\}.*/i.test(expression)) {
        metric = expression.substr(0, expression.indexOf('{'))
        const labelStr = expression.substr(expression.indexOf('{') + 1, expression.indexOf('}') - expression.indexOf('{') - 1)
        const labelArr = labelStr.split(',')

        if (labelArr.length > 0) {
          labels = labelArr.map((item, index) => {
            const temp = item.split('=')
            const label = temp[0] ? temp[0] : null
            const value = temp[1] ? temp[1] : null
            return label ? { label: label, value: value } : null
          })
        }
      } else {
        metric = expression
      }
      this.tableData = []
      let sourceData = JSON.parse(JSON.stringify(this.queryData))
      sourceData = sourceData.filter((item) => {
        const metricName = item.metric.__name__
        if (metricName.indexOf(metric) === -1) {
          return false
        }

        if (labels.length > 0) {
          for (const i in labels) {
            const label = labels[i]
            if (label && label.label) {
              const value = item.metric[label.label]
              let queryVal = label.value
              if (/^'.+'$/.test(queryVal)) {
                queryVal = queryVal.substr(1, queryVal.length - 2)
              }
              if (!value || value != queryVal) {
                return false
              }
            } else {
              return true
            }
          }
        }

        return true
      })
      for (const i in sourceData) {
        const item = sourceData[i]
        // {"metric":{"instance":"192.168.40.126:9100","__name__":"scrape_duration_seconds","module":"node_exporter","project":"kafka","asset":"192.168.40.126","job":"ed_1","dc":"dc5"},"value":[1580782176.522,"0.000560761"]}
        const metricName = item.metric.__name__
        let temp = metricName
        delete item.metric.__name__
        temp += '{'
        const hasLabel = true
        for (const key in item.metric) {
          const label = key
          const value = item.metric[label]
          temp += label + "='" + value + "',"
        }
        temp = temp.charAt(temp.length - 1) == ',' ? temp.substr(0, temp.length - 1) : temp
        temp += '}'
        if (hasLabel) {
          const edpQueryData = { element: temp, value: item.value[1], type: (item.metric.type ? item.metric.type : '2') }
          this.tableData.push(edpQueryData)
        }
      }
    },
    focusInput () {
      let classVal = document.getElementById('elementQuery').parentElement.getAttribute('class')
      classVal = classVal.replace('query-input-inactive', 'query-input-active')
      document.getElementById('elementQuery').parentElement.setAttribute('class', classVal)
      this.$refs.elementQuery.focus()
    },
    blurInput () {
      if (!this.queryExpression || this.queryExpression == '') {
        setTimeout(function () {
          let classVal = document.getElementById('elementQuery').parentElement.getAttribute('class')
          classVal = classVal.replace('query-input-active', 'query-input-inactive')
          document.getElementById('elementQuery').parentElement.setAttribute('class', classVal)
        }, 100)
      }
    },
    clearInput () {
      this.$refs.elementQuery.focus()
    },
    queryElementTips: async function () {
      this.elementMetricDatas = []
      const response = await axios.get('/metric/metadata?endpointId=' + this.currentEndpoint.id)
      if (response && response.status === 200) {
        if (response.data.msg === 'success') {
          this.elementMetricDatas = response.data.data.list
        }
      }
    },
    getStateContent (row) {
      if (row) {
        if (row.state == 1) {
          return 'up' + '[' + this.formatUpdateTime(row.lastUpdate) + ']'
        } else {
          return 'down' + '[' + this.getStateErrorMsg(row) + ']'
        }
      }
    },
    formatUpdateTime (date) {
      const time = new Date(date)
      const hours = time.getHours() > 9 ? time.getHours() : '0' + time.getHours()
      const minutes = time.getMinutes() > 9 ? time.getMinutes() : '0' + time.getMinutes()

      return hours + ':' + minutes
    },
    getStateErrorMsg (row) {
      const errCodes = [230009, 230010, 230011]
      if (row) {
        if (row.state == 0) {
          if (errCodes.find((item) => { return row.stateInfo.code == item })) {
            return this.$t('project.endpoint.stateInfo_' + row.stateInfo.code)
          } else {
            this.$message.error('state code error')
            return row.stateInfo.msg
          }
        }
      }
    }
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      handler (n) {
        if (n) {
          this.searchLabel = {}
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
    }
  },
  mounted () {
    this.getPanelData()
    setTimeout(() => { this.$refs.endpointQueryTable.setHeight() }, 700)
  }
}
</script>
