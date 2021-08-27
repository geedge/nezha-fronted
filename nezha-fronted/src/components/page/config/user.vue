<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.user"
      :layout="['searchInput', 'elementSet', 'pagination']"
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
        <user-table
          ref="dataTable"
          v-loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @copy="copy"
          @reset_mfa="resetMfa"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></user-table>
      </template>
      <template v-slot:pagination>
        <Pagination ref="Pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <user-box v-if="rightBox.show" :obj="object" @close="closeRightBox"></user-box>
    </transition>
  </div>
</template>
<script>
import deleteButton from '@/components/common/deleteButton'
import userBox from '@/components/common/rightBox/administration/userBox'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import userTable from '@/components/common/table/settings/userTable'
import MessageBox from 'element-ui/packages/message-box/src/main'
import i18n from '@/components/common/i18n'
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
        pin: '',
        pinChange: '',
        status: '1',
        createTime: '',
        receiver: [],
        roleIds: '',
        roles: [],
        lang: '',
        notifications: [],
        mfaLevel: 0
      },
      tableId: 'userTable',
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 10,
          name: this.$t('config.user.user'),
          type: 'input',
          label: 'name',
          disabled: false
        }]
      }
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
    edit (u, copyFlag) {
      this.$get(`${this.url}/${u.id}`).then(response => {
        const user = response.user
        if (response.code === 200) {
          this.object = {
            ...user,
            status: user.status + '',
            roleIds: Number(user.roles.map(item => item.id).join(',')),
            pin: '',
            pinChange: ''
          }
          if (!this.object.mfaLevel) {
            this.object.mfaLevel = 0
          }
          if (copyFlag) {
            this.object.id = ''
            this.object.name = this.object.name + '-copy'
            if (this.object.name.length > 64) {
              const length = this.object.name.length - 64
              this.object.name = u.name.substring(0, u.name.length - length) + '-copy'
            }
          }
          this.rightBox.show = true
        }
      })
    },
    copy (u) {
      this.edit(u, true)
    },
    resetMfa (row) {
      MessageBox.confirm(i18n.t('tip.resetMfa'), {
        confirmButtonText: i18n.t('tip.yes'),
        cancelButtonText: i18n.t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('/sys/user/resetMfa', { ids: row.id }).then(res => {
          if (res.code == 200) {
            this.$message.success(this.$t('tip.resetSuccess'))
            this.getTableData()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    }
  }
}
</script>
