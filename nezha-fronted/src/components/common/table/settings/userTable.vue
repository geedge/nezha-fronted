<template>
  <el-table
    id="userTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    border
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="selectionChange"
    @row-dblclick="(row)=>{showBottomBox('operationLogTab', row)}"
  >
    <el-table-column
      :resizable="false"
      align="center"
      type="selection"
      width="55">
    </el-table-column>
    <el-table-column
      v-for="(item, index) in customTableTitle"
      v-if="item.show"
      :key="`col-${index}`"
      :fixed="item.fixed"
      :label="item.label"
      :min-width="`${item.minWidth}`"
      :prop="item.prop"
      :resizable="true"
      :sort-orders="['ascending', 'descending']"
      :sortable="item.sortable"
      :width="`${item.width}`"
    >
      <template slot="header">
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <template v-if="item.prop === 'name'">
          <div>
            <div class="flex-align-center">
              <span class="user-name-top">{{scope.row[item.prop]}}</span>
              <el-tag size="mini" v-if="mfaEnable == '1' || scope.row.mfaLevel > 0" style="margin-left: 5px">2FA</el-tag>
            </div>
            <div class="user-name-bottom">
              @{{scope.row.username}}
            </div>
          </div>
        </template>
        <template v-else-if="item.prop === 'roles'">
          <template v-if="scope.row[item.prop]">
            {{scope.row[item.prop].map(t=>t.name).join(',')}}
          </template>
          <template v-else>
            <span>-</span>
          </template>
        </template>
        <template v-else-if="item.prop === 'status'">
          <el-switch
            v-model="scope.row.status"
            :active-color="theme.themeColor"
            :disabled="isCurrentUser(scope.row.username) || !hasButton('user_edit') || (scope.row.username === 'admin' && scope.row.id === 1)"
            active-value="1"
            inactive-value="0"
            @change="val => {statusChange(scope.row)}">
          </el-switch>
        </template>
        <span v-else-if="item.prop === 'createTime'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
        <span v-else-if="item.prop === 'lastLoginTime'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
        <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
        <span v-else>-</span>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item" @click="showBottomBox('operationLogTab', scope.row)"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" v-has="['user_edit','user_delete']" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-has="'user_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'user_delete'" :command="['delete', scope.row]" :disabled="scope.row.id === 1"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'user_edit'" :command="['reset_mfa', scope.row]"><i class="nz-icon nz-icon-zhongzhi2FA"></i><span class="operation-dropdown-text">{{$t('config.user.resetMfa')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
export default {
  name: 'userTable',
  mixins: [table],
  data () {
    return {
      tableTitle: [ // 原始table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        }, {
          label: this.$t('config.user.name'),
          prop: 'name',
          show: true,
          width: 600,
          sortable: 'custom'
        },
        // {
        //   label: this.$t('config.user.username'),
        //   prop: 'username',
        //   show: true,
        //   width: 150
        // },
        {
          label: this.$t('config.user.roles'),
          prop: 'roles',
          show: true,
          width: 150
        }, {
          label: 'E-mail',
          prop: 'email',
          show: true,
          minWidth: 150
        }, {
          label: this.$t('config.user.lastLoginTime'),
          prop: 'lastLoginTime',
          show: true,
          width: 200
        }, {
          label: this.$t('config.user.lastLoginIp'),
          prop: 'lastLoginIp',
          show: true,
          width: 150
        }, {
          label: this.$t('config.user.source'),
          prop: 'source',
          show: true,
          width: 150
        }, {
          label: this.$t('config.user.enable'),
          prop: 'status',
          show: true,
          width: 100
        }
      ],
      mfaEnable: localStorage.getItem('nz-mfa-enable')
    }
  },
  methods: {
    statusChange (user) {
      if (user.roles) {
        user.roleIds = user.roles.map(t => t.id).join(',')
      }
      this.$put(this.api, user).then(response => {
        if (response.code === 200) {
          this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
        } else {
          this.$message.error(response.msg)
        }
        this.$emit('reload')
      })
    }
  },
  computed: {
    isCurrentUser () {
      return function (username) {
        return localStorage.getItem('nz-username') === username
      }
    }
  }
}
</script>
<style scoped>
  .flex-align-center{
    display: flex;
    align-items: center;
  }
  /deep/ .el-tag.el-tag--mini{
    border-radius: 10px;
    font-size: 12px;
    line-height: 12px;
    height: 12px;
    vertical-align: middle;
  }
  .user-name-top{
    color: #333;
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;
    vertical-align: middle;
  }
  .user-name-bottom{
    color: #999999;
    font-size: 14px;
    line-height: 14px;
  }
</style>
