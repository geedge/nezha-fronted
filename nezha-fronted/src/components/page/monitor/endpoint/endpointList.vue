<template>
  <div class="endpoint-list">
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.user"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg">
      <template v-slot:top-tool-right>
        <button id="account-add" v-has="'monitor_endpoint_add'" :title="$t('overall.createUser')" class="top-tool-btn margin-l-20"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button id="account-list-batch-delete" v-has="'monitor_endpoint_delete'" :api="url" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot="slotProps">
        <endpoint-table
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
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></endpoint-table>
      </template>
      <template v-slot:pagination>
        <div class="endpoint-page">
          <Pagination ref="Pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
        </div>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <addEndpointBox v-if="rightBox.show" :endpoint="object" @close="closeRightBox"></addEndpointBox>
    </transition>
  </div>
</template>
<script>
import deleteButton from '@/components/common/deleteButton'
import addEndpointBox from '@/components/common/rightBox/addEndpointBox'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import endpointTable from '@/components/common/table/settings/endpointTable'

export default {
  name: 'endpointList',
  components: {
    nzDataList,
    addEndpointBox,
    deleteButton,
    endpointTable
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'monitor/endpoint',
      blankObject: {}, // 新增/编辑的endpoint
      tableId: 'endpointTable',
      queryPermission: 'account_view',
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 10,
          name: 'endpoint name',
          type: 'input',
          label: 'name',
          disabled: false
        },
        {
          id: 10,
          name: 'endpoint id',
          type: 'input',
          label: 'id',
          disabled: false
        }]
      },
      roles: []
    }
  },
  methods: {
    edit (u) {
      this.rightBox.show = true
    }
  },
  computed: {
  },
  mounted () {
  }
}
</script>
