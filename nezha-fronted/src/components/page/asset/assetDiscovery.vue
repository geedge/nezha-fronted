<template>
  <div class="asset-meta">
    <nz-data-list
      ref="dataList"
      :api="url"
      :from="fromRoute.assetDiscovery"
      :custom-table-title.sync="tools.customTableTitle"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="meta-add-meta" v-has="'asset_label_add'" :title="$t('overall.createLabel')" class="top-tool-btn margin-r-10"
                type="button" @click="add">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>
        <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="model"
          :params="searchLabel"
          :params2="searchCheckBox"
          :permissions="{
            import: 'asset_add',
            export: 'asset_edit'
          }"
          class="top-tool-export margin-l-10 margin-r-10"
          export-file-name="asset"
          export-url="/asset/asset/export"
          import-url="/asset/asset/import"
          @afterImport="getTableData"
          v-has="['asset_add','asset_edit','asset_delete']"
        >
          <template v-slot:before>
            <div>
              <el-dropdown-item :disabled="batchDeleteObjs.length==0" :class="'nz-el-dropdown-menu-item'">
                <delete-button
                  ref="deleteButton"
                  :single="false"
                  :from="fromRoute.assetDiscovery"
                  :forceDeleteShow="true"
                  :deleteTitle="'overall.asset'"
                  :type="'link'"
                  :title="$t('overall.batchDel')"
                  id="asset-list-batch-delete"
                  v-has="'asset_delete'"
                  :api="url"
                  :delete-objs="batchDeleteObjs"
                  @after="getTableData"
                  @before="delFlag=true"></delete-button>
              </el-dropdown-item>
            </div>
          </template>
        </top-tool-more-options>
      </template>
      <template v-slot:default="slotProps">
        <assetDiscoveryTable
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
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"
        ></assetDiscoveryTable>
        <!-- 回到table顶部的按钮 -->
        <button v-show="tools.showTopBtn && slotProps.mainResizeShow" id="role-list-totop" :class="{'to-top-is-hover': tools.tableHover}" :style="{top: tools.toTopBtnTop}" class="to-top" @click="toTop(scrollbarWrap)" :title="$t('overall.backToTop')"><i class="nz-icon nz-icon-top"></i></button>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <!--侧滑-->
    <transition name="right-box">
      <assetDiscoveryBox v-if="rightBox.show"
                 ref="assetBox"
                 :from="fromRoute.assetDiscovery"
                 :assetDiscovery="object"
                 @close="closeRightBox"
                 @refresh="getTableData">
      </assetDiscoveryBox>
    </transition>
  </div>
</template>

<script>
import deleteButton from '@/components/common/deleteButton'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import assetDiscoveryTable from '@/components/common/table/asset/assetDiscoveryTable'
import routerPathParams from '@/components/common/mixin/routerPathParams'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import assetDiscoveryBox from '@/components/common/rightBox/asset/assetDiscoveryBox'
export default {
  name: 'assetDiscovery',
  components: {
    deleteButton,
    nzDataList,
    assetDiscoveryTable,
    topToolMoreOptions,
    assetDiscoveryBox
  },
  mixins: [dataListMixin, routerPathParams],
  data () {
    return {
      url: '/mock/asset/discovery',
      tableId: 'assetDiscovery',
      detailType: 'list',
      // 侧滑
      rightBox: {
        metaShow: false,
        groupShow: false
      },
      groupData: [{
        name: this.$t('overall.exportAll'),
        id: -1,
        children: []
      }],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      /* 搜素相关 */
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          {
            name: 'ID',
            type: 'input',
            label: 'ids',
            disabled: false
          }, {
            name: this.$t('overall.name'),
            type: 'input',
            label: 'name',
            disabled: false
          }
        ]
      },
      // 创建修改相关
      blankObject: {
        id: '',
        name: '',
        subnet: '',
        snmpCredentialIds: '',
        schedule: {
          type: 1,
          stime: '2021-01-10 10:10:10',
          repeat: 1,
          nums: [1, 2, 3, 4, 5, 6, 7]
        }
      },
      blankMetaGroup: {
        id: '',
        name: '',
        remark: ''
      },
      filterGroup: '',
      showGroup: { name: '' },
      metaGroup: {}
    }
  },
  mounted () {
    // this.getGroup()
    this.showGroup = this.groupData[0]
  },
  methods: {
    add () {
      this.object = this.$loadsh.cloneDeep(this.blankObject)
      this.rightBox.show = true
    },
    edit (row) {
      this.$get(`${this.url}/${row.id}`).then(response => {
        if (response.code === 200) {
          this.object = response.data
          this.rightBox.metaShow = true
        }
      })
    },
    copy (u) {
      this.object = { ...u, name: u.name + '-copy', id: '' }
      if (this.object.name.length > 64) {
        const length = this.object.name.length - 64
        this.object.name = u.name.substring(0, u.name.length - length) + '-copy'
      }
      this.rightBox.metaShow = true
    },
    closeRightBox (refresh) {
      this.rightBox.metaShow = false
      this.rightBox.groupShow = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
        this.getGroup()
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
        propertyName: 'ids',
        isSearchInput: true,
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
  }
}
</script>
