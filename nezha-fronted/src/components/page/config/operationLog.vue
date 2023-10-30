<template>
  <div id="operation-log">
    <nz-data-list
      ref="dataList"
      :api="url"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.operationLog"
      @search="search"
      :search-msg="searchMsg">
      <template v-slot:default="slotProps">
        <operation-log-table
          ref="dataTable"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></operation-log-table>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
  </div>
</template>
<script>
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import operationLogTable from '@/components/common/table/settings/operationLogTable'

export default {
  name: 'oparetionLog',
  components: {
    nzDataList,
    operationLogTable
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'sys/log',
      tableId: 'operationLogTable', // 需要分页的table的id，用于记录每页数量
      orderBy: '-id',
      searchMsg: { // 给搜索框子组件传递的信息
        searchLabelList: [
          {
            id: 11,
            name: this.$t('overall.type'),
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
            name: this.$t('overall.option'),
            type: 'select',
            label: 'operation',
            disabled: false,
            readonly: true,
          }, {
            id: 14,
            name: this.$t('config.operationlog.operaId'),
            type: 'input',
            label: 'operaId',
            disabled: false
          }, {
            id: 16,
            name: this.$t('config.operationlog.state'),
            type: 'select',
            label: 'state',
            readonly: true,
            disabled: false
          }, {
            id: 17,
            name: this.$t('config.operationlog.params'),
            type: 'input',
            label: 'params',
            disabled: false
          }
        ]
      }
    }
  }
}
</script>
