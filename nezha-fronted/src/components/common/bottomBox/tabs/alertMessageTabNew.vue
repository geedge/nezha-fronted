<template>
  <div class="full-width-height">
    <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg"
      :tabs="tabs"
      :targetTab="targetTab"
      @changeTab="changeTab"
      @search="search"
      class="full-width-height"
      v-loading="tools.loading"
    >
      <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
      <template v-slot:top-tool-right>
        <el-select v-model="state" class="margin-r-10" size="small" value-key="value" @change="getTableData" popper-class="right-box-select-top right-public-box-dropdown-top">
          <el-option v-for="item in stateOptions" :key="item.value" :label="$t(item.label)" :value="item.value"></el-option>
        </el-select>
        <pick-time v-model="searchTimeHeader" :default-pick="12" :refresh-data-func="getTableData" :show-empty="true" :use-chart-unit="false" :use-refresh="false"></pick-time>
      </template>
      <template v-slot>
        <alertMessageTable
          ref="dataTable"
          :api="url"
          :loading="tools.loading"
          :custom-table-title="tools.customTableTitle"
          :height="subTableHeight"
          :now-time="nowTime"
          :table-data="tableData"
          :alertMessageTabNew="true"
          @del="del"
          @showText="showText"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @addSilence="addSilence"
          @selectionChange="selectionChange"
          @showBottomBox="(target, item) => { $refs.dataList.showBottomBox(target, item) }"
          @toDelete="toDeleteMessage"
          @messageDetail="messageDetail"
        ></alertMessageTable>
      </template>
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-bottom-data-list>
    <el-dialog id="viewGraphDialog"
               :modal-append-to-body='false'
               destroy-on-close
               :title="$t('overall.detail')"
               :visible.sync="graphShow"
               class="line-chart-block-modal nz-dialog endpoint-dialog"
               width="90%"
               @close="dialogClose">
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
      <div slot="title">
        {{$t("project.endpoint.dialogTitle")}}
        <div class="float-right panel-calendar dialog-tool" style="display: flex">
          <pick-time v-model="searchTime" :refresh-data-func="queryDate" :use-chart-unit="false" :use-refresh="false" style="height: 28px;"></pick-time>
        </div>
      </div>
      <div style="width: 100%;height: 100%" v-loading="chartLoading">
        <chart v-if="resultType === 'matrix'" ref="messageChart" :unit="chartUnit" name="alertMessageChart"></chart>
        <log-tab v-if="resultType === 'streamsFormat'" ref="logDetailScreen" :log-data="logData" :showSwitch="false" :tab-index="tabIndex" @exportLog="exportLog" @limitChange="queryLogData"></log-tab>
      </div>
    </el-dialog>
    <el-dialog class="nz-dialog table-chart-dialog" :title="$t('alert.config.trbShot')"
               :visible.sync="dialogShowText"
               width="96%"  @close="dialogShowText = false" :modal-append-to-body="false">
      <div slot="title">
        <span class="nz-dialog-title">{{$t('alert.config.trbShot')}}</span>
      </div>
      <div class="rich-text-screen-container"  >
        <div id="chartScreenContainer"  ref="chartScreenContainer" class="text-content" >
          <el-scrollbar style="height: 100%;" class="el-scrollbar-normal">
            <div style="height: 100%;" v-html="dialogText" ></div>
          </el-scrollbar>
        </div>
      </div>
    </el-dialog>
    <transition name="right-box"><alert-silence-box v-if='silenceBoxShow' :alert-silence="objectSilence" @close="closeSilenceBox"></alert-silence-box></transition>
  </div>
</template>

<script>
import { getTime } from '@/components/common/js/tools'
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import axios from 'axios'
import bus from '@/libs/bus'
import alertMessageTable from '@/components/common/table/alert/alertMessageTable.vue'
import chartDataFormat from '@/components/charts/chartDataFormat'
import chart from '@/components/page/dashboard/overview/chart'
import { alertMessage as alertMessageConstant, fromRoute } from '@/components/common/js/constants'
import alertSilenceBox from '@/components/common/rightBox/alertSilenceBox'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'

export default {
  name: 'alertMessageTab',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList,
    alertMessageTable,
    alertSilenceBox,
    chart
  },
  props: {
    from: String
  },
  watch: {
    obj: {
      immediate: true,
      handler (n) {
        if (n) {
          this.getTableData()
        }
      }
    }
  },
  data () {
    return {
      stateOptions: alertMessageConstant.states,
      url: 'alert/message',
      tableId: 'alertMessageModule', // 需要分页的table的id，用于记录每页数量
      state: '1',
      blankSilenceObject: {
        id: '',
        startAt: '',
        endAt: '',
        ruleId: '',
        type: 'asset',
        linkId: '',
        remark: '',
        time: [],
        matchers: [
          { name: '', value: '', regex: 0 }
        ],
        name: ''
      },
      objectSilence: {},
      silenceBoxShow: false,
      searchMsg: { // 给搜索框子组件传递的信息
        searchLabelList: [
          {
            id: 26,
            name: this.$t('alert.list.id'),
            type: 'input',
            label: 'ids',
            disabled: false
          },
          {
            name: this.$t('alert.alertRule'),
            type: 'input',
            label: 'ruleName',
            disabled: false
          }, {
            name: this.$t('asset.asset'),
            type: 'input',
            label: 'assetName',
            disabled: false
          }, {
            name: 'Endpoint',
            type: 'input',
            label: 'endpointName',
            disabled: false
          }, {
            name: this.$t('alert.summary'),
            type: 'input',
            label: 'summary',
            disabled: false
          }, {
            name: this.$t('alert.list.labels'),
            type: 'input',
            label: 'labels',
            disabled: false
          }
        ]
      },
      rightBox: {
        editShow: false,
        show: false
      },
      fromBottom: true,
      // 导出相关
      importBox: { show: false, title: this.$t('overall.exportExcel') },
      deleteBox: { show: false, ids: '', remark: '', state: 2 },
      // 详情相关
      graphShow: false,
      chartDatas: [],
      sameLabels: ['instance', 'module', 'project', 'asset', 'endpoint', 'datacenter'],
      legend: [],
      searchTime: [],
      searchTimeHeader: [],
      searchTimeSelect: bus.getTimezontDateRange(),
      currentMsg: {},
      chartUnit: 5,
      requestIndex: 0,
      viewAssetState: false,
      nowTime: '',
      resultType: '',
      logData: [],
      chartLoading: false,
      dialogShowText: false,
      dialogText: '',
      isError: false,
      errorContent: ''
    }
  },
  methods: {
    labelsSort (obj) {
      const buildIn = ['asset', 'endpoint', 'module', 'cpu', 'project', 'datacenter', 'parent_asset', 'user']
      const labels = JSON.parse(JSON.stringify(obj))
      const result = []
      for (const key of buildIn) {
        if (key in labels) {
          result.push({ label: key, value: labels[key] })
          delete labels[key]
        }
      }
      Object.keys(labels).sort().forEach(key => {
        result.push({ label: key, value: labels[key] })
      })
      return result
    },
    chartUnitChange (unit) {
      this.chartUnit = unit
      this.$nextTick(() => {
        this.queryDate()
      })
    },
    queryChartDate () {
      const $temp = this
      const start = this.searchTime[0] ? this.searchTime[0] : getTime(-1, 'h')
      const end = this.searchTime[1] ? this.searchTime[1] : getTime(0, 'h')
      // const start = this.currentMsg.startAt
      // const end = this.currentMsg.endAt
      this.searchTime = [start, end]
      const timeDiff = (new Date(end).getTime() - new Date(start).getTime()) / 1000 / (24 * 60 * 60)
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
      if (this.$refs.messageChart) {
        this.$refs.messageChart.startLoading()
        const axiosArr = []
        axiosArr.push(axios.get('/prom/api/v1/query_range?query=' + encodeURIComponent(this.currentMsg.alertRule.expr.replace(/\s+/g, '')) + '&start=' + this.$stringTimeParseToUnix(start) + '&end=' + this.$stringTimeParseToUnix(end) + '&step=' + step + '&filter=' + encodeURIComponent(decodeURIComponent(this.promQueryParamLabels(this.currentMsg.labels)))))
        this.legend = []
        this.chartDatas = []
        axios.all(axiosArr).then(res => {
          this.chartLoading = false
          try {
            res.forEach((response, promIndex) => {
              if (response.status === 200) {
                if (response.data.status === 'success') {
                  const queryData = response.data.data.result[0]
                  if (queryData) {
                    const chartData = {
                      type: 'line',
                      symbol: 'none', // 去掉点
                      smooth: 0.2, // 曲线变平滑
                      name: '',
                      lineStyle: {
                        width: 1,
                        opacity: 0.9
                      },
                      markLine: {
                        silent: true,
                        symbol: ['circle', 'circle'],
                        label: {
                          distance: this.computeDistance(chartDataFormat.getUnit(this.currentMsg.alertRule.unit ? this.currentMsg.alertRule.unit : 2).compute(this.currentMsg.alertRule.threshold)),
                          formatter (params) {
                            return chartDataFormat.getUnit($temp.currentMsg.alertRule.unit ? $temp.currentMsg.alertRule.unit : 2).compute(params.value)
                          }
                        },
                        lineStyle: {
                          color: '#d64f40',
                          width: 2,
                          type: 'dotted'
                        },
                        data: [{
                          yAxis: Number(this.currentMsg.alertRule.threshold)
                        }]
                      },
                      markArea: {
                        itemStyle: {
                          color: '#d64f40',
                          opacity: 0.1
                        },
                        data: [this.returnMarkArea()]
                      }
                    }
                    if (this.currentMsg.alertRule.operator == '==' || this.currentMsg.alertRule.operator == '!=') {
                      delete chartData.markArea
                    }
                    let alias = chartData.name
                    chartData.name += '{'
                    alias += '{'
                    Object.keys(queryData.metric).forEach((item, index) => {
                      const label = item
                      const value = queryData.metric[label]
                      chartData.name += label + "='" + value + "',"
                    })
                    chartData.name = chartData.name.charAt(chartData.name.length - 1) == ',' ? chartData.name.substr(0, chartData.name.length - 1) : chartData.name
                    chartData.name += '}'
                    const legend = {
                      name: chartData.name,
                      alias: chartData.name,
                      isGray: false
                    }
                    this.legend.push(legend)
                    chartData.data = queryData.values.map((dpsItem, dpsIndex) => {
                      return [dpsItem[0] * 1000, parseFloat(dpsItem[1]).toFixed(2)]
                    })
                    this.chartDatas.push(chartData)
                  }
                } else {
                  this.$message.error(response.data.error)
                }
              } else {
                this.$refs.messageChart.endLoading()
                this.chartLoading = false
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
            this.$nextTick(() => {
              this.$refs.messageChart.setRandomColors(this.chartDatas.length)
              this.$refs.messageChart.setLegend(this.legend)
              this.$refs.messageChart.setSeries(this.chartDatas)
              this.$refs.messageChart.endLoading()
            })
          } catch (err) {
            // this.$message.error(err)
            this.$refs.messageChart.endLoading()
          }
        })
      }
    },
    del (row) {
      const self = this
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete(this.url + '?ids=' + row.id + '&state=' + this.state).then(response => {
          if (response.code === 200) {
            self.delFlag = true
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
            self.getTableData()
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    getTableData (state) {
      if (state) {
        this.state = state
      }
      if (this.orderBy) {
        this.$set(this.searchLabel, 'orderBy', this.orderBy)
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.$set(this.searchLabel, 'state', this.state)
      if (this.searchTimeHeader && this.searchTimeHeader.length > 1) {
        this.$set(this.searchLabel, 'startAt', this.timezoneToUtcTimeStr(this.searchTimeHeader[0]))
        this.$set(this.searchLabel, 'endAt', this.timezoneToUtcTimeStr(this.searchTimeHeader[1]))
      } else {
        delete this.searchLabel.startAt
        delete this.searchLabel.endAt
      }
      this.tools.loading = true
      if (state) {
        delete this.searchLabel.startAt
        delete this.searchLabel.endAt
      }
      if (this.from === fromRoute.module) {
        this.searchLabel.moduleIds = this.obj.id
      } else if (this.from === fromRoute.endpoint) {
        this.searchLabel.endpointIds = this.obj.id
      } else if (this.from === fromRoute.asset) {
        this.searchLabel.assetIds = this.obj.id
      } else if (this.from === fromRoute.alertRule) {
        this.searchLabel.ruleIds = this.obj.id
      } else if (this.from === fromRoute.dc) {
        this.searchLabel.dcIds = this.obj.id
      }
      this.$get(this.url, this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          this.nowTime = this.utcTimeToTimezoneStr(response.time)
          this.tableData = response.data.list
          this.deleteBox.ids = ''
          this.pageObj.total = response.data.total
        }
      })
    },
    promQueryParamConvert (alert) {
      const obj = { ...alert }
      let r = '(' + obj.alertRule.expr.replace(/\"/g, '\'').replace(/\s+/g, '') + ')'
      let intoLabels = false
      obj.labels = JSON.parse(obj.labels)
      if (Object.keys(obj.labels).length > 0) {
        r += (function () {
          let group = ' and ' + '(group({'
          let by = ' by ('

          for (const k in obj.labels) {
            if (k != 'alertname' && k != 'severity' && k != 'severity_id' && k != 'rule_type') {
              intoLabels = true
              group += k
              group += '='
              group += ("'" + obj.labels[k] + "',")
              by += k
              by += ','
            }
          }
          if (intoLabels) {
            group = group.substring(0, group.length - 1)
            by = by.substring(0, by.length - 1)
            group += '})'
            by += ')'
            return group + by + ')'
          } else {
            return ''
          }
        }())
      }
      return r
    },
    promQueryParamLabels (labels) {
      const obj = JSON.parse(labels)
      const filterArr = ['alertname', 'severity_id', 'severity', 'rule_type']
      filterArr.forEach(key => {
        delete obj[key]
      })
      return JSON.stringify(obj)
    },
    // asset弹框控制
    tabControl (data) {
      if (data === 'close') {
        this.viewAssetState = false
        this.$refs.assetEditUnit.tabView = false
      }
    },
    openedDialog () {
      this.$refs.remarkForm.clearValidate()
    },
    openDelMessageBox () {
      if (this.batchDeleteObjs.length < 1) return
      if (this.$refs.alertMessageTable) {
        this.$refs.alertMessageTable.toDeleteMessage(false)
      }
    },
    toDeleteMessage (obj) {
      if (obj) {
        this.deleteBox.ids = obj.id + ''
      }
      this.deleteBox.show = true
    },
    messageDetail (row) {
      if (row.alertRule.type == 3) {
        return
      }
      this.$get('/alert/rule/' + row.alertRule.id).then(res => {
        this.currentMsg = { ...row, alertRule: { ...res.data } }
        this.graphShow = true
        this.$nextTick(() => {
          this.searchTime = [bus.computeTimezoneTime(new Date().getTime() - 1 * 60 * 60 * 1000), bus.computeTimezoneTime(new Date().getTime())]
          this.queryDate()
        })
      })
    },
    deleteMessage () {
      this.$refs.remarkForm.validate(valid => {
        if (valid) {
          this.$put(this.url, this.deleteBox).then(res => {
            if (res.code === 200) {
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
              this.deleteBox.ids = []
              this.deleteBox.show = false
              this.getTableData()
            } else {
              this.$message.error(res.msg)
            }
          })
        }
      })
    },
    selectChange (s) {
      const ids = []
      this.deleteBox.ids = ''
      s.forEach(item => {
        ids.push(item.id)
      })
      this.deleteBox.ids = ids.join(',')
    },
    showExportDialog () {
      this.importBox.show = true
    },
    closeDialog () {
      this.importBox.show = false
      this.deleteBox.show = false
    },
    dialogClose () {
      this.graphShow = false
    },
    exportCur () {
      const searchLabel = Object.assign({}, this.searchLabel)
      this.$set(searchLabel, 'language', localStorage.getItem('nz-language') ? localStorage.getItem('nz-language') : 'en')
      this.exportExcel(searchLabel)
      this.closeDialog()
    },
    exportAll () {
      const temp = JSON.parse(JSON.stringify(this.searchLabel))
      temp.pageSize = -1
      this.$set(temp, 'language', localStorage.getItem('nz-language') ? localStorage.getItem('nz-language') : 'en')
      this.exportExcel(temp)
      this.closeDialog()
    },
    getTimeString () {
      const split = '-'
      const date = new Date()
      const year = date.getFullYear()
      const month = this.formatNum(date.getMonth() + 1)
      const day = this.formatNum(date.getDate())
      const hours = this.formatNum(date.getHours())
      const minutes = this.formatNum(date.getMinutes())
      const seconds = this.formatNum(date.getSeconds())
      return year + split + month + split + day + ' ' + hours + split + minutes + split + seconds
    },
    formatNum (num) {
      return num > 9 ? num : '0' + num
    },
    exportExcel (params) {
      for (const item in params) {
        if (params[item]) {
          if (item === 'alertMessageState') {
            this.$set(params, 'state', params[item])
          } else {
            this.$set(params, item, params[item])
          }
        }
      }
      const temp = this
      if (!params) {
        params = temp.params
      }
      axios.get('alert/message/export', { responseType: 'blob', params: params }).then(res => {
        const fileName = 'alert-message-' + temp.getTimeString() + '.xlsx'
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res.data])
          window.navigator.msSaveOrOpenBlob(blobObject, fileName)
        } else {
          const url = URL.createObjectURL(new Blob([res.data]))
          const a = document.createElement('a')
          document.body.appendChild(a) // 此处增加了将创建的添加到body当中
          a.href = url
          a.download = fileName
          a.target = '_blank'
          a.click()
          a.remove() // 将a标签移除
        }
      }, error => {
        const $self = this
        const reader = new FileReader()
        reader.onload = function (event) {
          const responseText = reader.result
          const exception = JSON.parse(responseText)
          if (exception.message) {
            $self.$message.error(exception.message)
          } else {
            console.error(error)
          }
        }
        reader.readAsText(error.response.data)
      })
    },
    showTagDetail (data, key) {
      let open = false
      if (key == 'asset' || key == 'project' || key == 'module' || key == 'endpoint' || key == 'datacenter') {
        open = true
      }
      if (open) {
        const labelList = []
        const detailList = []
        for (const item in data) {
          if (item == 'asset' || item == 'project' || item == 'module' || item == 'endpoint' || item == 'dc') {
            labelList.push(item)
            detailList.push(data[item])
          }
        }
        this.bottomBox.showSubList = true
        this.tabList = labelList
      }
    },
    search (searchObj) {
      let orderBy = ''
      if (this.searchLabel.orderBy) {
        orderBy = this.searchLabel.orderBy
      }
      this.searchLabel = {}
      this.pageObj.pageNo = 1
      for (const item in searchObj) {
        if (searchObj[item]) {
          if (item == 'alertMessageState') {
            this.$set(this.searchLabel, 'state', searchObj[item])
          } else {
            this.$set(this.searchLabel, item, searchObj[item])
          }
        }
      }
      if (orderBy) {
        this.$set(this.searchLabel, 'orderBy', orderBy)
      }
      if (this.$refs.dataTable) {
        this.$refs.dataTable.$refs.dataTable.bodyWrapper.scrollTop = 0
      }
      this.getTableData()
    },
    fillProject (module) {
      this.$get('project', { id: module.projectId }).then(response => {
        if (response.code == 200) {
          module.project = response.data.list[0]
        }
      })
    },
    closeViews () {
      this.$refs.alertConfigBox.show(false, false)
      this.$refs.projectBox.show(false, false)
      this.$refs.moduleBox.show(false, false)
      this.viewAssetState = false
    },
    computeDistance (str) {
      let width = 0
      const html = document.createElement('span')
      html.innerText = str
      html.className = 'getTextWidth'
      document.querySelector('body').appendChild(html)
      width = document.querySelector('.getTextWidth').offsetWidth
      document.querySelector('.getTextWidth').remove()
      return Number('-' + (width + 5))
    },
    returnMarkArea () {
      if (this.currentMsg) {
        if (this.currentMsg.alertRule.operator == '>' || this.currentMsg.alertRule.operator == '>=') {
          return [{ yAxis: this.currentMsg.alertRule.threshold }, {}]
        } else {
          return [{}, { yAxis: this.currentMsg.alertRule.threshold }]
        }
      }
    },
    queryDate () {
      this.chartLoading = true
      if (this.currentMsg.alertRule.type === 1) {
        this.resultType = 'matrix'
        this.$nextTick(() => {
          this.queryChartDate()
        })
      } else if (this.currentMsg.alertRule.type === 2) {
        this.queryLogData(1000)
      }
    },
    exportLog ({ limit, descending }) {
      const start = this.searchTime[0] ? this.searchTime[0] : getTime(-1, 'h')
      const end = this.searchTime[1] ? this.searchTime[1] : getTime(0, 'h')
      const params = {
        logql: this.expressions,
        start: start,
        end: end,
        direction: descending ? 'backward' : 'forward',
        limit
      }
      axios.get('/logs/loki/export', { responseType: 'blob', params: params }).then(res => {
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res.data])
          window.navigator.msSaveOrOpenBlob(blobObject, 'log')
        } else {
          const url = URL.createObjectURL(new Blob([res.data]))
          const a = document.createElement('a')
          document.body.appendChild(a) // 此处增加了将创建的添加到body当中
          a.href = url
          a.download = 'log'
          a.target = '_blank'
          a.click()
          a.remove() // 将a标签移除
        }
      }, error => {
        const $self = this
        const reader = new FileReader()
        reader.onload = function (event) {
          const responseText = reader.result
          const exception = JSON.parse(responseText)
          if (exception.message) {
            $self.$message.error(exception.message)
          } else {
            console.error(error)
          }
        }
        reader.readAsText(error.response.data)
      })
    },
    queryLogData (limit) { // log的chart和table是一个请求
      if (!limit) {
        limit = 1000
      }
      const start = this.searchTime[0] ? this.searchTime[0] : getTime(-1, 'h')
      const end = this.searchTime[1] ? this.searchTime[1] : getTime(0, 'h')
      this.expressions = [this.currentMsg.alertRule.expr]
      this.$get('/logs/loki/api/v1/query_range?format=1&query=' + encodeURIComponent(this.currentMsg.alertRule.expr) + '&start=' + this.$stringTimeParseToUnix(start) + '&end=' + this.$stringTimeParseToUnix(end) + '&limit=' + limit + '&filter=' + encodeURIComponent(decodeURIComponent(this.promQueryParamLabels(this.currentMsg.labels)))).then(res => {
        this.chartLoading = false
        const logData = [res.data]
        this.resultType = res.data.resultType
        this.$nextTick(() => {
          if (this.$refs.logDetail) {
            this.$refs.logDetail.time = this.chartData.param.time
            this.$refs.logDetail.wrapLines = this.chartData.param.wrapLines
            this.$refs.logDetail.operations.descending = this.chartData.param.descending
          }
          // logData.forEach((item, index) => {
          //   item.result.forEach(result => {
          //     result.elements = this.expressions[index]
          //   })
          // })
          this.logData = logData
          this.resultType === 'matrix' && this.loadLogGraph()
        })
      })
    },
    loadLogGraph () {
      const graphData = this.logData.filter(l => l.resultType === 'matrix')
      if (graphData && graphData.length > 0) {
        this.$refs.messageChart.startLoading()
        const queryExpression = []
        let series = []
        const legend = []
        this.expressions.forEach((item, index) => {
          if (item !== '') {
            queryExpression.push(item)
          }
        })
        this.logData.forEach((response, index) => {
          if (response.resultType === 'matrix') {
            const data = response.result
            if (!data || data.length < 1) {
              return
            }
            data.forEach((result, i) => {
              const seriesItem = {
                name: '',
                symbol: 'emptyCircle', // 去掉点
                symbolSize: [2, 2],
                showSymbol: false,
                smooth: 0.2, // 曲线变平滑
                data: [],
                lineStyle: {
                  width: 1,
                  opacity: 0.9
                },
                type: 'line'
              }
              seriesItem.data = result.values.map((item) => {
                return [item[0] * 1000, item[1]]
              })
              let host = ''// up,
              let alias = ''
              if (result.metric && Object.keys(result.metric).length > 0) {
                const metric = Object.keys(result.metric)
                if (metric.__name__) {
                  host = `${metric.__name__}{`// up,
                }
                metric.forEach((tag, i) => {
                  if (tag !== '__name__') {
                    host += `${tag}="${result.metric[tag]}",`
                  }
                })
                if (host.endsWith(',')) {
                  host = host.substr(0, host.length - 1)
                }
                if (metric.__name__) {
                  host += '}'
                }
                // 处理legend别名
                // alias = this.dealLegendAlias(host, this.chartData.elements[index].legend)
                if (!alias || alias === '') {
                  alias = host
                }
              } else {
                alias = queryExpression[index]
              }
              seriesItem.name = alias + '-' + index
              series.push(seriesItem)
              legend.push({ name: seriesItem.name, alias: alias, isGray: false })
            })
          }
        })
        this.$refs.messageChart.setLegend(legend)
        this.$refs.messageChart.setRandomColors(series.length)
        if (!series.length) {
          series = ''
        }
        this.$refs.messageChart.setSeries(series)
        this.defaultChartVisible = true
        this.$nextTick(() => {
          this.$refs.messageChart.endLoading()
          this.$refs.messageChart.resize()
        })
      }
    },
    showText (row) {
      this.dialogShowText = true
      this.dialogText = row.alertRule.trbShot
    }
  }
}
</script>
<style scoped>
  .full-width-height{
    width: 100%;
    height: 100%;
  }
</style>
