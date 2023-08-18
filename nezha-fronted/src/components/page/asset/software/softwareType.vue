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
        <button id="account-add" v-has="'model_add'" :title="$t('overall.createSoftwareType')" class="top-tool-btn margin-r-10" type="button" @click="add">
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
          @afterImport="getTableData"
          v-has="['model_add','model_edit','model_delete']"
        >
          <template v-slot:before>
            <div>
              <el-dropdown-item :disabled="batchDeleteObjs.length==0" :class="'nz-el-dropdown-menu-item'">
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
        <softwareTypeTable

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
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></softwareTypeTable>
      </template>
      <template v-slot:pagination>
        <Pagination ref="Pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <softwareTypeBox v-if="rightBox.show" :obj="object" @close="closeRightBox"></softwareTypeBox>
    </transition>
  </div>
</template>
<script>
import deleteButton from '@/components/common/deleteButton'
import softwareTypeBox from '@/components/common/rightBox/software/softwareTypeBox'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import softwareTypeTable from '@/components/common/table/settings/softwareTypeTable'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'

export default {
  name: 'softwareType',
  components: {
    nzDataList,
    softwareTypeBox,
    deleteButton,
    softwareTypeTable,
    topToolMoreOptions
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: '/asset/software/type',
      blankObject: { // 空白对象
        id: '',
        name: '',
        category: '',
        icon: '',
        params: {
        },
        remark: ''
      },
      tableId: 'softwareTypeTable',
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
      }
    }
  },
  created () {

  },
  computed: {
  },
  mounted () {
  },
  methods: {
  },
  beforeDestroy () {
  }
}
</script>
