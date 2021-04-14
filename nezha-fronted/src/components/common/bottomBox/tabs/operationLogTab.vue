<template>
  <nz-bottom-data-list
    :api="url"
    :custom-table-title.sync="tools.customTableTitle"
    :layout="['searchInput', 'elementSet']"
    :search-msg="searchMsg"
    :tabs="tabs"
    @changeTab="changeTab"
  >
    <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
    <template v-slot>
      <operation-log-table
        ref="dataTable"
        v-loading="tools.loading"
        :api="url"
        :custom-table-title="tools.customTableTitle"
        :height="subTableHeight"
        :table-data="tableData"
        @del="del"
        @edit="edit"
        @orderBy="tableDataSort"
        @reload="getTableData"
        @selectionChange="selectionChange"></operation-log-table>
    </template>
    <template v-slot:pagination>
      <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
    </template>
  </nz-bottom-data-list>
</template>

<script>
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import operationLogTable from '@/components/common/table/settings/operationLogTable'
export default {
  name: 'operationLogTab',
  mixins: [dataListMixin, subDataListMixin],
  components: {
    nzBottomDataList,
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
  methods: {
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
    }
  }
}
</script>
