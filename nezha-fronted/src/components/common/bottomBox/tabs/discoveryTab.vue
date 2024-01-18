<template>
  <div>
    <nz-bottom-data-list
      :showTitle="showTitle"
      :obj="obj"
      :title="' '"
      :api="url"
      :tableId="tableId"
      style="height: 100%"
      :custom-table-title.sync="tools.customTableTitle"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg"
      :tabs="tabs"
      :targetTab.sync="targetTab"
      @changeTab="changeTab"
      @search="search"
      :hide-header="true"
    >
      <template v-slot:title
      ><span :title="obj.name">{{ obj.name }}</span></template
      >
      <template v-slot:top-tool-right>
        <pick-time :time-range="[0,1]" ref="pickTime" :refresh-data-func="dateChange" :showTimePicker="false" :use-chart-unit="false" :sign="'assetDiscovery' + obj.id"></pick-time>
      </template>
      <template v-slot>
        <disccoveryTabTable
          ref="dataTable"
          :api="url"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :custom-table-title="tools.customTableTitle"
          :height="subTableHeight"
          :table-data="tableData"
          @del="del"
          @copy="copy"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @uploadAsset="uploadAsset"
        ></disccoveryTabTable>
      </template>
      <template v-slot:pagination>
        <Pagination
          ref="Pagination"
          :pageObj="pageObj"
          :tableId="tableId"
          @pageNo="pageNo"
          @pageSize="pageSize"
        >
        </Pagination>
      </template>
    </nz-bottom-data-list>
  </div>
</template>

<script>
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import disccoveryTabTable from '@/components/common/table/asset/disccoveryTabTable'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'
import routerPathParams from '@/components/common/mixin/routerPathParams'
export default {
  name: 'rolesTab',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin, routerPathParams],
  components: {
    nzBottomDataList,
    disccoveryTabTable,
  },
  props: {
    obj: Object
  },
  data () {
    return {
      url: '/mock/tool/discovery',
      tableId: 'discoveryTabTble',
      detailType: 'list',
      searchMsg: {
        // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          {
            name: 'IP',
            type: 'input',
            label: 'ip',
            id: 'ip',
            disabled: false
          }
        ]
      },
      searchLabel: { roleId: this.obj.id }
    }
  },
  watch: {
    tableData: {
      immediate: true,
      handler (n) {
        if (n) {
          const arr = []
          n.map(item => {
            if (!item.position) {
              const obj = {
                ...this.$lodash.cloneDeep(item),
                type: 'user',
                position: {
                  top: 0,
                  left: 0
                },
                loading: false
              }
              arr.push(obj)
            }
          })
          return arr
        }
      }
    },
    obj (n) {
      this.searchLabel = { roleId: this.obj.id }
      this.getTableData()
    }
  },
  methods: {
    dateChange () {
      this.getTableData()
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
      this.$get(this.url + '/' + this.obj.id, { ...this.searchLabel, ...this.searchCheckBox }).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
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
    },
    uploadAsset (row) {
    }
  }
}
</script>
