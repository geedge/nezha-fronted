<template>
  <div style="height: 100%;">
    <!--表格-->
    <el-table
      id="alertMessageTable"
      ref="dataTable"
      :cell-class-name="labelsClassName"
      :data="tableData"
      :height="height"
      border
      :default-sort="orderBy"
      @header-dragend="dragend"
      @sort-change="tableDataSort"
      @selection-change="selectionChange"
      @row-dblclick="(row)=>{rowDblclick(row)}"
    >
      <el-table-column
        :resizable="false"
        align="center"
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        v-for="(item, index) in customTableTitle"
        v-if="item.show"
        :key="`col-${index}`"
        :fixed="item.fixed"
        :label="item.label"
        :min-width="`${item.minWidth}`"
        :prop="item.prop"
        :resizable="true"
        :sort-orders="['ascending', 'descending']"
        :sortable="item.sortable"
        :width="`${item.width}`"
      >
        <template slot-scope="scope" :column="item">
          <template v-if="item.prop === 'alertRule'">
            <div v-if="scope.row.alertRule&&scope.row.alertRule.name" class="document-copy-block">
            <span class="document-copy-text"
              @mouseenter="alertMessageHover(scope.row, true, $event)"
              @mouseleave="alertMessageHover(scope.row, false)"
            >{{scope.row.alertRule?scope.row.alertRule.name : '--'}}</span>
             <i v-if="scope.row.alertRule" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(scope.row.alertRule.name)" :title="$t('overall.copyText')"></i>
            </div>
            <template v-else>-</template>
          </template>
          <template v-else-if="item.prop === 'summary'">
            <div class="document-copy-block">
              <span class="document-copy-text">{{scope.row[item.prop] ? scope.row[item.prop] : '-'}}</span>
              <i v-if="scope.row[item.prop]" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(scope.row[item.prop])" :title="$t('overall.copyText')"></i>
            </div>
          </template>
          <template v-else-if="item.prop === 'description'">
            <template v-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
            <span v-else>-</span>
          </template>
          <template v-else-if="item.prop === 'remark'">
            <template v-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
            <span v-else>-</span>
          </template>
          <span v-else-if="item.prop === 'severityId'&&scope.row['severity']" class="severity">
          <i :style="{color:scope.row['severity'].color,'font-size':'12px','margin-right':'5px'}" class="nz-icon nz-icon-circle"></i> {{scope.row['severity'].name}}
        </span>
          <span v-else-if="item.prop === 'startAt'">{{utcTimeToTimezoneStr(scope.row.startAt)}}</span>
          <span v-else-if="item.prop === 'lastAt'">{{utcTimeToTimezoneStr(scope.row.lastAt)}}</span>
          <template v-else-if="item.prop === 'duration'">
            <el-tooltip :disabled="!scope.row.endAt" effect="light" placement="right">
              <div slot="content">
                {{$t('overall.endTime')}}<br/>
                {{utcTimeToTimezoneStr(scope.row.endAt)}}
              </div>
              <span>{{getDuration(scope.row)}}</span>
            </el-tooltip>
          </template>
          <template v-else-if="item.prop === 'labels'" class="labels">
          <span v-for="(item, i) in labelsSort(scope.row.labels)" :key="i">
            <span
              @mouseenter="labelHover(scope.row, item.label, true, true, $event)"
              @mouseleave="labelHover(scope.row, item.label, false, true,)">
              <nz-alert-tag
                v-if="item.label !== 'alertname' && item.label !== 'severity'" :key="item.label" :cursor-point="tagType(item.label) !== 'info'"
                :label="item.label"
                :type="tagType(item.label)"
                style="margin: 5px 0 5px 5px;"
              >
               {{item.value}}
              </nz-alert-tag>
            </span>
          </span>
          </template>
          <span v-else-if="item.prop === 'state'">
            <span class="alert-message-state" :class="{'gray-bg': scope.row['state'] == 3, 'red-bg': scope.row['state'] == 1,'yellow-bg': scope.row['state'] == 2}">
              {{$t(stateOptions.find(state=>state.value == scope.row['state']).label)}}
            </span>
          </span>
          <span v-else-if="item.prop === 'id'" class="id-alert"><span :style="{'font-size':'12px','margin-right':'5px'}" class="id-alertMessage" :class="{'gray-bg': scope.row.ack == 0, 'blue-bg': scope.row.ack == 1}"></span>{{scope.row[item.prop]}}</span>
          <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
          <template v-else>-</template>
        </template>
      </el-table-column>
      <el-table-column
        v-if="showOption"
        :resizable="false"
        :width="operationWidth"
        fixed="right">
        <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
        <div slot-scope="scope" class="table-operation-items">
          <button v-if="scope.row.alertRule" class="table-operation-item" @click="$emit('messageDetail', scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button>
          <el-dropdown v-has="['alertMessage_expired', 'alertSilence_add']" size="medium" trigger="click" @command="tableOperation">
            <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
              <i class="nz-icon nz-icon-more3"></i>
            </div>
            <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
              <!--            <el-dropdown-item :command="['showText', scope.row]"><i class="nz-icon nz-icon-guzhangshuju"></i><span class="operation-dropdown-text">{{$t('alert.config.trbShot')}}</span></el-dropdown-item>-->
              <el-dropdown-item v-has="'alertMessage_view'" :command="['delete', scope.row, 'singleDel']"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
              <!-- <el-dropdown-item v-has="'alertMessage_view'" :command="['delete', scope.row]">
                  <delete-button
                  ref="deleteButton"
                  :from="'alertMessage'"
                  :forceDeleteShow="false"
                  :deleteTitle="'alert.alertMessage'"
                  :type="'link'"
                  :title="$t('overall.delete')"
                  id="alert-msg-delete"
                  v-has="'alertMessage_expired'"
                  :api="api"
                  :single="true"
                  :delete-objs="singleDelete"
                  @before="delFlag=true"
                  ></delete-button>
              </el-dropdown-item> -->
              <el-dropdown-item v-has="'alertSilence_add'" :command="['fastSilence', scope.row, 'alertMessage']"><i class="nz-icon nz-icon-fast-silence"></i><span class="operation-dropdown-text">{{$t('overall.silenceAlert')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'alertMessage_expired'" :disabled="scope.row.ack === 1" :command="['ack', scope.row]"><i class="nz-icon nz-icon-queren"></i><span class="operation-dropdown-text">{{$t('overall.acknowledge')}}</span></el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-table-column>
      <template slot="empty">
        <div v-if="!loading" class="table-no-data">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#nz-icon-no-data-list"></use>
          </svg>
          <div class="table-no-data__title">No results found</div>
        </div>
        <div v-else>&nbsp;</div>
      </template>
    </el-table>
    <alertRuleInfo @tipHoverRule='tipHoverRule' v-if="alertRuleShow" :id="alertRuleId" :severity-data="severityData" :that="alertRuleObj.alertRule" @showText="$emit('showText',alertRuleObj)"></alertRuleInfo>
    <alertLabel
      v-if="alertLabelShow"
      :id="alertLabelId"
      :that="alertLabelObj"
      :type="alertLabelType"
      :alert-table-dialog="chartAlertList"
      @tipHover='tipHover'
    ></alertLabel>
  </div>
</template>

<script>
import bus from '../../../../libs/bus'
import axios from 'axios'
import table from '@/components/common/mixin/table'
import chartDataFormat from '../../../chart/chartDataFormat'
import alertRuleInfo from '../../alert/alertRuleInfo'
import { calcDurationByStringTimeB } from '../../js/tools'
import { alertMessage as alertMessageConstant } from '@/components/common/js/constants'
import alertLabelMixin from '@/components/common/mixin/alertLabelMixin'
import alertMessageLabelMixin from '@/components/common/alert/alertMessageLabelMixin'
import deleteButton from '@/components/common/deleteButton'
export default {
  name: 'alertMessageTable',
  components: {
    alertRuleInfo: alertRuleInfo, deleteButton
  },
  props: {
    nowTime: {
      type: String
    },
    showOption: {
      type: Boolean,
      default: true
    },
    alertMessageTabNew: Boolean,
    loading: Boolean,
    chartAlertList: Boolean
  },
  mixins: [table, bus, alertLabelMixin, alertMessageLabelMixin],
  data () {
    return {
      /* 二级列表相关 */
      tabList: [], // 二级列表的标签
      tabDetailList: [], // 多个详情
      stateOptions: alertMessageConstant.states,
      // 详情相关
      graphShow: false,
      chartDatas: [],
      sameLabels: ['instance', 'module', 'project', 'asset', 'endpoint', 'dc'],
      filterArr: ['alertname', 'severity_id', 'severity', 'rule_type', 'rule_id', 'rule_name'],
      legend: [],
      searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()],
      currentMsg: {},
      chartUnit: 5,
      severityData: [],
      tableTitle: [

        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 180,
          sortable: 'custom'
        }, {
          label: this.$t('alert.rule'),
          prop: 'alertRule',
          show: true,
          width: 180,
          sortable: 'custom'
        }, {
          label: this.$t('project.endpoint.labels2'),
          prop: 'labels',
          show: true,
          NotSet: true,
          minWidth: 250,
          sortable: 'custom'
        }, {
          label: this.$t('alert.severity'),
          prop: 'severityId',
          show: true,
          width: 110,
          sortable: 'custom'
        }, {
          label: this.$t('alert.summary'),
          prop: 'summary',
          show: true,
          minWidth: 200
        }, {
          label: this.$t('overall.remark'),
          prop: 'description',
          show: true,
          minWidth: 200
        }, {
          label: this.$t('overall.state'),
          prop: 'state',
          show: true,
          width: 100
          // sortable: 'custom'
        }, {
          label: this.$t('overall.startTime'),
          prop: 'startAt',
          show: true,
          width: 150,
          sortable: 'custom'
        },
        // {
        //   label: this.$t('alert.lastAt'),
        //   prop: 'lastAt',
        //   show: true,
        //   width: 150,
        //   sortable: 'custom'
        // },
        {
          label: this.$t('config.terminallog.duration'),
          prop: 'duration',
          show: true,
          width: 150
        }
      ],
      viewAssetState: false,
      tableDataInitNum: 0,
      alertRuleShow: false,
      alertRuleId: '',
      alertRuleObj: ''
    }
  },
  computed: {
    getDuration () {
      return function (record) {
        if (record.endAt) {
          return calcDurationByStringTimeB(record.startAt, record.endAt)
        }
        return calcDurationByStringTimeB(record.startAt, this.nowTime)
      }
    }
  },
  mounted () {
    this.getSeverityData()
  },
  methods: {
    getSeverityData () {
      this.$get('alert/severity', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code == 200) {
          this.severityData = response.data.list
        }
      })
    },
    chartUnitChange: function (unit) {
      this.chartUnit = unit
      this.$nextTick(() => {
        this.queryChartDate()
      })
    },
    formatThreshold (value, unit) {
      const unitMethod = chartDataFormat.getUnit(unit)
      if (unitMethod && value) {
        return unitMethod.compute(value, null, 2)
      } else {
        return value
      }
    },
    queryChartDate () {
      const $temp = this
      const start = this.searchTime[0] ? this.searchTime[0] : this.getTime(-1, 'h')
      const end = this.searchTime[1] ? this.searchTime[1] : this.getTime(0, 'h')
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
        axiosArr.push(axios.get('/prom/api/v1/query_range?query=' + paramStr.substring(1, paramStr.length - 1) + '&start=' + this.$stringTimeParseToUnix(start) + '&end=' + this.$stringTimeParseToUnix(end) + '&step=' + step))
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
    detail (obj) {
      if (!obj.current) { return }
      this.chartDatas = []
      this.legend = []
      this.graphShow = true
      this.currentMsg = obj
      this.chartUnit = obj.alertRule.unit ? obj.alertRule.unit : 5
      this.$nextTick(() => {
        this.queryChartDate()
      })
    },
    dialogClose () {
      this.graphShow = false
    },
    getAlertList () {
      if (!this.scrollbarWrap) {
        this.$nextTick(() => {
          this.scrollbarWrap = this.$refs.alertListTable.bodyWrapper
          this.toTopBtnHandler(this.scrollbarWrap)
        })
      }
    },
    promQueryParamConvert (obj) {
      let r = '(' + obj.alertRule.expr + ')'
      let intoLabels = false
      if (Object.keys(obj.labels).length > 0) {
        r += (function () {
          let group = ' and ' + '(group({'
          let by = ' by ('

          for (const k in obj.labels) {
            if (this.filterArr.indexOf(k) == -1) {
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
    toDeleteMessage (obj) {
      this.$emit('toDelete', obj)
    },
    selectionChange (objs) {
      this.$emit('selectionChange', objs)
    },
    closeDialog () {
      this.importBox.show = false
      this.deleteBox.show = false
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
    labelsClassName (row) {
      if (row.column.label == this.$t('project.endpoint.labels2')) {
        return 'alert-message-list-labels'
      } else if (row.column.label == this.$t('overall.state')) {
        if (row.row.state == 1) {
          return ''
        } else if (row.row.state == 2) {
          return ''
        }
      } else {
        return ''
      }
    },
    closeViews () {
      this.$refs.alertConfigBox.show(false, false)
      this.$refs.projectBox.show(false, false)
      this.$refs.moduleBox.show(false, false)
      this.viewAssetState = false
    },
    // alertName鼠标划入
    alertMessageHover (item, loading, e) {
      clearTimeout(this.timer)
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        this.$set(item.alertRule, 'position', position)
        this.alertRuleId = item.alertRule.id
        this.alertRuleObj = item
      }
      this.$set(item.alertRule, 'loading', loading)
      this.timer = setTimeout(() => {
        this.alertRuleShow = loading
      }, 500)
      this.flag = loading
    },
    tipHoverRule (tipLoading) {
      clearTimeout(this.timer)
      if (this.flag === false) {
        this.alertRuleShow = tipLoading
      }
    },
    // Severity Label
    returnSeverityLabel (key) {
      return this.$t(this.$CONSTANTS.alertMessage.severityData.find(s => { return s.value == key }).label)
    },
    rowDblclick (row) {
      if (!this.showOption) {
        return
      }
      this.$emit('messageDetail', row)
    }
  }
}

</script>
<style>
  .alert-message-tooltip.el-popover{
    padding: 0 !important;
  }
</style>
