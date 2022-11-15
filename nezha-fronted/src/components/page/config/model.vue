<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.model"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="account-add" v-has="'model_add'" :title="$t('overall.createModel')" class="top-tool-btn margin-r-10" type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
       <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="model"
          :params="searchLabel"
          :permissions="{
            import: 'model_add',
            export: 'model_edit'
          }"
          class="top-tool-export margin-r-10"
          export-file-name="asset-model"
          export-url="/asset/model/export"
          import-url="/asset/model/import"
          @afterImport="getTableData"
        >
          <template v-slot:before>
            <div>
              <el-dropdown-item :disabled="batchDeleteObjs.length==0">
                <delete-button
                  ref="deleteButton"
                  :single="false"
                  :from="'model'"
                  :forceDeleteShow="true"
                  :type="'link'"
                  :title="$t('overall.batchDel')"
                  id="account-list-batch-delete"
                  v-has="'model_delete'"
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
      <template v-slot="slotProps">
        <model-table
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
          @sync="chartBySync"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></model-table>
      </template>
      <template v-slot:pagination>
        <Pagination ref="Pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <model-box v-if="rightBox.show" :obj="object" @close="closeRightBox"></model-box>
    </transition>
  </div>
</template>
<script>
import bus from '@/libs/bus'
import deleteButton from '@/components/common/deleteButton'
import modelBox from '@/components/common/rightBox/administration/modelBox'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import modelTable from '@/components/common/table/settings/modelTable'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'

export default {
  name: 'model',
  components: {
    nzDataList,
    modelBox,
    deleteButton,
    modelTable,
    topToolMoreOptions
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'asset/model',
      blankObject: { // 空白对象
        id: '',
        name: '',
        chartIds: '',
        sysObjectId: '',
        type: { id: '', name: '' },
        remark: ''
      },
      tableId: 'modelTable',
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
        }, {
          name: this.$t('asset.brand'),
          type: 'brand',
          label: 'brandIds',
          readonly: true,
          disabled: false
        }]
      }
    }
  },
  mounted () {
    bus.$on('refreshBrand', () => {
      this.$refs.dataList.$refs.searchInput.getBrandData()
    })
  },
  methods: {
    chartBySync (row) {
      this.$store.dispatch('dispatchHomeLoading', true)
      this.$post('visual/panel/chart/syncTmpl', { models: [row.id] }).then(res => {
        this.$store.dispatch('dispatchHomeLoading', false)
        if (res.code === 200) {
          this.getTableData()
          this.$message.success(this.$t('tip.syncSuccess'))
        } else {
          this.$message.error(res.msg)
        }
      })
    }
  },
  beforeDestroy () {
    bus.$off('refreshBrand', () => {
      this.$refs.dataList.$refs.searchInput.getBrandData()
    })
  },
  created () {

  },
  computed: {
  }
}
</script>
