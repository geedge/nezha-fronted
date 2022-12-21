<template>
  <div style="height: 100%">
    <el-table
      id="roleTable"
      ref="dataTable"
      class="asset-table2"
      :data="tableData"
      :height="height"
      :default-sort="orderBy"
      border
      @cell-mouse-enter="cellMouseEnter"
      @header-dragend="dragend"
      @sort-change="tableDataSort"
      @selection-change="selectionChange"
      @row-dblclick="(row)=>{$emit('showBottomBox', 'panelTab', row)}"
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
        class="data-column"
      >
        <template slot="header">
          <span class="data-column__span">{{item.label}} <i class="nz-icon nz-icon-label" v-if="item.type==='label'" style="color: #fa901c"/></span>
          <div class="col-resize-area"></div>
        </template>
        <template slot-scope="scope" :column="item">
          <template v-if="item.prop === 'name'">
            <!-- <div class="document-copy-block">
              <span class="document-copy-text">{{scope.row.name ? scope.row.name : '-'}}</span>
              <i v-if="scope.row.name" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(scope.row.name)" :title="$t('overall.copyText')"></i>
            </div> -->
            <copy :copyData='scope.row.name' :showInfo='scope.row.name'>
              <template slot="copy-text">
                 {{scope.row.name ? scope.row.name : '-'}}
              </template>
            </copy>
          </template>
           <template v-else-if="item.prop === 'manageIp'">
            <copy :copyData='scope.row.manageIp' :showInfo='scope.row.manageIp'>
              <template slot="copy-text">
                 {{scope.row.manageIp ? scope.row.manageIp : '-'}}
              </template>
            </copy>
          </template>
          <template v-else-if="item.prop === 'type'">{{scope.row.type ? scope.row.type.name : '-'}}</template>
          <template v-else-if="item.prop === 'state'">{{scope.row.state ? scope.row.state.name : '-'}}</template>
          <template v-else-if="item.prop === 'endpointNum'">
            <span style="cursor: pointer" @click.stop="$emit('showBottomBox', 'endpointTab', scope.row)" @dblclick.stop=""><i class="nz-icon nz-icon-overview-endpoint monitorColor"></i> <span>{{scope.row.endpointNum ? scope.row.endpointNum : 0}}</span></span>
          </template>
          <template v-else-if="item.prop === 'alertNum'">
            <!--          v-my-loading:ldsFacebook="scope.row.trendLoading"-->
            <span style="cursor: pointer" @click.stop="$emit('showBottomBox', 'alertMessageTab', scope.row)" @dblclick.stop="">
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
          <template v-else-if="item.prop === 'dc'">{{scope.row.dc ? scope.row.dc.name : '-'}}</template>
          <template v-else-if="item.prop === 'cabinet'">
            <span v-if="scope.row.cabinet && scope.row.cabinet !== '--'">{{scope.row.cabinet.name}}&nbsp;{{returnCabinet( scope.row.cabinetStart, scope.row.cabinetEnd)}}</span>
            <span v-else >-</span>
          </template>
          <template v-else-if="item.prop === 'pingInfo'">
            <div class="ping-info" v-if="scope.row.pingInfo">
              <div :class="{'active-icon green-bg':scope.row.pingInfo.status == 1,'active-icon red-bg':scope.row.pingInfo.status == 0}" style="position: relative">
              </div>
              <div class="active-icon-content">{{$t('asset.assetStatPre')+(scope.row.pingInfo.lastUpdate?utcTimeToTimezoneStr(scope.row.pingInfo.lastUpdate):$t('asset.assetStatDown'))}}</div>
              {{scope.row.pingInfo.rtt?scope.row.pingInfo.rtt+'ms':''}}
            </div>
          </template>
          <template v-else-if="item.prop === 'model'">{{scope.row.model ? scope.row.model.name : '-'}}</template>
          <template v-else-if="item.prop === 'parent'">
          <span
            v-if="scope.row.parent"
            style="cursor: pointer"
            @mouseenter="labelHover(scope.row, 'asset', true, false, $event)"
            @mouseleave="labelHover(scope.row, 'asset', false, false)">
            {{scope.row.parent.name}}
              </span>
            <span v-else> - </span>
          </template>
          <template v-else-if="item.prop === 'children'">
            <div  @click.stop="$emit('showBottomBox', 'assetSubTab', scope.row)" v-if="scope.row.childrenNum" style="cursor: pointer" @dblclick.stop="">
              <i class="nz-icon nz-icon-overview-project monitorColor color23BF9A"></i>
              {{scope.row.childrenNum}}</div>
            <!--          <span v-else-if="scope.row.pid == -1">  <i class="nz-icon nz-icon-overview-project monitorColor color23BF9A"></i> 0 </span>-->
            <span v-else> - </span>
          </template>
          <template v-else-if="item.prop === 'sn'">
            <copy :copyData='scope.row[item.prop]' :showInfo='scope.row[item.prop]'>
                  <template slot="copy-text">
                     {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
                  </template>
              </copy>
          </template>
          <template v-else-if="item.prop === 'talon'">
            <div v-if="scope.row['clientState']===1">
              <div class="active-icon green-bg inline-block"></div>
              OK
            </div>
            <div v-else-if="scope.row['clientState']===0">
              <div class="active-icon gray-bg inline-block"></div> {{ $t('profile.close') }}
            </div>
            <div v-else-if="scope.row['clientState']===2">
              <div class="active-icon red-bg inline-block"></div> {{ $t('asset.connectionTimedOut') }}
            </div>
            <div v-else-if="scope.row['clientState']===3">
              <div class="active-icon red-bg inline-block"></div> {{ $t('overall.AuthenticationFailed') }}
            </div>
            <div v-else-if="scope.row['clientState']===4">
              <div class="active-icon red-bg inline-block"></div> {{ $t('config.terminallog.statusItem.unknownError') }}
            </div>
            <template v-else>-</template>
          </template>
          <template v-else-if="item.prop === 'brand'">{{scope.row.brand ? scope.row.brand.name : '-'}}</template>
          <template v-else-if="item.prop === 'purchaseDate'">{{scope.row.purchaseDate ? scope.row.purchaseDate : '-'}}</template>
          <span v-else-if="item.prop === 'id'" :id="'globalSearch' + scope.row.id">{{scope.row[item.prop]}}</span>
          <template v-else>
          <span v-if="scope.row.fields&&scope.row.fields.find(field => field.name === item.prop)">
            {{scope.row.fields.find(field => field.name === item.prop).value.join(',')}}
          </span>
            <span v-else>
             {{scope.row[item.prop]}}
          </span>
          </template>
        </template>
      </el-table-column>
      <el-table-column
        v-if="showOption"
        :width="operationWidth"
        fixed="right">
        <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
        <div slot-scope="scope" class="table-operation-items">
          <button v-if="assetTab"  class="table-operation-item" v-has="'model_edit'" @click="$emit('edit', scope.row)" :title="$t('overall.edit')"><i class="nz-icon nz-icon-edit"></i></button>
          <button v-else class="table-operation-item" @click="$emit('showBottomBox', 'panelTab', scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button>
          <el-dropdown size="medium" v-has="['asset_edit','asset_connect','asset_add','asset_delete', 'alertSilence_add']" trigger="click" @command="tableOperation">
            <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
              <i class="nz-icon nz-icon-more3"></i>
            </div>
            <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
              <el-dropdown-item v-if="!assetTab" v-has="'asset_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'asset_connect'" :command="['cli', scope.row]" :disabled="!scope.row.authUsername"><i class="nz-icon nz-icon-cli"></i><span class="operation-dropdown-text">{{$t('config.system.terminal.terminal')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'asset_add'" :command="['duplicate', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'asset_delete'" :command="['delete', scope.row]">
                  <delete-button
                  ref="deleteButton"
                  :from="'asset'"
                  :forceDeleteShow="true"
                  :deleteTitle="'overall.asset'"
                  :type="'link'"
                  :title="$t('overall.delete')"
                  id="asset-list-delete"
                  v-has="'asset_delete'"
                  :api="api"
                  :single="true"
                  :delete-objs="singleDelete"
                  @before="delFlag=true"
                  ></delete-button>
              </el-dropdown-item>
              <!-- <el-dropdown-item v-has="'asset_delete'" :command="['delete', scope.row]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item> -->
              <el-dropdown-item v-has="'alertSilence_add'" :command="['fastSilence', scope.row, 'asset']"><i class="nz-icon nz-icon-fast-silence"></i><span class="operation-dropdown-text">{{$t('overall.silenceAlert')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'asset_add'" :command="['topology', scope.row, 'asset']"><i class="nz-icon nz-icon-Topology"></i><span class="operation-dropdown-text">{{$t('overall.topology')}}</span></el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-table-column>
      <template slot="empty">
        <div  v-if="!loading" class="table-no-data">
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
      @tipHover='tipHover'
    ></alertLabel>
  </div>
</template>

<script>
import table from '@/components/common/mixin/table'
import { showTableTooltip, hideTableTooltip } from '@/components/common/js/tools'
// import bus from '@/libs/bus'
import deleteButton from '@/components/common/deleteButton'
import copy from '@/components/common/copy'
import alertLabel from '@/components/common/alert/alertLabel'
import alertDaysInfo from '@/components/common/alert/alertDaysInfo'
import alertLabelMixin from '@/components/common/mixin/alertLabelMixin'
export default {
  name: 'assetTable',
  mixins: [table, alertLabelMixin],
  components: {
    alertLabel: alertLabel,
    alertDaysInfo,
    copy,
    deleteButton
  },
  props: {
    showOption: {
      type: Boolean,
      default: true
    },
    assetTab: Boolean,
    loading: Boolean
  },
  data () {
    return {
      needAlertDaysData: true,
      trendKey: 'assetId',
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 110,
          sortable: 'custom'
        }, {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true,
          minWidth: 150,
          sortable: 'custom'
        }, {
          label: this.$t('asset.manageIp'),
          prop: 'manageIp',
          show: true,
          minWidth: 140,
          sortable: 'custom'
        }, {
          label: this.$t('asset.parent'),
          prop: 'parent',
          show: false,
          minWidth: 110
        }, {
          label: this.$t('overall.assetSubTab'),
          prop: 'children',
          show: false,
          minWidth: 120
        }, {
          label: this.$t('overall.type'),
          prop: 'type',
          show: true,
          minWidth: 140,
          sortable: 'custom'
        }, {
          label: this.$t('overall.state'),
          prop: 'state',
          show: true,
          minWidth: 110,
          sortable: 'custom'
        }, {
          label: this.$t('asset.pingInfo'),
          prop: 'pingInfo',
          show: true,
          minWidth: 110
        }, {
          label: this.$t('overall.dc'),
          prop: 'dc',
          show: true,
          minWidth: 140,
          sortable: 'custom'
        }, {
          label: this.$t('asset.cabinet'),
          prop: 'cabinet',
          show: true,
          minWidth: 110,
          sortable: 'custom'
        }, {
          label: this.$t('overall.alert'),
          prop: 'alertNum',
          show: true,
          width: 120,
          sortable: 'custom'
        }, {
          label: this.$t('asset.endpointNum2'),
          prop: 'endpointNum',
          show: true,
          minWidth: 160,
          sortable: 'custom'
        }, {
          label: this.$t('asset.brand'),
          prop: 'brand',
          show: true,
          minWidth: 120,
          sortable: 'custom'
        }, {
          label: this.$t('asset.model'),
          prop: 'model',
          show: true,
          minWidth: 110,
          sortable: 'custom'
        }, {
          label: this.$t('asset.sn'),
          prop: 'sn',
          show: true,
          minWidth: 120
        }, {
          label: this.$t('asset.talon'),
          // prop: 'clientState',
          prop: 'talon',
          show: true,
          sortable: 'custom',
          minWidth: 150
        }, {
          label: this.$t('asset.purchaseDate'),
          prop: 'purchaseDate',
          show: false,
          minWidth: 120
        }
      ]
    }
  },
  methods: {
    showTableTooltip,
    hideTableTooltip,
    tableDataSort (item) {
      let orderBy = ''
      const str = item.prop
      if (str === 'dc') {
        orderBy = str
      }
      // if (str === 'clientState') {
      //   str = 'talon_status'
      //   orderBy = str
      // }
      if (item.order === 'ascending') {
        orderBy = str
      }
      if (item.order === 'descending') {
        orderBy = '-' + str
      }
      this.$emit('orderBy', orderBy)
    },
    messageStyle (title, row) {
      if (title.prop === 'alertNum') {
        if (row.alertNum > 0) {
          return 'danger'
        } else {
          return 'success'
        }
      }
      if (title.label === 'endpointNum') {
        if (row.state === 3) {
          return 'suspended'
        } else {
          if (row.endpointDownNum > 0) {
            return 'danger'
          } else {
            return 'success'
          }
        }
      }
      return ''
    },
    showEndpoint (asset) {
      this.bottomBox.asset = Object.assign({}, asset)
      this.bottomBox.targetTab = 'endpoint'
      this.bottomBox.showSubList = true
    },
    returnCabinet (start, end) { // 返回机柜u位信息
      if (!start || !end) {
        return ''
      }
      return `[${start}-${end}]`
    }
  }
}
</script>
