<template>
  <el-table
    id="roleTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    :default-sort="orderBy"
    border
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
        <template v-if="item.prop === 'type'">{{scope.row.type ? scope.row.type.name : '-'}}</template>
        <template v-else-if="item.prop === 'state'">{{scope.row.state ? scope.row.state.name : '-'}}</template>
        <template v-else-if="item.prop === 'endpointNum'">
          <span style="cursor: pointer" @click="$emit('showBottomBox', 'endpointTab', scope.row)"><i class="nz-icon nz-icon-overview-endpoint monitorColor"></i> <span>{{scope.row.endpointNum ? scope.row.endpointNum : 0}}</span></span>
<!--          <div :class="messageStyle(item, scope.row)" @mouseenter="showTableTooltip(`${$t('asset.down')} / ${$t('asset.suspended')} / ${$t('asset.total')}`, true, $event)" @mouseleave="hideTableTooltip">
            <span class="link" style="padding: 2px 8px" @click="showEndpoint(scope.row)">{{scope.row.endpointDownNum}}/{{scope.row.endpointSuspendedNum}}/{{scope.row.endpointNum}}</span>
          </div>-->
        </template>
        <template v-else-if="item.prop === 'alertNum'">
          <span style="cursor: pointer" @click="$emit('showBottomBox', 'alertMessageTab', scope.row)"><i :class="scope.row.alertNum ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i> <span>{{scope.row.alertNum ? scope.row.alertNum : 0}}</span></span>
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
            @mouseenter="labelHover(scope.row, 'asset', true, $event)"
            @mouseleave="labelHover(scope.row, 'asset', false)">
            {{scope.row.parent.name}}
                <alertLabel
                  v-if="scope.row.loading"
                  :id="scope.row.pid"
                  :that="scope.row"
                  :type="'asset'"
                ></alertLabel>
              </span>
          <span v-else> - </span>
        </template>
        <template v-else-if="item.prop === 'children'">
          <div  @click="$emit('showBottomBox', 'assetSubTab', scope.row)" v-if="scope.row.childrenNum" style="cursor: pointer">
            <i class="nz-icon nz-icon-overview-project monitorColor color23BF9A"></i>
            {{scope.row.childrenNum}}</div>
<!--          <span v-else-if="scope.row.pid == -1">  <i class="nz-icon nz-icon-overview-project monitorColor color23BF9A"></i> 0 </span>-->
          <span v-else> - </span>
        </template>
        <template v-else-if="item.prop === 'clientState'">
          <div v-if="scope.row[item.prop]===1">
            <div class="active-icon green-bg inline-block"></div>
            {{ $t('overall.normal') }}
          </div>
          <div v-else-if="scope.row[item.prop]===0">
            <div class="active-icon red-bg inline-block"></div> {{ $t('overall.unusual') }}
          </div>
          <div v-else-if="scope.row[item.prop]===-1">
            <div class="active-icon red-bg inline-block"></div> {{ $t('overall.AuthenticationFailed') }}
          </div>
          <template v-else>-</template>
        </template>
        <template v-else-if="item.prop === 'brand'">{{scope.row.brand ? scope.row.brand.name : '-'}}</template>
        <template v-else-if="item.prop === 'purchaseDate'">{{scope.row.purchaseDate ? scope.row.purchaseDate : '-'}}</template>
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
      :resizable="false"
      v-if="showOption"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button v-if="assetTab"  class="table-operation-item" v-has="'model_edit'" @click="$emit('edit', scope.row)"><i class="nz-icon nz-icon-edit"></i></button>
        <button v-else class="table-operation-item" @click="$emit('showBottomBox', 'panelTab', scope.row)"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" v-has="['asset_edit','asset_connect','asset_add','asset_delete']" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-public-box-select-top right-public-box-dropdown-top">
            <el-dropdown-item v-if="!assetTab" v-has="'asset_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'asset_connect'" :command="['cli', scope.row]" :disabled="!scope.row.authUsername"><i class="nz-icon nz-icon-cli"></i><span class="operation-dropdown-text">{{$t('dashboard.connect')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'asset_add'" :command="['duplicate', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('dashboard.duplicate')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'asset_delete'" :command="['delete', scope.row]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'alertSilence_add'" :command="['fastSilence', scope.row, 'asset']"><i class="nz-icon nz-icon-fast-silence"></i><span class="operation-dropdown-text">{{$t('overall.silenceAlert')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
    <template slot="empty">
      <div  v-if="!loading" class="right-no-data">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#nz-icon-no-data-list"></use>
        </svg>
        <div style="font-size: 16px;color: #333333;font-weight: 400;">No results found</div>
      </div>
      <div v-else>&nbsp;</div>
    </template>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
import { showTableTooltip, hideTableTooltip } from '@/components/common/js/tools'
// import bus from '@/libs/bus'
import alertLabel from '@/components/common/alert/alertLabel'
export default {
  name: 'assetTable',
  mixins: [table],
  components: {
    alertLabel: alertLabel
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
          label: this.$t('overall.parent'),
          prop: 'parent',
          show: false,
          minWidth: 110
        }, {
          label: this.$t('overall.children'),
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
          label: this.$t('asset.state'),
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
          label: this.$t('asset.alertNum'),
          prop: 'alertNum',
          show: true,
          minWidth: 140,
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
          label: 'SN',
          prop: 'sn',
          show: true,
          minWidth: 110
        }, {
          label: 'Talon',
          prop: 'clientState',
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
      let str = item.prop
      if (str === 'dc') {
        orderBy = str
      }
      if (str === 'clientState') {
        str = 'talon_status'
        orderBy = str
      }
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
    // label 鼠标划入
    labelHover (item, type, loading, e) {
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        this.$set(item, 'position', position)
      }
      this.$set(item, 'loading', loading)
      // this.$set(this.tableData,index,item);// 调用父组件
    },
    returnCabinet (start, end) { // 返回机柜u位信息
      if (!start || !end) {
        return ''
      }
      return `[${start}-${end}]`
    }
    // formatPingTime (str) {
    //   if (!str || str == '') {
    //     return this.$t('asset.assetStatPre') + this.$t('asset.assetStatDown')
    //   }
    //   const ds = '-'
    //   const ts = ':'
    //   const time = new Date(bus.UTCTimeToConfigTimezone(str))
    //   const year = time.getFullYear()
    //   const month = time.getMonth() + 1 > 9 ? time.getMonth() + 1 : ('0' + (time.getMonth() + 1))
    //   const day = time.getDate() > 9 ? time.getDate() : ('0' + time.getDate())
    //   const hours = time.getHours() > 9 ? time.getHours() : ('0' + time.getHours())
    //   const minutes = time.getMinutes() > 9 ? time.getMinutes() : ('0' + time.getMinutes())
    //   const seconds = time.getSeconds() > 9 ? time.getSeconds() : ('0' + time.getSeconds())
    //   return this.$t('asset.assetStatPre') + year + ds + month + ds + day + ' ' + hours + ts + minutes + ts + seconds
    // }
  }
}
</script>
<style scoped lang="scss">
  /deep/ .el-table__row{
    td{
      position: relative;
    }
  }
.active-icon-content {
  display: none;
  position: absolute;
  background: #FFF;
  min-width: 150px;
  border: 1px solid #EBEEF5;
  padding: 12px;
  z-index: 2000;
  color: #606266;
  line-height: 1.4;
  text-align: justify;
  font-size: 14px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  left: 100%;
  top: -60%;
  width: auto;
  white-space: nowrap;
  transform: translateY(50%);
}

.ping-info:hover {
  .active-icon-content{
    display: block;
  }
}
</style>
