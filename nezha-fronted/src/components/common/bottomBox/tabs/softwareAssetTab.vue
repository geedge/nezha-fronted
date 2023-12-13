<template>
  <div>
    <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
      :targetTab.sync="targetTab"
      :api="url"
      style="height: 100%"
      :custom-table-title.sync="tools.customTableTitle"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg"
      :tableId="tableId"
      :tabs="tabs"
      @search="search"
      @changeTab="changeTab"
    >
      <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
      <template v-slot>
        <softwareAssetTable
          ref="dataTable"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="subTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @copy="copy"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></softwareAssetTable>
      </template>
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-bottom-data-list>
    <transition name="right-box">
      <softwareAssetBox v-if="rightBox.show" :obj="object" @close="closeRightBox"></softwareAssetBox>
    </transition>
  </div>
</template>

<script>
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'
import softwareAssetTable from '@/components/common/table/settings/softwareAssetTable'
import softwareAssetBox from '@/components/common/rightBox/software/softwareAssetBox'
export default {
  name: 'softwareAssetTab',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList,
    softwareAssetTable,
    softwareAssetBox
  },
  computed: {
    externalTerminal () {
      return this.$store.getters.getExternalTerminal
    }
  },
  data () {
    return {
      url: '/asset/software',
      blankObject: { // 空白对象
        id: '',
        name: '',
        typeId: '',
        assetId: '',
        projectId: '',
        params: {},
        remark: ''
      },
      tableId: 'softwareAssetTable',
      searchMsg: { // 给搜索框子组件传递的信息
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
        }]
      },
      blankSilenceObject: {
        startAt: ''
      },
      objectSilence: {},
      silenceBoxShow: false,
      needAlertDaysData: true,
      trendKey: 'assetId',
      fromBottom: true
    }
  },
  methods: {
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
      const dataListParam = {
        ...this.searchLabel,
        ...this.searchCheckBox
      }
      if (this.switchTab) {
        dataListParam.switchTab = this.switchTab
      }
      let path = this.$route.fullPath.match(/\/(\S*)\?/)
      if (!path) {
        path = ''
      } else {
        path = path[1]
      }
      this.updatePath(dataListParam, path)
      this.$set(this.searchLabel, 'typeIds', this.obj.id)
      this.$get(this.url, { ...this.searchLabel, ...this.searchCheckBox }).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].status = response.data.list[i].status + ''
          }
          if (this.needAlertDaysData) {
            response.data.list.forEach(item => {
              item.trendLoading = true
              item.left = 0
              item.top = 0
              item.alertNumtooltipShow = false
              item.alertDaysData = [
                {
                  metric: { priority: 'P1' },
                  values: [[0, 0]]
                },
                {
                  metric: { priority: 'P2' },
                  values: [[0, 0]]
                },
                {
                  metric: { priority: 'P3' },
                  values: [[0, 0]]
                }
              ]
            })
          }
          this.tableData = response.data.list
          const globalSearchId = this.$store.getters.getGlobalSearchId
          let detailViewRightObj = ''
          if (globalSearchId) {
            detailViewRightObj = this.tableData.find(item => item.id === globalSearchId)
          } else {
            detailViewRightObj = this.tableData[0]
          }
          this.detailViewRightObj = this.$lodash.cloneDeep(detailViewRightObj)
          this.pageObj.total = response.data.total
          this.pageObj.pages = response.data.pages
          if (!this.scrollbarWrap && this.$refs.dataTable && this.$refs.dataTable.$refs.dataTable) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
          if (this.detailType === 'view') {
            this.$refs.dataDetail && (this.$refs.dataDetail.$refs.dataTable.scrollTop = 0)
          }
        } else {
          this.$message.error(response.error || response.msg)
        }
      })
    }
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      async handler (n, o) {
        this.searchLabel = {}
        await this.getPreference()
        this.$set(this.searchLabel, 'typeIds', this.obj.id)
        this.getTableData()
      }
    }
  },
  mounted () {
  }
}
</script>

<style scoped>

</style>
