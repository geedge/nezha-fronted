<template>
  <el-table
    id="assetNetworkTable"
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
    <!-- <el-table-column
      :resizable="false"
      align="center"
      type="selection"
      width="55">
    </el-table-column> -->
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
        <template v-if="item.prop === 'processCmd'">
          <div v-if="scope.row[item.prop] || scope.row.processName" class="process-name" :title="scope.row[item.prop] ? scope.row[item.prop] : scope.row.processName">{{scope.row[item.prop] ? scope.row[item.prop] : scope.row.processName}}</div>
          <div v-else title="-">-</div>
        </template>
        <template v-else-if="item.prop === 'processId'">
          {{scope.row[item.prop] == -1 ? "-" : scope.row[item.prop]}}
        </template>
        <template v-else-if="item.prop === 'localAddress'">
          {{scope.row[item.prop]}}:{{scope.row.localPort == 0 ? '*' : scope.row.localPort}}
        </template>
        <template v-else-if="item.prop === 'foreignAddress'">
          {{scope.row[item.prop]}}:{{scope.row.foreignPort == 0 ? '*' : scope.row.foreignPort}}
        </template>
        <template v-else-if="item.prop === 'receiveQueue'">
          {{scope.row[item.prop]}}
        </template>
        <template v-else-if="item.prop === 'transmitQueue'">
          {{scope.row[item.prop]}}
        </template>
        <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
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
  name: 'assetNetworkTable',
  mixins: [table],
  props: {
    loading: Boolean,
    filterTime: {}
  },
  data () {
    return {
      tableTitle: [
        {
          label: this.$t('overall.process'),
          prop: 'processCmd',
          show: true,
          minWidth: 300,
          sortable: 'custom'
        }, {
          label: this.$t('asset.process.PID'),
          prop: 'processId',
          show: true,
          minWidth: 100,
          sortable: 'custom'
        }, {
          label: this.$t('overall.type'),
          prop: 'type',
          show: true,
          minWidth: 100,
          sortable: 'custom'
        }, {
          label: this.$t('asset.network.localAddress'),
          prop: 'localAddress',
          show: true,
          minWidth: 150,
          sortable: 'custom'
        }, {
          label: this.$t('asset.network.foreignAddress'),
          prop: 'foreignAddress',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('overall.state'),
          prop: 'state',
          show: true,
          minWidth: 120,
          sortable: 'custom'
        },
        {
          label: this.$t('asset.network.receiveQueue'),
          prop: 'receiveQueue',
          show: true,
          minWidth: 120,
          sortable: 'custom'
        }, {
          label: this.$t('asset.network.transmitQueue'),
          prop: 'transmitQueue',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }
      ]
    }
  },
  methods: {
    // 数据排序
    tableDataSort (item) {
      const orderBy = { order: item.order, prop: item.prop }
      this.$emit('orderBy', orderBy)
    }
  }
}
</script>
<style scoped>
.process-name{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
