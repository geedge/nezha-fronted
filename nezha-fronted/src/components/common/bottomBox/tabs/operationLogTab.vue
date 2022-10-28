<template>
 <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
      :api="url"
      :tableId="tableId"
      :custom-table-title.sync="tools.customTableTitle"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg"
      :tabs="tabs"
      :targetTab="targetTab"
    @changeTab="changeTab"
    @search="search"
  >
    <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
    <template v-slot>
      <operation-log-table
        ref="dataTable"
        :orderByFa="'id'"
        v-my-loading="tools.loading"
        :loading="tools.loading"
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
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'
export default {
  name: 'operationLogTab',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList,
    operationLogTable
  },
  props: {
    obj: Object
  },
  watch: {
    obj (n) {
      this.searchLabel = { userId: n.id }
      this.getTableData()
    }
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
            type: 'selectString',
            label: 'operation',
            readonly: true,
            disabled: false
          }, {
            id: 14,
            name: this.$t('config.operationlog.operaId'),
            type: 'input',
            label: 'operaId',
            disabled: false
          }, {
            id: 16,
            name: this.$t('config.operationlog.state'),
            type: 'selectString',
            readonly: true,
            label: 'state',
            disabled: false
          }, {
            id: 17,
            name: this.$t('config.operationlog.params'),
            type: 'input',
            label: 'params',
            disabled: false
          }
        ]
      },
      searchLabel: { userId: this.obj.id }
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
    getTableData (params) {
      if (params && Object.keys(params).length > 0) {
        for (const key in params) {
          this.$set(this.searchLabel, key, params[key])
        }
      }
      if (this.orderBy) {
        this.$set(this.searchLabel, 'orderBy', this.orderBy)
      } else {
        delete this.searchLabel.orderBy
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      if (this.obj) {
        this.$set(this.searchLabel, 'userId', this.obj.id)
      }
      this.$get(this.url, { ...this.searchLabel, ...this.searchCheckBox }).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].status = response.data.list[i].status + ''
          }
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
          if (!this.scrollbarWrap && this.$refs.dataTable && this.$refs.dataTable.$refs.dataTable) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    }
  }
}
</script>
