<template>
  <el-table
    id="modelTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    border
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="selectionChange"
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
      :width="`${item.width}`"
    >
      <template slot="header">
        <span>{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <template v-if="item.prop === 'roles'">
          <template v-if="scope.row[item.prop]">
            {{scope.row[item.prop].map(t=>t.name).join(',')}}
          </template>
          <template v-else>
            <span>-</span>
          </template>
        </template>
         <template v-else-if="item.prop === 'brand'">
             {{scope.row.brand.name}}
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
        <span v-else>{{scope.row[item.prop]}}</span>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item" @click="showBottomBox('operationLogTab', scope.row)"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <span>…</span><i class="nz-icon nz-icon-arrow-down"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item :command="['delete', scope.row]" :disabled="scope.row.id === 1"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
export default {
  name: 'modelTable',
  mixins: [table],
  data () {
    return {
      tableTitle: [ // 原始table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: this.$t('config.model.name'),
          prop: 'name',
          show: true,
          width: 160
        }, {
          label: this.$t('config.model.brand'),
          prop: 'brand',
          show: true,
          width: 160
        }, {
          label: this.$t('config.model.remark'),
          prop: 'remark',
          show: true
        },{
          label: this.$t('config.model.assetNum'),
          prop: 'assetNum',
          show: true,
          width:200
        }
      ]
    }
  },
  methods: {
    statusChange (user) {
      if (user.roles) {
        user.roleIds = user.roles.map(t => t.id)
      }
      this.$put(this.url, user).then(response => {
        if (response.code === 200) {
          this.rightBox.show = false
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
