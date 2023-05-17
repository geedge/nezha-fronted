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
          <template v-if="scope.row.i18n">
            <copy :copyData='$t(scope.row.i18n)' :showInfo='$t(scope.row.i18n)'>
                  <template slot="copy-text">
                     {{$t(scope.row.i18n)}}
                  </template>
            </copy>
          </template>
          <template v-else-if="scope.row.name">
            <copy :copyData='$t(scope.row.name)' :showInfo='$t(scope.row.name)'>
                  <template slot="copy-text">
                     {{scope.row.name}}
                  </template>
              </copy>
          </template>
        </template>
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
        <button class="table-operation-item" v-has="'role_edit'" @click="showBottomBox('roles', scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" v-has="['role_delete','role_edit']" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
            <el-dropdown-item v-has="'role_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'role_edit'" :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'role_delete'" :command="['delete-rel', scope.row, {forceDeleteShow:true, single:true, deleteTitle:'config.roles.roles'}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
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
import copy from '@/components/common/copy'
export default {
  name: 'roleTable',
  mixins: [table],
  components: { copy },
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
