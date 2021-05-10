<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.model"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="account-add" v-has="'user_add'" :title="$t('overall.createUser')" class="top-tool-btn margin-r-10"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button id="account-list-batch-delete" v-has="'user_delete'" :api="url" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot="slotProps">
        <model-table
          ref="dataTable"
          v-loading="slotProps.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
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
import deleteButton from '@/components/common/deleteButton'
import modelBox from '@/components/common/rightBox/administration/modelBox'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import modelTable from '@/components/common/table/settings/modelTable'

export default {
  name: 'model',
  components: {
    nzDataList,
    modelBox,
    deleteButton,
    modelTable
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'asset/model',
      blankObject: { // 空白对象
        id: '',
        name: '',
        chartIds: '',
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
          name: 'Name',
          type: 'input',
          label: 'name',
          disabled: false
        }, {
          name: this.$t('asset.brand'),
          type: 'brand',
          label: 'brandIds',
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
