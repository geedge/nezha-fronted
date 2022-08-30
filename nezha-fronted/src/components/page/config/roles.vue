<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.role"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="roles-add" v-has="'role_add'" :title="$t('overall.createRole')" class="top-tool-btn margin-r-10"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button
          ref="deleteButton"
          :from="'roles'"
          :forceDeleteShow="true"
          :deleteTitle="'config.roles.roles'"
          id="role-list-batch-delete"
          v-has="'role_delete'"
          :api="url"
          :delete-objs="batchDeleteObjs"
          @after="getTableData"
          @before="delFlag=true"
        ></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <role-table
          ref="dataTable"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @copy="copy"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></role-table>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <role-box v-if="rightBox.show" :copyFlag="copyFlag" :obj="object" @close="closeRightBox"></role-box>
    </transition>
  </div>
</template>
<script>
import roleBox from '@/components/common/rightBox/administration/roleBox'
import deleteButton from '@/components/common/deleteButton'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import roleTable from '@/components/common/table/settings/roleTable'

export default {
  name: 'roles',
  components: {
    roleTable,
    roleBox,
    deleteButton,
    nzDataList
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'sys/role',
      tableId: 'rolesTable', // 需要分页的table的id，用于记录每页数量
      blankObject: { // 空白对象
        name: ''
      },
      copyFlag: false,
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 10,
          name: this.$t('overall.name'),
          type: 'input',
          label: 'name',
          disabled: false
        }]
      }
    }
  },
  methods: {
    edit (row, copyFlag) {
      this.object = { ...row }
      if (copyFlag) {
        this.object.name = this.object.name + '-copy'
        if (this.object.name.length > 64) {
          const length = this.object.name.length - 64
          this.object.name = row.name.substring(0, row.name.length - length) + '-copy'
        }
      }
      this.rightBox.show = true
    },
    copy (u) {
      this.edit(u, true)
      this.copyFlag = true
    }
  }
}
</script>
