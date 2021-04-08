<template>
  <div style="height: 100%">
    <nz-data-list
      ref="dataList"
      :components="['searchInput', 'elementSet']"
      :custom-table-title.sync="tools.customTableTitle"
      :search-msg="searchMsg"
      :table-id="tableId"
      :table-title="tableTitle"
      :from="fromRoute.terminalLog">
      <template v-slot:default="slotProps">
        <el-table
          id="terminal-log-list-table"
          ref="dataTable"
          v-loading="tools.loading"
          :data="tableData"
          :height="mainTableHeight"
          border
          @header-dragend="dragend"
          @sort-change="tableDataSort"
          @selection-change="(selection)=>{batchDeleteObjs=selection}"
        >
          <el-table-column
            :resizable="false"
            align="center"
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            v-for="(item, index) in tools.customTableTitle"
            v-if="item.show"
            :key="`col-${index}`"
            :fixed="item.fixed"
            :label="item.label"
            :prop="item.prop"
            :resizable="true"
            :sort-orders="['ascending', 'descending']"
            :width="`${item.width}`"
            class="data-column"
          >
            <template slot="header">
              <span>
                <span>{{item.label}}</span>
                <div class="col-resize-area"></div>
              </span>
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
              <template v-else-if="item.prop === 'duration'">
                <el-tooltip placement="right" effect="light" :disabled="!scope.row.status">
                  <div slot="content">
                    {{$t('config.terminallog.endTime')}}<br/>
                    {{scope.row.endTime}}
                  </div>
                  <span>{{getDuration(scope.row)}}</span>
                </el-tooltip>
              </template>
              <template v-else-if="item.prop === 'authType'">
                <span v-if="scope.row.authType == 1">{{$t('config.terminallog.password')}}</span>
                <span v-else-if="scope.row.authType == 2">{{$t('config.terminallog.key')}}</span>
              </template>
              <span v-else>{{scope.row[item.prop]}}</span>
            </template>
          </el-table-column>
          <el-table-column
            :resizable="false"
            fixed="right"
            :width="operationWidth">
            <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
            <div slot-scope="scope" class="table-operation-items">
              <template v-if="scope.row.status == 0">
                <button class="table-operation-item" @click="$refs.dataList.showBottomBox('monitor', scope.row)" :title="$t('config.terminallog.monitor.monitor')"><i class="nz-icon nz-icon-JC"></i></button>
                <el-dropdown size="medium" trigger="hover" @command="tableOperation">
                  <div class="table-operation-item table-operation-item--more">
                    <span>…</span><i class="nz-icon nz-icon-arrow-down"></i>
                  </div>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="['shutdown', scope.row]"><i class="nz-icon nz-icon-ZD"></i><span class="operation-dropdown-text">Kill</span></el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
              <template v-else>
                <button class="table-operation-item" @click="$refs.dataList.showBottomBox('cmd', scope.row)"><i class="nz-icon nz-icon-view1"></i></button>
                <el-dropdown size="medium" trigger="hover" @command="tableOperation">
                  <div class="table-operation-item table-operation-item--more">
                    <span>…</span><i class="nz-icon nz-icon-arrow-down"></i>
                  </div>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="['record', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('config.terminallog.record.record')}}</span></el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </div>
          </el-table-column>
        </el-table>
        <!-- 回到table顶部的按钮 -->
        <button v-show="tools.showTopBtn && slotProps.mainResizeShow" id="role-list-totop" :class="{'to-top-is-hover': tools.tableHover}" :style="{top: tools.toTopBtnTop}" class="to-top" @click="toTop(scrollbarWrap)"><i class="nz-icon nz-icon-top"></i></button>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
  </div>
</template>
<script>
import { terminalLog } from '@/components/common/js/constants'
import { calcDurationByStringTimeB } from '@/components/common/js/tools'
import nzDataList from '@/components/common/table/nzDataList'
import tableMixin from '@/components/common/mixin/table'

export default {
  name: 'terminalLog',
  components: {
    nzDataList
  },
  mixins: [tableMixin],
  data () {
    return {
      tableId: 'terminalLogTable', // 需要分页的table的id，用于记录每页数量

      tableTitle: [
        {
          label: this.$t('config.terminallog.id'),
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: 'Session ID',
          prop: 'uuid',
          show: true
        }, {
          label: 'Username',
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
          label: 'AuthType',
          prop: 'authType',
          show: false
        },
        {
          label: this.$t('config.terminallog.status'), // killusername鼠标悬停形式
          prop: 'status',
          show: true,
          width: 100
        }
      ],
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          {
            id: 11,
            name: this.$t('config.terminallog.host'),
            type: 'input',
            label: 'host',
            disabled: false
          }, {
            id: 12,
            name: this.$t('config.terminallog.user'),
            type: 'input',
            label: 'username',
            disabled: false
          }
        ]
      },
      nowTime: ''
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
        return calcDurationByStringTimeB(record.startTime, this.nowTime)
      }
    }
  },
  methods: {
    tableOperation ([command, row]) {
      switch (command) {
        case 'shutdown': {
          this.shutdown(row)
          break
        }
        default:
          this.$refs.dataList.showBottomBox(command, row)
          break
      }
    },
    getTableData () {
      const params = {
        ...this.searchLabel,
        pageNo: this.pageObj.pageNo,
        pageSize: this.pageObj.pageSize
      }
      this.$get('terminal/session', params).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          this.tableData = response.data.list
          this.nowTime = this.utcTimeToTimezoneStr(response.time)
          this.pageObj.total = response.data.total
          if (!this.scrollbarWrap) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    },
    shutdown (record) {
      this.$confirm(this.$t('tip.killTerm'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$put('/terminal/kill', { uuid: record.uuid }).then(res => {
          if (res.code === 200) {
            this.$message.success(this.$t('config.terminallog.success'))
            this.bottomBox.showSubList = false
            this.getTableData()
          } else {
            this.$message.error(this.$t('config.terminallog.killErrorTip'))
          }
        })
      })
    },
    messageStyle (e) {
      if (e.column.label == this.$t('config.terminallog.status')) {
        if (e.row.status == '0') {
          return 'success'
        } else if (e.row.status == '1') {
          return 'warning'
        } else if (e.row.status == '2') {
          return 'suspended'
        } else if (e.row.status == '3') {
          return 'danger'
        } else if (e.row.status == '4') {
          return 'danger'
        }
      }
      return ''
    }
  }
}
</script>
