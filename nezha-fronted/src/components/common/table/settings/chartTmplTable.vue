<template>
  <el-table
    id="roleTable"
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
      :sortable="item.sortable"
      :width="`${item.width}`"
      class="data-column"
    >
      <template slot="header">
        <span>{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <span v-if="item.prop==='varType'">{{scope.row[item.prop]===1?'Asset':'endpoint'}}</span>
        <span v-else-if="item.prop==='type'">
          <i :class="typeIcon(scope.row)"/>
        {{chartTypeList.find(title=>title.value === scope.row[item.prop]).label}}
        </span>
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
        <button class="table-operation-item" title="Copy" @click="showBottomBox('panel', scope.row)"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" v-has="['panel_chart_edit','panel_chart_delete']" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <span>…</span><i class="nz-icon nz-icon-arrow-down"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-has="'panel_chart_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'panel_chart_delete'" :command="['delete', scope.row]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
import { chart as chartConstant } from '@/components/common/js/constants'
export default {
  name: 'roleTable',
  mixins: [table],
  data () {
    return {
      chartTypeList: chartConstant.type,
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        }, {
          label: this.$t('config.exprTemp.name'),
          prop: 'name',
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('config.exprTemp.type'),
          prop: 'type',
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('config.exprTemp.varType'),
          prop: 'varType',
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('config.exprTemp.remark'),
          prop: 'remark',
          show: true
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
        default :
          str += 'nz-icon-table1'
          break
      }
      return str
    }
  }
}
</script>
