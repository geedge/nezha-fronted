<template>
  <el-table
    id="roleTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    border
    :default-sort="orderBy"
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="selectionChange"
    @row-dblclick="(row)=>{showBottomBox('dashboardTab', row)}"
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
        <span v-if="item.prop==='varType'">{{scope.row[item.prop] === 1 ? 'Asset' : 'Endpoint'}}</span>
        <span v-else-if="item.prop==='type'">
          <i :class="typeIcon(scope.row)"/>
        {{findTypeLabel(scope.row)}}
        </span>
        <template v-else-if="item.prop === 'name'">
          <copy :copyData='scope.row[item.prop]' :showInfo='scope.row[item.prop]'>
                  <template slot="copy-text">
                     {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
                  </template>
              </copy>
          </template>
        <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop] || '-'}}</span>
        <template v-else>-</template>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item"  @click="showBottomBox('dashboardTab', scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" v-has="['chartTemplate_edit','chartTemplate_delete']" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
            <el-dropdown-item v-has="'chartTemplate_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'chartTemplate_delete'" :command="['delete-rel', scope.row, {forceDeleteShow:false, single:true}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'chartTemplate_edit'" :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'chartTemplate_edit'" :command="['sync', scope.row]"><i class="nz-icon nz-icon-sync"></i><span class="operation-dropdown-text">{{$t('overall.syncChart')}}</span></el-dropdown-item>
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
import { chart as chartConstant } from '@/components/common/js/constants'
import copy from '@/components/common/copy'
export default {
  name: 'chartTmplTable',
  mixins: [table],
  components: { copy },
  props: {
    loading: Boolean
  },
  data () {
    return {
      chartTypeList: chartConstant.type,
      qsArr: [],
      tableTitle: [
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
          label: this.$t('overall.type'),
          prop: 'type',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('dashboard.panel.chartForm.varType'),
          prop: 'varType',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('overall.remark'),
          prop: 'remark',
          show: true,
          minWidth: 200
        }
      ]
    }
  },
  methods: {
    typeIcon (row) {
      let str = 'nz-icon '
      switch (row.type) {
        case 'line':
          str += 'nz-icon-link-chart'
          break
        case 'bar':
          str += 'nz-icon-bar-chart'
          break
        case 'stackArea':
          str += 'nz-icon-stack-area'
          break
        case 'singleStat':
          str += 'nz-icon-single-value'
          break
        case 'pie':
          str += 'nz-icon-pie-chart'
          break
        case 'table':
          str += 'nz-icon-table1'
          break
        case 'alertList':
          str += 'nz-icon-alert-list'
          break
        case 'text':
          str += 'nz-icon-text1'
          break
        case 'url':
          str += 'nz-icon-url'
          break
        case 'group':
          str += 'nz-icon-group'
          break
        case 'logs':
          str += 'nz-icon-logs'
          break
        case 'log':
          str += 'nz-icon-logs'
          break
        case 'bubble':
          str += 'nz-icon-bubble'
          break
        case 'area':
          str += 'nz-icon-stack-area'
          break
        case 'point':
          str += 'nz-icon-bubble'
          break
        case 'stat':
          str += 'nz-icon-single-value'
          break
        case 'hexagon':
          str += 'nz-icon-duobianxing'
          break
        case 'gauge':
          str += 'nz-icon-menu-dashboard'
          break
        case 'treemap':
          str += 'nz-icon-Firewall'
          break
        case 'sankey':
          str += 'nz-icon-sankey'
          break
        case 'rank':
          str += 'nz-icon-rank'
          break
        case 'diagram':
          str += 'nz-icon-diagram'
          break
        case 'map':
          str += 'nz-icon-map'
          break
        case 'clock':
          str += 'nz-icon-clock'
          break
        case 'topology':
          str += 'nz-icon-projectTopology'
          break
        default :
          // str += 'nz-icon-table1'
          break
      }
      return str
    },
    findTypeLabel (row) {
      const typeItem = this.chartTypeList.find(title => title.value == row.type)
      return typeItem ? this.$t(typeItem.label) : '-'
    }
  }
}
</script>
