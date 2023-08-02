<template>
  <el-table
    id="dcTable"
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
        <template v-if="item.prop === 'lang'">
          <span v-if="scope.row[item.prop] === 'en'">English</span>
          <span v-else-if="scope.row[item.prop] === 'zh'">简体中文</span>
        </template>
        <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
        <template v-else>-</template>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item" @click="tableOperation(['edit', scope.row])" :title="$t('overall.edit')"><i class="nz-icon nz-icon-edit"></i></button>
        <el-dropdown size="medium" v-has="['i18n_delete']" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
            <el-dropdown-item :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'i18n_delete'" :command="['delete-rel', scope.row, {forceDeleteShow:false, single:true,from:'i18n'}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
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
  name: 'globalizationTable',
  mixins: [table],
  props: {
    loading: Boolean
  },
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
          label: this.$t('overall.name'),
          prop: 'name',
          show: true,
          minWidth: 150,
          sortable: 'custom'
        }, {
          label: this.$t('config.menus.code'),
          prop: 'code',
          show: true,
          minWidth: 150,
          sortable: 'custom'
        }, {
          label: this.$t('config.user.language'),
          prop: 'lang',
          show: true,
          minWidth: 150,
          sortable: 'custom'
        }, {
          label: this.$t('overall.value'),
          prop: 'value',
          minWidth: 150,
          show: true
        }, {
          label: this.$t('overall.remark'),
          prop: 'remark',
          show: true,
          minWidth: 150,
          sortable: 'custom'
        }
      ]
    }
  }
}
</script>
