<template>
  <div style="height: 100%">
    <el-table
      id="endpointTable"
      ref="dataTable"
      :data="tableData"
      :height="height"
      border
      :default-sort="orderBy"
      @header-dragend="dragend"
      @cell-mouse-enter="cellMouseEnter"
      @sort-change="tableDataSort"
      @selection-change="selectionChange"
      @row-dblclick="(row)=>{$emit('showBottomBox', 'dashboardTab', row)}"
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
        :key="`col-${index}-${item.prop}`"
        :fixed="item.fixed"
        :label="item.label"
        :min-width="`${item.minWidth}`"
        :prop="item.prop"
        :resizable="true"
        :sort-orders="['ascending', 'descending']"
        :sortable="item.sortable"
        :width="`${item.width}`"
        class="data-column"
      >
        <template slot="header">
          <span class="data-column__span">{{item.label}}</span>
          <div class="col-resize-area"></div>
        </template>
        <template slot-scope="scope" :column="item">
          <template v-if="item.prop === 'name'">
            <div class="document-copy-block">
              <span class="document-copy-text">{{scope.row[item.prop]}}</span>
              <i v-if="scope.row[item.prop]" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(scope.row.name)" :title="$t('overall.copyText')"></i>
            </div>
          </template>
          <template v-else-if="item.prop === 'type'">
            {{scope.row.module.type}}
          </template>
          <template v-else-if="item.prop === 'project'">
            <div class="document-copy-block">
              <span class="document-copy-text"
              @mouseenter="labelHover(scope.row, item.prop, true,true, $event)"
              @mouseleave="labelHover(scope.row, item.prop, false,true)">
              {{scope.row[item.prop].name}}
              </span>
              <i v-if="scope.row[item.prop].name" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(scope.row[item.prop].name)" :title="$t('overall.copyText')"></i>
            </div>
          </template>
          <template v-else-if="item.prop === 'module'">
            <div class="document-copy-block">
              <span class="document-copy-text"
                @mouseenter="labelHover(scope.row, item.prop, true,true, $event)"
                @mouseleave="labelHover(scope.row, item.prop, false,true)">
                <i class="nz-icon nz-icon-overview-module monitorColor"/>
                {{scope.row[item.prop].name}}
              </span>
              <i v-if="scope.row[item.prop].name" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(scope.row[item.prop].name)" :title="$t('overall.copyText')"></i>
            </div>
          </template>
          <template v-else-if="item.prop === 'asset'">
           <div class="document-copy-block">
              <span
                class="document-copy-text"
                @mouseenter="labelHover(scope.row, item.prop, true,true, $event)"
                @mouseleave="labelHover(scope.row, item.prop, false,true)">
                <i class="nz-icon nz-icon-overview-project monitorColor color23BF9A"></i>
                {{scope.row.asset&&scope.row.asset.name}}
              </span>
              <i v-if="scope.row.asset&&scope.row.asset.name" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(scope.row.asset.name)" :title="$t('overall.copyText')"></i>
            </div>
          </template>
          <template v-else-if="item.prop === 'alerts'">
          <span class="num-cursor" @click.stop="showBottomBox('endpointAlertMessage', scope.row)" @dblclick.stop="">
            <i :class="scope.row.alertNum ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert vertical-align-top;"  @mouseenter="tooltipHover(scope.row,true, $event)" @mouseleave="tooltipHover(scope.row,false, $event)"></i>
            <div v-if="scope.row.alertNumtooltipShow" class="alert-days-info-tooltip" :style="{left: scope.row.left + 'px',top:scope.row.top + 'px'}">
              <div class="tooltip-title">{{$t('project.topology.alert')}}({{$t('overall.active')}})</div>
              <div class="severity-info" style='justify-content: space-between'>
                <div class="severity-name">{{$t('overall.result.total')}}</div>
                <div class="severity-value">{{scope.row.alertNum}}</div>
              </div>
            </div>
            <alertDaysInfo
              v-show="!scope.row.trendLoading"
              :alertDaysData="scope.row.alertDaysData"
            />
          </span>
          </template>
          <template v-else-if="item.prop === 'configs'">
          <span class="configs-endpoint metrics"
                @mouseenter="labelHover1(scope.row, item.prop, true, $event)"
                @mouseleave="labelHover1(scope.row, item.prop, false, $event, true)">
            [{{scope.row.configs[0].enable ?  'Metrics':''}}{{scope.row.configs[0].enable&&scope.row.configs[1].enable?',':''}}{{scope.row.configs[1].enable ?  'Logs' : ''}}]
          </span>
          <nz-tooltip :that="scope.row[item.prop]" class="data-column__" v-if="scope.row[item.prop] && scope.row[item.prop].loading" :type="item.prop" @tipHover="tipHover($event,scope.row, item.prop,)" >
              <div name="default">
                <span class="copy-value-content" :title="$t('overall.duplicate')"> <i class="nz-icon nz-icon-override" @click="copyValue(clConfigs(scope.row))"></i></span>
                <pre class="copy-value-content__pre">{{JSON.stringify(clConfigs(scope.row),null,2)}}</pre>
              </div>
            </nz-tooltip>
          </template>

          <template v-else-if="item.prop === 'state'">
            <!-- metrics -->
            <span
              style="width: auto;display: inline-block"
              @mouseenter="labelHoverConfigs(scope.row, 0, true, $event)"
              @mouseleave="labelHoverConfigs(scope.row, 0, false, $event)"
            >
              <span class="endpoint-cell-left"><i class="nz-icon nz-icon-Metrics colorFA901C" /> {{$t('overall.metric')}} </span>
              <span v-if="scope.row.configs[0].state===0 || !scope.row.configs[0].state">
                <span class="active-icon red-bg inline-block"></span>
              </span>
              <span v-else-if="scope.row.configs[0].state===1">
                <span class="active-icon green-bg inline-block"></span>
              </span>
              <span v-else-if="scope.row.configs[0].state">
                <span class="active-icon gray-bg inline-block"></span>
              </span>
            </span>
            <nz-tooltip :that="scope.row.configs[0]"  v-if="scope.row.configs[0] && scope.row.configs[0].loading && scope.row.configs[0].state  > 1" :type="'configs[0]'">
              <div name="default">
                <div v-html="suspendedStr(scope.row.configs[0].state)"></div>
              </div>
            </nz-tooltip>
            <!-- logs -->
            <span
              style="width: auto;display: inline-block"
              @mouseenter="labelHoverConfigs(scope.row, 1, true, $event)"
              @mouseleave="labelHoverConfigs(scope.row, 1, false, $event)">
              <span class="endpoint-cell-left" style="margin-left: 10px"><i class="nz-icon nz-icon-logs colorFA901C" /> {{$t('dashboard.dashboard.chartForm.typeVal.log.label')}} </span>
              <span v-if="scope.row.configs[1].state===0 || !scope.row.configs[1].state">
                <span class="active-icon red-bg inline-block"></span>
              </span>
              <span v-else-if="scope.row.configs[1].state===1">
                <span class="active-icon green-bg inline-block"></span>
              </span>
              <span v-else-if="scope.row.configs[1].state">
                <span class="active-icon gray-bg inline-block"></span>
              </span>
            </span>
            <nz-tooltip :that="scope.row.configs[1]"  v-if="scope.row.configs[1] && scope.row.configs[1].loading && scope.row.configs[1].state > 1" :type="'configs[1]'" :isTopoInfo="isTopoInfo">
              <div name="default">
                <div v-html="suspendedStr(scope.row.configs[1].state)"></div>
              </div>
            </nz-tooltip>
          </template>
          <template v-else-if="item.prop === 'enabled'">
            <span v-if="scope.row[item.prop] === 1">{{$t('overall.enabled')}}</span>
            <span v-else>{{$t('profile.close')}}</span>
          </template>
          <span v-else-if="item.prop === 'id'" :id="'globalSearch' + scope.row.id">{{scope.row[item.prop]}}</span>
          <span v-else>{{scope.row[item.prop] ? scope.row[item.prop] : ''}}</span>
        </template>
      </el-table-column>
      <el-table-column
        :resizable="false"
        :width="operationWidth"
        v-if="showOption"
        fixed="right">
        <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
        <div slot-scope="scope" class="table-operation-items">
          <button v-if="endpointTab"  class="table-operation-item" v-has="'monitor_endpoint_edit'" @click="$emit('edit', scope.row)" :title="$t('overall.edit')"><i class="nz-icon nz-icon-edit"></i></button>
          <button v-else class="table-operation-item"  @click="$emit('showBottomBox', 'dashboardTab', scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button>
          <el-dropdown size="medium" v-has="['monitor_endpoint_edit','monitor_endpoint_delete','alertSilence_add']" trigger="click" @command="tableOperation">
            <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
              <i class="nz-icon nz-icon-more3"></i>
            </div>
            <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
              <!--            <el-dropdown-item v-if="!endpointTab" :command="['endpointQuery', scope.row]"><i class="nz-icon nz-icon-search"></i><span class="operation-dropdown-text">{{$t('overall.query')}}</span></el-dropdown-item>-->
              <el-dropdown-item v-if="!endpointTab" v-has="'monitor_endpoint_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'monitor_endpoint_delete'" :command="['delete-rel', scope.row, {forceDeleteShow:false, single:true}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'monitor_endpoint_edit'" :command="['copy', scope.row, 'project']"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'alertSilence_add'" :command="['fastSilence', scope.row, 'endpoint']"><i class="nz-icon nz-icon-fast-silence"></i><span class="operation-dropdown-text">{{$t('overall.silenceAlert')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'asset_add'" :command="['topology', scope.row, 'endpoint']"><i class="nz-icon nz-icon-Topology"></i><span class="operation-dropdown-text">{{$t('overall.topology')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'monitor_endpoint_add'" :command="['diagnosis', scope.row,{from:'endpoint'}]"><i class="nz-icon nz-icon-diagnosis"></i><span class="operation-dropdown-text">{{$t('overall.diagnosis')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'monitor_endpoint_add'" :command="['metricTarget', scope.row, 'endpoint']" :disabled="scope.row.configs[0].config.protocol !== ('http'||'https')"><i class="nz-icon nz-icon-Metrics"></i><span class="operation-dropdown-text">{{$t('endpoints.metricTarget')}}</span></el-dropdown-item>
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
    <alertLabel
      v-if="alertLabelShow"
      :id="alertLabelId"
      :that="alertLabelObj"
      :type="alertLabelType"
    ></alertLabel>
  </div>
</template>

<script>
import table from '@/components/common/mixin/table'
import alertLabel from '../../alert/alertLabel'
import nzTooltip from '../../alert/nzTooltip'
import alertLabelMixin from '@/components/common/mixin/alertLabelMixin'
export default {
  name: 'endpointTable',
  components: {
    alertLabel,
    nzTooltip
  },
  mixins: [table, alertLabelMixin],
  props: {
    showOption: {
      type: Boolean,
      default: true
    },
    isTopoInfo: {
      type: Boolean,
      default: false
    },
    endpointTab: Boolean,
    loading: Boolean
  },
  data () {
    return {
      needAlertDaysData: true,
      trendKey: 'endpointId',
      tableTitle: [ // 原始table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        }, {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('project.project.projectName'),
          prop: 'project',
          show: true,
          minWidth: 100,
          sortable: 'custom'
        },
        {
          label: this.$t('asset.asset'),
          prop: 'asset',
          show: true,
          minWidth: 90,
          sortable: 'custom'
        },
        {
          label: this.$t('overall.module'),
          prop: 'module',
          show: true
        },
        {
          label: this.$t('overall.config'),
          prop: 'configs',
          minWidth: 150,
          show: false
        },
        {
          label: this.$t('overall.alert'),
          prop: 'alerts',
          show: true,
          Width: 120,
          sortable: 'custom'
        },
        {
          label: this.$t('overall.state'),
          prop: 'state',
          show: true,
          minWidth: 200
        }
        // {
        //   label: this.$t('project.endpoint.status'),
        //   prop: 'enabled',
        //   show: false
        // }
      ]
    }
  },
  methods: {
    copyValue (item) {
      const str = item
      // const domUrl = document.createElement('input')
      // domUrl.value = JSON.stringify(str)
      // domUrl.id = 'creatDom'
      // document.body.appendChild(domUrl)
      // domUrl.select() // 选择对象
      // document.execCommand('Copy') // 执行浏览器复制命令
      // const creatDom = document.getElementById('creatDom')
      // creatDom.parentNode.removeChild(creatDom)
      // this.$message.success(this.$t('overall.copySuccess'))
      this.$copyText(JSON.stringify(str)).then(() => {
        this.$message.success({ message: this.$t('overall.copySuccess') })
      })
    },
    suspendedStr (status) { // 10进制转为2进制 分别给对应的状态
      if (!status || status === 1 || status == 0) { return '' }
      const arr = status.toString(2).split('')
      while (arr.length < 4) {
        arr.unshift('0')
      }
      arr.pop()
      let str = ''
      arr.forEach((item, index) => {
        if (index === 0) {
          str += `<div><div class="active-icon inline-block ${item == '0' ? 'gray-bg' : 'green-bg'}"></div> DC</div>`
        }
        if (index === 1) {
          str += `<div><div class="active-icon inline-block ${item == '0' ? 'gray-bg' : 'green-bg'}"></div> ASSET</div>`
        }
        if (index === 2) {
          str += `<div><div class="active-icon inline-block ${item == '0' ? 'gray-bg' : 'green-bg'}"></div> ENDPOINT</div>`
        }
        // if (index === 3) {
        //   str += `<div>PROMETHEUS <div class="active-icon inline-block ${item == '0' ? 'red-bg' : 'green-bg'}"></div></div>`
        // }
      })
      return str
    },
    // label 鼠标划入
    labelHover1 (item, type, loading, e, slow) {
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        this.$set(item[type], 'position', position)
      }
      if (slow) {
        item[type].timeout = setTimeout(() => {
          this.$set(item[type], 'loading', loading)
        }, 500)
      } else {
        if (item[type].timeout) {
          clearTimeout(item[type].timeout)
          item[type].timeout = null
        }
        this.$set(item[type], 'loading', loading)
      }
      // this.$set(this.tableData,index,item);// 调用父组件
    },
    tipHover (tipLoading, item, type) {
      if (item[type].timeout) {
        clearTimeout(item[type].timeout)
        item[type].timeout = null
      }
      this.$set(item[type], 'loading', tipLoading)
    },
    labelHoverConfigs (item, type, loading, e, slow) {
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        this.$set(item.configs[type], 'position', position)
      }
      if (slow) {
        item.configs[type].timeout = setTimeout(() => {
          this.$set(item.configs[type], 'loading', loading)
        }, 200)
      } else {
        this.$set(item.configs[type], 'loading', loading)
      }
      // this.$set(this.tableData,index,item);// 调用父组件
    },
    clConfigs (item) {
      const str = []
      if (item.configs[0].enable) {
        str.push(item.configs[0])
      }
      if (item.configs[1].enable) {
        str.push(item.configs[1])
      }
      return str
    }
  },
  computed: {}
}
</script>
