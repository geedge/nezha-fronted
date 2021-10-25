<template>
  <el-table
    id="roleTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    border
    class="no-operation"
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
      :sortable="item.sortable"
      :sort-orders="['ascending', 'descending']"
      :width="`${item.width}`"
      class="data-column"
      :show-overflow-tooltip="item.ShowOverflowTooltip"
    >
      <template slot="header">
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <span v-if="item.prop === 'time'">
                {{scope.row[item.prop]}} ms
              </span>
        <span v-else-if="item.prop === 'username'">{{formatUsername(scope.row)}}</span>
        <span v-else-if="item.prop === 'createDate'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
        <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
        <span v-else>-</span>
      </template>
    </el-table-column>
    <template slot="empty">
      <div v-if="!loading" class="table-no-data">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#nz-icon-no-data-list"></use>
        </svg>
        <div style="font-size: 16px;color: #333333;font-weight: 400;">No results found</div>
      </div>
      <div v-else>&nbsp;</div>
    </template>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
export default {
  name: 'operationLog',
  mixins: [table],
  props: {
    loading: Boolean
  },
  data () {
    return {
      tableTitle: [
        {
          label: this.$t('config.operationlog.id'),
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        }, {
          label: this.$t('config.operationlog.username'),
          prop: 'username',
          show: true,
          minWidth: 80,
          sortable: 'custom'
        },
        {
          label: this.$t('config.operationlog.ip'),
          prop: 'ip',
          show: true,
          minWidth: 80
        },
        {
          label: this.$t('config.operationlog.operation'),
          prop: 'operation',
          show: true,
          minWidth: 140,
          sortable: 'custom'
        },
        {
          label: this.$t('config.operationlog.type'),
          prop: 'type',
          show: true,
          minWidth: 80,
          sortable: 'custom'
        },
        {
          label: this.$t('config.operationlog.state'),
          prop: 'state',
          show: true,
          minWidth: 80
        },
        // {
        //   label: this.$t('config.operationlog.userId'),
        //   prop: 'userId',
        //   show: false,
        // },
        {
          label: this.$t('config.operationlog.operaId'),
          prop: 'operaId',
          show: false,
          minWidth: 140
        },
        {
          label: this.$t('config.operationlog.createDate'),
          prop: 'createDate',
          show: true,
          minWidth: 80
        },
        {
          label: this.$t('config.operationlog.time'),
          prop: 'time',
          show: false,
          minWidth: 80
        },
        {
          label: this.$t('config.operationlog.params'),
          prop: 'params',
          show: false,
          ShowOverflowTooltip: true,
          minWidth: 80
        },
        {
          label: this.$t('config.operationlog.response'),
          prop: 'response',
          show: false,
          ShowOverflowTooltip: true,
          minWidth: 140
        }
      ]
    }
  },
  methods: {
    formatUsername (row) {
      if (row.username) {
        return row.username
      } else if (row.operation === 'login' && !row.username) { // 如果是登录 且登录失败
        return JSON.parse(row.params).username
      } else {
        return '-'
      }
    }
  }
}
</script>
