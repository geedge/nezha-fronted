<template>
  <div>
    <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
      :api="url"
      :targetTab="targetTab"
      style="height: 100%"
      :custom-table-title.sync="tools.customTableTitle"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg"
      :tabs="tabs"
      :show-title="showTitle"
      @search="search"
      @changeTab="changeTab"
    >
      <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
      <template v-slot>
        <cabinet-table
          ref="dataTable"
          :orderByFa="'id'"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="subTableHeight"
          :table-data="tableData"
          @del="del"
          @copy="copy"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
        ></cabinet-table>
      </template>
      <template v-slot:top-tool-right>
        <button id="asset-create-asset" v-has="'dc_add'" class="top-tool-btn margin-r-10 margin-l-10" @click.stop="add" :title="$t('tip.add')">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>
       <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="model"
          :params="searchLabel"
          :permissions="{
                  import: 'dc_add',
                  export: 'dc_edit'
                }"
          class="top-tool-export margin-r-10"
          export-file-name="cabinet"
          export-url="/dc/cabinet/export"
          import-url="/dc/cabinet/import"
          @afterImport="getTableData"
        >
          <template v-slot:before>
            <div>
              <el-dropdown-item :disabled="batchDeleteObjs.length==0">
                <delete-button
                  ref="deleteButton"
                  :from="'cabinetTab'"
                  :single="true"
                  :forceDeleteShow="true"
                  :type="'link'"
                  :title="$t('overall.batchDel')"
                  id="asset-model-batch-delete"
                  v-has="'dc_delete'"
                  :api="url"
                  :delete-objs="batchDeleteObjs"
                  @after="getTableData"
                  @before="delFlag=true"
                ></delete-button>
              </el-dropdown-item>
            </div>
          </template>
        </top-tool-more-options>
      </template>
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-bottom-data-list>
    <transition name="right-box">
      <cabinet-box v-if="rightBox.show" :current-dc="obj" :obj="object" ref="cabinetEditBox" v-has="'dc_add'" @close="closeRightBox"></cabinet-box>
    </transition>
  </div>
</template>

<script>
import cabinetBox from '../../rightBox/setting/cabinetBox'
import deleteButton from '../../deleteButton'
import dataListMixin from '@/components/common/mixin/dataList'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import cabinetTable from '@/components/common/table/settings/cabinetTable'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import bus from '@/libs/bus'
export default {
  name: 'cabinetTab',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList,
    'cabinet-box': cabinetBox,
    'delete-button': deleteButton,
    cabinetTable,
    topToolMoreOptions
  },
  props: {
    showTitle: {}
  },
  data () {
    return {
      url: 'dc/cabinet',
      tableId: 'cabinetTable',

      blankObject: {
        id: '',
        idcId: '',
        name: '',
        remark: '',
        seq: '',
        uSize: 1
      },
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          {
            id: 11,
            name: this.$t('overall.name'),
            type: 'input',
            label: 'name',
            disabled: false
          }
        ]
      }
    }
  },
  created () {
  },
  methods: {
    // 切换tab
    changeTab (tab) {
      this.$emit('changeTab', tab)
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
        this.$set(this.searchLabel, 'dcIds', this.obj.id)
      }
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
    closeRightBox (refresh) {
      this.rightBox.show = false
      this.copyFlag = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
        bus.$emit('cabinet-tab')
      }
    },
    del (row) {
      const self = this
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete(this.url + '?ids=' + row.id).then(response => {
          if (response.code === 200) {
            self.delFlag = true
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
            self.getTableData()
            bus.$emit('cabinet-tab')
          } else if (response.data && response.data.list && response.code !== 200) {
            this.delFlag = true
            this.$refs.deleteButton && this.$refs.deleteButton.showProcess(response.data.list)
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    }
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      handler (n) {
        if (n) {
          this.currentDc = JSON.parse(JSON.stringify(n))
          this.searchLabel = { dcIds: this.currentDc.id }
          this.getTableData()
        }
      }
    }
  }
}
</script>
