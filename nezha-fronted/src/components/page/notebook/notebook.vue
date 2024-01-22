<template>
  <div v-my-loading="preferenceLoading">
    <nzDetailView
      v-my-loading="detailViewLoading || tools.loading"
      v-if="detailType !== 'list' "
      :api="url"
      ref="detailList"
      :layout="['searchInput', 'elementSet', 'pagination','detailViewSet']"
      :from="fromRoute.notebook"
      :search-msg="searchMsg"
      :detailType="detailType"
      :detailViewRightObj="detailViewRightObj"
      :dataLength="tableData.length"
      @search="search"
      @changeDetailType="changeDetailType"
      @getTableData="getTableData"
    >
      <template v-slot:top-tool-left>
      </template>
      <template v-slot:top-tool-right>
        <button id="asset-create-asset" v-has="'notebook_add'" :title="$t('asset.createAsset')" class="top-tool-btn" @click.stop="add">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>
       <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="model"
          :params="searchLabel"
          :params2="searchCheckBox"
          :permissions="{
            import: 'role_add',
            export: 'role_edit'
          }"
          class="top-tool-export margin-r-10 margin-l-10"
          export-file-name="notebook"
          export-url="/visual/notebook/export"
          import-url="/visual/notebook/import"
          :only-json="true"
          @afterImport="getTableData"
          v-has="['notebook_add','notebook_edit']"
        >
        </top-tool-more-options>
      </template>
      <template v-slot:nz-detail-view-list>
        <notebook-detail
          class="data-detail"
          ref="dataDetail"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :detailViewRightObj="detailViewRightObj"
          :api="url"
          :table-data="tableData"
          @detailViewRightShow="detailViewRightShow"
          @orderDetail="orderDetail"
        >
        </notebook-detail>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <el-pagination
          @current-change="pageNo"
          :current-page.sync="pageObj.pageNo"
          :page-size="20"
          :total="pageObj.total"
          layout="prev, slot, next"
          small
        >
          <template>
            <el-input-number v-if="showInput" ref="jumpInput" v-model="pageObj.pageNo" :controls="false" :min="1" :max="pageObj.pages" class="jump-input" @change="getTableData" @keyup.enter.native="getTableData" size="mini"/>
            <span class="jump-pages">/&nbsp;{{pageObj.pages}}</span>
          </template>
        </el-pagination>
      </template>
    </nzDetailView>
    <nz-data-list
      ref="dataList"
      :api="url"
      v-if="detailType === 'list' "
      :layout="['searchInput', 'elementSet', 'pagination','detailViewSet']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.notebook"
      :search-msg="searchMsg"
      @search="search"
      :detailType="detailType"
      @changeDetailType="changeDetailType"
      @getTableData="getTableData"
    >
      <template v-slot:top-tool-right>
        <button v-has="'notebook_add'" :title="$t('overall.createDatacenter')" class="top-tool-btn margin-r-10" type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
       <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="model"
          :params="searchLabel"
          :permissions="{
            import: 'role_add',
            export: 'role_edit'
          }"
          class="top-tool-export margin-r-10"
          export-file-name="notebook"
          export-url="/visual/notebook/export"
          import-url="/visual/notebook/import"
          :only-json="true"
          @afterImport="getTableData"
          v-has="['notebook_add','notebook_edit','notebook_delete']"
        >
          <template v-slot:before>
            <div>
              <el-dropdown-item :disabled="batchDeleteObjs.length==0" :class="'nz-el-dropdown-menu-item'">
                <delete-button
                  ref="deleteButton"
                  :single="false"
                  :from="'notebook'"
                  :forceDeleteShow="false"
                  :deleteTitle="'overall.notebook'"
                  :type="'link'"
                  :title="$t('overall.batchDel')"
                  id="account-list-batch-delete"
                  v-has="'notebook_delete'"
                  :delete-objs="batchDeleteObjs"
                  api="visual/notebook"
                  @after="getTableData"
                ></delete-button>
              </el-dropdown-item>
            </div>
          </template>
        </top-tool-more-options>
      </template>
      <template v-slot:default="slotProps">
        <notebook-table
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
          @copy="copy"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @topology="topology"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></notebook-table>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
  </div>
</template>
<script>
import deleteButton from '@/components/common/deleteButton'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import notebookTable from '@/components/common/table/settings/notebookTable'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import nzDetailView from '@/components/common/detailView/nzDetailView'
import detailViewMixin from '@/components/common/mixin/detailViewMixin'
import notebookDetail from '@/components/common/detailView/list/notebook/notebookDetail'
import bus from '@/libs/bus'
export default {
  name: 'notebook',
  components: {
    deleteButton,
    nzDataList,
    notebookTable,
    topToolMoreOptions,
    nzDetailView,
    notebookDetail
  },
  mixins: [dataListMixin, detailViewMixin],
  data () {
    return {
      url: 'visual/notebook',
      tableId: 'notebookTable', // 需要分页的table的id，用于记录每页数量
      blankObject: {
        id: '',
        name: '',
        type: 'none',
        remark: 'none'
      },
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          {
            name: 'ID',
            type: 'input',
            label: 'ids',
            disabled: false
          },
          {
            name: this.$t('overall.name'),
            type: 'input',
            label: 'name',
            disabled: false
          }
        ]
      }
    }
  },
  methods: {
    notebookSave (data) {
      if (this.detailType === 'list') {
        this.$refs.dataList.showBottomBox('notebookTab', data)
      } else {
        this.detailViewRightObj = this.$lodash.cloneDeep(data)
      }
    },
    add () {
      this.$store.commit('setNotebookEdit', true)
      const username = localStorage.getItem('nz-username')
      const date = bus.timeFormate(bus.computeTimezone(new Date().getTime()))
      const name = username + ' ' + date
      if (this.detailType === 'list') {
        this.$refs.dataList.showBottomBox('notebookTab', { name })
      } else {
        this.detailViewRightObj = this.$lodash.cloneDeep({ name })
      }
    },
    copy (u) {
      this.$confirm(this.$t('tip.confirmDuplicateNotebook'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        const username = localStorage.getItem('nz-username')
        const date = bus.timeFormate(bus.computeTimezone(new Date().getTime()))
        const param = {
          id: u.id,
          name: username + ' ' + date
        }
        this.$post('/visual/notebook/duplicate', param).then(res => {
          if (res.code === 200) {
            this.getTableData()
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {
      })
    }
  },
  created () {
    const searchKeys = {
      // key: path 键
      // value: vue set 参数
      pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
      pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
      orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
      ids: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'ids',
        type: 'string',
        defaultJson: {
          disabled: false,
          id: 'ids',
          label: 'ids',
          name: 'ID',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      },
      name: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'name',
        type: 'string',
        defaultJson: {
          disabled: false,
          id: 'name',
          label: 'name',
          name: 'Name',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      }
    }
    this.initQueryFromPath(searchKeys)
  },
  mounted () {
    bus.$on('notebookSave', this.notebookSave)
  },
  beforeDestroy () {
    bus.$off('notebookSave', this.notebookSave)
  }
}
</script>
