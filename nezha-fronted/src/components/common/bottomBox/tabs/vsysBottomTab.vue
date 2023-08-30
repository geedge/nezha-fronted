<template>
  <nz-bottom-data-list
    :showTitle='showTitle'
    :obj='obj'
    :tableId="tableId"
    id="vsysBottomTab"
    :api="url"
    :custom-table-title.sync="tools.customTableTitle"
    :layout="['elementSet']"
    :search-msg="searchMsg"
    :tabs="tabs"
    :targetTab="targetTab"
    :showPagination="false"
    @search="search"
    @changeTab="changeTab"
  >
    <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
    <template v-slot>
      <assetVsysTable
        ref="dataTable"
        :orderByFa="'id'"
        v-my-loading="tools.loading"
        :loading="tools.loading"
        :api="url"
        :custom-table-title="tools.customTableTitle"
        :height="subTableHeight"
        :table-data="tableData"
        :terminaLogTab="true"
        @del="del"
        @edit="edit"
        @tableDataSort="tableDataSort"
        @reload="getTableData"
        @selectionChange="selectionChange"></assetVsysTable>
    </template>
  </nz-bottom-data-list>
</template>

<script>
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import assetVsysTable from '@/components/common/table/asset/assetVsysTable'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'

export default {
  name: 'vsysBottomTab',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList,
    assetVsysTable
  },
  props: {
    obj: Object,
    showTitle: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      url: '/vsys/asset/',
      tableId: 'assetVsysTable', // 需要分页的table的id，用于记录每页数量
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: []
      },
      searchLabel: {},
      tableData: [],
      orderBy: { order: 'ascending', prop: 'id' },
      fromBottom: true
    }
  },
  watch: {
    obj: {
      deep: true,
      immediate: true,
      async handler (n) {
        if (n) {
          await this.getPreference()
          this.getTableData()
        }
      }
    }
  },
  methods: {
    async getTableData () {
      this.$set(this.searchLabel, 'assetId', this.obj.id)
      this.tools.loading = true
      this.$get(this.url, this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          this.tableData = this.filterShowData(response.data.list, this.orderBy)
          if (!this.scrollbarWrap && this.$refs.dataTable && this.$refs.dataTable.$refs.dataTable) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    },
    // 数据排序
    tableDataSort (item) {
      this.orderBy = item
      this.filterShowData(this.tableData, item)
    },
    filterShowData (source, ord) {
      let orderBy = null
      orderBy = ord
      if (orderBy.order === 'ascending') {
        source = source.sort(this.$tableSet.asce(orderBy.prop))
      }
      if (orderBy.order === 'descending') {
        source = source.sort(this.$tableSet.desc(orderBy.prop))
      }
      return source
    }
  }
}
</script>
