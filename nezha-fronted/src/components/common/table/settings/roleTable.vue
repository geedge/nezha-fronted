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
          <template v-if="scope.row.i18n">
            <div style="cursor:text" class="document-copy-block">
              <span class="document-copy-text">{{$t(scope.row.i18n)}}</span>
              <i  class="nz-icon nz-icon-override" style="cursor: pointer;visibility: hidden" @click="onCopy($t(scope.row.i18n))"></i>
            </div>
          </template>
          <template v-else-if="scope.row.name">
            <div style="cursor:text" class="document-copy-block">
              <span class="document-copy-text">{{scope.row.name}}</span>
              <i  class="nz-icon nz-icon-override" style="cursor: pointer;visibility: hidden" @click="onCopy($t(scope.row.name))"></i>
            </div>
          </template>
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
        <button class="table-operation-item" v-has="'role_edit'" @click="tableOperation(['edit', scope.row])"><i class="nz-icon nz-icon-edit"></i></button>
        <el-dropdown size="medium" v-has="['role_delete','role_edit']" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
            <el-dropdown-item v-has="'role_edit'" :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'role_delete'" :command="['delete', scope.row]" :disabled="isBuiltIn(scope.row)"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
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
  name: 'roleTable',
  mixins: [table],
  props: {
    loading: Boolean
  },
  data () {
    return {
      tableTitle: [ // 原table列
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
          sortable: 'custom'
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
