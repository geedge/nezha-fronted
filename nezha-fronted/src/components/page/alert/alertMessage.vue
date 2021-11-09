<style lang="scss">
  @import '../../charts/chart';
</style>
<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.alertMessage"
      :layout="dataListLayout"
      :search-msg="searchMsg"
      @search="search"
      v-loading="tools.loading"
    >
      <template v-slot:top-tool-right>
        <el-select v-model="state" class="margin-r-10" size="small" value-key="value" @change="getTableData" popper-class="right-box-select-top right-public-box-dropdown-top">
          <el-option v-for="item in stateOptions" :key="item.value" :label="$t(item.label)" :value="item.value"></el-option>
        </el-select>
        <button id="asset-filter" :class="[dataListLayout.indexOf('clickSearch') > -1?'is-focus':'' ]" class="top-tool-btn margin-r-10" @click.stop="showClickSearch">
          <i class="nz-icon nz-icon-funnel"></i>
        </button>
        <pick-time v-model="searchTime" :default-pick="12" :refresh-data-func="getTableData" :show-empty="true" :use-chart-unit="false" :use-refresh="false"></pick-time>
        <button id="roles-add" v-has="'alertMessage_view'" :title="$t('overall.exportExcelLower')" class="top-tool-btn margin-r-10"
                type="button" @click="showExportDialog">
          <i class="nz-icon-download1 nz-icon"></i>
        </button>
        <delete-button id="alert-msg-batch-delete" v-has="'alertMessage_expired'" :api="url" :clickFunction="batchDel" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot:search >
        <click-search ref="clickSearch" :select-value.sync="selectValue" :title-search-list="titleSearchList" @reload="reloadTable"/>
      </template>
      <template v-slot:default="slotProps">
        <alert-message-table
          ref="dataTable"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :now-time="nowTime"
          :table-data="tableData"
          :loading="tools.loading"
          @del="del"
          @edit="edit"
          @showText="showText"
          @orderBy="tableDataSort"
          @queryMessage='queryMessage'
          @reload="getTableData"
          @addSilence="addSilence"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"
          @messageDetail="messageDetail"></alert-message-table>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <!--导出-->
    <div class="export-xlsx">
      <el-dialog :modal-append-to-body='false' :show-close="true" :title="importBox.title" :visible.sync="importBox.show" class="nz-dialog" width="600px" @close="closeDialog">
        <div class="upload-body" style="height: 170px">
          <div class="export-box">
            <span class="export-title">Records</span>
            <el-radio-group v-model="importBox.record"  size="small">
              <el-radio-button :label="item.value" v-for="(item,index) in recordArr" :key="index" :disabled="item.value==='records'&&!batchDeleteObjs.length">{{item.name}}</el-radio-button>
            </el-radio-group>
          </div>
          <div class="export-box">
            <span class="export-title">File format</span>
            <el-radio-group v-model="importBox.format"  size="small">
              <el-radio-button :label="item.value" v-for="(item,index) in formatArr" :key="index" :disabled="item.value!==1">{{item.name}}</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div slot="footer" class="footer">
          <div class="el-message-box__btns">
            <button :id="'-xlsx-import-export'"  class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" @click="exportData">
              <span style="text-transform:Capitalize">{{$t('config.operationlog.operations.export')}}</span>
            </button>
            <button :id="'-xlsx-import-close'" class="nz-btn el-button el-button--default el-button--small" @click="closeDialog">
              <span>{{$t('overall.close')}}</span>
            </button>
          </div>
        </div>
      </el-dialog>
    </div>
    <!--删除弹窗-->
    <div class="export-xlsx">
      <el-dialog :modal-append-to-body='false' :show-close="true" :title="$t('overall.remark')" :visible.sync="deleteBox.show" class="nz-message"  width="450px" @close="closeDialog" @opened="openedDialog">
        <div class="upload-body">
          <el-form ref="remarkForm" :model="deleteBox">
            <el-form-item :rules="[{required:true,message: $t('validate.required'), trigger: 'change'}]" prop="remark">
              <el-input v-model="deleteBox.remark" :placeholder="$t('overall.remark')" type="textarea"></el-input>
            </el-form-item>
          </el-form>
          <div style="text-align: right; margin-top: 10px;">
            <button class="el-button el-button--default el-button--small" @click="closeDialog">
              <span>{{$t('tip.no')}}</span>
            </button>
            <button class="el-button el-button--default el-button--small el-button--primary" @click="deleteMessage">
              <span>{{$t('tip.yes')}}</span>
            </button>
          </div>
        </div>
      </el-dialog>
    </div>
    <el-dialog id="viewGraphDialog"
               :modal-append-to-body='false'
               destroy-on-close
               :title="$t('overall.detail')"
               :visible.sync="graphShow"
               class="line-chart-block-modal nz-dialog endpoint-dialog"
               width="90%"
               @close="dialogClose">
      <div slot="title">
        {{$t("project.endpoint.dialogTitle")}}
        <div class="float-right panel-calendar dialog-tool" style="display: flex">
          <pick-time v-model="searchTimeDialog" :refresh-data-func="queryDate" :use-chart-unit="false" :use-refresh="false" style="height: 28px;"></pick-time>
        </div>
      </div>
      <div style="width: 100%;height: 100%" v-loading="chartLoading">
        <chart v-if="resultType === 'matrix'" ref="messageChart" :unit="chartUnit" name="alertMessageChart"></chart>
        <log-tab v-if="resultType === 'streamsFormat'" ref="logDetailScreen" :log-data="logData" :showSwitch="false" :tab-index="tabIndex" @exportLog="exportLog" @limitChange="queryLogData"></log-tab>
      </div>
    </el-dialog>
    <!--全屏-->
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
    <transition name="right-box"><alert-silence-box v-if='silenceBoxShow' :alert-silence="objectSilence" @close="closeSilenceBox"></alert-silence-box>
    </transition>
  </div>
</template>
<script>
import bus from '@/libs/bus'
import axios from 'axios'
import pickTime from '@/components/common/pickTime'
import { getTime } from '@/components/common/js/tools'
import alertMessageTable from '@/components/common/table/alert/alertMessageTable.vue'
import deleteButton from '@/components/common/deleteButton'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import chartDataFormat from '@/components/charts/chartDataFormat'
import chart from '@/components/page/dashboard/overview/chart'
import { alertMessage as alertMessageConstant, fromRoute } from '@/components/common/js/constants'
import alertSilenceBox from '@/components/common/rightBox/alertSilenceBox'
import clickSearch from '@/components/common/labelFilter/clickSearch'

export default {
  name: 'alertMessage',
  components: {
    alertMessageTable,
    pickTime,
    chart,
    nzDataList,
    deleteButton,
    alertSilenceBox,
    clickSearch
  },
  mixins: [dataListMixin],
  data () {
    return {
      chartLoading: false,
      stateOptions: alertMessageConstant.states,
      dataListLayout: localStorage.getItem('dataList-layout' + 'alertMessageTable') ? JSON.parse(localStorage.getItem('dataList-layout' + 'alertMessageTable')) : ['searchInput', 'elementSet', 'clickSearch', 'pagination'],
      state: '1',
      dialogShowText: false,
      dialogText: '',
      url: 'alert/message',
      // 导出相关
      importBox: { show: false, title: this.$t('overall.importExcel'), type: 1, record: 'all', format: 1 },
      deleteBox: { show: false, ids: '', remark: '', state: 2 },
      // 详情相关
      graphShow: false,
      chartDatas: [],
      sameLabels: ['instance', 'module', 'project', 'asset', 'endpoint', 'datacenter'],
      legend: [],
      searchTime: [],
      searchTimeDialog: [],
      searchTimeSelect: bus.getTimezontDateRange(),
      currentMsg: {},
      chartUnit: 5,
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
      tableId: 'alertMessageTable', // 需要分页的table的id，用于记录每页数量
      searchMsg: { // 给搜索框子组件传递的信息
        searchLabelList: [
          {
            id: 26,
            name: this.$t('alert.list.id'),
            type: 'id',
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
            name: this.$t('overall.labels'),
            type: 'input',
            label: 'labels',
            disabled: false
          }
        ]
      },
      requestIndex: 0,
      viewAssetState: false,
      nowTime: '',
      logData: [],
      resultType: '',
      titleSearchList: {
        project: {
          label: this.$t('dashboard.overview.project.project'),
          key: 'projectIds',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1
        },
        module: {
          label: this.$t('dashboard.overview.project.module'),
          key: 'moduleIds',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1
        },
        dc: {
          label: this.$t('overall.dc'),
          key: 'dcIds',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1
        },
        severity: {
          label: this.$t('alert.severity'),
          key: 'severityIds',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1
        }
      },
      selectValue: {
        dcIds: [],
        projectIds: [],
        moduleIds: [],
        modelIds: [],
        severityIds: []
      },
      detailSearchList: {
        project: {
          label: this.$t('dashboard.overview.project.project'),
          key: 'projectIds',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1
        },
        module: {
          label: this.$t('dashboard.overview.project.module'),
          key: 'moduleIds',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1
        },
        dc: {
          label: this.$t('overall.dc'),
          key: 'dcIds',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1
        },
        severity: {
          label: this.$t('alert.severity'),
          key: 'severityIds',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1
        }
      },
      recordArr: [
        { name: this.$t('overall.allData'), value: 'all' },
        { name: this.$t('overall.selectRecords'), value: 'records' },
        { name: this.$t('overall.current'), value: 'current' }
      ],
      formatArr: [
        { name: 'XLSX', value: 1 },
        { name: 'CSV', value: 2 },
        { name: 'JSON', value: 3 }
      ]
    }
  },
  computed: {
    tagType () {
      return (key) => {
        if (key == 'asset' || key == 'module' || key == 'project' || key == 'datacenter' || key == 'endpoint') {
          return 'normal'
        } else {
          return 'info'
        }
      }
    },
    tagValue () {
      return (key, value) => {
        if (key == 'type') {
          if (value == 1) {
            value = this.$t('project.project.projectName')
          } else if (value == 2) {
            value = this.$t('module.module.module')
          } else if (value == 3) {
            value = this.$t('asset.asset')
          }
        }
        return key + '：' + value
      }
    }
  },
  created () {
    if (localStorage.getItem('alertMessageProjectId')) {
      this.selectValue.projectIds = [Number(localStorage.getItem('alertMessageProjectId'))]
      this.searchCheckBox.projectIds = this.selectValue.projectIds.join(',')
    }
  },
  mounted () {
    if (localStorage.getItem('alertMessageProjectId')) {
      this.selectValue.projectIds = [Number(localStorage.getItem('alertMessageProjectId'))]
      // this.$refs.clickSearch.selectValueOut.projectIds = [localStorage.getItem('endpointProjectId')]
    }
    // this.getTitleSearch()
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
        this.queryChartDate()
      })
    },
    batchDel () {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete(this.url + '?ids=' + this.batchDeleteObjs.map(m => m.id).join(',') + '&state=' + this.state).then(response => {
          if (response.code === 200) {
            this.delFlag = true
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.getTableData()
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    del (row) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete(this.url + '?ids=' + row.id + '&state=' + this.state).then(response => {
          if (response.code === 200) {
            this.delFlag = true
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.getTableData()
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    messageDetail (row) {
      if (row.alertRule.type == 3) {
        return
      }
      this.$get('/alert/rule/' + row.alertRule.id).then(res => {
        this.currentMsg = { ...row, alertRule: { ...res.data } }
        this.graphShow = true
        this.$nextTick(() => {
          this.searchTimeDialog = [bus.computeTimezoneTime(new Date().getTime() - 1 * 60 * 60 * 1000), bus.computeTimezoneTime(new Date().getTime())]
          this.queryDate()
        })
      })
    },
    queryMessage (alertMessage) {
      if (!this.hasButton('alertMessage_view')) {
        return
      }
      this.$refs.dataList.showBottomBox(alertMessage, alertRule)
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
    queryChartDate () {
      const $temp = this
      const start = this.searchTimeDialog[0] ? this.searchTimeDialog[0] : bus.computeTimezoneTime(new Date().getTime() - 1 * 60 * 60 * 1000)
      const end = this.searchTimeDialog[1] ? this.searchTimeDialog[1] : bus.computeTimezoneTime(new Date().getTime())
      this.searchTimeDialog = [start, end]
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
        const paramStr = JSON.stringify(this.promQueryParamConvert(this.currentMsg))
        axiosArr.push(axios.get('/prom/api/v1/query_range?query=' + paramStr.substring(1, paramStr.length - 1) + '&start=' + this.$stringTimeParseToUnix(start) + '&end=' + this.$stringTimeParseToUnix(end) + '&step=' + step))
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
              }
            })
            this.$nextTick(() => {
              this.$refs.messageChart.setRandomColors(this.chartDatas.length)
              this.$refs.messageChart.setLegend(this.legend)
              this.$refs.messageChart.setSeries(this.chartDatas)
              this.$refs.messageChart.endLoading()
              this.$refs.messageChart.resize()
            })
          } catch (err) {
            // this.$message.error(err)
            this.$refs.messageChart.endLoading()
            this.chartLoading = false
          }
        })
      }
    },
    exportLog ({ limit, descending }) {
      const start = this.searchTimeDialog[0] ? this.searchTimeDialog[0] : bus.computeTimezoneTime(new Date().getTime() - 1 * 60 * 60 * 1000)
      const end = this.searchTimeDialog[1] ? this.searchTimeDialog[1] : bus.computeTimezoneTime(new Date().getTime())
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
      const start = this.searchTimeDialog[0] ? this.searchTimeDialog[0] : bus.computeTimezoneTime(new Date().getTime() - 1 * 60 * 60 * 1000)
      const end = this.searchTimeDialog[1] ? this.searchTimeDialog[1] : bus.computeTimezoneTime(new Date().getTime())
      this.expressions = [this.currentMsg.alertRule.expr]
      this.$get('/logs/loki/api/v1/query_range?format=1&query=' + this.currentMsg.alertRule.expr + '&start=' + this.$stringTimeParseToUnix(start) + '&end=' + this.$stringTimeParseToUnix(end) + '&limit=' + limit).then(res => {
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
      if (this.searchTime && this.searchTime.length > 1) {
        this.$set(this.searchLabel, 'startAt', this.timezoneToUtcTimeStr(this.searchTime[0]))
        this.$set(this.searchLabel, 'endAt', this.timezoneToUtcTimeStr(this.searchTime[1]))
      } else {
        delete this.searchLabel.startAt
        delete this.searchLabel.endAt
      }
      if (this.$route.path === '/alertMessage') {
        this.$set(this.searchLabel, 'statistics', 1)
      }/* else {
        delete this.searchLabel.statistics
      } */
      this.tools.loading = true
      if (state) {
        delete this.searchLabel.startAt
        delete this.searchLabel.endAt
      }
      this.$get(this.url, { ...this.searchLabel, ...this.searchCheckBox }).then(response => {
        this.tools.loading = false
        if (response.code == 200) {
          this.nowTime = this.utcTimeToTimezoneStr(response.time)
          this.tableData = response.data.list
          if (response.statistics && this.$route.path === '/alertMessage') {
            this.setSearchData(response.statistics)
          }
          /* const axiosAll = []
            this.$nextTick(() => {
              this.tableData.forEach((item) => {
                item.labels = JSON.parse(item.labels)
                if (!this.isBuildIn(item.alertRule)) {
                  const paramStr = JSON.stringify(this.promQueryParamConvert(item))
                  axiosAll.push(axios.get('/prom/api/v1/query?query=' + paramStr.substring(1, paramStr.length - 1).replace(/\+/g, '%2B').replace(/ /g, '%20').replace(/\\/g, '')))
                } else {
                  axiosAll.push('')
                }
              })
              axios.all(axiosAll).then(res => {
                res.forEach((item, index) => {
                  let current = []
                  const response2 = item.data
                  if (response2.data && response2.data.result && response2.data.result.length > 0) {
                    current = response2.data.result[0].value.map((item, i) => {
                      if (i == 0) {
                        return bus.computeTimezone(item)
                      } else {
                        return parseFloat(item).toFixed(2)
                      }
                    })
                  } else {
                    current = [null, null]
                  }
                  this.tableData[index].current = current
                })
                this.$set(this.tableData, [...this.tableData])
              })
            }) */
          this.deleteBox.ids = ''
          this.pageObj.total = response.data.total
        }
      })
    },
    setSearchData (statistics) {
      Object.keys(this.titleSearchList).forEach(key => {
        const keys = key === 'assetLabel' ? 'meta' : key
        this.titleSearchList[key].children = statistics[keys].map(d => { return { ...d, value: d.id } })
        this.detailSearchList[key].children = statistics[keys].map(d => { return { ...d, value: d.id } })
        if (this.titleSearchList[key].children.length === 0) {
          // delete this.titleSearchList[key]
          // delete this.detailSearchList[key]
        } else {
          this.titleSearchList[key].show = true
          this.detailSearchList[key].show = true
        }
        this.titleSearchList[key].show = true
        this.detailSearchList[key].show = true
      })
    },
    reloadTable (obj) {
      const params = JSON.parse(JSON.stringify(obj))
      if (this.detailType === 'view') {
        const obj = {}
        params.modelIds = params.modelIdsDetail
        params.fieldsDetail.forEach(item => {
          const arr = item.split('-')
          if (obj[arr[0]]) {
            obj[arr[0]].push(arr[1])
          } else {
            obj[arr[0]] = [arr[1]]
          }
        })
        params.fields = JSON.stringify(obj)
        if (params.fields === '{}') {
          params.fields = ''
        }
        delete params.modelIdsDetail
        delete params.fieldsDetail
      }
      Object.keys(params).forEach(key => {
        if (typeof params[key] === 'string') {
          this.searchCheckBox[key] = params[key] ? params[key] : null
        } else {
          params[key] && params[key].length > 0 ? this.searchCheckBox[key] = params[key].join(',') : this.searchCheckBox[key] = null
        }
      })
      if (!this.timer) {
        this.timer = setTimeout(() => {
          this.getTableData()
          clearTimeout(this.timer)
          this.timer = ''
        }, 1000)
      } else {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.getTableData()
          clearTimeout(this.timer)
          this.timer = ''
        }, 1000)
      }
    },
    promQueryParamConvert (alert) {
      const obj = { ...alert }
      let r = '(' + obj.alertRule.expr.replace(/\"/g, '\'') + ')'
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
    showExportDialog () {
      this.importBox.show = true
    },
    closeDialog () {
      this.importBox.show = false
      this.deleteBox.show = false
      this.$nextTick(() => {
        this.importResult = null
        this.importFileList = []
        this.importFile = null
        this.importBox.value = 1
        this.importBox.record = 'all'
      })
    },
    dialogClose () {
      this.graphShow = false
    },
    exportCur () {
      const searchLabel = Object.assign({}, this.searchLabel)
      searchLabel.format = this.importBox.format
      delete searchLabel.statistics
      this.$set(searchLabel, 'language', localStorage.getItem('nz-language') ? localStorage.getItem('nz-language') : 'en')
      this.exportExcel({ ...searchLabel, state: this.state })
      this.closeDialog()
    },
    exportAll () {
      const temp = JSON.parse(JSON.stringify(this.searchLabel))
      temp.pageSize = -1
      delete temp.statistics
      temp.format = this.importBox.format
      this.$set(temp, 'language', localStorage.getItem('nz-language') ? localStorage.getItem('nz-language') : 'en')
      this.exportExcel({ ...temp, state: this.state })
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
    deleteMessage () {},
    exportData () {
      if (this.importBox.record === 'all') {
        this.exportAll()
      } else if (this.importBox.record === 'current') {
        this.exportCur()
      } else if (this.importBox.record === 'records') {
        this.exportRecords()
      }
    },
    exportRecords () {
      const params = JSON.parse(JSON.stringify(this.searchLabel))
      params.format = this.importBox.format
      delete params.statistics
      if (this.params2) {
        Object.keys(this.params2).forEach(key => {
          if (params[key]) {
            if (params[key].prototype.toString.call(val) === '[object Object]') {
              Object.assign(params[key], this.params2[key])
            } else if (params[key].prototype.toString.call(val) === '[object Array]') {
              params[key].concat(this.params2[key])
            }
          } else {
            params[key] = this.params2[key]
          }
        })
      }
      params.pageSize = -1
      // if (this.importUrl.indexOf('endpoint') > -1){
      //   delete params.moduleId
      // }
      params.language = localStorage.getItem('nz-language') || 'en'
      params.format = this.importBox.format
      params.ids = this.batchDeleteObjs.map(item => item.id).join(',')
      this.exportExcel(this.exportUrl, params, this.exportFileName + '-' + this.getTimeString() + '.xlsx')
      this.closeDialog()
    }
  },
  destroyed () {
    localStorage.removeItem('alertMessageProjectId')
  }
}
</script>

<style scoped lang="scss">
  .active{
    border-bottom: 3px solid #fa901c;
    color: #333;
    cursor: default;
    font-weight: bold;
  }
  .list-page /deep/ .main-container{
    display: flex;
    flex-direction: column;
    /deep/ .nz-table2{
      flex: 1;
    }
  }
</style>
