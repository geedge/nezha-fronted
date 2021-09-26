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
    @row-dblclick="(row)=>{showBottomBox('endpoint', row)}"
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
      class="data-column"
    >
      <template slot="header">
        <span class="data-column__span data-column__span--modify">{{item.label}}</span>
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
          <span class="endpoint-num"  @click="showBottomBox('endpoint', scope.row)">
             <i class="nz-icon nz-icon-overview-endpoint monitorColor"/>
          {{scope.row[item.prop]}}
          </span>
        </template>
        <template v-else-if="item.prop === 'alertNum'">
          <span class="alert-num" @click="showBottomBox('moduleAlertMessage', scope.row)">
            <i class="nz-icon nz-icon-overview-alert" :class="scope.row[item.prop]>0?'colorEF7458':'color23BF9A'"/>
            {{scope.row[item.prop]}}
          </span>
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
        <button class="table-operation-item"  @click="showBottomBox('endpoint', scope.row)"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" v-has="['monitor_module_edit','monitor_module_delete']" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-box-dropdown-top">
            <el-dropdown-item v-has="'monitor_module_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'monitor_module_delete'" :command="['delete', scope.row, `sys/user?ids=${scope.row.id}`]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'monitor_module_edit'" :command="['copy', scope.row, 'module']"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'panel_chart_edit'" :command="['sync', scope.row]"><i class="nz-icon nz-icon-sync"></i><span class="operation-dropdown-text">{{$t('overall.syncChart')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'alertSilence_add'" :command="['fastSilence', scope.row, 'module']"><i class="nz-icon nz-icon-fast-silence"></i><span class="operation-dropdown-text">{{$t('overall.silenceAlert')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
export default {
  name: 'moduleTable',
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
          label: this.$t('project.module.moduleName'),
          prop: 'name',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('project.project.projectName'),
          prop: 'project',
          show: true,
          width: 200,
          sortable: 'custom'
        },
        {
          label: this.$t('project.endpoint.endpoint'),
          prop: 'endpointNum',
          show: true,
          width: 200,
          sortable: 'custom'
        }, {
          label: this.$t('project.module.alerts'),
          prop: 'alertNum',
          show: true,
          width: 200,
          sortable: 'custom'
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
  .colorEF7458{
    color: #EF7458;
  }
  .color23BF9A{
    color: #23BF9A;
  }
  .color969dea{
    color: #969dea;
  }
  .endpoint-num, .alert-num{
    cursor: pointer;
  }
</style>
