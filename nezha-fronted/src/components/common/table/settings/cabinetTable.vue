<template>
  <el-table
    id="cabinetTable"
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
      type="selection"
      width="40"
      align="center">
    </el-table-column>
    <el-table-column
      :resizable="true"
      v-for="(item, index) in customTableTitle"
      v-if="item.show"
      :key="`col-${index}-${item.prop}`"
      :label="item.label">
      <template slot-scope="scope" :column="item">
        <span v-if="scope.row[item.prop]" :class="item.prop === 'remark'? 'el-table-remark':''">{{scope.row[item.prop]}}</span>
        <template v-else>-</template>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item" v-has="'dc_edit'" @click="tableOperation(['edit', scope.row])" :title="$t('overall.edit')"><i class="nz-icon nz-icon-edit"></i></button>
        <el-dropdown size="medium" v-has="['dc_delete','dc_add']" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
            <el-dropdown-item v-has="'dc_add'" :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'dc_delete'" :command="['delete-rel', scope.row, {forceDeleteShow:true, single:true,from:'cabinet'}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
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
  name: 'cabinetTable',
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
          width: 80
        },
        {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true
        },
        {
          label: this.$t('config.cab.uSize'),
          prop: 'uSize',
          show: true
        },
        {
          label: this.$t('asset.asset'),
          prop: 'assetNum',
          show: true
        },
        {
          label: this.$t('overall.remark'),
          prop: 'remark',
          show: true
        }
      ]
    }
  },
  methods: {
  }
}
</script>
