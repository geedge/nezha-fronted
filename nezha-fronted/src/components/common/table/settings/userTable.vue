<template>
<div style="height: 100%">
  <el-table
    id="userTable"
    ref="dataTable"
    class="user-table"
    :data="tableData"
    :height="height"
    border
    :default-sort="orderBy"
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
        <span class="data-column__span" :class="{'margin-l-10': item.prop === 'name'}">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <template v-if="item.prop === 'name'">
          <div class="document-copy-block">
            <div class="user-name-td document-copy-text" :class="{'margin-l-10': !scope.row.online}">
              <i class="nz-icon nz-icon-user1 user-online" v-if="scope.row.online" :title="$t('overall.online')"/>
              <div>
              <div class="flex-align-center">
                <span class="user-name-top">{{scope.row[item.prop]}}</span>
                <el-tag size="mini" v-if="mfaEnable == '1' || scope.row.mfaLevel > 0" style="margin-left: 5px">2FA</el-tag>
              </div>
              <div class="user-name-bottom">
                @{{scope.row.username}}
              </div>
            </div>
            </div>
          <i v-if="scope.row.name" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(scope.row.name)" :title="$t('overall.copyText')"></i>
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
          <div v-if="scope.row[item.prop] == 1">
            <div class="active-icon green-bg inline-block"></div>
            {{ $t('overall.enabled') }}
          </div>
          <div v-else-if="scope.row[item.prop] == 0">
            <div class="active-icon gray-bg inline-block"></div>
            {{ $t('overall.disabled') }}
          </div>
        </template>
        <span v-else-if="item.prop === 'createTime'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
        <span v-else-if="item.prop === 'lastLoginTime'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
        <template v-else-if="item.prop === 'lang'">
          <span v-if="scope.row[item.prop] === 'en'">English</span>
          <span v-else-if="scope.row[item.prop] === 'zh'">简体中文</span>
        </template>
        <template v-else-if="item.prop === 'email'">
          <copy :copyData='scope.row[item.prop]' :showInfo='scope.row[item.prop]'>
                  <template slot="copy-text">
                     {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
                  </template>
          </copy>
        </template>
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
        <button class="table-operation-item" @click="showBottomBox('operationLogTab', scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" v-has="['user_edit','user_delete']" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
            <el-dropdown-item v-has="'user_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'user_edit'" :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'user_delete'" :command="['delete-rel', scope.row, {forceDeleteShow:false, single:true, deleteTitle:'config.user.user',from:'user'}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'user_edit'" :command="['reset_mfa', scope.row]"><i class="nz-icon nz-icon-zhongzhi2FA1"></i><span class="operation-dropdown-text">{{$t('config.user.resetMfa')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
    <template slot="empty">
      <div  v-if="!loading" class="table-no-data">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#nz-icon-no-data-list"></use>
        </svg>
        <div class="table-no-data__title">No results found</div>
      </div>
      <div v-else>&nbsp;</div>
    </template>
  </el-table>
</div>
</template>

<script>
import table from '@/components/common/mixin/table'
import copy from '@/components/common/copy'
export default {
  name: 'userTable',
  mixins: [table],
  components: { copy },
  props: {
    loading: Boolean
  },
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
          minWidth: 600,
          sortable: 'custom'
        },
        // {
        //   label: this.$t('login.username'),
        //   prop: 'username',
        //   show: true,
        //   width: 150
        // },
        {
          label: this.$t('profile.role'),
          prop: 'roles',
          show: true,
          width: 150
        }, {
          label: 'E-mail',
          prop: 'email',
          show: true,
          minWidth: 150
        }, {
          label: this.$t('profile.lastLoginTime'),
          prop: 'lastLoginTime',
          show: true,
          width: 200
        }, {
          label: this.$t('profile.lastLoginIp'),
          prop: 'lastLoginIp',
          show: true,
          width: 150
        }, {
          label: this.$t('profile.source'),
          prop: 'source',
          show: true,
          width: 150
        }, {
          label: this.$t('config.user.language'),
          prop: 'lang',
          show: true,
          width: 150
        }, {
          label: this.$t('overall.state'),
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
