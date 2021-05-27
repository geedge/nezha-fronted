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
    @row-dblclick="(row)=>{showBottomBox(row.status==0 ? 'monitorTab' : 'cmdTab', row)}"
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
      :width="`${item.width}`"
      class="data-column"
    >
      <template slot="header">
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <span v-if="item.prop === 'time'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
        <template v-else-if="item.prop === 'status'">
          <span>{{getStatusText(scope.row.status)}}</span>
        </template>
        <template v-else-if="item.prop === 'uuid'">
          <span>{{scope.row.uuid.substring(0, 8).toUpperCase()}}</span>
        </template>
        <template v-else-if="item.prop === 'remote'">
          <span>{{getRemoteText(scope.row)}}</span>
        </template>
        <template v-else-if="item.prop === 'startTime'">
          <span> {{utcTimeToTimezoneStr(scope.row.startTime)}}</span>
        </template>
        <template v-else-if="item.prop === 'duration'">
          <el-tooltip :disabled="!scope.row.status" effect="light" placement="right">
            <div slot="content">
              {{$t('config.terminallog.endTime')}}<br/>
              {{utcTimeToTimezoneStr(scope.row.endTime)}}
            </div>
            <span>{{getDuration(scope.row)}}</span>
          </el-tooltip>
        </template>
        <template v-else-if="item.prop === 'authType'">
          <span v-if="scope.row.authType == 1">{{$t('config.terminallog.pin')}}</span>
          <span v-else-if="scope.row.authType == 2">{{$t('config.terminallog.key')}}</span>
        </template>
        <span v-else>{{scope.row[item.prop]}}</span>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <template v-if="scope.row.status == 0">
          <button :title="$t('config.terminallog.monitor.monitor')" class="table-operation-item" @click="showBottomBox('monitorTab', scope.row)"><i class="nz-icon nz-icon-JC"></i></button>
          <el-dropdown size="medium" trigger="hover" @command="tableOperation">
            <div class="table-operation-item table-operation-item--more">
              <i class="nz-icon nz-icon-more3"></i>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="['shutdown', scope.row]"><i class="nz-icon nz-icon-ZD"></i><span class="operation-dropdown-text">Kill</span></el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
        <template v-else>
          <button class="table-operation-item" @click="showBottomBox('cmdTab', scope.row)"><i class="nz-icon nz-icon-view1"></i></button>
          <el-dropdown size="medium" trigger="hover" @command="tableOperation">
            <div class="table-operation-item table-operation-item--more">
              <i class="nz-icon nz-icon-more3"></i>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="['recordTab', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('config.terminallog.record.record')}}</span></el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import { terminalLog } from '@/components/common/js/constants'
import { calcDurationByStringTimeB } from '@/components/common/js/tools'
import table from '@/components/common/mixin/table'
export default {
  name: 'roleTable',
  mixins: [table],
  props: {
    nowTime: {}
  },
  data () {
    return {
      tableTitle: [
        {
          label: this.$t('config.terminallog.id'),
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: this.$t('config.terminallog.SessionID'),
          prop: 'uuid',
          show: true
        }, {
          label: this.$t('config.terminallog.username'),
          prop: 'username',
          show: true
        },
        {
          label: this.$t('config.terminallog.source'),
          prop: 'remoteAddr',
          show: true
        },
        {
          label: this.$t('config.terminallog.remote'),
          prop: 'remote',
          show: true
        },
        {
          label: this.$t('config.terminallog.protocol'),
          prop: 'protocol',
          show: true
        },
        {
          label: this.$t('config.terminallog.startTime'),
          prop: 'startTime',
          show: true
        },
        {
          label: this.$t('config.terminallog.duration'),
          prop: 'duration',
          show: true
        },
        {
          label: this.$t('config.terminallog.authtype'),
          prop: 'authType',
          show: false
        },
        {
          label: this.$t('config.terminallog.status'), // killusername鼠标悬停形式
          prop: 'status',
          show: true,
          width: 100
        }
      ]
    }
  },
  computed: {
    getStatusText () {
      return function (status) {
        return terminalLog.status[status]
      }
    },
    getRemoteText () {
      return function (record) {
        return `${record.loginUser}@${record.host}:${record.port}`
      }
    },
    getDuration () {
      return function (record) {
        if (record.endTime) {
          return calcDurationByStringTimeB(record.startTime, record.endTime)
        }
        return ''
      }
    }
  }
}
</script>
