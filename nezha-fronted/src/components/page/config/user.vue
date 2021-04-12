<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.user"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg">
      <template v-slot:top-tool-right>
        <button id="account-add" v-has="'account_toAdd'" :title="$t('overall.createUser')" class="top-tool-btn margin-l-20"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button id="account-list-batch-delete" v-has="'account_delete'" :api="url" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot="slotProps">
        <user-table
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
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></user-table>
      </template>
      <template v-slot:pagination>
        <Pagination ref="Pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <user-box v-if="rightBox.show" :roles="roles" :user="object" @close="closeRightBox"></user-box>
    </transition>
  </div>
</template>
<script>
import deleteButton from '@/components/common/deleteButton'
import userBox from '@/components/common/rightBox/userBox'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import userTable from '@/components/common/table/settings/userTable'

export default {
  name: 'user',
  components: {
    nzDataList,
    userBox,
    deleteButton,
    userTable
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'sys/user',
      blankObject: { // 空白对象
        id: '',
        name: '',
        username: '',
        email: '',
        status: '1',
        createTime: '',
        receiver: [],
        roleIds: 0,
        roles: [],
        lang: '',
        notifications: []
      },
      tableId: 'userTable',
      queryPermission: 'account_view',
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 10,
          name: this.$t('config.user.user'),
          type: 'input',
          label: 'username',
          disabled: false
        }]
      },
      roles: []
    }
  },
  methods: {
    statusChange (user) {
      if (user.roles) {
        user.roleIds = user.roles.map(t => t.id)
      }
      this.$put('sys/user', user).then(response => {
        if (response.code === 200) {
          this.rightBox.show = false
          this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
        } else {
          this.$message.error(response.msg)
        }
        this.getTableData()
      })
    },
    getRoles () {
      this.roles = []
      this.$get('sys/role?pageSize=-1').then(response => {
        if (response.code === 200) {
          this.roles = response.data.list
        } else {
          this.$message.error('load roles faild')
        }
      })
    }
  },
  computed: {
    isCurrentUser () {
      return function (username) {
        return localStorage.getItem('nz-username') === username
      }
    }
  },
  mounted () {
    this.getRoles()
  }
}
</script>
