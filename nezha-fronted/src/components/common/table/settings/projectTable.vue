<template>
  <el-table
    id="userTable"
    ref="dataTable"
    class="project-table"
    :data="tableData"
    :height="height"
    border
    :default-sort="orderBy"
    @header-dragend="dragend"
    @cell-mouse-enter="cellMouseEnter"
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
      :key="`col-${index}-${item.prop}`"
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

          <div class="document-copy-block">
              <span class="document-copy-text" :title="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
              <i v-if="scope.row[item.prop]" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(scope.row.name)" :title="$t('overall.copyText')"></i>
          </div>
        </template>
        <template v-else-if="item.prop === 'moduleNum'" >
          <span class="num-cursor" @click="jumpModule(scope.row)">
            <i class="nz-icon nz-icon-overview-module monitorColor"/>
            {{scope.row[item.prop]}}
          </span>
        </template>
        <template v-else-if="item.prop === 'endpointNum'">
          <span class="num-cursor" @click="jumpEndpoint(scope.row)" >
            <i class="nz-icon nz-icon-overview-endpoint monitorColor"/>
            {{scope.row[item.prop]}}
          </span>
        </template>
        <template v-else-if="item.prop === 'alertNum'">
          <span class="num-cursor" @click="jumpAlertMessage(scope.row)">
            <i :class="scope.row.alertNum ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert vertical-align-top;"  @mouseenter="tooltipHover(scope.row,true, $event)" @mouseleave="tooltipHover(scope.row,false, $event)"></i>
            <div v-if="scope.row.alertNumtooltipShow" class="alert-days-info-tooltip" :style="{left: scope.row.left + 'px',top:scope.row.top + 'px'}">
              <div class="tooltip-title">{{$t('project.topology.alert')}}({{$t('overall.active')}})</div>
              <div class="severity-info" style='justify-content: space-between'>
                <div class="severity-name">{{$t('overall.result.total')}}</div>
                <div class="severity-value">{{scope.row.alertNum}}</div>
              </div>
            </div>
            <alertDaysInfo
              v-show="!scope.row.trendLoading"
              :alertDaysData="scope.row.alertDaysData"
            />
          </span>
        </template>
        <span v-else-if="item.prop === 'id'" :id="'globalSearch' + scope.row.id">{{scope.row[item.prop]}}</span>
        <span v-else>{{scope.row[item.prop] ? scope.row[item.prop] : ''}}</span>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="155">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item" @click="changeProjectTopo(scope.row)" v-has="'project_view'" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" v-has="['project_edit','project_delete','alertSilence_add']" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
            <el-dropdown-item :command="['edit', scope.row]" v-has="'project_edit'"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item :command="['delete-rel', scope.row, {forceDeleteShow:true, single:true,from:'project'}]" v-has="'project_delete'"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'project_edit'" :command="['copy', scope.row, 'project']"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'alertSilence_add'" :command="['fastSilence', scope.row, 'project']"><i class="nz-icon nz-icon-fast-silence"></i><span class="operation-dropdown-text">{{$t('overall.silenceAlert')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'asset_add'" :command="['topology', scope.row, 'project']"><i class="nz-icon nz-icon-Topology"></i><span class="operation-dropdown-text">{{$t('overall.topology')}}</span></el-dropdown-item>
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
import deleteButton from '@/components/common/deleteButton'
export default {
  name: 'projectTable',
  mixins: [table],
  components: { deleteButton },
  props: {
    loading: Boolean
  },
  data () {
    return {
      needAlertDaysData: true,
      trendKey: 'projectId',
      tableTitle: [ // 原始table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        }, {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true,
          sortable: 'custom',
          minWidth: 80
        }, {
          label: this.$t('overall.module'),
          prop: 'moduleNum',
          show: true,
          width: 120,
          sortable: 'custom'
        }, {
          label: this.$t('asset.endpoint'),
          prop: 'endpointNum',
          show: true,
          width: 120,
          sortable: 'custom'
        }, {
          label: this.$t('overall.alert'),
          prop: 'alertNum',
          show: true,
          width: 120,
          sortable: 'custom'
        }
      ]
    }
  },
  methods: {
    changeProjectTopo (project) {
      this.$store.commit('currentProjectChange', JSON.parse(JSON.stringify(project)))
    },
    jumpModule (row) {
      localStorage.setItem('moduleProjectId', JSON.stringify([row.id, row.name]))
      this.$router.push({ path: '/module' })
    },
    jumpAlertMessage (row) {
      localStorage.setItem('alertMessageProjectId', row.id)
      this.$router.push({ path: '/alertMessage' })
    },
    jumpEndpoint (row) {
      localStorage.setItem('endpointProjectId', row.id)
      this.$router.push({ path: '/endpoint' })
    }
  },
  computed: {
    isCurrentUser () {
      return function (username) {
        return localStorage.getItem('nz-username') === username
      }
    },
    showList () {
      return !this.$store.getters.getShowTopoScreen
    }
  },
  watch: {
    showList: {
      handler (val) {
        if (val) {
          this.$refs.dataTable.doLayout()
        }
      }
    }
  }
}
</script>
