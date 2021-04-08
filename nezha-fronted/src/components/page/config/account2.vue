<template>
  <div style="height: 100%">
    <nz-data-list
      ref="dataList"
      :components="['searchInput', 'elementSet']"
      :custom-table-title.sync="tools.customTableTitle"
      :search-msg="searchMsg"
      :table-id="tableId"
      :table-title="tableTitle"
      :from="fromRoute.account">
      <template v-slot:top-tool-right>
        <button id="account-add" v-has="'account_toAdd'" :title="$t('overall.createAccount')" class="top-tool-btn margin-l-20"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button id="account-list-batch-delete" v-has="'account_delete'" :delete-objs="batchDeleteObjs" api="sys/user" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <el-table
          id="account-list-table"
          ref="dataTable"
          v-loading="tools.loading"
          :data="tableData"
          :height="mainTableHeight"
          border
          @header-dragend="dragend"
          @sort-change="tableDataSort"
          @selection-change="(selection)=>{batchDeleteObjs=selection}"
        >
          <el-table-column
            :resizable="false"
            align="center"
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            v-for="(item, index) in tools.customTableTitle"
            v-if="item.show"
            :key="`col-${index}`"
            :fixed="item.fixed"
            :label="item.label"
            :prop="item.prop"
            :resizable="true"
            :sort-orders="['ascending', 'descending']"
            :width="`${item.width}`"
            :min-width="`${item.minWidth}`"
            class="data-column"
          >
            <template slot="header">
              <span>{{item.label}}</span>
              <div class="col-resize-area"></div>
            </template>
            <template slot-scope="scope" :column="item">
              <template v-if="item.prop === 'roles'">
                <template v-if="scope.row[item.prop]">
                  <template v-for="(role, index) in scope.row[item.prop]">
                    <span v-if="role" :key="index">{{role.i18n?$t(role.i18n):role.name}}</span>
                  </template>
                </template>
                <template v-else>
                  <span>-</span>
                </template>
              </template>
              <template v-else-if="item.prop === 'status'">
                <el-switch
                  v-model="scope.row.status"
                  :disabled="isCurrentUser(scope.row.username) || !hasButton('account_toEdit') || !hasButton('account_toAdd') || (scope.row.username==='admin' && scope.row.id==1)"
                  active-color="#ee9d3f"
                  active-value="1"
                  inactive-value="0"
                  @change="(val)=>{statusChange(scope.row)}">
                </el-switch>
              </template>
              <span v-else-if="item.prop === 'createTime'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
              <span v-else>{{scope.row[item.prop]}}</span>
            </template>
          </el-table-column>
          <el-table-column
            :resizable="false"
            fixed="right"
            :width="operationWidth">
            <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
            <div slot-scope="scope" class="table-operation-items">
              <button class="table-operation-item" @click="$refs.dataList.showBottomBox('operationLogTab', scope.row)"><i class="nz-icon nz-icon-view1"></i></button>
              <el-dropdown size="medium" trigger="hover" @command="tableOperation">
                <div class="table-operation-item table-operation-item--more">
                  <span>…</span><i class="nz-icon nz-icon-arrow-down"></i>
                </div>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
                  <el-dropdown-item :command="['delete', scope.row, `sys/user?ids=${scope.row.id}`]" :disabled="scope.row.id === 1"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </el-table-column>
        </el-table>
        <!-- 回到table顶部的按钮 -->
        <button v-show="tools.showTopBtn && slotProps.mainResizeShow" id="account-list-totop" :class="{'to-top-is-hover': tools.tableHover}" :style="{top: tools.toTopBtnTop}" class="to-top" @click="toTop(scrollbarWrap)"><i class="nz-icon nz-icon-top"></i></button>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <account-box v-if="rightBox.show" :roles="roles" :user="object" @close="closeRightBox"></account-box>
    </transition>
  </div>
</template>
<script>
import deleteButton from '@/components/common/deleteButton'
import accountBox from '@/components/common/rightBox/accountBox'
import nzDataList from '@/components/common/table/nzDataList'
import tableMixin from '@/components/common/mixin/table'
export default {
  name: 'account',
  components: {
    nzDataList,
    accountBox,
    deleteButton
  },
  mixins: [tableMixin],
  data () {
    return {
      tableId: 'accountTable', // 需要分页的table的id，用于记录每页数量
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
      tableTitle: [ // 原table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: this.$t('config.account.name'),
          prop: 'name',
          show: true,
          width: 150
        }, {
          label: this.$t('config.account.username'),
          prop: 'username',
          show: true,
          width: 150
        }, {
          label: this.$t('config.account.roles'),
          prop: 'roles',
          show: true,
          width: 150
        }, {
          label: 'E-mail',
          prop: 'email',
          show: true,
          minWidth: 150
        }, {
          label: this.$t('config.account.lastLoginTime'),
          prop: 'lastLoginTime',
          show: true,
          width: 200
        }, {
          label: this.$t('config.account.lastLoginIp'),
          prop: 'lastLoginIp',
          show: true,
          width: 150
        }, {
          label: this.$t('config.account.source'),
          prop: 'source',
          show: true,
          width: 150
        }, {
          label: this.$t('config.account.enable'),
          prop: 'status',
          show: true,
          width: 100
        }
      ],
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 10,
          name: this.$t('config.account.account'),
          type: 'input',
          label: 'username',
          disabled: false
        }]
      },
      roles: []
    }
  },
  methods: {
    getTableData () {
      if (!this.hasButton('account_view')) {
        this.$message.error(this.$t('tip.noAccess'))
        return
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      this.$get('sys/user', this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].status = response.data.list[i].status + ''
          }
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
          if (!this.scrollbarWrap) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    },
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
        if (response.code == 200) {
          this.roles = response.data.list
        } else {
          this.$message.error('load roles faild')
        }
      })
    },
    resetTableTitle () {
      const title = this.tools.customTableTitle
      const tableTitle = title.slice(0, this.tableTitle.length)
      const tagTitle = title.slice(this.tableTitle.length, title.length)
      this.$get('/alert/script?pageNo=1&pageSize=-1').then(response => {
        let scripts = response.data.list
        scripts = scripts.map(item => {
          return { label: item.name, prop: 'tags', show: false, allowed: true, scriptId: item.id, type: 'tag' }
        })
        const newTags = scripts.filter(item => { return !tagTitle.find(t => { return item.label == t.label }) })
        const keepTags = tagTitle.filter(item => { return scripts.find(t => { return item.label == t.label }) })
        keepTags.forEach(item => {
          const script = scripts.find(t => { return item.label == t.label })
          item.scriptId = script.scriptId
        })
        let result = tableTitle.concat([{ label: this.$t('config.account.notification'), show: false, NotSet: true, type: 'title', prop: 'table-tag' }])

        result = result.concat(keepTags).concat(newTags)
        this.tools.customTableTitle = JSON.parse(JSON.stringify(result))
      })
    }/* ,
    filterTags (head, scope) {
      if (scope.row.notifications) {
        const notification = scope.row.notifications.find(item => {
          return head.scriptId === item.scriptId
        })
        if (notification) {
          return notification.account
        }
      }
    } */
  },
  computed: {
    isCurrentUser () {
      return function (username) {
        return localStorage.getItem('nz-username') == username
      }
    }
  },
  mounted () {
    this.getRoles()
    this.resetTableTitle()
  }
}
</script>
