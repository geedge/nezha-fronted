<template>
  <!--表格-->
  <el-table
    id="alertMessageTable"
    ref="dataTable"
    :cell-class-name="labelsClassName"
    :data="tableData"
    :height="height"
    border
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="selectionChange"
    @row-dblclick="(row)=>{$emit('messageDetail', row)}"
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
          <div v-if="scope.row.alertRule&&scope.row.alertRule.name" >
            <el-popover
              placement="right"
              popper-class="alert-message-tooltip"
              style="position: relative"
              @show="alertMessageHover(scope.row.alertRule, true)"
              @hide="alertMessageHover(scope.row.alertRule, false)"
              trigger="hover">
              <alertRuleInfo v-if="scope.row.alertRule.loading" :id="scope.row.alertRule.id" :severity-data="severityData" :that="scope.row.alertRule" @showText="$emit('showText',scope.row)"></alertRuleInfo>
              <span slot="reference" class="data-column__span">{{scope.row.alertRule?scope.row.alertRule.name : '--'}}</span>
            </el-popover>
          </div>
          <template v-else>-</template>
        </template>
        <template v-else-if="item.prop === 'summary'">
          <template v-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
          <template v-else>-</template>
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
        <template v-else-if="item.prop === 'duration'">
          <el-tooltip :disabled="!scope.row.endAt" effect="light" placement="right">
            <div slot="content">
              {{$t('config.terminallog.endTime')}}<br/>
              {{utcTimeToTimezoneStr(scope.row.endAt)}}
            </div>
            <span>{{getDuration(scope.row)}}</span>
          </el-tooltip>
        </template>
        <template v-else-if="item.prop === 'labels'" class="labels">
          <span v-for="(item, i) in labelsSort(scope.row.labels)" :key="i">
            <span
              @mouseenter="labelHover(scope.row, item.label, true, $event)"
              @mouseleave="labelHover(scope.row, item.label, false)">
              <nz-alert-tag
                 v-if="item.label !== 'alertname' && item.label !== 'severity'" :key="item.label" :cursor-point="tagType(item.label) !== 'info'"
                 :label="item.label"
                 :type="tagType(item.label)"
                 style="margin: 5px 0 5px 5px;"
              >
               {{item.value}}
              </nz-alert-tag>
            </span>
            <alertLabel
              v-if="(item.label === 'asset' ||item.label === 'module' || item.label === 'project' || item.label === 'dc' ||item.label === 'endpoint' ||item.label === 'cpu' ||item.label === 'user' ||item.label === 'parent_asset') && scope.row[item.label] && scope.row[item.label].loading"
              :id="scope.row[item.label].id"
              :that="scope.row[item.label]"
              :type="item.label"
            ></alertLabel>
          </span>
        </template>
        <span v-else-if="item.prop === 'state'" :class="{'green': scope.row['state'] == 2, 'red': scope.row['state'] == 1}">
            {{scope.row['state'] == 1 ? "Pending" : ""}}
            {{scope.row['state'] == 2 ? "Expired" : ""}}
        </span>
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
        <button v-if="scope.row.alertRule&&scope.row.alertRule.type !== 3" class="table-operation-item" @click="$emit('messageDetail', scope.row)"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown v-has="['alertMessage_expired']" size="medium" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-public-box-select-top right-public-box-dropdown-top">
<!--            <el-dropdown-item :command="['showText', scope.row]"><i class="nz-icon nz-icon-guzhangshuju"></i><span class="operation-dropdown-text">{{$t('alert.config.trbShot')}}</span></el-dropdown-item>-->
            <el-dropdown-item v-has="'alertMessage_expired'" :command="['delete', scope.row]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'alertSilence_add'" :command="['fastSilence', scope.row, 'alertMessage']"><i class="nz-icon nz-icon-fast-silence"></i><span class="operation-dropdown-text">{{$t('overall.silenceAlert')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import bus from '../../../../libs/bus'
import axios from 'axios'
import table from '@/components/common/mixin/table'
import nzAlertTag from '../../../page/alert/nzAlertTag'
import chartDataFormat from '../../../charts/chartDataFormat'
import alertRuleInfo from '../../alert/alertRuleInfo'
import alertLabel from '../../alert/alertLabel'
import { calcDurationByStringTimeB } from '../../js/tools'
export default {
  name: 'alertMessageTable',
  components: {
    nzAlertTag,
    alertRuleInfo: alertRuleInfo,
    alertLabel: alertLabel
  },
  props: {
    nowTime: {
      type: String
    },
    showOption: {
      type: Boolean,
      default: true
    },
    alertMessageTabNew: Boolean
  },
  mixins: [table, bus],
  data () {
    return {
      /* 二级列表相关 */
      tabList: [], // 二级列表的标签
      tabDetailList: [], // 多个详情

      // 详情相关
      graphShow: false,
      chartDatas: [],
      sameLabels: ['instance', 'module', 'project', 'asset', 'endpoint', 'dc'],
      exclusiveLabels: ['_id', 'severity', '__name__'],
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
          width: 160,
          sortable: 'custom'
        }, {
          label: this.$t('alert.rule'),
          prop: 'alertRule',
          show: true,
          width: 180,
          sortable: 'custom'
        }, {
          label: this.$t('alert.list.labels'),
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
          label: this.$t('alert.startAt'),
          prop: 'startAt',
          show: true,
          width: 150,
          sortable: 'custom'
        }, {
          label: this.$t('config.terminallog.duration'),
          prop: 'duration',
          show: true,
          width: 150
        }
      ],
      viewAssetState: false,
      tableDataInitNum: 0
    }
  },
  computed: {
    tagType () {
      return (key) => {
        if (key == 'asset' || key == 'module' || key == 'project' || key == 'dc' || key == 'endpoint') {
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
    },
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
    labelsSort (obj) {
      const buildIn = ['asset', 'endpoint', 'module', 'cpu', 'datacenter', 'project', 'parent_asset', 'user']
      if (typeof obj === 'string') obj = JSON.parse(obj)
      const labels = JSON.parse(JSON.stringify(obj))
      const result = []
      for (const key of this.exclusiveLabels) {
        Object.keys(labels).forEach(labelsKey => {
          if (labelsKey.indexOf(key) !== -1) {
            delete labels[labelsKey]
          }
        })
      }
      for (const key of buildIn) {
        if (key in labels) {
          if (key === 'datacenter') {
            result.push({ label: 'dc', value: labels.datacenter })
            delete labels.datacenter
          } else {
            result.push({ label: key, value: labels[key] })
          }
          delete labels[key]
        }
      }
      Object.keys(labels).sort().forEach(key => {
        result.push({ label: key, value: labels[key] })
        delete labels[key]
      })
      return result
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
      if (row.column.label == this.$t('alert.list.labels')) {
        return 'alert-message-list-labels'
      } else if (row.column.label == this.$t('alert.list.state')) {
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
    // label tooltip是否显示
    labelToolTipDis (labelType) {
      switch (labelType) {
        case 'asset':
        case 'module':
        case 'endpoint':
        case 'project':
        case 'dc':
          return false
        default: return true
      }
    },
    // alertName鼠标划入
    alertMessageHover (item, loading, e) {
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        this.$set(item, 'position', position)
      }
      this.$set(item, 'loading', loading)
    },
    // label 鼠标划入
    labelHover (item, type, loading, e) {
      if (this.labelToolTipDis(type)) {
        return
      }
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        this.$set(item[type], 'position', position)
      }
      this.$set(item[type], 'loading', loading)
    },
    // Severity Label
    returnSeverityLabel (key) {
      return this.$CONSTANTS.alertMessage.severityData.find(s => { return s.value == key }).label
    }
  }
}

</script>
<style>
  .alert-message-tooltip.el-popover{
    padding: 0 !important;
  }
</style>
