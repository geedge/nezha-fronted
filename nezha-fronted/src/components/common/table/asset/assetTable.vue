<template>
  <el-table
    id="roleTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    border
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="selectionChange"
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
        <span>{{item.label}}</span>
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
          <span v-else >--</span>
        </template>
        <template v-else-if="item.prop == 'pingInfo'">
          <div @mouseenter="showTableTooltip( formatPingTime(scope.row.pingInfo.lastUpdate), true, $event)" @mouseleave="hideTableTooltip" >
            <div :class="{'active-icon green-bg':scope.row.pingInfo.status == 1,'active-icon red-bg':scope.row.pingInfo.status == 0}"></div><span>{{scope.row.pingInfo.rtt?scope.row.pingInfo.rtt+'ms':''}}</span>
          </div>
        </template>
        <template v-else-if="item.prop === 'model'">{{scope.row.model ? scope.row.model.name : '-'}}</template>
        <template v-else-if="item.prop === 'parent'">{{scope.row.parent ? scope.row.parent.name : '-'}}</template>
        <template v-else-if="item.prop === 'brand'">{{scope.row.brand ? scope.row.brand.name : '-'}}</template>
        <template v-else-if="item.prop === 'purchaseDate'">{{scope.row.purchaseDate ? scope.row.purchaseDate : '--'}}</template>
        <template v-else>{{scope.row[item.prop]}}</template>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item" @click="$emit('showBottomBox', 'panelTab', scope.row)"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <span>…</span><i class="nz-icon nz-icon-arrow-down"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item :command="['cli', scope.row]" :disabled="!scope.row.authUsername"><i class="nz-icon nz-icon-cli"></i><span class="operation-dropdown-text">Connect</span></el-dropdown-item>
            <el-dropdown-item :command="['duplicate', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('dashboard.duplicate')}}</span></el-dropdown-item>
            <el-dropdown-item :command="['delete', scope.row]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
import { showTableTooltip, hideTableTooltip } from '@/components/common/js/tools'
import bus from '@/libs/bus'
export default {
  name: 'assetTable',
  mixins: [table],
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
          sortable: 'custom'
        }, {
          label: this.$t('asset.manageIp'),
          prop: 'manageIp',
          show: true,
          width: 140,
          sortable: 'custom'
        }, {
          label: this.$t('overall.parent'),
          prop: 'parent',
          show: false,
          width: 110
        }, {
          label: this.$t('overall.type'),
          prop: 'type',
          show: true,
          width: 140,
          sortable: 'custom'
        }, {
          label: this.$t('asset.state'),
          prop: 'state',
          show: true,
          width: 100,
          sortable: 'custom'
        }, {
          label: this.$t('asset.pingInfo'),
          prop: 'pingInfo',
          show: true,
          width: 110
        }, {
          label: this.$t('overall.dc'),
          prop: 'dc',
          show: true,
          width: 140,
          sortable: 'custom'
        }, {
          label: this.$t('asset.cabinet'),
          prop: 'cabinet',
          show: true,
          width: 110,
          sortable: 'custom'
        }, {
          label: this.$t('asset.alertNum'),
          prop: 'alertNum',
          show: true,
          width: 140,
          sortable: 'custom'
        }, {
          label: this.$t('asset.endpointNum2'),
          prop: 'endpointNum',
          show: true,
          width: 160,
          sortable: 'custom'
        }, {
          label: this.$t('asset.brand'),
          prop: 'brand',
          show: true,
          width: 120,
          sortable: 'custom'
        }, {
          label: this.$t('asset.model'),
          prop: 'model',
          show: true,
          width: 110,
          sortable: 'custom'
        }, {
          label: 'SN',
          prop: 'sn',
          show: true,
          width: 110
        }, {
          label: this.$t('asset.purchaseDate'),
          prop: 'purchaseDate',
          show: false,
          width: 110
        }
      ]
    }
  },
  methods: {
    showTableTooltip,
    hideTableTooltip,
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
    },
    formatPingTime (str) {
      if (!str || str == '') {
        return this.$t('asset.assetStatPre') + this.$t('asset.assetStatDown')
      }
      const ds = '-'
      const ts = ':'
      const time = new Date(bus.UTCTimeToConfigTimezone(str))
      const year = time.getFullYear()
      const month = time.getMonth() + 1 > 9 ? time.getMonth() + 1 : ('0' + (time.getMonth() + 1))
      const day = time.getDate() > 9 ? time.getDate() : ('0' + time.getDate())
      const hours = time.getHours() > 9 ? time.getHours() : ('0' + time.getHours())
      const minutes = time.getMinutes() > 9 ? time.getMinutes() : ('0' + time.getMinutes())
      const seconds = time.getSeconds() > 9 ? time.getSeconds() : ('0' + time.getSeconds())
      return this.$t('asset.assetStatPre') + year + ds + month + ds + day + ' ' + hours + ts + minutes + ts + seconds
    }
  }
}
</script>
