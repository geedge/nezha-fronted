<template>
  <div class="full-width-height">
    <nz-bottom-data-list
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
        <el-select v-model="state" class="margin-r-10" size="small" value-key="value" @change="getTableData">
          <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </template>
      <template v-slot>
        <alertMessageTable
          ref="dataTable"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :now-time="nowTime"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
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
               :title="$t('overall.detail')"
               :visible.sync="graphShow"
               class="line-chart-block-modal nz-dialog endpoint-dialog"
               width="90%"
               @close="dialogClose">
      <div slot="title">
        {{$t("project.endpoint.dialogTitle")}}
        <div class="float-right panel-calendar dialog-tool" style="display: flex">
          <pick-time v-model="searchTime" :refresh-data-func="queryChartDate" :use-chart-unit="false" :use-refresh="false" style="height: 28px;" @unitChange="chartUnitChange"></pick-time>
        </div>
      </div>
      <chart ref="messageChart" :unit="chartUnit" name="alertMessageChart"></chart>
    </el-dialog>
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
import chart from '@/components/page/dashboard/overview/chart'
import { alertMessage as alertMessageConstant, fromRoute } from '@/components/common/js/constants'

export default {
  name: 'alertMessageTab',
  mixins: [dataListMixin, subDataListMixin],
  components: {
    nzBottomDataList,
    alertMessageTable,
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
      searchMsg: { // 给搜索框子组件传递的信息
        searchLabelList: [
          {
            id: 26,
            name: this.$t('alert.list.id'),
            type: 'id',
            label: 'id',
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
      searchTimeSelect: bus.getTimezontDateRange(),
      currentMsg: {},
      chartUnit: 5,
      requestIndex: 0,
      viewAssetState: false,
      nowTime: ''
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
    queryChartDate () {
      const $temp = this
      // const start = this.searchTime[0] ? this.searchTime[0] : getTime(-1, 'h')
      // const end = this.searchTime[1] ? this.searchTime[1] : getTime(0, 'h')
      const start = this.currentMsg.startAt
      const end = this.currentMsg.endAt
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
        const paramStr = JSON.stringify(this.promQueryParamConvert(this.currentMsg))
        axiosArr.push(axios.get('/prom/api/v1/query_range?query=' + paramStr.substring(1, paramStr.length - 1).replace(/\+/g, '%2B').replace(/ /g, '%20').replace(/\\/g, '') + '&start=' + this.$stringTimeParseToUnix(start) + '&end=' + this.$stringTimeParseToUnix(end) + '&step=' + step))
        this.legend = []
        this.chartDatas = []
        axios.all(axiosArr).then(res => {
          try {
            res.forEach((response, promIndex) => {
              if (response.status == 200) {
                if (response.data.status == 'success') {
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
                      alias: alias,
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
            this.$message.error(err)
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
          const axiosAll = []
          this.$nextTick(() => {
            this.tableData.forEach((item) => {
              item.labels = JSON.parse(item.labels)
              if (!this.isBuildIn(item.alertRule)) {
                const paramStr = JSON.stringify(this.promQueryParamConvert(item))
                axiosAll.push(axios.get('/prom/api/v1/query?query=' + paramStr.substring(1, paramStr.length - 1)))
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
          })
          this.deleteBox.ids = ''
          this.pageObj.total = response.data.total
        }
      })
    },
    promQueryParamConvert (obj) {
      let r = '(' + obj.alertRule.expr + ')'
      let intoLabels = false
      if (Object.keys(obj.labels).length > 0) {
        r += (function () {
          let group = ' and ' + '(group({'
          let by = ' by ('

          for (const k in obj.labels) {
            if (k != 'alertname' && k != 'severity') {
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
      this.currentMsg = { ...row }
      this.graphShow = true
      this.$nextTick(() => {
        this.queryChartDate()
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
    // 数据排序
    tableDataSort (item) {
      let orderBy = ''
      if (item.order === 'ascending') {
        orderBy = item.prop
      }
      if (item.order === 'descending') {
        orderBy = '-' + item.prop
      }
      this.pageObj.orderBy = orderBy
      this.$set(this.searchLabel, 'orderBy', orderBy)
      this.getTableData()
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
