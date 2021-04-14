<template>
  <el-table
    id="userTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    border
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="(selection) => { batchDeleteObjs = selection }"
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
      class="data-column"
    >
      <template slot="header">
        <span>{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <template v-if="item.prop === 'name'">
          {{scope.row[item.prop]}}
        </template>
        <template v-else-if="item.prop === 'type'">
          {{scope.row[item.prop]}}
        </template>
        <template v-else-if="item.prop === 'project'">
          {{scope.row[item.prop].name}}
        </template>
        <template v-else-if="item.prop === 'endpointNum'">
          {{scope.row[item.prop]}}
        </template>
        <template v-else-if="item.prop === 'alertNum'">
          {{scope.row[item.prop]}}
        </template>
        <span v-else>{{scope.row[item.prop] ? scope.row[item.prop] : ''}}</span>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item" @click="showBottomBox( scope.row)"><i class="nz-icon nz-icon-view1"></i></button>
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
          width: 80
        }, {
          label: this.$t('project.module.moduleName'),
          prop: 'name',
          show: true,
          width: 150
        }, {
          label: this.$t('project.module.type'),
          prop: 'type',
          show: true,
          width: 150
        }, {
          label: this.$t('project.project.project'),
          prop: 'project',
          show: true,
          width: 150
        },
        {
          label: this.$t('project.endpoint.endpoint'),
          prop: 'endpointNum',
          show: true,
          width: 150
        },{
          label: this.$t('project.module.alerts'),
          prop: 'alertNum',
          show: true,
          width: 150
        },
        {
          label: this.$t('overall.remark'),
          prop: 'remark',
          show: true,
          minWidth: 150
        }
      ]
    }
  },
  methods: {
    showBottomBox (project) {
      this.$store.commit('currentProjectChange', project)
    },
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
