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
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg"
      @search="search"
      v-loading="tools.loading"
    >
      <template v-slot:top-tool-right>
        <el-select v-model="state" class="margin-r-10" size="small" value-key="value" @change="getTableData">
          <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <pick-time v-model="searchTime" :default-pick="12" :refresh-data-func="getTableData" :show-empty="true" :use-chart-unit="false" :use-refresh="false"></pick-time>
        <button id="roles-add" v-has="'alertMessage_view'" :title="$t('overall.exportExcelLower')" class="top-tool-btn margin-r-10"
                type="button" @click="showExportDialog">
          <i class="nz-icon-download1 nz-icon"></i>
        </button>
        <delete-button id="alert-msg-batch-delete" v-has="'alertMessage_expired'" :api="url" :clickFunction="batchDel" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <alert-message-table
          ref="dataTable"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :now-time="nowTime"
          :table-data="tableData"
          @del="del"
          @edit="edit"
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
      <el-dialog :modal-append-to-body='false' :show-close="true" :title="importBox.title" :visible.sync="importBox.show" class="nz-dialog" width="300px" @close="closeDialog">
        <div class="upload-body">
          <button id="alert-msg-exportcur" class="el-button el-button--default el-button--small" @click="exportCur">
            <span>{{$t('overall.exportCur')}}</span>
          </button>
          <button id="alert-msg-exportall" class="el-button el-button--default el-button--small" @click="exportAll">
            <span>{{$t('overall.exportAll')}}</span>
          </button>
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
               :title="$t('overall.detail')"
               :visible.sync="graphShow"
               class="line-chart-block-modal nz-dialog endpoint-dialog"
               width="90%"
               @close="dialogClose">
      <div slot="title">
        {{$t("project.endpoint.dialogTitle")}}
        <div class="float-right panel-calendar dialog-tool" style="display: flex">
          <pick-time v-model="searchTimeDialog" :refresh-data-func="queryChartDate" :use-chart-unit="false" :use-refresh="false" style="height: 28px;" @unitChange="chartUnitChange"></pick-time>
        </div>
      </div>
      <chart ref="messageChart" :unit="chartUnit" name="alertMessageChart"></chart>
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
import { alertMessage as alertMessageConstant } from '@/components/common/js/constants'
import alertSilenceBox from '@/components/common/rightBox/alertSilenceBox'
export default {
  name: 'alertList',
  components: {
    alertMessageTable,
    pickTime,
    chart,
    nzDataList,
    deleteButton,
    alertSilenceBox
  },
  mixins: [dataListMixin],
  data () {
    return {
      stateOptions: alertMessageConstant.states,
      state: '1',
      url: 'alert/message',
      // 导出相关
      importBox: { show: false, title: this.$t('overall.exportExcel') },
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
      nowTime: ''
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
  methods: {
    labelsSort (obj) {
      const buildIn = ['asset', 'endpoint', 'module', 'project', 'datacenter']
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
      this.$get('/alert/rule/' + row.alertRule.id).then(res => {
        this.currentMsg = { ...row, alertRule: { ...res.data } }
        this.graphShow = true
        this.$nextTick(() => {
          this.queryChartDate()
        })
      })
    },
    queryMessage (alertMessage) {
      if (!this.hasButton('alertMessage_view')) {
        return
      }
      this.$refs.dataList.showBottomBox(alertMessage, alertRule)
    },
    queryChartDate () {
      const $temp = this
      const start = this.searchTime[0] ? this.searchTime[0] : bus.computeTimezoneTime(new Date().getTime() - 1 * 30 * 60 * 1000)
      const end = this.searchTime[1] ? this.searchTime[1] : bus.computeTimezoneTime(new Date().getTime())
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
            })
          } catch (err) {
            // this.$message.error(err)
            this.$refs.messageChart.endLoading()
          }
        })
      }
    },
    getTableData (state) {
      if (state) {
        this.state = state
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
      this.tools.loading = true
      if (state) {
        delete this.searchLabel.startAt
        delete this.searchLabel.endAt
      }
      this.$get(this.url, this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code == 200) {
          this.nowTime = this.utcTimeToTimezoneStr(response.time)
          this.tableData = response.data.list
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
    promQueryParamConvert (obj) {
      let r = '(' + obj.alertRule.expr.replace(/\"/g, '\'') + ')'
      let intoLabels = false
      obj.labels = JSON.parse(obj.labels)
      if (Object.keys(obj.labels).length > 0) {
        r += (function () {
          let group = ' and ' + '(group({'
          let by = ' by ('

          for (const k in obj.labels) {
            if (k != 'alertname' && k != 'severity' && k != 'severity_id') {
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
    },
    dialogClose () {
      this.graphShow = false
    },
    exportCur () {
      const searchLabel = Object.assign({}, this.searchLabel)
      this.$set(searchLabel, 'language', localStorage.getItem('nz-language') ? localStorage.getItem('nz-language') : 'en')
      this.exportExcel({ ...searchLabel, state: this.state })
      this.closeDialog()
    },
    exportAll () {
      const temp = JSON.parse(JSON.stringify(this.searchLabel))
      temp.pageSize = -1
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
    deleteMessage () {}
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
</style>
