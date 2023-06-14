<template>
  <el-table
      id="traceTable"
      ref="dataTable"
      :height="'calc(100% - 10px)'"
      :data="tableData"
      :row-key="rowKey"
      border
      @header-dragend="dragend"
    >
    <el-table-column type="expand">
      <template slot-scope="{ row }">
        <div class="details">
          <pre>{{row.raw}}</pre>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      v-for="(item, index) in customTableTitle"
      :key="`col-${index}`"
      :label="item.label"
      :min-width="`${item.minWidth}`"
      :prop="item.prop"
      :resizable="true"
      :width="`${item.width}`"
      class="data-column"
      :sortable="item.sortable"
      :sort-orders="['ascending', 'descending']"
      :sort-method="item.sortMethod"
    >
      <template slot="header">
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <template v-if="item.prop === 'state'">
          <div class="active-icon green-bg inline-block" v-if="scope.row.state===1"></div>
          <div class="active-icon red-bg inline-block" v-else></div>
        </template>
        <span v-else-if="item.prop === 'dc'&&scope.row[item.prop]!==undefined">{{scope.row[item.prop].name}}</span>
        <span v-else-if="item.prop === 'time'&&scope.row[item.prop]!==undefined">{{scope.row[item.prop]}}ms</span>
        <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
        <span v-else>-</span>
      </template>
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
import lodash from 'lodash'
export default {
  name: 'traceTable',
  mixins: [table],
  props: {
    loading: Boolean
  },
  data () {
    return {
      tableTitle: [ // 原table列
        {
          label: this.$t('overall.dc'),
          prop: 'dc',
          sortable: true,
          sortMethod: this.sortMethod('dc.name')
        }, {
          label: this.$t('ping.sourceIp'),
          prop: 'source',
          sortable: true
        }, {
          label: this.$t('ping.targetIp'),
          prop: 'ip',
          sortable: true
        }, {
          label: this.$t('overall.state'),
          prop: 'state',
          sortable: true
        }, {
          label: this.$t('trace.totalTime'),
          prop: 'time',
          sortable: true
        }
      ]
    }
  },
  methods: {
    // 防止prop为对象时 排序不正确
    sortMethod (prop) {
      return function (a, b) {
        const val1 = lodash.get(a, prop, '')
        const val2 = lodash.get(b, prop, '')
        if (val1 < val2) {
          return -1
        } else if (val1 > val2) {
          return 1
        } else {
          return 0
        }
      }
    }
  }
}
</script>
