<template>
  <nz-bottom-data-list
    :api="url"
    :custom-table-title.sync="tools.customTableTitle"
    :layout="['searchInput', 'elementSet']"
    :search-msg="searchMsg"
    :tabs="tabs"
    @changeTab="changeTab"
    @search="search"
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
      url: 'sys/log',
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
          },{
            id: 14,
            name: this.$t('config.operationlog.operaId'),
            type: 'input',
            label: 'operaId',
            disabled: false
          },{
            id: 16,
            name: this.$t('config.operationlog.state'),
            type: 'selectString',
            label: 'state',
            disabled: false
          }, {
            id: 17,
            name: this.$t('config.operationlog.params'),
            type: 'input',
            label: 'params',
            disabled: false
          },
        ]
      },
      searchLabel:{userId:this.obj.id}
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

  }
}
</script>
