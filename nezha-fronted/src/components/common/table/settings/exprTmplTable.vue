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
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <span v-if="scope.row[item.prop]">{{scope.row[item.prop] || '-'}}</span>
        <template v-else>-</template>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item"  v-has="'expressionTemplate_edit'" @click="tableOperation(['edit', scope.row])"><i class="nz-icon nz-icon-edit"></i></button>
        <el-dropdown size="medium" v-has="['expressionTemplate_add','expressionTemplate_delete']" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-public-box-select-top right-public-box-dropdown-top">
            <el-dropdown-item v-has="'expressionTemplate_add'" :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'expressionTemplate_delete'" :command="['delete', scope.row]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
export default {
  name: 'exprTmplTable',
  mixins: [table],
  data () {
    return {
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
          label: this.$t('config.exprTemp.gname'),
          prop: 'gname',
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('config.exprTemp.expression'),
          prop: 'expression',
          show: true
        }, {
          label: this.$t('overall.remark'),
          prop: 'remark',
          show: true
        }
      ]
    }
  }
}
</script>
