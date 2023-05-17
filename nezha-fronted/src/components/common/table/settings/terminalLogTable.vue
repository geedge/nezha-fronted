<template>
  <el-table
    id="roleTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    border
    :default-sort="orderBy"
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
      :key="`col-${index}-${item.prop}`"
      :fixed="item.fixed"
      :label="item.label"
      :min-width="`${item.minWidth}`"
      :prop="item.prop"
      :resizable="true"
      :sortable="item.sortable"
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
        <template v-else-if="item.prop === 'state'">
          <span><i class="nz-icon" :class="statusClass(scope.row.status)"/>  {{getStatusText(scope.row.status)}}</span>
        </template>
        <template  v-else-if="item.prop === 'uuid'">
          <el-popover
            placement="right-start"
            width="200"
            trigger="hover"
            :content="scope.row.uuid">
            <span slot="reference">{{scope.row.uuid.substring(0, 8).toUpperCase()}}</span>
          </el-popover>
        </template>
        <span v-else-if="item.prop === 'sourceIp'">{{scope.row.remoteAddr}}</span>
        <template v-else-if="item.prop === 'remote'">
          <span>{{getRemoteText(scope.row)}}</span>
        </template>
        <template v-else-if="item.prop === 'startTime'">
          <span> {{utcTimeToTimezoneStr(scope.row.startTime)}}</span>
        </template>
        <template v-else-if="item.prop === 'duration'">
          <el-tooltip effect="light" placement="right">
            <div slot="content">
              {{$t('overall.endTime')}}<br/>
              {{utcTimeToTimezoneStr(scope.row.endTime)}}
            </div>
            <span>{{getDuration(scope.row)}}</span>
          </el-tooltip>
        </template>
        <template v-else-if="item.prop === 'cmdNum'">
          <div style="cursor: pointer" @click.stop="showBottomBox('cmdTab', scope.row)" @dblclick.stop="">
            {{scope.row[item.prop] ? scope.row[item.prop] : 0}}
          </div>
        </template>
        <template v-else-if="item.prop === 'sftpNum'">
          <div style="cursor: pointer" @click.stop="showBottomBox('sftpTab', scope.row)" @dblclick.stop="">
            {{scope.row[item.prop] ? scope.row[item.prop] : 0}}
          </div>
        </template>
        <template v-else-if="item.prop === 'authType'">
          <span v-if="scope.row.authType == 1">{{$t('login.pin')}}</span>
          <span v-else-if="scope.row.authType == 2">{{$t('config.terminallog.key')}}</span>
        </template>
        <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
        <span v-else>-</span>
      </template>
    </el-table-column>
    <el-table-column
      v-if="terminalLogTab || terminalLog"
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items" :key="scope.row.status + scope.row.uuid">
        <template v-if="scope.row.status == 0">
          <button :title="$t('config.terminallog.monitor.monitor')" v-has="'terminal_view'" class="table-operation-item" @click="showBottomBox('monitorTab', scope.row)"><i class="nz-icon nz-icon-JC"></i></button>
          <el-dropdown size="medium" trigger="click" @command="tableOperation">
            <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
              <i class="nz-icon nz-icon-more3"></i>
            </div>
            <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
              <el-dropdown-item :command="['shutdown', scope.row]"><i class="nz-icon nz-icon-ZD"></i><span class="operation-dropdown-text">{{$t('config.terminallog.stop')}}</span></el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
        <template v-else>
          <button class="table-operation-item" @click="showBottomBox('cmdTab', scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button>
          <el-dropdown size="medium" trigger="click" v-has="['terminal_edit']" @command="tableOperation">
            <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
              <i class="nz-icon nz-icon-more3"></i>
            </div>
            <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
              <el-dropdown-item v-has="'terminal_edit'" :command="['recordTab', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('config.terminallog.record.record')}}</span></el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </div>
    </el-table-column>
    <template  slot="empty">
      <div v-if="!loading" class="table-no-data">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#nz-icon-no-data-list"></use>
        </svg>
        <div class="table-no-data__title">No results found</div>
      </div>
      <div v-else>&nbsp;</div>
    </template>
  </el-table>
</template>

<script>
import { terminalLog } from '@/components/common/js/constants'
import { calcDurationByStringTimeB } from '@/components/common/js/tools'
import table from '@/components/common/mixin/table'
export default {
  name: 'terminalLogTable',
  mixins: [table],
  props: {
    nowTime: {},
    terminalLogTab: Boolean,
    terminalLog: Boolean,
    loading: Boolean
  },
  data () {
    return {
      tableTitle: [
        {
          label: this.$t('asset.id'),
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        }, {
          label: this.$t('config.terminallog.SessionID'),
          prop: 'uuid',
          minWidth: 200,
          show: true
        }, {
          label: this.$t('config.operationlog.username'),
          prop: 'username',
          minWidth: 200,
          show: true
        },
        {
          label: this.$t('ping.sourceIp'),
          prop: 'sourceIp',
          minWidth: 115,
          show: true,
          sortable: 'custom'
        },
        {
          label: this.$t('config.terminallog.remote'),
          prop: 'remote',
          show: true
        },
        {
          label: this.$t('webshell.protocol'),
          prop: 'protocol',
          show: true
        },
        {
          label: this.$t('overall.startTime'),
          prop: 'startTime',
          minWidth: 100,
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
          minWidth: 100,
          show: false
        },
        {
          label: this.$t('config.terminallog.cmd.cmd'),
          prop: 'cmdNum',
          show: false,
          width: 100
        },
        {
          label: this.$t('terminal.sftp'),
          prop: 'sftpNum',
          show: false,
          width: 80
        },
        {
          label: this.$t('overall.state'), // killusername鼠标悬停形式
          prop: 'state',
          show: true,
          width: 150,
          sortable: 'custom'
        }
      ],
      timer: null
    }
  },
  methods: {
    showBottomBox (targetTab, row) {
      if (this.timer) {
        clearTimeout(this.timer)
      }
      const self = this
      this.timer = setTimeout(() => {
        self.$emit('showBottomBox', targetTab, row)
        self.timer = null
      }, 200)
    }
  },
  computed: {
    getStatusText () {
      const self = this
      return function (status) {
        return self.$t(terminalLog.status[status])
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
    },
    statusClass () {
      return function (status) {
        switch (Number(status)) {
          case 0:
            return 'nz-icon-connecting color23bf9a'
          case 1:
            return 'nz-icon-failed colorffa416'
          case 2:
            return 'nz-icon-over color999999'
          case 3:
            return 'nz-icon-stop colorec7f66'
          case 4:
            return 'nz-icon-unknown-error color535b64'
        }
      }
    }
  }
}
</script>
