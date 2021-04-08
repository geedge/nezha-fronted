<template>
  <div style="height: 100%">
    <div class="sub-top-tools">
      <div class="sub-list-tabs">
        <div class="sub-list-tab-title">{{obj.id}}</div><div
        id="endpoint-tab-change-panel" class="sub-list-tab sub-list-tab-active">{{$t("config.operationlog.operationlog")}}</div><div
        id="endpoint-tab-change-alertmsg" class="sub-list-tab" @click="changeTab('terminalLogTab')">{{$t("config.terminallog.terminallog")}}</div>
      </div>
      <div class="top-tool-right">
        <div class="top-tool-search">
          <search-input :searchMsg="searchMsg" position="endpoint-bottom" @search="search"></search-input>
        </div>
      </div>
    </div>
    <el-table
      id="role-list-table"
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
              <span v-if="item.prop === 'time'">
                {{scope.row[item.prop]}} ms
              </span>
          <span v-else-if="item.prop === 'username'">{{formatUsername(scope.row)}}</span>
          <span v-else-if="item.prop === 'createDate'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
          <span v-else>{{scope.row[item.prop]}}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import tableMixin from '@/components/common/mixin/table'
export default {
  name: 'operationLogTab',
  mixins: [tableMixin],
  data () {
    return {
      tableId: 'operationLogTable', // 需要分页的table的id，用于记录每页数量
      tableTitle: [
        {
          label: this.$t('config.operationlog.id'),
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: this.$t('config.operationlog.username'),
          prop: 'username',
          show: true
        },
        {
          label: this.$t('config.operationlog.ip'),
          prop: 'ip',
          show: true
        },
        {
          label: this.$t('config.operationlog.operation'),
          prop: 'operation',
          show: true
        },
        {
          label: this.$t('config.operationlog.type'),
          prop: 'type',
          show: true
        },
        {
          label: this.$t('config.operationlog.state'),
          prop: 'state',
          show: true
        },
        // {
        //   label: this.$t('config.operationlog.userId'),
        //   prop: 'userId',
        //   show: false,
        // },
        {
          label: this.$t('config.operationlog.operaId'),
          prop: 'operaId',
          show: false
        },
        {
          label: this.$t('config.operationlog.createDate'),
          prop: 'createDate',
          show: true
        },
        {
          label: this.$t('config.operationlog.time'),
          prop: 'time',
          show: false
        },
        {
          label: this.$t('config.operationlog.params'),
          prop: 'params',
          show: false
        },
        {
          label: this.$t('config.operationlog.response'),
          prop: 'response',
          show: false
        }
      ],
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          {
            id: 11,
            name: this.$t('config.operationlog.type'),
            type: 'input',
            label: 'type',
            disabled: false
          }, {
            id: 12,
            name: this.$t('config.operationlog.username'),
            type: 'input',
            label: 'username',
            disabled: false
          }, {
            id: 13,
            name: this.$t('config.operationlog.operation'),
            type: 'selectString',
            label: 'operation',
            disabled: false
          }
        ]
      }
    }
  },
  props: {
    obj: Object // 关联的实体对象
  },
  methods: {
    // 切换tab
    changeTab (tab) {
      this.$emit('changeTab', tab)
    },
    messageStyle (e) {
      if (e.column.label === this.$t('config.operationlog.state')) {
        if (e.row.state === 'success') {
          return 'success'
        } else {
          return 'danger'
        }
      }
      return ''
    },
    getTableData () {
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      this.$get('sys/log/list', this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          this.tableData = response.data.list
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
    formatUsername (row) {
      if (row.username) {
        return row.username
      } else if (row.operation === 'login' && !row.username) { // 如果是登录 且登录失败
        return JSON.parse(row.params).username
      } else {
        return '-'
      }
    }
  }
}
</script>
