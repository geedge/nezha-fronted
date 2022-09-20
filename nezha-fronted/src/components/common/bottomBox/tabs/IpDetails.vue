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
      <template v-slot:top-tool-right>
        <button id="account-add" v-has="'ipam_add'" :title="$t('overall.createipamDetail')" class="top-tool-btn margin-r-10" type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="ipam-ip"
          :params="searchLabel"
          :permissions="{
            import: 'ipam_add',
            export: 'ipam_edit'
          }"
          class="top-tool-export margin-r-10"
          export-file-name="ipam"
          export-url="/ipam/ip/export"
          import-url="/ipam/ip/import"
          @afterImport="getTableData"
        >
          <template v-slot:before>
            <div>
              <el-dropdown-item :disabled="batchDeleteObjs.length==0">
                <delete-button
                  ref="deleteButton"
                  :from="'ipDetails'"
                  :type="'link'"
                  :title="$t('overall.batchDel')"
                  v-has="'ipam_delete'"
                  id="account-list-batch-delete"
                  :api="url"
                  :delete-objs="batchDeleteObjs"
                  @after="getTableData"
                  @before="delFlag=true"></delete-button>
              </el-dropdown-item>
            </div>
          </template>
        </top-tool-more-options>
      </template>
      <template v-slot>
        <ip-details-table
          ref="dataTable"
          :api="url"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
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
    <transition name="right-box">
      <ip-details-box v-if="rightBox.show" :obj="object" :details-type="obj.type" @close="closeRightBox"></ip-details-box>
    </transition>
  </div>
</template>

<script>
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'
import ipDetailsTable from '@/components/common/table/settings/ipDetailsTable'
import ipDetailsBox from '@/components/common/rightBox/ipDetailsBox'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import deleteButton from '@/components/common/deleteButton'
export default {
  name: 'IpDetails',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList,
    ipDetailsTable,
    ipDetailsBox,
    topToolMoreOptions,
    deleteButton
  },
  data () {
    return {
      url: '/ipam/ip',
      tableId: 'IpDetails', // 需要分页的table的id，用于记录每页数量
      blankObject: {
        id: '',
        name: '',
        addr: '',
        mac: '',
        state: '',
        remark: ''
      },
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
          label: 'addr',
          disabled: false
        }, {
          name: this.$t('overall.state'),
          type: 'select',
          label: 'ipamState',
          readonly: true,
          disabled: false
        }]
      }
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
      this.$set(this.searchLabel, 'subnetId', this.obj.id)
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
  watch: {
    obj: {
      immediate: true,
      deep: true,
      handler (n, o) {
        if (n) {
          this.searchLabel = {}
          this.getTableData()
        }
      }
    }
  }
}
</script>
