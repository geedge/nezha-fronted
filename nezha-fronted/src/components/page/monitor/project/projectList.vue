<template>
  <div class="project-list">
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.user"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg">
      <template v-slot:top-tool-right>
        <button id="account-add" v-has="'project_add'" :title="$t('overall.createUser')" class="top-tool-btn margin-l-20"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button id="account-list-batch-delete" v-has="'project_delete'" :api="url" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot="slotProps">
        <project-table
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
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></project-table>
      </template>
      <template v-slot:pagination>
        <div class="project-page">
          <Pagination ref="Pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
        </div>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <projectBox v-if="rightBox.show" :project="object" @close="closeRightBox"></projectBox>
    </transition>
  </div>
</template>
<script>
import deleteButton from '@/components/common/deleteButton'
import projectBox from '@/components/common/rightBox/projectBox'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import projectTable from '@/components/common/table/settings/projectTable'

export default {
  name: 'projectList',
  components: {
    nzDataList,
    projectBox,
    deleteButton,
    projectTable
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'monitor/project',
      blankObject: { // 空白对象
        id: '',
        name: '',
        remark: ''
      },
      tableId: 'projectTable',
      queryPermission: 'account_view',
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 10,
          name: 'Project name',
          type: 'input',
          label: 'name',
          disabled: false
        },
        {
          id: 10,
          name: 'Project id',
          type: 'input',
          label: 'id',
          disabled: false
        }]
      },
      roles: []
    }
  },
  methods: {
  },
  computed: {
  },
  mounted () {
  }
}
</script>
<style lang="scss">
  .project-list{
    .project-page{
      margin: 0 20px;
      border: 1px solid #eeeeee;
      border-top: none;
      /deep/ .pagination{
        padding-top: 0;
      }
    }
  }
</style>
