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
        <button id="account-add" v-has="'user_add'" :title="$t('overall.createUser')" class="top-tool-btn margin-r-10"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button
          ref="deleteButton"
          :single="false"
          :from="'assetType'"
          :forceDeleteShow="false"
          id="account-list-batch-delete"
          v-has="'user_delete'"
          :api="url"
          :delete-objs="batchDeleteObjs"
          @after="getTableData"
          @before="delFlag=true"
        ></delete-button>
      </template>
      <template v-slot="slotProps">
        <asset-type-table
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
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></asset-type-table>
      </template>
      <template v-slot:pagination>
        <Pagination ref="Pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <asset-type-box v-if="rightBox.show" :obj="object" @close="closeRightBox"></asset-type-box>
    </transition>
  </div>
</template>
<script>
import deleteButton from '@/components/common/deleteButton'
import assetTypeBox from '@/components/common/rightBox/administration/assetTypeBox'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import assetTypeTable from '@/components/common/table/settings/assetTypeTable'

export default {
  name: 'assetType',
  components: {
    nzDataList,
    assetTypeBox,
    deleteButton,
    assetTypeTable
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'asset/typeConf',
      blankObject: { // 空白对象
        id: '',
        name: '',
        vm: '',
        vmh: '',
        authProtocol: '',
        snmpEnable: '',
        snmpCollect: '',
        sshCollect: ''
      },
      tableId: 'typeConfTable',
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          name: 'ID',
          type: 'input',
          label: 'ids',
          disabled: false
        }, {
          name: 'Name',
          type: 'input',
          label: 'name',
          disabled: false
        }]
      }
    }
  },
  methods: {
  },
  computed: {
  }
}
</script>
