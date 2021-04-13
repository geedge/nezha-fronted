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
    <operation-log-table
      ref="dataTable"
      v-loading="tools.loading"
      :api="url"
      :custom-table-title="tools.customTableTitle"
      :height="mainTableHeight"
      :table-data="tableData"
      @del="del"
      @edit="edit"
      @orderBy="tableDataSort"
      @reload="getTableData"
      @selectionChange="selectionChange"></operation-log-table>
  </div>
</template>

<script>
import dataListMixin from '@/components/common/mixin/dataList'
import operationLogTable from '@/components/common/table/settings/operationLogTable'
export default {
  name: 'operationLogTab',
  mixins: [dataListMixin],
  components: {
    operationLogTable
  },
  data () {
    return {
      url: 'sys/log/list',
      tableId: 'operationLogTable',
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
