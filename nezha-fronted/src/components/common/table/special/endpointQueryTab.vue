<template>
  <div class="full-width-height endpoint-query-tab">
    <el-table
      id="endpointTable"
      ref="dataTable"
      :data="currentTableData"
      v-my-loading="loading"
      :height="'calc(100% - 48px)'"
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
        :label="$t('dashboard.panel.chartForm.element')">
        <template v-slot="scope">
          <el-popover trigger="hover" placement="right">
            <meta-data :metaDataList="metaDataList" :metaName="scope.row.metricTip.metric" />
            <span slot="reference"><i @mouseover="metricMetaData(scope.row)" class="nz-icon nz-icon-info-normal metric-tip-icon"></i></span>
          </el-popover>
          <span style="word-break: break-all;" v-html="hideSameLabels?scope.row.colorSimpleElement: scope.row.colorElement"></span>
        </template>
      </el-table-column>
      <el-table-column
        :resizable="false"
        prop="value"
        column-key="value"
        :label="$t('overall.value')"
        min-width="180">
      </el-table-column>
      <template  slot="empty">
        <div v-if="!loading" class="table-no-data">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#nz-icon-no-data-list"></use>
          </svg>
          <div class="table-no-data__title">No results found</div>
        </div>
        <div v-else>&nbsp;</div>
      </template>
    </el-table>
    <div class="query-page-option">
      <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
    </div>
    <el-dialog
      v-if="graphShow"
      :visible.sync="graphShow"
      :show-close="false"
      class="nz-dialog chart-fullscreen endpoint-query-metrics"
      destroy-on-close
      fullscreen
      :modal-append-to-body="false"
    >
      <panel-chart
        :ref="'chart-fullscreen' + chartInfo.id"
        :chart-info="chartInfo"
        :from="fromRoute.endpointQuery"
        :filter="{}"
        :is-fullscreen="true"
        @saveChart="saveChart"
        :time-range="searchTime"
        @showFullscreen="showFullscreen"
      ></panel-chart>
    </el-dialog>
    <transition name="right-box">
      <chart-right-box
        v-if="chartRightBoxShow"
        v-my-loading="rightBox.loading"
        ref="addChartModal"
        :chart="chart"
        :showPanel="{}"
        :from="fromRoute.dashboard"
        :panel-data="panelData"
        @close="closeChartBox"
        @on-create-success="createSuccess"
      ></chart-right-box>
    </transition>
  </div>
</template>

<script>
import chartRightBox from '@/components/common/rightBox/chart/chartRightBox'
import bus from '../../../../libs/bus'
import { sameLabels, fromRoute } from '@/components/common/js/constants'
import metaData from '@/components/common/metaData'
import panelChart from '@/components/chart/panelChart'
import lodash from 'lodash'
import lineData from '@/components/chart/defaultLineData'
export default {
  name: 'endpointQueryTab',
  components: {
    metaData,
    panelChart,
    chartRightBox
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
    },
    batchDeleteObjs: {
      immediate: true,
      deep: true,
      handler (n) {
        if (n) {
          this.$emit('selectedEndpointsChange', n)
        }
      }
    }
  },
  data () {
    return {
      fromRoute,
      tableData: [],
      currentTableData: [],
      batchDeleteObjs: [],
      currentEndpoint: {},
      sameLabels: sameLabels,
      loading: false,
      panelData: {},
      graphShow: false,
      chartUnit: 5,
      rightBox: { show: false },
      minusTime: 0,
      searchTime: bus.getTimezontDateRange(),
      tableId: 'endpointQueryTable',
      pageObj: {
        pageSize: 20,
        pageNo: 1,
        total: 0
      },
      metaDataList: [],
      letter: [
        'A', 'B', 'C', 'D', 'E', 'F', 'G',
        'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z'
      ]
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
        this.$get('/prom/api/v1/query?query=' + encodeURIComponent("{endpoint_id='" + this.currentEndpoint.id + "'}") + '&time=' + this.$stringTimeParseToUnix(bus.formateTimeToTime(this.formatTime))).then(response => {
          this.loading = false
          if (response.status === 'success') {
            const results = response.data.result
            this.queryData = JSON.parse(JSON.stringify(results))
            this.tableData = this.handlerTableData(results)
            this.tableDataCopy = JSON.stringify(this.tableData)
            this.pageObj.total = this.tableData.length
            this.$nextTick(this.$refs.dataTable.doLayout())
            if (!this.scrollbarWrap) {
              this.$nextTick(() => {
                this.handleCurrentChange()
                // this.scrollbarWrap = this.$refs.dataTable.$refs.singleTable.bodyWrapper
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
        this.$get('visual/dashboard?pageNo=1&pageSize=-1').then(response => {
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
      this.pageObj.pageNo = 1
      this.handleCurrentChange()
    },
    dragend () {
      this.$nextTick(() => {
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
      this.$nextTick(() => {
        const chartInfo = lodash.cloneDeep(lineData)
        const elements = lodash.cloneDeep(chartInfo.elements[0])
        chartInfo.elements = []
        chartInfo.name = this.$t('project.endpoint.dialogTitle')
        for (const endpoint of this.batchDeleteObjs) {
          const element = lodash.cloneDeep(elements)
          element.expression = endpoint.element
          chartInfo.elements.push(element)
        }
        chartInfo.elements.forEach((item, index) => {
          item.name = this.transformNumToLetter(index)
        })
        this.showFullscreen(true, chartInfo)
      })
    },
    saveChart (chart) { // 新增chart
      this.getPanelData().then(() => {
        chart.id = ''
        chart.name = ''
        chart.panelName = ''
        this.chart = chart
        this.graphShow = false
        this.$store.dispatch('dispatchEditChart', {
          chart: this.chart,
          type: 'add'
        })
      })
    },
    createSuccess (panel) {
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
    pageNo (val) {
      this.pageObj.pageNo = val
      this.handleCurrentChange()
    },
    pageSize (val) {
      this.pageObj.pageSize = val
      localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val)
      this.handleCurrentChange()
    },
    handleCurrentChange () {
      this.pageObj.total = this.tableData.length
      this.currentTableData = this.tableData.slice(
        (this.pageObj.pageNo - 1) * this.pageObj.pageSize,
        this.pageObj.pageNo * this.pageObj.pageSize
      )
    },
    metricMetaData (data) {
      this.$get('/prom/api/v1/metadata?' + 'metric=' + data.metricTip.metric + '&limit=' + 1).then(res => {
        if (res.code === 200) {
          this.metaDataList = res.data[data.metricTip.metric]
        }
      })
    },
    showFullscreen (show, chartInfo) {
      this.chartInfo = chartInfo
      this.graphShow = show
    },
    closeChartBox (refresh) {
      // this.rightBox.chart.show = false
      this.chart = {}
      this.$store.dispatch('clearPanel')
      /* if (refresh) {
         this.getData(this.filter)
      } */
    },
    transformNumToLetter (num) { // 相当于26进制 获取idaddExpression
      const self = this
      let letter = ''
      const loopNum = parseInt(num / 26)
      if (loopNum > 0) {
        letter += this.transformNumToLetter(loopNum - 1)
      }
      letter += self.letter[num % 26]
      return letter
    }
  },
  computed: {
    chartRightBoxShow () {
      return this.$store.getters.getShowRightBox
    }
  },
  created () {
    // this.getPanelData()
    const pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId)
    this.pageObj.pageSize = pageSize || 20
  }
}
</script>
