<template>
  <div class="full-width-height">
    <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
      :tableId="tableId"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg"
      :tabs="tabs"
      :targetTab="targetTab"
      @changeTab="changeTab"
      @search="search"
      class="full-width-height"
    >
      <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
      <template v-slot:top-tool-right>
        <el-select v-model="state" class="margin-r-10" size="small" value-key="value" :disabled="from === fromRoute.alertSilence" @change="getTableData" popper-class="right-box-select-top right-public-box-dropdown-top" style="width: 110px">
          <el-option v-for="item in stateOptions" :key="item.value" :label="$t(item.label)" :value="item.value"></el-option>
        </el-select>
        <pick-time ref="pickTime" v-model="searchTimeHeader" :default-pick="defaultPick" :refresh-data-func="dateChange" :show-empty="true" :use-chart-unit="false" :use-refresh="true" :sign="sign"></pick-time>
      </template>
      <template v-slot>
        <alertMessageTable
          ref="dataTable"
          :api="url"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :custom-table-title="tools.customTableTitle"
          :height="subTableHeight"
          :now-time="nowTime"
          :table-data="tableData"
          :alertMessageTabNew="true"
          @del="del"
          @acknowledge="acknowledge"
          class="bottom-box__top"
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
<!--    <el-dialog id="viewGraphDialog"-->
<!--               :modal-append-to-body='false'-->
<!--               destroy-on-close-->
<!--               :title="$t('overall.detail')"-->
<!--               :visible.sync="graphShow"-->
<!--               class="line-chart-block-modal nz-dialog endpoint-dialog"-->
<!--               width="90%"-->
<!--               @close="dialogClose">-->
<!--      <el-popover-->
<!--        v-if="isError"-->
<!--        placement="top-start"-->
<!--        :close-delay=10-->
<!--        trigger="hover"-->
<!--        popper-class="chart-error-popper">-->
<!--        <div >{{errorContent}}</div>-->
<!--        <span slot="reference"  class="panel-info-corner panel-info-corner&#45;&#45;error">-->
<!--                <i class="nz-icon nz-icon-warning fa-model" ></i>-->
<!--                <span class="panel-info-corner-inner"></span>-->
<!--            </span>-->
<!--      </el-popover>-->
<!--      <div slot="title">-->
<!--        {{$t("project.endpoint.dialogTitle")}}-->
<!--        <div class="float-right panel-calendar dialog-tool" style="display: flex">-->
<!--          <pick-time v-model="searchTime" :refresh-data-func="queryDate" :use-chart-unit="false" :use-refresh="false" style="height: 28px;"></pick-time>-->
<!--        </div>-->
<!--      </div>-->
<!--      <div style="width: 100%;height: 100%" v-my-loading="chartLoading">-->
<!--        <chart v-if="resultType === 'matrix'" ref="messageChart" :unit="chartUnit" name="alertMessageChart"></chart>-->
<!--        <log-tab v-if="resultType === 'streamsFormat'" ref="logDetailScreen" :log-data="logData" :showSwitch="false" :tab-index="tabIndex" @exportLog="exportLog" @limitChange="queryLogData"></log-tab>-->
<!--      </div>-->
<!--    </el-dialog>-->
    <el-dialog
      id="viewGraphDialog"
      v-if="graphShow"
      :visible.sync="graphShow"
      :show-close="false"
      class="nz-dialog chart-fullscreen"
      destroy-on-close
      fullscreen
      :modal-append-to-body="false"
    >
      <alertMessageInfo
        :ref="'chart-fullscreen' + chartInfo.id"
        :chart-info="chartInfo"
        :from="fromRoute.alertMessage"
        :filter="{}"
        :currentMsg="currentMsg"
        :is-fullscreen="true"
        :time-range="searchTime"
        @showFullscreen="showFullscreen"
      ></alertMessageInfo>
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
import chartDataFormat from '@/components/chart/chartDataFormat'
import chart from '@/components/page/dashboard/overview/chart'
import { alertMessage as alertMessageConstant, fromRoute } from '@/components/common/js/constants'
import alertSilenceBox from '@/components/common/rightBox/alertSilenceBox'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'
import alertMessageInfo from '@/components/common/alert/alertMessageInfo'
import panelChart from '@/components/chart/panelChart'
import lodash from 'lodash'
import lineData from '@/components/chart/defaultLineData'
import logData from '@/components/chart/defaultLogData'

export default {
  name: 'alertMessageTab',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList,
    alertMessageTable,
    alertSilenceBox,
    chart,
    panelChart,
    alertMessageInfo
  },
  props: {
    from: String,
    sign: [Number, String]
  },
  watch: {
    obj: {
      immediate: true,
      handler (n) {
        if (n) {
          this.searchLabel = {}
          if (this.from === fromRoute.alertSilence) {
            this.state = '2'
          }
          this.searchLabel = {}
          // this.getTableData()
          setTimeout(() => {
            this.$refs.pickTime && this.$refs.pickTime.$refs.timePicker.refresh()
          }, 100)
        }
      }
    },
    orderBy: {
      immediate: true,
      handler (n) {
        if (n) {
          // console.log(n)
        }
      }
    }
  },
  data () {
    return {
      orderBy: '-id',
      stateOptions: alertMessageConstant.states,
      url: 'alert/message',
      urlNew: 'alert/message/query',
      alertSilenceUrl: '',
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
            name: this.$t('asset.id'),
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
      searchMsgSilence: { // 给搜索框子组件传递的信息
        searchLabelList: [
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
      searchTimeHeader: [bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - 24 * 7)), bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime()))), '7d'],
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
      errorContent: '',
      chartInfo: {},
      defaultPick: 10,
      defaultPickType: 'date',
      defaultPickVal: 7
    }
  },
  created () {
    if (this.from === fromRoute.alertSilence) {
      this.searchMsg = this.searchMsgSilence
    }
    this.$route.query.bottomSelectTime && this.renderDefaultParams()
  },
  methods: {
    renderDefaultParams () {
      sessionStorage.setItem('nz-reload', 0)
      const q = JSON.parse(this.$route.query.bottomSelectTime)
      this.state = q.state
      this.searchTimeHeader[0] = q.startAt ? this.momentTz(q.startAt) : ''
      this.searchTimeHeader[1] = q.endAt ? this.momentTz(q.endAt) : ''
      this.searchTimeHeader[2] = q.timeType
      if (!q.startAt && !q.timeType) {
        this.searchTimeHeader = ['', '', 'all']
      } else if (q.timeType === 'all') {
        this.searchTimeHeader = ['', '', 'all']
      }
      switch (this.searchTimeHeader[2]) {
        case '5m' :
          this.defaultPick = 1
          this.defaultPickType = 'minute'
          this.defaultPickVal = 5
          break
        case '15m' :
          this.defaultPick = 2
          this.defaultPickType = 'minute'
          this.defaultPickVal = 15
          break
        case '30m' :
          this.defaultPick = 3
          this.defaultPickType = 'minute'
          this.defaultPickVal = 30
          break
        case '1h' :
          this.defaultPick = 4
          this.defaultPickType = 'hour'
          this.defaultPickVal = 1
          break
        case '3h' :
          this.defaultPick = 5
          this.defaultPickType = 'hour'
          this.defaultPickVal = 3
          break
        case '6h' :
          this.defaultPick = 6
          this.defaultPickType = 'hour'
          this.defaultPickVal = 6
          break
        case '12h' :
          this.defaultPick = 7
          this.defaultPickType = 'hour'
          this.defaultPickVal = 12
          break
        // case '1d' :
        //   this.defaultPick = 8
        //   this.defaultPickType = 'hour'
        //   break
        case '24h' :
          this.defaultPick = 8
          this.defaultPickType = 'hour'
          this.defaultPickVal = 24
          break
        case '2d' :
          this.defaultPick = 9
          this.defaultPickType = 'date'
          this.defaultPickVal = 2
          break
        case '7d' :
          this.defaultPick = 10
          this.defaultPickType = 'date'
          this.defaultPickVal = 7
          break
        case '30d' :
          this.defaultPick = 11
          this.defaultPickType = 'date'
          this.defaultPickVal = 30
          break
        case 'all' :
          this.defaultPick = 12
          this.defaultPickType = 'all'
          this.defaultPickVal = 'all'
          break
        default:
          this.defaultPick = 0
      }
      // this.defaultPick = 11
      if (this.defaultPick && this.defaultPick !== 12) {
        this.setDefaultSearchTime('')
      }
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
        this.queryDate()
      })
    },
    del (row) {
      const self = this
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        let url = ''
        // if (this.from === fromRoute.alertSilence) {
        //   this.alertSilenceUrl = `/alert/silence/${this.obj.id}/rel`
        //   url = this.alertSilenceUrl
        // } else {
        //   url = this.url
        // }
        url = this.url
        this.$delete(url + '?ids=' + row.id + '&state=' + row.state).then(response => {
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
    dateChange () {
      this.setSearchTime('searchTimeHeader')
      this.getTableData()
    },
    setDefaultSearchTime () {
      const type = this.defaultPickType
      const val = this.defaultPickVal
      const key = 'searchTime'
      if (type === 'minute') {
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
        this.searchLabel.body = {
          q: ''
        }
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.$set(this.searchLabel.body, 'state', this.state)
      if (this.searchTimeHeader && this.searchTimeHeader.length > 1 && this.searchTimeHeader[0] && this.searchTimeHeader[1]) {
        this.$set(this.searchLabel.body, 'startAt', [bus.timeFormate(this.timezoneToUtcTime(bus.formateTimeToTime(this.searchTimeHeader[0])), 'YYYY-MM-DD HH:mm:ss')])
        this.$set(this.searchLabel.body, 'endAt', [bus.timeFormate(this.timezoneToUtcTime(bus.formateTimeToTime(this.searchTimeHeader[1])), 'YYYY-MM-DD HH:mm:ss')])
      } else {
        delete this.searchLabel.body.startAt
        delete this.searchLabel.body.endAt
      }
      this.tools.loading = true
      // if (state) {
      //   delete this.searchLabel.startAt
      //   delete this.searchLabel.endAt
      // }
      if (this.from === fromRoute.module) {
        this.searchLabel.body.moduleId = [this.obj.id]
      } else if (this.from === fromRoute.endpoint) {
        this.searchLabel.body.endpointId = [this.obj.id]
      } else if (this.from === fromRoute.asset) {
        this.searchLabel.body.assetId = [this.obj.id]
      } else if (this.from === fromRoute.alertRule) {
        this.searchLabel.body.ruleId = [this.obj.id]
      } else if (this.from === fromRoute.dc) {
        this.searchLabel.body.dcId = [this.obj.id]
      }
      let url = ''
      if (this.from === fromRoute.alertSilence) {
        // this.alertSilenceUrl = `/alert/silence/${this.obj.id}/rel`
        this.$set(this.searchLabel.body, 'state', this.state)
        this.$set(this.searchLabel.body, 'silenceId', [this.obj.id])
        url = this.urlNew
      } else {
        url = this.urlNew
      }
      const param = {
        ...this.searchLabel
      }
      // const path = this.fromRoute.alertMessage
      const routePathParams = this.$lodash.cloneDeep(param)
      delete routePathParams.statistics
      routePathParams.body.startAt = this.searchTimeHeader[0] ? this.momentStrToTimestamp(this.searchTimeHeader[0]) : ''
      routePathParams.body.endAt = this.searchTimeHeader[1] ? this.momentStrToTimestamp(this.searchTimeHeader[1]) : ''
      routePathParams.body.timeType = this.searchTimeHeader[2]
      if (!this.searchTimeHeader[2]) {
        routePathParams.body.startAt = this.searchTimeHeader[0] ? this.momentStrToTimestamp(this.searchTimeHeader[0]) : ''
        routePathParams.body.endAt = this.searchTimeHeader[1] ? this.momentStrToTimestamp(this.searchTimeHeader[1]) : ''
      } else {
        delete routePathParams.body.startAt
        delete routePathParams.body.endAt
      }
      const bottomSelectTime = JSON.stringify(routePathParams.body)
      routePathParams.body = JSON.stringify(routePathParams.body)
      const path = this.$route.path
      const urlQuery = this.$route.query
      this.$router.replace({ path, query: { ...urlQuery, bottomSelectTime } }).catch(err => {})
      const queryParams = {
        ...this.searchLabel,
        body: encodeURIComponent(JSON.stringify(this.searchLabel.body))
      }
      this.$get(url, queryParams).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          this.nowTime = response.time
          this.tableData = response.data.list
          this.deleteBox.ids = ''
          this.pageObj.total = response.data.total
        } else {
          this.$message.error(response.msg)
        }
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
      this.$get('/alert/rule/' + row.alertRule.id).then(res => {
        this.currentMsg = { ...row, alertRule: { ...res.data } }
        this.$nextTick(() => {
          this.searchTime = [bus.computeTimezoneTime(new Date().getTime() - 1 * 60 * 60 * 1000), bus.computeTimezoneTime(new Date().getTime())]
          this.$store.dispatch('dispatchPanelTime', {
            time: this.searchTime,
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
    deleteMessage () {
      this.$refs.remarkForm.validate(valid => {
        if (valid) {
          let url = ''
          if (this.from === fromRoute.alertSilence) {
            this.alertSilenceUrl = `/alert/silence/${this.obj.id}/rel`
            url = this.alertSilenceUrl
          } else {
            url = this.url
          }
          this.$put(url, this.deleteBox).then(res => {
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
      this.searchLabel = {
        body: searchObj
      }
      this.pageObj.pageNo = 1
      if (orderBy) {
        this.$set(this.searchLabel, 'orderBy', orderBy)
      }
      if (this.$refs.dataTable) {
        this.$refs.dataTable.$refs.dataTable.bodyWrapper.scrollTop = 0
      }
      // this.getTableData()
      this.$refs.pickTime && this.$refs.pickTime.$refs.timePicker.refresh()
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
      let chartInfo = {}
      const severityData = JSON.parse(localStorage.getItem('nz-severityDataWeight'))
      const conditionArr = JSON.parse(this.currentMsg.alertRule.condition)
      if (this.currentMsg.alertRule.type === 1 || this.currentMsg.alertRule.type === 3) {
        chartInfo = lodash.cloneDeep(lineData)
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
        chartInfo = lodash.cloneDeep(logData)
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
    showText (row) {
      this.dialogShowText = true
      this.dialogText = row.alertRule.trbShot
    },
    showFullscreen (show, chartInfo) {
      this.chartInfo = chartInfo
      this.graphShow = show
    }
  }
}
</script>
