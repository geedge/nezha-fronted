<template>
  <el-table
      id="pingTable"
      ref="dataTable"
      :height="height"
      :data="tableData"
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
    >
      <template slot="header">
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <template v-if="item.prop === 'state'">
          <div class="active-icon green-bg inline-block" v-if="scope.row.state===1"></div>
          <div class="active-icon gray-bg inline-block" v-else-if="scope.row.state===0"></div>
        </template>
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
export default {
  name: 'pingTable',
  mixins: [table],
  props: {
    loading: Boolean
  },
  data () {
    return {
      tableTitle: [ // 原table列
        {
          label: this.$t('overall.dc'),
          prop: 'dataCenter'
        }, {
          label: this.$t('ping.sourceIp'),
          prop: 'source'
        }, {
          label: this.$t('ping.targetIp'),
          prop: 'ip'
        }, {
          label: this.$t('overall.state'),
          prop: 'state'
        }, {
          label: this.$t('ping.packetLossRate'),
          prop: 'rate'
        }, {
          label: this.$t('ping.rttAverage'),
          prop: 'avg'
        }, {
          label: this.$t('ping.rttMinimum'),
          prop: 'min'
        }, {
          label: this.$t('ping.rttMaximum'),
          prop: 'max'
        }
      ]
    }
  },
  methods: {
  }
}
</script>
