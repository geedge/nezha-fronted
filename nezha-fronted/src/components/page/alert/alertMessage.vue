<template>
  <div class="alert-message-list">
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.alertMessage"
      :nz-table-height-offset="alertMessageNzTableHeightOffset"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :search-msg="searchMsg"
      @search="search"
      v-my-loading="tools.loading"
    >
      <template v-slot:top-tool-right>
        <el-select v-model="state" class="margin-r-10" size="small" value-key="value" @change="getTableData" popper-class="right-box-select-top right-public-box-dropdown-top" style="width: 100px">
          <el-option v-for="item in stateOptions" :key="item.value" :label="$t(item.label)" :value="item.value"></el-option>
        </el-select>
        <pick-time ref="pickTime" v-model="searchTime" sign="message" :default-pick="defaultPick" :refresh-data-func="dateChange" :show-empty="true" :use-chart-unit="false" :use-refresh="true"></pick-time>
        <button id="roles-add" v-has="'alertMessage_view'" :title="$t('overall.exportExcel')" class="top-tool-btn margin-r-10" type="button" @click="showExportDialog">
          <i class="nz-icon-download1 nz-icon"></i>
        </button>
         <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="model"
          :params="searchLabel"
          :params2="searchCheckBox"
          export-file-name="AlertMessage"
          class="top-tool-export margin-r-10"
          @afterImport="getTableData"
          v-has="['alertMessage_delete','alertMessage_expired']"
        >
          <template v-slot:before>
            <div>
              <el-dropdown-item :disabled="batchDeleteObjs.length==0" :class="'nz-el-dropdown-menu-item'">
                <delete-button
                  ref="deleteButton"
                  :single="false"
                  :from="'alertMessage'"
                  :forceDeleteShow="false"
                  :deleteTitle="'alert.alertMessage'"
                  id="alert-msg-batch-delete"
                  v-has="'alertMessage_delete'"
                  :api="url"
                  :clickFunction="batchDel"
                  :delete-objs="batchDeleteObjs"
                  @after="getTableData"
                  @before="delFlag=true"
                  :title="$t('overall.batchDel')"
                  :type="'link'"
                ></delete-button>
              </el-dropdown-item>
              <el-dropdown-item :disabled="batchDeleteObjs.length==0">
                <div id="alert-msg-batch-ack" v-has="'alertMessage_expired'" @click="batchAck"><i class="nz-icon nz-icon-queren"></i>{{$t('overall.batchAck')}}</div>
              </el-dropdown-item>
            </div>
          </template>
        </top-tool-more-options>

      </template>
      <template v-slot:search >
        <click-search ref="clickSearch" :select-value.sync="selectValue" :title-search-list="titleSearchList" @reload="reloadTable"/>
      </template>
      <template v-slot:default="slotProps">
        <alert-message-table
          ref="dataTable"
          :orderByFa="orderBy"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :now-time="nowTime"
          :table-data="tableData"
          :loading="tools.loading"
          @del="del"
          @acknowledge="acknowledge"
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
      <el-dialog :modal-append-to-body='false' :show-close="true" :title="importBox.title" :visible.sync="importBox.show" class="nz-dialog" width="580px" @close="closeDialog">
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
            <button :id="'-xlsx-import-export'" v-has="'alertMessage_expired'" class="nz-btn el-button--small nz-btn-style-normal" @click="exportData">
              <span style="text-transform:Capitalize">{{$t('overall.exportExcel')}}</span>
            </button>
            <button :id="'-xlsx-import-close'" class="nz-btn el-button el-button--small el-button--default" @click="closeDialog">
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
    <el-dialog
      id="viewGraphDialog"
      v-if="graphShow"
      :visible.sync="graphShow"
      :show-close="false"
      class="nz-dialog chart-fullscreen"
      destroy-on-close
      fullscreen
      append-to-body
    >
      <alertMessageInfo
        :ref="'chart-fullscreen' + chartInfo.id"
        :chart-info="chartInfo"
        :from="fromRoute.alertMessage"
        :filter="{}"
        :currentMsg="currentMsg"
        :is-fullscreen="true"
        :time-range="searchTimeDialog"
        @showFullscreen="showFullscreen"
        :now-time="nowTime"
      ></alertMessageInfo>
    </el-dialog>
    <!--全屏-->
    <el-dialog class="nz-dialog table-chart-dialog" :title="$t('alert.config.trbShot')" :visible.sync="dialogShowText" width="96%"  @close="dialogShowText = false" :modal-append-to-body="false">
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
import chartDataFormat from '@/components/chart/chartDataFormat'
import chart from '@/components/page/dashboard/overview/chart'
import { alertMessage as alertMessageConstant, fromRoute } from '@/components/common/js/constants'
import alertSilenceBox from '@/components/common/rightBox/alertSilenceBox'
import clickSearch from '@/components/common/labelFilter/clickSearch'
import routerPathParams from '@/components/common/mixin/routerPathParams'
import alertMessageInfo from '@/components/common/alert/alertMessageInfo'
import lineData from '@/components/chart/defaultLineData'
import logData from '@/components/chart/defaultLogData'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'

export default {
  name: 'alertMessage',
  components: {
    alertMessageTable,
    pickTime,
    chart,
    nzDataList,
    deleteButton,
    alertSilenceBox,
    clickSearch,
    alertMessageInfo,
    topToolMoreOptions
  },
  mixins: [dataListMixin, routerPathParams],
  data () {
    return {
      orderBy: '-id',
      chartLoading: false,
      chartInfo: {},
      alertMessageNzTableHeightOffset: 242,
      stateOptions: alertMessageConstant.states,
      state: '1',
      dialogShowText: false,
      dialogText: '',
      url: '/alert/message/query',
      // 导出相关
      importBox: { show: false, title: this.$t('overall.exportExcel'), type: 1, record: 'all', format: 1 },
      deleteBox: { show: false, ids: '', remark: '', state: 2 },
      // 详情相关
      graphShow: false,
      chartDatas: [],
      sameLabels: ['instance', 'module', 'project', 'asset', 'endpoint', 'datacenter'],
      legend: [],
      searchTime: [bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - 24 * 7)), bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime()))), '7d'],
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
            name: this.$t('asset.id'),
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
            name: this.$t('asset.endpoint'),
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
          }, {
            name: this.$t('overall.acknowledge'),
            type: 'select',
            label: 'ack',
            readonly: true,
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
          label: this.$t('project.project.projectName'),
          key: 'projectIds',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1
        },
        module: {
          label: this.$t('overall.module'),
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
          label: this.$t('project.project.projectName'),
          key: 'projectIds',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1
        },
        module: {
          label: this.$t('overall.module'),
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
      ],
      errorContent: '',
      isError: false,
      defaultPick: 10,
      defaultPickType: 'date',
      defaultPickVal: 7
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
    this.initQueryFromPath('', this.renderDefaultParams)
  },
  mounted () {
    if (localStorage.getItem('alertMessageProjectId')) {
      this.selectValue.projectIds = [Number(localStorage.getItem('alertMessageProjectId'))]
      // this.$refs.clickSearch.selectValueOut.projectIds = [localStorage.getItem('endpointProjectId')]
    }
    // this.getTitleSearch()
  },
  methods: {
    renderDefaultParams () {
      sessionStorage.setItem('nz-reload', 0)
      const q = JSON.parse(this.$route.query.body)
      this.state = q.state
      this.searchTime[0] = q.startAt ? this.momentTz(q.startAt) : ''
      this.searchTime[1] = q.endAt ? this.momentTz(q.endAt) : ''
      this.searchTime[2] = q.timeType
      if (!q.startAt && !q.timeType) {
        this.searchTime = ['', '', 'all']
      } else if (q.timeType === 'all') {
        this.searchTime = ['', '', 'all']
      }
      this.initTimeType(this.searchTime[2])
      if (this.defaultPick && this.defaultPick !== 12) {
        this.setDefaultSearchTime('')
      }
      // this.defaultPick = 11
    },
    batchAck () {
      if (this.batchDeleteObjs.length < 1) return
      this.$confirm(this.$t('tip.confirmBatchAck', [this.batchDeleteObjs.length]), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.delFlag = true
        const params = []
        this.batchDeleteObjs.forEach(item => {
          const obj = {
            id: item.id,
            ack: 1
          }
          params.push(obj)
        })
        this.$put('alert/message/ack', params).then(response => {
          if (response.code == 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.ackSuccess') })
          } else {
            this.$message.error(response.msg)
          }
          this.getTableData()
        })
      })
    },
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
        const arrState = []
        const promiseArr = []
        this.batchDeleteObjs.forEach(item => {
          if (arrState.indexOf(item.state) === -1) {
            arrState.push(item.state)
          }
        })
        arrState.forEach(state => {
          const batchDeleteArr = this.batchDeleteObjs.filter(m => m.state === state)
          promiseArr.push(this.$delete('/alert/message' + '?ids=' + batchDeleteArr.map(m => m.id).join(',') + '&state=' + state))
        })
        Promise.all(promiseArr)
          .then(res => {
            let error = ''
            let flag = false
            for (let i = 0; i < res.length; i++) {
              if (res[i].code !== 200 && !flag) {
                error = res[i].msg
                flag = true
              }
            }
            if (!flag) {
              this.delFlag = true
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
              this.getTableData()
            } else {
              this.$message.error(error)
            }
          })
          .catch(response => {
            this.$message.error(response.msg)
          })
      })
    },
    del (row) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('/alert/message' + '?ids=' + row.id + '&state=' + row.state).then(response => {
          if (response.code === 200) {
            this.delFlag = true
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.getTableData()
          } else if (response.data && response.data.list && response.code !== 200) {
            this.delFlag = true
            this.$refs.deleteButton && this.$refs.deleteButton.showProcess(response.data.list)
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    acknowledge (row) {
      this.$confirm(this.$t('tip.confirmAck'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        const params = []
        const obj = {}
        obj.id = row.id
        obj.ack = 1
        params.push(obj)
        this.$put('alert/message/ack', params).then(response => {
          if (response.code == 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.ackSuccess') })
            this.getTableData()
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    messageDetail (row) {
      // this.sign = Number(row.alertRule.id)
      this.$get('/alert/rule/' + row.alertRule.id).then(res => {
        this.currentMsg = { ...row, alertRule: { ...res.data } }
        this.$nextTick(() => {
          this.searchTimeDialog = [bus.computeTimezoneTime(new Date().getTime() - 1 * 60 * 60 * 1000), bus.computeTimezoneTime(new Date().getTime())]
          this.$store.dispatch('dispatchPanelTime', {
            time: this.searchTimeDialog,
            nowTimeType: {
              id: 4,
              text: this.$t('dashboard.dashboard.lastOneHour'),
              type: 'hour',
              value: 1
            }
          })
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
      let chartInfo = {}
      const severityData = JSON.parse(localStorage.getItem('nz-severityDataWeight'))
      const conditionArr = JSON.parse(this.currentMsg.alertRule.condition)
      if (this.currentMsg.alertRule.type === 1 || this.currentMsg.alertRule.type === 3) {
        chartInfo = this.$lodash.cloneDeep(lineData)
        chartInfo.elements = [{}]
        if (conditionArr.length) {
          chartInfo.param.enable.thresholds = true
          chartInfo.param.thresholds = conditionArr.map(item => {
            const findItem = severityData.find(severity => severity.id === item.id)
            if (findItem) {
              item.color = findItem.color
              item.label = findItem.name
            }
            return item
          }).filter(item => item.value)
        }
        chartInfo.elements && (chartInfo.elements[0].expression = this.currentMsg.alertRule.expr.replace(/\"/g, '\'').replace(/\r|\n+/g, ''))
      } else if (this.currentMsg.alertRule.type === 2) {
        chartInfo = this.$lodash.cloneDeep(logData)
        chartInfo.elements = [{}]
        if (conditionArr.length) {
          chartInfo.param.enable.thresholds = true
          chartInfo.param.thresholds = conditionArr.map(item => {
            const findItem = severityData.find(severity => severity.id === item.id)
            if (findItem) {
              item.color = findItem.color
              item.label = findItem.name
            }
            return item
          }).filter(item => item.value)
        }
        chartInfo.elements && (chartInfo.elements[0].expression = this.currentMsg.alertRule.expr.replace(/\r|\n+/g, ''))
      }

      chartInfo.id = this.currentMsg.id
      chartInfo.name = this.currentMsg.alertRule.name
      chartInfo.isAlertMessage = true
      chartInfo.alertRule = this.currentMsg.alertRule
      chartInfo.elements && (chartInfo.elements[0].filter = encodeURIComponent(decodeURIComponent(this.promQueryParamLabels(this.currentMsg.labels))))
      chartInfo.unit = this.currentMsg.alertRule.unit
      this.showFullscreen(true, chartInfo)
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
                symbolSize: 8,
                showSymbol: false,
                smooth: 0.2, // 曲线变平滑
                data: [],
                lineStyle: {
                  width: 2,
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

    dateChange () {
      this.setSearchTime('searchTime')
      this.getTableData()
    },
    setDefaultSearchTime () {
      const type = this.defaultPickType
      const val = this.defaultPickVal
      const key = 'searchTime'
      const oneDTimestamp = 24 * 60 * 60 * 1000
      if (type === 'relative') {
        const now = new Date(bus.computeTimezone(new Date().getTime()))
        let start = bus.timeFormate(now, 'YYYY-MM-DD') // 使用固定时间格式 方便添加  00:00:00 23:59:59
        let end = bus.timeFormate(now, 'YYYY-MM-DD HH:mm:ss')
        let unit = ''
        if (this.defaultPick === 13) { // today
          unit = 't'
          end = start + ' 23:59:59'
          start += ' 00:00:00'
          start = this.momentTz(this.momentStrToTimestamp(start, 'YYYY-MM-DD HH:mm:ss'))
          end = this.momentTz(this.momentStrToTimestamp(end, 'YYYY-MM-DD HH:mm:ss'))
        }
        if (this.defaultPick === 14) { // Yesterday
          unit = 't'
          end = start + ' 23:59:59'
          start += ' 00:00:00'
          start = this.momentTz(this.momentStrToTimestamp(start, 'YYYY-MM-DD HH:mm:ss') - oneDTimestamp)
          end = this.momentTz(this.momentStrToTimestamp(end, 'YYYY-MM-DD HH:mm:ss') - oneDTimestamp)
        }
        if (this.defaultPick === 15) { // The day before yesterday
          unit = 't'
          end = start + ' 23:59:59'
          start += ' 00:00:00'
          start = this.momentTz(this.momentStrToTimestamp(start, 'YYYY-MM-DD HH:mm:ss') - 2 * oneDTimestamp)
          end = this.momentTz(this.momentStrToTimestamp(end, 'YYYY-MM-DD HH:mm:ss') - 2 * oneDTimestamp)
        }
        if (this.defaultPick === 16) { // This day last week
          unit = 't'
          end = start + ' 23:59:59'
          start += ' 00:00:00'
          start = this.momentTz(this.momentStrToTimestamp(start, 'YYYY-MM-DD HH:mm:ss') - 7 * oneDTimestamp)
          end = this.momentTz(this.momentStrToTimestamp(end, 'YYYY-MM-DD HH:mm:ss') - 7 * oneDTimestamp)
        }
        if (this.defaultPick === 17) { // This week
          unit = 'w'
          const noTime = this.momentStrToTimestamp(start + ' 00:00:00', 'YYYY-MM-DD HH:mm:ss')
          const nowDay = this.momentDays(noTime)
          end = start + ' 23:59:59'
          if (nowDay == 0) {
            start = this.momentSetDay(noTime, -6, 'YYYY-MM-DD')
            end = this.momentSetDay(noTime, 0, 'YYYY-MM-DD')
          } else {
            start = this.momentSetDay(noTime, 1, 'YYYY-MM-DD')
            end = this.momentSetDay(noTime, 7, 'YYYY-MM-DD')
          }
          start += ' 00:00:00'
          end += ' 23:59:59'
          start = this.momentTz(this.momentStrToTimestamp(start, 'YYYY-MM-DD HH:mm:ss'))
          end = this.momentTz(this.momentStrToTimestamp(end, 'YYYY-MM-DD HH:mm:ss'))
        }
        if (this.defaultPick === 18) { // Previous week
          unit = 'w'
          let noTime = this.momentStrToTimestamp(start + ' 00:00:00', 'YYYY-MM-DD HH:mm:ss')
          noTime = noTime - 7 * oneDTimestamp
          const nowDay = this.momentDays(noTime)
          if (nowDay == 0) { // 判断当前是否是周天 周天则为 -6 - 0 非周天 则是 1 - 7
            start = this.momentSetDay(noTime, -6, 'YYYY-MM-DD')
            end = this.momentSetDay(noTime, 0, 'YYYY-MM-DD')
          } else {
            start = this.momentSetDay(noTime, 1, 'YYYY-MM-DD')
            end = this.momentSetDay(noTime, 7, 'YYYY-MM-DD')
          }
          start += ' 00:00:00'
          end += ' 23:59:59'
          start = this.momentTz(this.momentStrToTimestamp(start, 'YYYY-MM-DD HH:mm:ss'))
          end = this.momentTz(this.momentStrToTimestamp(end, 'YYYY-MM-DD HH:mm:ss'))
        }
        if (this.defaultPick === 19) { // this month
          unit = 'm'
          const noTime = this.momentStrToTimestamp(start + ' 00:00:00', 'YYYY-MM-DD HH:mm:ss')
          const endTime = this.momentStrToTimestamp(start + ' 23:59:59', 'YYYY-MM-DD HH:mm:ss')
          start = this.momentSetMonthDate(noTime, 1)
          end = this.momentSetMonthDate(endTime, 31)
        }
        if (this.defaultPick === 20) { // Previous month 需要判断当前是否是 1号
          unit = 'm'
          const noTime = this.momentStrToTimestamp(start + ' 00:00:00', 'YYYY-MM-DD HH:mm:ss')
          end = this.momentStrToTimestamp(this.momentSetMonthDate(noTime, 1)) - 1000 // 当月1号 00:00:00 减1s 则是上月最后一天 23:59:59
          start = this.momentSetMonthDate(end, 1, 'YYYY-MM-DD') + ' 00:00:00'
          start = this.momentTz(this.momentStrToTimestamp(start, 'YYYY-MM-DD HH:mm:ss'))
          end = this.momentTz(end)
        }
        this.$set(this[key], 0, start)
        this.$set(this[key], 1, end)
        this.$set(this[key], 2, val + unit)
      } else if (type === 'minute') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setMinutes(new Date(bus.computeTimezone(new Date().getTime())).getMinutes() - val))
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())))
        this.$set(this[key], 0, startTime)
        this.$set(this[key], 1, endTime)
        this.$set(this[key], 2, val + 'm')
      } else if (type === 'hour') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - val))
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())))
        this.$set(this[key], 0, startTime)
        this.$set(this[key], 1, endTime)
        this.$set(this[key], 2, val + 'h')
      } else if (type === 'date') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setDate(new Date(bus.computeTimezone(new Date().getTime())).getDate() - val))
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())))
        this.$set(this[key], 0, startTime)
        this.$set(this[key], 1, endTime)
        this.$set(this[key], 2, val + 'd')
      }
    },
    getTableData (state) {
      if (state) {
        this.state = state
      }
      if (this.orderBy) {
        this.$set(this.searchLabel, 'orderBy', this.orderBy)
      } else {
        delete this.searchLabel.orderBy
      }
      if (!this.searchLabel.body) {
        this.searchLabel.body = {}
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      // this.$set(this.searchLabel, 'state', this.state)
      if (this.searchTime && this.searchTime.length > 1 && this.searchTime[0] && this.searchTime[1]) {
        this.$set(this.searchLabel.body, 'startAt', [bus.timeFormate(this.timezoneToUtcTime(bus.formateTimeToTime(this.searchTime[0])), 'YYYY-MM-DD HH:mm:ss')])
        this.$set(this.searchLabel.body, 'endAt', [bus.timeFormate(this.timezoneToUtcTime(bus.formateTimeToTime(this.searchTime[1])), 'YYYY-MM-DD HH:mm:ss')])
      } else {
        delete this.searchLabel.body.startAt
        delete this.searchLabel.body.endAt
      }
      this.$set(this.searchLabel.body, 'state', this.state)
      if (this.$route.path === '/alertMessage') {
        this.$set(this.searchLabel, 'statistics', 1)
      }/* else {
        delete this.searchLabel.statistics
      } */
      this.tools.loading = true
      // if (state) {
      //   delete this.searchLabel.startAt
      //   delete this.searchLabel.endAt
      // }
      const param = {
        ...this.searchLabel
      }
      const path = this.fromRoute.alertMessage
      const routePathParams = JSON.parse(JSON.stringify(param))
      delete routePathParams.statistics
      if (!this.searchTime[2]) {
        routePathParams.body.startAt = this.searchTime[0] ? this.momentStrToTimestamp(this.searchTime[0]) : ''
        routePathParams.body.endAt = this.searchTime[1] ? this.momentStrToTimestamp(this.searchTime[1]) : ''
      } else {
        delete routePathParams.body.startAt
        delete routePathParams.body.endAt
      }
      routePathParams.body.timeType = this.searchTime[2]
      routePathParams.body = JSON.stringify(routePathParams.body)
      this.updatePath(routePathParams, path)
      const queryParams = {
        ...this.searchLabel,
        body: encodeURIComponent(JSON.stringify(this.searchLabel.body))
      }
      this.$get('/alert/message/query', { ...queryParams }).then(response => {
        this.tools.loading = false
        if (response.code == 200) {
          this.nowTime = response.time
          response.data.list.forEach((item) => {
            const labels = JSON.parse(item.labels)
            if (labels) {
              Object.keys(labels).forEach((key) => {
                if (item[key] && item[key].id) {
                  item.position = {}
                  item.loading = false
                }
              })
            }
          })
          this.tableData = response.data.list
          if (response.statistics && this.$route.path === '/alertMessage') {
            this.setSearchData(response.statistics)
          }
          this.deleteBox.ids = ''
          this.pageObj.total = response.data.total
        } else {
          this.$message.error(response.msg)
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
      this.pageObj.pageNo = 1
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
          this.scrollbarToTop()
        }, 1000)
      } else {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.getTableData()
          clearTimeout(this.timer)
          this.timer = ''
          this.scrollbarToTop()
        }, 1000)
      }
    },
    scrollbarToTop () {
      this.$nextTick(() => {
        const wraps = document.querySelectorAll('.el-table__body-wrapper')
        wraps.forEach(wrap => {
          if (wrap) {
            wrap.scrollTop = 0
            wrap.scrollLeft = 0
          }
        })
      })
    },
    promQueryParamConvert (alert) {
      const obj = { ...alert }
      let r = '(' + obj.alertRule.expr.replace(/\"/g, '\'').replace(/\r|\n+/g, '') + ')'
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
      const filterArr = ['alertname', 'severity_id', 'severity', 'rule_type', 'rule_id', 'rule_name']
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
      if (this.searchCheckBox) {
        Object.keys(this.searchCheckBox).forEach(key => {
          if (searchLabel[key]) {
            if (searchLabel[key].prototype.toString.call(val) === '[object Object]') {
              Object.assign(searchLabel[key], this.searchCheckBox[key])
            } else if (searchLabel[key].prototype.toString.call(val) === '[object Array]') {
              searchLabel[key].concat(this.searchCheckBox[key])
            }
          } else {
            searchLabel[key] = this.searchCheckBox[key]
          }
        })
      }
      searchLabel.body = encodeURIComponent(JSON.stringify(this.searchLabel.body))
      this.$set(searchLabel, 'language', localStorage.getItem('nz-language') ? localStorage.getItem('nz-language') : 'en')
      this.exportExcel('alert/message/export', { ...searchLabel, state: this.state })
      this.closeDialog()
    },
    exportAll () {
      const temp = JSON.parse(JSON.stringify(this.searchLabel))
      temp.pageSize = -1
      delete temp.statistics
      temp.format = this.importBox.format
      if (this.searchCheckBox) {
        Object.keys(this.searchCheckBox).forEach(key => {
          if (temp[key]) {
            if (temp[key].prototype.toString.call(val) === '[object Object]') {
              Object.assign(temp[key], this.searchCheckBox[key])
            } else if (temp[key].prototype.toString.call(val) === '[object Array]') {
              temp[key].concat(this.searchCheckBox[key])
            }
          } else {
            temp[key] = this.searchCheckBox[key]
          }
        })
      }
      temp.body = encodeURIComponent(JSON.stringify(this.searchLabel.body))
      this.$set(temp, 'language', localStorage.getItem('nz-language') ? localStorage.getItem('nz-language') : 'en')
      this.exportExcel('alert/message/export', { ...temp, state: this.state })
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
    exportExcel (url, params, fileName) {
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
      this.searchLabel = {
        body: searchObj
      }
      this.pageObj.pageNo = 1
      // for (const item in searchObj) {
      //   if (searchObj[item]) {
      //     if (item == 'alertMessageState') {
      //       this.$set(this.searchLabel, 'state', searchObj[item])
      //     } else {
      //       this.$set(this.searchLabel, item, searchObj[item])
      //     }
      //   }
      // }
      if (orderBy) {
        this.$set(this.searchLabel, 'orderBy', orderBy)
      }
      if (this.$refs.dataTable) {
        this.$refs.dataTable.$refs.dataTable.bodyWrapper.scrollTop = 0
      }
      // this.getTableData()
      this.$refs.pickTime && this.$refs.pickTime.$refs.timePicker.refresh()
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
      if (this.searchCheckBox) {
        Object.keys(this.searchCheckBox).forEach(key => {
          if (params[key]) {
            if (params[key].prototype.toString.call(val) === '[object Object]') {
              Object.assign(params[key], this.searchCheckBox[key])
            } else if (params[key].prototype.toString.call(val) === '[object Array]') {
              params[key].concat(this.searchCheckBox[key])
            }
          } else {
            params[key] = this.searchCheckBox[key]
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
      params.body = encodeURIComponent(JSON.stringify(this.searchLabel.body))
      this.exportExcel(this.exportUrl, params, this.exportFileName + '-' + this.getTimeString() + '.xlsx')
      this.closeDialog()
    },
    showFullscreen (show, chartInfo) {
      this.chartInfo = chartInfo
      this.graphShow = show
    }
  },
  beforeDestroy () {
    clearTimeout(this.timer)
  },
  destroyed () {
    localStorage.removeItem('alertMessageProjectId')
  }
}
</script>
