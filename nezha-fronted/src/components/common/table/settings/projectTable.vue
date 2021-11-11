<template>
  <el-table
    id="userTable"
    ref="dataTable"
    class="project-table"
    :data="tableData"
    :height="height"
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
         <span class="alert-num" @click="jumpAlertMessage(scope.row)">
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
        <el-dropdown size="medium" v-has="['project_edit','project_delete','alertSilence_add']" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
            <el-dropdown-item :command="['edit', scope.row]" v-has="'project_edit'"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item :command="['delete', scope.row, `sys/user?ids=${scope.row.id}`]" v-has="'project_delete'"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'project_edit'" :command="['copy', scope.row, 'project']"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'alertSilence_add'" :command="['fastSilence', scope.row, 'project']"><i class="nz-icon nz-icon-fast-silence"></i><span class="operation-dropdown-text">{{$t('overall.silenceAlert')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
    <template  slot="empty">
      <div v-if="!loading" class="table-no-data">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#nz-icon-no-data-list"></use>
        </svg>
        <div class="table-no-data__title">No results found</div>
      </div>
      <div v-else>&nbsp;</div>
    </template>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
export default {
  name: 'projectTable',
  mixins: [table],
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
      localStorage.setItem('moduleProjectId', JSON.stringify([row.id, row.name]))
      this.$router.push({ path: '/monitor/module' })
    },
    jumpAlertMessage (row) {
      localStorage.setItem('alertMessageProjectId', row.id)
      this.$router.push({ path: '/alertMessage' })
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
