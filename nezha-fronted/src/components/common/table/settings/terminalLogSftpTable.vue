<template>
  <el-table
    id="terminalLogSftpTable"
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
      :key="`col-${index}-${item.prop}`"
      :fixed="item.fixed"
      :label="item.label"
      :min-width="`${item.minWidth}`"
      :width="`${item.width}`"
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
        <template v-if="item.prop === 'id'">
          {{scope.row[item.prop] ? scope.row[item.prop] : '-'}}
        </template>
        <template v-else-if="item.prop === 'type'">
          <div v-if="scope.row[item.prop] == 1">{{$t("overall.uploadFiles")}}</div>
          <div v-else-if="scope.row[item.prop] == 2">{{$t("overall.downloadFile")}}</div>
          <div v-else-if="scope.row[item.prop] == 3">{{$t("overall.newFolder")}}</div>
          <div v-else-if="scope.row[item.prop] == 4">{{$t("overall.deleteFiles")}}</div>
          <div v-else>{{'-'}}</div>
        </template>
        <template v-else-if="item.prop === 'ts'">
           {{scope.row[item.prop] ? momentTz(scope.row[item.prop]) : '-'}}
        </template>
        <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop] ? scope.row[item.prop] : '-'}}</template>
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
  name: 'terminalLogSftpTable',
  mixins: [table],
  props: {
    loading: Boolean
  },
  components: {},
  data () {
    return {
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        },
        {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true,
          minWidth: 150,
          sortable: 'custom'
        }, {
          label: this.$t('overall.type'),
          prop: 'type',
          width: 150,
          minWidth: 30,
          show: true,
          sortable: 'custom'
        },
        {
          label: this.$t('overall.time'),
          prop: 'ts',
          show: true,
          width: 180,
          minWidth: 40,
          sortable: 'custom'
        }
      ]
    }
  },
  methods: {
    // 数据排序
    tableDataSort (item) {
      const orderBy = { order: item.order, prop: item.prop }
      this.$emit('tableDataSort', orderBy)
    }

  }
}
</script>
<style>
</style>
