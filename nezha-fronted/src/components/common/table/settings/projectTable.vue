<template>
  <el-table
    id="userTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    style="width: calc(100% - 25px)"
    border
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="selectionChange"
    @row-dblclick="(row)=>{changeProjectTopo(row)}"
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
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <template v-if="item.prop === 'name'">
          <span class="">
            {{scope.row[item.prop]}}
          </span>
        </template>
        <template v-else-if="item.prop === 'moduleNum'" >
          <span class="module-num" @click="jumpModule(scope.row)">
            <i class="nz-icon nz-icon-overview-module monitorColor"/>
            {{scope.row[item.prop]}}
          </span>
        </template>
        <template v-else-if="item.prop === 'endpointNum'">
          <span style="cursor: pointer" class="endpoint-num" @click="jumpEndpoint(scope.row)" >
              <i class="nz-icon nz-icon-overview-endpoint monitorColor"/>
            {{scope.row[item.prop]}}
          </span>
        </template>
        <template v-else-if="item.prop === 'alertNum'">
         <span class="alert-num">
            <i class="nz-icon nz-icon-overview-alert" :class="scope.row[item.prop]>0?'colorEF7458':'color23BF9A'"/>
            {{scope.row[item.prop]}}
          </span>
        </template>
        <span v-else>{{scope.row[item.prop] ? scope.row[item.prop] : ''}}</span>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="155">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item" @click="changeProjectTopo(scope.row)"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" v-has="['project_edit','project_delete']" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :command="['edit', scope.row]" v-has="'project_edit'"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item :command="['delete', scope.row, `sys/user?ids=${scope.row.id}`]" v-has="'project_delete'"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'alertSilence_add'" :command="['fastSilence', scope.row, 'project']"><i class="nz-icon nz-icon-fast-silence"></i><span class="operation-dropdown-text">{{$t('overall.silenceAlert')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
export default {
  name: 'projectTable',
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
          label: this.$t('project.project.project'),
          prop: 'name',
          show: true,
          sortable: 'custom',
          minWidth: 80
        }, {
          label: this.$t('project.module.module'),
          prop: 'moduleNum',
          show: true,
          width: 100,
          sortable: 'custom'
        }, {
          label: this.$t('project.endpoint.endpoint'),
          prop: 'endpointNum',
          show: true,
          width: 120,
          sortable: 'custom'
        }, {
          label: this.$t('project.endpoint.alerts'),
          prop: 'alertNum',
          show: true,
          width: 100,
          sortable: 'custom'
        }
      ]
    }
  },
  methods: {
    changeProjectTopo (project) {
      this.$store.commit('currentProjectChange', project)
    },
    jumpModule (row) {
      localStorage.setItem('moduleProjectId', row.id)
      this.$router.push({ path: '/monitor/module' })
    },
    jumpEndpoint (row) {
      localStorage.setItem('endpointProjectId', row.id)
      this.$router.push({ path: '/monitor/endpoint' })
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
<style scoped lang="scss">
  .module-num{
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
    padding: 0 3px;
    cursor: pointer;
    .nz-icon-overview-module{
    color: rgb(122, 208, 188)
    }
  }
  .alert-num{
    padding: 0 3px;
    cursor: pointer;
    border-radius: 2px;
  }
  .colorEF7458{
    color: #EF7458;
  }
  .color23BF9A{
    color: #23BF9A;
  }
</style>
