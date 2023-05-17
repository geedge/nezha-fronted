<template>
  <el-table
      id="pingTable"
      ref="dataTable"
      :height="'calc(100% - 80px)'"
      :row-key="rowKey"
      :data="tableData"
      border
      @header-dragend="dragend"
    >
    <el-table-column type="expand">
      <template #header>
        <div class="arrow-expand" @click="toggleRowExpansion">
            <i v-if="expandData" class="nz-icon nz-icon-quanbuzhankai1"></i>
            <i v-else class="nz-icon nz-icon-quanbushouqi1"></i>
        </div>
      </template>
      <template slot-scope="{ row }">
        <div class="details">
          <pre>{{row.raw}}</pre>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      v-for="(item, index) in customTableTitle"
      :key="`col-${index}-${item.prop}`"
      :label="item.label"
      :min-width="`${item.minWidth}`"
      :prop="item.prop"
      :resizable="true"
      :width="`${item.width}`"
      class="data-column"
      :sortable="item.sortable"
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
        <span v-else-if="item.prop === 'rate'&&scope.row[item.prop]!==undefined">{{scope.row[item.prop]}}%</span>
        <span v-else-if="(item.prop === 'avg'||item.prop === 'min'||item.prop === 'max')&&scope.row[item.prop]!==undefined">{{scope.row[item.prop]}}ms</span>
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
          prop: 'dc',
          sortable: true,
          minWidth: 200
        }, {
          label: this.$t('ping.sourceIp'),
          prop: 'source',
          sortable: true,
          minWidth: 200
        }, {
          label: this.$t('ping.targetIp'),
          prop: 'ip',
          sortable: true,
          minWidth: 200
        }, {
          label: this.$t('overall.state'),
          prop: 'state',
          sortable: true,
          width: 150
        }, {
          label: this.$t('ping.packetLossRate'),
          prop: 'rate',
          sortable: true,
          minWidth: 200
        }, {
          label: this.$t('ping.rttAverage'),
          prop: 'avg',
          sortable: true,
          minWidth: 200
        }, {
          label: this.$t('ping.rttMinimum'),
          prop: 'min',
          sortable: true,
          minWidth: 200
        }, {
          label: this.$t('ping.rttMaximum'),
          prop: 'max',
          sortable: true,
          minWidth: 200
        }
      ],
      expandRowKeys: [],
      expandData: false
    }
  },
  methods: {
    toggleRowExpansion () {
      this.$nextTick(() => {
        this.expandData = !this.expandData
      })
      this.toggleRowExpansionAll(this.tableData, !this.expandData)
    },
    toggleRowExpansionAll (data, isExpansion) {
      data.forEach((item) => {
        this.$refs.dataTable.toggleRowExpansion(item, isExpansion)
        if (item.children !== undefined && item.children !== null) {
          this.toggleRowExpansionAll(item.children, isExpansion)
        }
      })
    }
  }
}
</script>
