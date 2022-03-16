<template>
  <div class="scrape-endpoint">
    <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
      :targetTab.sync="targetTab"
      :api="url"
      style="height: 100%"
      :custom-table-title.sync="tools.customTableTitle"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg"
      :tabs="tabs"
      @search="search"
      @changeTab="changeTab"
    >
      <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
      <template v-slot>
        <ip-details-table
          ref="dataTable"
          :api="url"
          :orderByFa="'id'"
          v-loading="tools.loading"
          :loading="tools.loading"
          :custom-table-title="tools.customTableTitle"
          :height="subTableHeight"
          :table-data="tableData"
          :assetTab="true"
          @del="del"
          @edit="edit"
          @addSilence="addSilence"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
        ></ip-details-table>
      </template>
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-bottom-data-list>
  </div>
</template>

<script>
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'
import ipDetailsTable from '@/components/common/table/settings/ipDetailsTable'
export default {
  name: 'IpDetails',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList,
    ipDetailsTable
  },
  data () {
    return {
      url: '/ipam/ip',
      tableId: 'IpDetails', // 需要分页的table的id，用于记录每页数量
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          name: 'ID',
          type: 'input',
          label: 'ids',
          disabled: false
        }, {
          name: this.$t('overall.name'),
          type: 'input',
          label: 'name',
          disabled: false
        }, {
          name: 'IP',
          type: 'input',
          label: 'manageIp',
          disabled: false
        }, {
          name: this.$t('asset.state'),
          type: 'assetState',
          label: 'stateIds',
          id: 'stateIds',
          readonly: true,
          disabled: false
        }]
      }
    }
  },
  methods: {
    // 数据请求
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
      this.$get(this.url, { ...this.searchLabel }).then(response => {
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
  },
  obj: {
    immediate: true,
    deep: true,
    handler (n, o) {
      if (n) {
        console.log(n)
        this.getTableData()
      }
    }
  }
}
</script>
