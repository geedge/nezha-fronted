<template>
  <div style="height: 100%">
    <el-table
      id="userTable"
      ref="dataTable"
      :data="tableData"
      :height="height"
      border
      @cell-mouse-enter="cellMouseEnter"
      :default-sort="orderBy"
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
            <copy :copyData='scope.row[item.prop]' :showInfo='scope.row[item.prop]'>
              <template slot="copy-text">
                {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
              </template>
            </copy>
          </template>
          <template v-else-if="item.prop === 'type'">
            {{scope.row[item.prop]}}
          </template>
          <template v-else-if="item.prop === 'project'">
            <div class="document-copy-block">
              <span class="document-copy-text"
              @mouseenter="labelHover(scope.row, item.prop, true,true, $event)"
              @mouseleave="labelHover(scope.row, item.prop, false,true)">
              {{scope.row[item.prop].name}}
              </span>
              <i v-if="scope.row[item.prop].name" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(scope.row[item.prop].name)" :title="$t('overall.copyText')"></i>
            </div>
          </template>
          <template v-else-if="item.prop === 'endpointNum'">
            <span class="num-cursor" @click.stop="showBottomBox('endpoint', scope.row)" @dblclick.stop="">
              <i class="nz-icon nz-icon-overview-endpoint monitorColor"/>
            {{scope.row[item.prop]}}
            </span>
          </template>
          <template v-else-if="item.prop === 'alertNum'">
            <span class="num-cursor" @click.stop="showBottomBox('moduleAlertMessage', scope.row)" @dblclick.stop="">
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
          <template v-else-if="item.prop === 'dashboard'">
            {{scope.row.dashboard ? scope.row.dashboard.name : '-'}}
          </template>
          <span v-else-if="item.prop === 'id'" :id="'globalSearch' + scope.row.id">{{scope.row[item.prop]}}</span>
          <span v-else-if="scope.row[item.prop]" :class="item.prop === 'remark'? 'el-table-remark':''">{{scope.row[item.prop]}}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        :resizable="false"
        :width="operationWidth"
        fixed="right">
        <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
        <div slot-scope="scope" class="table-operation-items">
          <button class="table-operation-item"  @click="showBottomBox('endpoint', scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button>
          <el-dropdown size="medium" v-has="['monitor_module_edit','monitor_module_delete','alertSilence_add','main_edit']" trigger="click" @command="tableOperation">
            <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
              <i class="nz-icon nz-icon-more3"></i>
            </div>
            <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
              <el-dropdown-item v-has="'monitor_module_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'monitor_module_delete'" :command="['delete-rel', scope.row, {forceDeleteShow:true, single:true}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'monitor_module_edit'" :command="['copy', scope.row, 'module']"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'main_edit'" :command="['sync', scope.row]"><i class="nz-icon nz-icon-sync"></i><span class="operation-dropdown-text">{{$t('overall.syncChart')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'alertSilence_add'" :command="['fastSilence', scope.row, 'module']"><i class="nz-icon nz-icon-fast-silence"></i><span class="operation-dropdown-text">{{$t('overall.silenceAlert')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'asset_add'" :command="['topology', scope.row, 'module']"><i class="nz-icon nz-icon-Topology"></i><span class="operation-dropdown-text">{{$t('overall.topology')}}</span></el-dropdown-item>
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
    <alertLabel
      v-if="alertLabelShow"
      :id="alertLabelId"
      :that="alertLabelObj"
      :type="alertLabelType"
    ></alertLabel>
  </div>
</template>

<script>
import table from '@/components/common/mixin/table'
import deleteButton from '@/components/common/deleteButton'
import copy from '@/components/common/copy'
import alertLabel from '../../alert/alertLabel'
import alertLabelMixin from '@/components/common/mixin/alertLabelMixin'
export default {
  name: 'moduleTable',
  mixins: [table, alertLabelMixin],
  components: { deleteButton, copy, alertLabel },
  props: {
    loading: Boolean
  },
  data () {
    return {
      needAlertDaysData: true,
      trendKey: 'moduleId',
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
          label: this.$t('overall.alert'),
          prop: 'alertNum',
          show: true,
          width: 120,
          sortable: 'custom'
        }, {
          label: this.$t('model.dashboardtemplate'),
          prop: 'dashboard',
          minWidth: 150,
          show: false
        }, {
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
