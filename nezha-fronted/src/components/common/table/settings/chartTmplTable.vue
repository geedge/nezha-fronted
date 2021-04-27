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
        {{chartTypeList.find(title=>title.id == scope.row[item.prop]).name}}
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
        <el-dropdown size="medium" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <span>…</span><i class="nz-icon nz-icon-arrow-down"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item :command="['delete', scope.row]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
export default {
  name: 'roleTable',
  mixins: [table],
  data () {
    return {
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: this.$t('config.exprTemp.name'),
          prop: 'name',
          show: true
        }, {
          label: this.$t('config.exprTemp.type'),
          prop: 'type',
          show: true
        }, {
          label: this.$t('config.exprTemp.varType'),
          prop: 'varType',
          show: true
        }, {
          label: this.$t('config.exprTemp.remark'),
          prop: 'remark',
          show: true
        }
      ],
      chartTypeList: [
        {
          id: 'line',
          name: this.$t('dashboard.panel.chartForm.typeVal.line.label')
        },
        {
          id: 'stackArea',
          name: this.$t('dashboard.panel.chartForm.typeVal.stackArea.label')
        },
        {
          id: 'bar',
          name: this.$t('dashboard.panel.chartForm.typeVal.bar.label')
        },
        {
          id: 'singleStat',
          name: this.$t('dashboard.panel.chartForm.typeVal.singleStat.label')
        },
        {
          id: 'pie',
          name: this.$t('dashboard.panel.chartForm.typeVal.pie.label')
        },
        {
          id: 'table',
          name: this.$t('dashboard.panel.chartForm.typeVal.table.label')
        },
        {
          id: 'alertList',
          name: this.$t('dashboard.panel.chartForm.typeVal.alertList.label')
        },
        {
          id: 'text',
          name: this.$t('dashboard.panel.chartForm.typeVal.text.label')
        },
        {
          id: 'url',
          name: this.$t('dashboard.panel.chartForm.typeVal.url.label')
        },
        {
          id: 'group',
          name: this.$t('dashboard.panel.chartForm.typeVal.group.label')
        }

      ],
    }
  },
  methods: {
    typeIcon (row) {
      let str = 'nz-icon '
      switch (row.type) {
        case 'line':
          str += 'nz-icon-LinkChart'
          break
        case 'bar':
          str += 'nz-icon-barchart'
          break
        case 'stackArea':
          str += 'nz-icon-StackArea'
          break
        case 'singleStat':
          str += 'nz-icon-SingleValue'
          break
        case 'pie':
          str += 'nz-icon-Piechart'
          break
        case 'table':
          str += 'nz-icon-Table1'
          break
        case 'alertList':
          str += 'nz-icon-alertlist'
          break
        case 'text':
          str += 'nz-icon-Text1'
          break
        case 'url':
          str += 'nz-icon-URL'
          break
        case 'group':
          str += 'nz-icon-Group'
          break
        default :
          str += 'nz-icon-Table1'
          break
      }
      return str
    }
  }
}
</script>
