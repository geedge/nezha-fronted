<template>
  <el-table
    id="assetVsysTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    tooltip-effect="light"
    border
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="selectionChange"
    @row-dblclick="(row)=>{queryMessage(row)}"
  >
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
      :show-overflow-tooltip="item.prop === 'description'"
      class="data-column"
    >
      <template slot="header">
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <template v-if="item.prop === 'vsysId'">
          {{scope.row.delFlag == 1 ? scope.row[item.prop] : '-'}}
        </template>
        <template v-else-if="item.prop === 'uts'">
           {{scope.row[item.prop] ? utcTimeToTimezoneStr(scope.row[item.prop]) : '-'}}
        </template>
        <template v-else-if="item.prop === 'state'">
          <div :class="{'active-icon green-bg':scope.row.state == 1,'active-icon red-bg':scope.row.state == 0}" style="position: relative"></div>
          {{scope.row.state === 1 ? $t('overall.result.success') : $t('overall.result.failed')}}
        </template>
        <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
        <template v-else>-</template>
      </template>
    </el-table-column>
    <template slot="empty">
      <div  v-if="!loading"  class="table-no-data">
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
  name: 'assetVsysTable',
  mixins: [table],
  props: {
    loading: Boolean
  },
  data () {
    return {
      tableTitle: [
        {
          label: this.$t('asset.vsysId'),
          prop: 'vsysId',
          show: true,
          minWidth: 120
        },
        {
          label: this.$t('overall.state'),
          prop: 'state',
          show: true,
          minWidth: 120
        }, {
          label: this.$t('overall.time'),
          prop: 'uts',
          show: true,
          minWidth: 120
        }
      ]
    }
  }
}
</script>
<style scoped>
</style>
