<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.softwareAsset"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="account-add" v-has="'softwareAsset_add'" :title="$t('overall.createSoftwareAsset')" class="top-tool-btn margin-r-10" type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
       <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="model"
          :params="searchLabel"
          :permissions="{
            import: 'softwareAsset_add',
            export: 'softwareAsset_edit'
          }"
          class="top-tool-export margin-r-10"
          export-file-name="asset-model"
          @afterImport="getTableData"
          v-has="['softwareAsset_add','softwareAsset_edit','softwareAsset_delete']"
        >
          <template v-slot:before>
            <div>
              <el-dropdown-item :disabled="batchDeleteObjs.length==0" :class="'nz-el-dropdown-menu-item'">
                <delete-button
                  ref="deleteButton"
                  :single="false"
                  :from="'softwareAsset'"
                  :forceDeleteShow="true"
                  :type="'link'"
                  :title="$t('overall.batchDel')"
                  id="account-list-batch-delete"
                  v-has="'softwareAsset_delete'"
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
        <softwareAssetTable
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
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></softwareAssetTable>
      </template>
      <template v-slot:pagination>
        <Pagination ref="Pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <softwareAssetBox v-if="rightBox.show" :obj="object" @close="closeRightBox"></softwareAssetBox>
    </transition>
  </div>
</template>
<script>
import deleteButton from '@/components/common/deleteButton'
import softwareAssetBox from '@/components/common/rightBox/software/softwareAssetBox'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import softwareAssetTable from '@/components/common/table/settings/softwareAssetTable'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'

export default {
  name: 'softwareAsset',
  components: {
    nzDataList,
    softwareAssetBox,
    deleteButton,
    softwareAssetTable,
    topToolMoreOptions
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: '/asset/software',
      tableId: 'softwareAssetTable',
      blankObject: { // 空白对象
        id: '',
        name: '',
        typeId: '',
        assetId: '',
        projectId: '',
        params: {},
        remark: ''
      },
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
  computed: {
  },
  mounted () {
  },
  methods: {
    copy (u, copyParams) {
      const copyName = this.$lodash.get(copyParams, 'copyName', '-copy')
      this.object = {
        name: u.name + copyName,
        id: '',
        typeId: u.typeId,
        assetId: u.assetId,
        remark: u.remark,
        params: u.params
      }
      if (this.object.name.length > 64) {
        const length = this.object.name.length - 64
        this.object.name = u.name.substring(0, u.name.length - length) + copyName
      }
      this.rightBox.show = true
    }
  },
  beforeDestroy () {
  }
}
</script>
