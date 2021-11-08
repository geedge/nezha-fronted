<style lang="scss">
  @import './chart.scss';
</style>
<template>
  <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box" ref="resizeBox">
      <div class="chart-container chart-detail" :id="'chartContainerDiv' + chartIndex" @mouseenter="caretShow = true" @mouseleave="caretShow = false">
        <loading :ref="'localLoading' + chartIndex"></loading>
        <div class="clearfix chartTitle" :class="{'drag-disabled': !data.draggable,}" :id="'chartTitle' + chartIndex">
          <el-popover
            v-if="isError"
            :close-delay="10"
            placement="top-start"
            trigger="hover"
            popper-class="chart-error-popper">
            <div>{{errorContent}}</div>
            <span slot="reference" class="panel-info-corner panel-info-corner--error">
              <i class="nz-icon nz-icon-warning fa"></i>
              <span class="panel-info-corner-inner"></span>
            </span>
          </el-popover>
          <span :class="{'move-able':!isLock}"><span class="el-dropdown-link chart-title-text chart-title" @click="dropdownMenuShow = !dropdownMenuShow">{{data.name}}</span></span>

        </div>
        <div ref="chartInfo" class="chart-info" :id="'chartInfoDiv' + chartIndex" v-cloak>
          <div ref="scrollbar" style="height: 100%;width:100%; overflow: auto;">
            <div v-for="(item, index) in detail" :key="index" class="chart-sub">
              <template v-if="isEmptyTab(item)">
                <div class="chart-sub-title" @click="hideElement(index)">
                  <span v-if="data.from !== fromRoute.endpoint"><i :class="{'nz-icon nz-icon-caret-right': show.indexOf(index) === -1,'nz-icon nz-icon-caret-bottom': show.indexOf(index) > -1}"></i></span>
                  <span>{{item.title}}</span>
                </div>
                <el-collapse-transition>
                  <div v-show="show.indexOf(index) > -1" class="chart-sub-content">
                    <template v-for="(value, key, i) in item.data">

                      <!-- endpoint-detail、asset、model的assetInfo的asset详情-->
                      <div v-if="(data.from === fromRoute.endpoint || data.from === fromRoute.asset || data.from === fromRoute.model) && data.type === 'assetInfo' && item.type === 'basic' && assetKey[key]" :key="i" class="content-item">
                        <div :id="`key-${index}-${i}`" class="content-item-key item-tip">
                          <span class="content-text">{{assetKey[key]}}</span>
                          <div :class="itemTip(`key-${index}`, key, i, ready)" class="item-tip-hide item-tip-key el-popover">{{assetKey[key]}}</div>
                        </div>
                        <div :id="`value-${index}-${i}`" class="content-item-value item-tip">
                          <span v-if="key === 'name'">{{value}}</span>
                          <span v-else-if="key === 'type'">{{value}}</span>
                          <span v-else-if="key === 'state'">{{value}}</span>
                          <span v-else-if="key === 'brand'">{{value}}</span>
<!--                          <span v-else-if="key === 'model'">{{value}}</span>-->
                          <span v-else-if="key === 'alert'" class="as-button"><i :class=" value > 0 ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i>&nbsp;{{value}}</span>
                          <span v-else-if="key === 'endpoint'" class="as-button"><i class="nz-icon nz-icon-overview-endpoint monitorColor"></i>&nbsp;{{value}}</span>
                          <div v-else-if="key === 'tags'" class="no-overflow" style="padding-bottom: 5px;">
                            <template v-if="value && value.length > 0">
                              <nz-alert-tag v-for="(tagItem, tagIndex) in value" :key="tagItem.id" :cursor-point="false"
                                            :label="tagItem.name"
                                            style="margin: 5px 5px 0 0; vertical-align: middle;"
                                            type="normal">
                                <div :id="`tag-${index}-${tagIndex}`" class="tag-value">
                                  <span class="content-text">{{tagItem.value.join(',')}}</span>
                                </div>
                              </nz-alert-tag>
                            </template>
                            <template v-else>&nbsp;</template>
                          </div>
                          <template v-else-if="key === 'cabinet'">
                            <span v-if="value&&item.data.cabinetStart&&item.data.cabinetEnd">{{value + '['+item.data.cabinetStart+'-'+item.data.cabinetEnd+']'}}</span>
                            <span v-else-if="value&&!(item.data.cabinetStart||item.data.cabinetEnd)">{{value}}</span>
                            <span v-else></span>
                          </template>
                          <template v-else-if="key === 'pingRtt'">
                            <div :class="{'green-bg': item.data.pingStatus == 1, 'red-bg': item.data.pingStatus == 1 != 1}" class="active-icon"></div>
                            <span>{{value ? value + 'ms' : ''}}</span>
                          </template>
                          <template v-else-if="assetKey[key]">
                            <span v-if="key!=='pingLastReply'" class="content-text">{{value ? value : "&nbsp;"}}</span>
                            <span v-else class="content-text">{{value ? timeFormat(value): "&nbsp;"}}</span>
                            <div :class="itemTip(`value-${index}`, key, i, ready)" class="item-tip-hide item-tip-value el-popover">{{value}}</div>
                          </template>
                        </div>
                      </div>
                      <!-- endpoint-detail、asset、model的assetInfo的feature-->
                      <div v-if="(data.from === fromRoute.endpoint || data.from === fromRoute.asset || data.from === fromRoute.model) && data.type === 'assetInfo' && item.type === 'attribute'" :key="i" class="content-item">
                        <div :id="`key-${index}-${i}`" class="content-item-key item-tip">
                          <span class="content-text">{{key}}</span>
                          <div :class="itemTip(`key-${index}`, key, i, ready)" class="item-tip-hide item-tip-key el-popover">{{key}}</div>
                        </div>

                        <div :id="`value-${index}-${i}`" :class="{'content-item-value-muti': Array.isArray(value) && value.length > 0}" class="content-item-value item-tip">
                          <template v-if="Array.isArray(value) && value.length>0">
                            <template v-if="typeof value[0] == 'string'">
                              <div v-for="(_item, _index) in value" :key="_index" class="item-value-sub">{{_item}}</div>
                            </template>
                            <template v-else>
                              <el-table
                                ref="dataTable"
                                :data="value"
                                class="nz-table asset-info-table"
                                height="100%"
                                tooltip-effect="light"
                              >
                                <el-table-column
                                  v-for="(_item, _index) in setLabels(value)"
                                  v-if="_item.show"
                                  :key="`col-${_index}`"
                                  :label="_item.label"
                                  :resizable="true"
                                >
                                  <template slot-scope="scope" :column="_item">
                                    <template >
                                      <span v-html="scope.row[_item.prop]"></span>
                                    </template>
                                  </template>
                                </el-table-column>
                              </el-table>
                            </template>

                          </template>
                          <template v-else-if="key">
                            <span class="content-text">{{value ? value : "&nbsp;"}}</span>
                            <div :class="itemTip(`value-${index}`, key, i, ready)" class="item-tip-hide item-tip-value el-popover">{{value}}</div>
                          </template>
                        </div>
                      </div>

                      <!-- endpoint-detail的endpointInfo的endpoint详情-->
                      <div v-else-if="data.from === fromRoute.endpoint && data.type === 'endpointInfo'" :key="i" class="content-item">
                        <div :id="`key-${index}-${i}`" class="content-item-key item-tip">
                          <span class="content-text">{{endpointKey[key]}}</span>
                          <div :class="itemTip(`key-${index}`, key, i, ready)" class="item-tip-hide item-tip-key el-popover">{{endpointKey[key]}}</div>
                        </div>
                        <div :id="`value-${index}-${i}`" class="content-item-value item-tip">
                          <template>
                            <span v-if="key === 'alerts'"><i :class=" value > 0 ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i>&nbsp;{{value}}</span>
                            <span v-else-if="key === 'asset'"><i class="nz-icon nz-icon-overview-project monitorColor color23BF9A"/>&nbsp;{{value}}</span>
                            <span v-else-if="key === 'module'"><i style="cursor: pointer" class="nz-icon nz-icon-overview-module monitorColor"/>&nbsp;&nbsp;{{value}}</span>
                            <span v-else-if="key === 'state'">
                              <span style="width: auto">
                                <span class="endpoint-cell-left"><i class="nz-icon nz-icon-Metrics colorFA901C" /> {{$t('project.endpoint.metrics')}} </span>
                                <span v-if="value[0].state === 0">
                                  <span class="active-icon red-bg inline-block"></span>
                                </span>
                                <span v-else-if="value[0].state === 1">
                                  <span class="active-icon green-bg inline-block"></span>
                                </span>
                                <span v-else-if="value[0].state">
                                  <span class="active-icon gray-bg inline-block"></span>
                                </span>
                              </span>
                              <span style="width: auto">
                                <span class="endpoint-cell-left" style="margin-left: 10px"><i class="nz-icon nz-icon-logs colorFA901C" /> {{$t('project.endpoint.logs')}} </span>
                                <span v-if="value[1].state === 0">
                                  <span class="active-icon red-bg inline-block"></span>
                                </span>
                                <span v-else-if="value[1].state === 1">
                                  <span class="active-icon green-bg inline-block"></span>
                                </span>
                                <span v-else-if="value[1].state">
                                  <span class="active-icon gray-bg inline-block"></span>
                                </span>
                              </span>
                            </span>
                            <span v-else class="content-text">{{value || value === 0 ? value : "&nbsp;"}}</span>
                            <div :class="itemTip(`value-${index}`, key, i, ready)" class="item-tip-hide item-tip-value el-popover">{{value}}</div>
                          </template>
                        </div>
                      </div>

                      <!-- alertRule-detail的详情-->
                      <div v-else-if="data.from == fromRoute.rule && data.type == 'alertRuleInfo' && key != '_module_'" :key="i" class="content-item" @click="showDeep(`deep-${index}-${i}`)">
                        <div :id="`key-${index}-${i}`" class="content-item-key item-tip">
                        <span class="content-text">
                          <span><i v-if="item.data._module_[key]" :class="{'nz-icon nz-icon-caret-right': deepShow.indexOf(`deep-${index}-${i}`) == -1,'nz-icon nz-icon-caret-bottom': deepShow.indexOf(`deep-${index}-${i}`) > -1}"></i></span>
                          <span>{{key}}</span>
                          <!--<span v-if="item.data._module_[key]">{{Object.keys(item.data._module_[key]).length-1}}个module</span>-->
                        </span>
                          <div :class="itemTip(`key-${index}`, key, i, ready)" class="item-tip-hide item-tip-key el-popover">{{key}}</div>
                        </div>
                        <div :id="`value-${index}-${i}`" class="content-item-value item-tip">
                          <span class="content-text">{{value ? value : "&nbsp;"}}</span>
                        </div>
                        <!-- module -->
                        <el-collapse-transition>
                          <div v-show="deepShow.indexOf(`deep-${index}-${i}`) > -1" class="chart-third-content">
                            <template v-for="(module, mProjectName, ti) in item.data._module_" v-if="mProjectName == key">
                              <div v-for="(moduleNum, moduleName, fi) in module" v-if="moduleName != '_endpoint_'" :key="fi" class="content-item" @click.stop="showDeep(`deep-${index}-${i}-${ti}-${fi}`)">
                                <div :id="`key-${index}-${i}-${ti}-${fi}`" class="content-item-key item-tip deep">
                                <span class="content-text">
                                  <span><i v-if="module._endpoint_[moduleName]" :class="{'nz-icon nz-icon-caret-right': deepShow.indexOf(`deep-${index}-${i}-${ti}-${fi}`) == -1,'nz-icon nz-icon-caret-bottom': deepShow.indexOf(`deep-${index}-${i}-${ti}-${fi}`) > -1}"></i></span>
                                  <span>{{moduleName}}</span>
                                  <!--<span v-if="module._endpoint_[moduleName]">{{Object.keys(module._endpoint_[moduleName]).length-1}}个endpoint</span>-->
                                </span>
                                  <div :class="itemTip(`key-${index}-${i}-${ti}`, moduleName, fi, ready)" class="item-tip-hide item-tip-key el-popover">{{moduleName}}</div>
                                </div>
                                <div :id="`value-${index}-${i}-${ti}-${fi}`" class="content-item-value item-tip deep">
                                  <span class="content-text">{{moduleNum ? moduleNum : "&nbsp;"}}</span>
                                </div>
                                <!-- endpoint -->
                                <el-collapse-transition>
                                  <div v-show="deepShow.indexOf(`deep-${index}-${i}-${ti}-${fi}`) > -1" class="chart-forth-content">
                                    <template v-for="(endpoint, eModuleName, si) in module._endpoint_" v-if="eModuleName == moduleName">
                                      <div v-for="(endpointNum, endpointName, ei) in endpoint" :key="ei" class="content-item" @click.stop>
                                        <div :id="`key-${index}-${i}-${ti}-${fi}-${si}-${ei}`" class="content-item-key item-tip deepp">
                                        <span class="content-text">
                                          <span>{{endpointName}}</span>
                                        </span>
                                          <div :class="itemTip(`key-${index}-${i}-${ti}-${fi}-${si}`, endpointName, ei, ready)" class="item-tip-hide item-tip-key el-popover">{{endpointName}}</div>
                                        </div>
                                        <div :id="`value-${index}-${i}-${ti}-${fi}-${si}-${ei}`" class="content-item-value item-tip deepp">
                                          <span class="content-text">{{endpointNum ? endpointNum : "&nbsp;"}}</span>
                                        </div>
                                      </div>
                                    </template>
                                  </div>
                                </el-collapse-transition>
                              </div>
                            </template>
                          </div>
                        </el-collapse-transition>
                      </div>
                    </template>
                  </div>
                </el-collapse-transition>
              </template>
            </div>
          </div>
        </div>
      </div>
      <span v-if="data.resizable&&!isLock" class="vue-resizable-handle" @mousedown="startResize"></span>
    </div>
    <!--preview -->
    <chart-preview :panelId="panelId" ref="chartsPreview" ></chart-preview>
  </div>
</template>

<script>
import loading from '../common/loading'
import chartPreview from './chartPreview'
import * as echarts from 'echarts'
import nzAlertTag from '../page/alert/nzAlertTag'
import bus from '../../libs/bus'
import { fromRoute } from '@/components/common/js/constants'
export default {
  name: 'chartDetail',
  components: {
    loading: loading,
    'chart-preview': chartPreview,
    'nz-alert-tag': nzAlertTag
  },
  props: {
    // 看板id
    panelId: {
      type: Number,
      default: 0
    },
    editChartId: {
      type: String,
      default: 'editChartId'
    },
    chartIndex: {
      type: Number,
      default: 0
    },
    isLock: { type: Boolean, default: false }
  },
  data () {
    return {
      fromRoute,
      ready: false,
      data: {}, // 该图表信息,chartItem
      detail: [], // 展示的详情
      unit: {},
      show: [0], // 控制展开/隐藏
      deepShow: [], // 控制二级/三级的展开/隐藏
      isError: false,
      errorContent: '',
      loading: Object,
      panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
      firstLoad: false, // 是否第一次加载
      screenModal: false,
      // 查询数据使用
      filter: {
        start_time: '',
        end_time: ''
      },
      firstShow: false, // 默认不显示操作按钮,
      caretShow: false,
      dropdownMenuShow: false,
      divFirstShow: false,
      searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()], // 全屏显示的时间
      oldSearchTime: [],

      assetKey: {
        // host: this.$t('asset.host'),
        id: 'Id',
        name: this.$t('overall.name'),
        manageIp: this.$t('overall.manageIp'),
        type: this.$t('overall.type'),
        // assetType: this.$t('asset.assetType'),
        // sn: this.$t('asset.device'),
        state: this.$t('asset.assetState'),
        pingRtt: this.$t('asset.assetPing'),
        dataCenter: this.$t('asset.dataCenter'),
        cabinet: this.$t('asset.cabinet'),
        brand: this.$t('asset.brand'),
        model: this.$t('asset.model'),
        tags: this.$t('overall.labels'),
        alert: this.$t('asset.alerts'),
        endpoint: this.$t('asset.modules')
        // vendor: this.$t('asset.vendor'),
        // purchaseDate: this.$t('asset.procurementDate'),
        // principal: this.$t('asset.principal'),
        // tel: this.$t('asset.principalTel'),
        // pingStatus: this.$t('asset.assetPing'),
        // pingLastReply: this.$t('asset.lastReply'),

      },
      projectKey: {
        id: 'ID',
        name: this.$t('overall.name'),
        remark: this.$t('overall.remark'),
        alertStat: this.$t('project.chart.alertStat')
      },
      moduleKey: {
        id: 'ID',
        name: this.$t('overall.name'),
        type: this.$t('overall.type'),
        remark: this.$t('overall.remark'),
        endpointStat: this.$t('project.chart.endpointStat'),
        alertStat: this.$t('project.chart.alertStat')
      },
      endpointKey: {
        id: 'ID',
        name: this.$t('overall.name'),
        // type: this.$t('overall.type'),
        project: this.$t('overall.project'),
        module: this.$t('project.module.module'),
        asset: this.$t('overall.asset'),
        alerts: this.$t('project.endpoint.alerts'),
        state: this.$t('project.endpoint.state')
      }
    }
  },
  computed: {
    itemTip () {
      return function (type, content, index, ready) {
        const className = 'item-tip-show'
        this.$nextTick(() => {
          if (ready) {
            const cellDom = document.querySelector(`#${type}-${index}`)
            const spanDom = document.querySelector(`#${type}-${index} .content-text`)
            if (cellDom.offsetWidth - 16 <= spanDom.offsetWidth) {
              document.querySelector(`#${type}-${index}>.el-popover`).classList.add(className)
            } else {
              document.querySelector(`#${type}-${index}>.el-popover`).classList.remove(className)
            }
          }
        })
        return ''
      }
    },
    isEmptyTab () {
      return function (item) {
        return item.data && Object.keys(item.data).length > 0
      }
    }
  },
  methods: {
    startResize (e) {
      const vm = this
      this.$chartResizeTool.start(vm, this.data, e)
    },
    setLabels: function (source) {
      let labels = Object.keys(source[0])
      labels = labels.map(item => {
        return {
          label: this.replaceSplit(item),
          prop: item,
          show: true
        }
      })
      return labels
    },
    replaceSplit (key) {
      if (key) {
        return key.replace(/\$_\$/g, ' ')
      }
    },
    hideElement (index) {
      if (this.data.from === fromRoute.endpoint) {
        return
      }
      if (this.show.indexOf(index) > -1) {
        this.show.splice(this.show.indexOf(index), 1)
      } else {
        this.show.push(index)
      }
    },
    showDeep (index) {
      if (this.deepShow.indexOf(index) > -1) {
        this.deepShow.splice(this.deepShow.indexOf(index), 1)
      } else {
        this.deepShow.push(index)
      }
    },
    startLoading (area) {
      this.$refs['localLoading' + this.chartIndex].startLoading()
    },
    endLoading (area) {
      this.$refs['localLoading' + this.chartIndex].endLoading()
    },
    preview () {
      this.$refs.chartsPreview.show(this.data)
    },
    resize () {
      const container = document.querySelector('#chartInfoDiv' + this.chartIndex)
      container.style.height = `calc(100% - ${this.$chartResizeTool.titleHeight + this.$chartResizeTool.chartTableBlankHeight}px)`
    },
    showLoad (chartItem) {
      this.$nextTick(() => {
        this.resize()
      })
      this.startLoading()
      this.divFirstShow = true
    },
    // 重新请求数据 刷新操作-local
    refreshChart () {
      this.dropdownMenuShow = false
      this.startLoading()
      this.firstShow = false
      this.$emit('on-refresh-data', this.data.id)
    },
    // 编辑图表
    editChart () {
      this.dropdownMenuShow = false
      this.$emit('on-edit-chart-block', this.data.id)
    },
    // 删除该图表
    removeChart () {
      this.dropdownMenuShow = false
      this.$emit('on-remove-chart-block', this.data.id)
    },
    clearChart () {
      this.data = {}
    },

    // 设置数据, filter区分
    setData (chartItem, detail, panelId, filter, area, errorMsg) {
      if (errorMsg && errorMsg !== '') {
        this.isError = true
        this.errorContent = errorMsg
      } else {
        this.isError = false
        this.errorContent = ''
      }
      this.divFirstShow = true

      this.firstShow = true // 展示操作按键

      this.panelIdInner = panelId
      this.data = chartItem
      this.detail = detail
      // console.info(this.data, this.detail)
      /* if (this.detail[0] && this.detail[0].type && this.detail[0].type == 'endpointInfo') { // endpointInfo的小图表
        this.$nextTick(() => {
          this.initChart(this.detail[0].data.stateSeries)
        })
      } */
      this.endLoading()
    },
    initChart (series) {
      series.forEach((item) => {
        item.areaStyle = {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgb(35,191,154)' // 0% 处的颜色
            }, {
              offset: 1, color: 'rgb(255, 255, 255)' // 100% 处的颜色
            }],
            global: false
          }
        }
      })
      const option = {
        title: { show: false },
        grid: { top: 20, bottom: 20 },
        tooltip: {
          show: true,
          trigger: 'axis',
          extraCssText: 'z-index:3100;',
          position: [100, 1],
          textStyle: {
            fontSize: 12
          },
          padding: 3,
          formatter: function (param) {
            let time = param[0].data[0]
            time = bus.computeTimezone(time)
            const date = new Date(time)
            let hour = date.getHours()
            hour = hour > 9 ? hour : '0' + hour // 加0补充为两位数字
            let minute = date.getMinutes()
            minute = minute > 9 ? minute : '0' + minute // 如果分钟小于10,则在前面加0补充为两位数字

            let value = param[0].data[1]
            if (value == '1') {
              value = 'up'
            } else {
              value = 'down'
            }
            return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('/') + ' ' + [hour, minute].join(':') + '\n' + value
          }
        },
        legend: { show: false },
        xAxis: {
          show: false,
          type: 'time'
        },
        yAxis: {
          type: 'value',
          show: false
        },
        useUTC: false, // 使用本地时间
        visualMap: {
          show: false,
          pieces: [{
            gt: -0.5,
            lt: 0.5,
            color: '#d64f40'
          }, {
            gt: 0.6,
            lt: 1.5,
            color: '#50d050'
          }]
        },
        series: series
      }
      const chart = echarts.init(document.querySelector('#littleChart'))
      chart.setOption(option)// 创建图表
    },
    timeFormat (val) {
      return this.utcTimeToTimezoneStr(val)
    }
  },
  mounted () {
    this.firstLoad = false
    setTimeout(() => {
      this.ready = true
    }, 300)
  },
  beforeDestroy () {
    this.clearChart()
  }
}
</script>
<style>
.colorFA901C{
  color: #fa901c;
}
</style>
