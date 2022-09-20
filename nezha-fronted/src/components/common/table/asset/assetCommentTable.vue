<template>
  <el-table
    id="assetCommentTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    :show-header="false"
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
      :width="`${item.width}`"
      :show-overflow-tooltip="item.prop === 'description'"
      class="data-column"
    >
      <template slot="header">
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <div class="descriptions-info">
            <div>
                <i class="nz-icon nz-icon-user" style="margin-right: 4px;"></i>
                <span class="descriptions-name">{{scope.row.createUser.name}}</span>
                <span class="descriptions-name-small">@{{scope.row.createUser.name}}</span>
                <span class="descriptions-time">{{utcTimeToTimezoneStr(scope.row.cts)}}</span>
                <i class="nz-icon nz-icon-edit descriptions-button" @click="$emit('edit', scope.row.id)" :title="$t('overall.edit')" style="margin-right: 18px;"></i>
                <i :title="$t('overall.delete')" @click="$emit('del', scope.row)" class="nz-icon nz-icon-delete descriptions-button"></i>
            </div>
            <div class="descriptions-content">{{scope.row.content}}</div>
        </div>
      </template>
    </el-table-column>
    <template slot="empty">
      <div  v-if="!loading"  class="table-no-data">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#nz-icon-a-NoComment"></use>
        </svg>
        <div class="table-no-data__title">No Comment</div>
      </div>
      <div v-else>&nbsp;</div>
    </template>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
export default {
  name: 'assetCommentTable',
  mixins: [table],
  props: {
    loading: Boolean,
    filterTime: {}
  },
  data () {
    return {
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true
        }]
    }
  },
  methods: {
    deleteInfo (info) {
      this.$emit('del', info)
    }
  }
}
</script>
<style>
</style>
