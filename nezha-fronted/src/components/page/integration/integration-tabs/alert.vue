<template>
  <div class="integration-alert">
    <div class="integration-tool" style="padding: 0 10px;">
      <h3></h3>

      <button class="nz-btn el-button--small nz-btn-style-normal" :class="{'no-choose':!batchObjs.length}" @click="importFn">
        <i class="nz-icon nz-icon-upload"></i>
        <span>{{$t('overall.importExcel')}}</span>
      </button>
    </div>
    <div class="list-page">
      <div class="nz-table-list">
        <el-table
          v-my-loading="loading"
          ref="dataTable"
          :height="'100%'"
          :data="tableData"
          border
          @header-dragend="dragend"
          @selection-change="selectionChange"
        >
          <el-table-column
            :resizable="false"
            align="center"
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            v-for="(item, index) in tableTitle"
            :key="`col-${index}`"
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
              <template v-if="item.prop === 'type'">
                <span v-if="scope.row[item.prop] === 1">{{ $t('overall.metric') }}</span>
                <span v-else-if="scope.row[item.prop] === 2">{{ $t('overall.logs') }}</span>
                <span v-else-if="scope.row[item.prop] === 3">SNMP trap</span>
                <span v-else>-</span>
              </template>
              <template v-else-if="item.prop === 'threshold'">{{formatThreshold(scope.row[item.prop], scope.row.unit)}}</template>
              <span v-else-if="item.prop === 'severity'&&scope.row[item.prop]" class="severity">
                <i class="nz-icon nz-icon-circle" :style="{color:scope.row[item.prop].color,'font-size':'12px','margin-right':'5px'}"></i> {{scope.row[item.prop].name}}
              </span>
              <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
              <template v-else>-</template>
            </template>
          </el-table-column>
          <el-table-column
            :resizable="false"
            :width="100"
            fixed="right">
            <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
            <div class="table-operation-items">
              <button class="table-operation-item" @click="importFn" :title="$t('overall.importExcel')"><i class="nz-icon nz-icon-upload"></i></button>
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
      </div>
    </div>
  </div>
</template>

<script>
import chartDataFormat from '@/components/chart/chartDataFormat'
export default {
  name: 'integration-alert',
  props: {
    moduleId: Number
  },
  data () {
    return {
      tableTitle: [
        {
          label: this.$t('alert.alertName'),
          prop: 'name',
          minWidth: 150
        },
        {
          label: this.$t('overall.type'),
          prop: 'type',
          show: true,
          minWidth: 90
        },
        {
          label: this.$t('config.exprTemp.expression'),
          prop: 'expr',
          minWidth: 180
        },
        // {
        //   label: this.$t('alert.config.threshold'),
        //   prop: 'threshold',
        //   minWidth: 100
        // },
        {
          label: this.$t('alert.summary'),
          prop: 'summary',
          minWidth: 160
        }
        // {
        //   label: this.$t('alert.severity'),
        //   prop: 'severity',
        //   minWidth: 100
        // }, {
        //   label: this.$t('asset.snmpCredential'),
        //   prop: '',
        //   minWidth: 150
        // }
      ],
      loading: false,
      tableData: [],
      batchObjs: []
    }
  },
  mounted () {
    this.getTableData()
  },
  methods: {
    async getTableData () {
      this.loading = true
      const res = await this.$get('/integration/alertRule', { moduleIds: this.moduleId, pageSize: -1 })
      this.tableData = res.data.list
      this.loading = false
    },
    selectionChange (objs) {
      this.batchObjs = objs
    },
    formatThreshold (value, unit) {
      const unitMethod = chartDataFormat.getUnit(unit)
      if (unitMethod && value) {
        return unitMethod.compute(value, null, 2)
      } else {
        return value
      }
    },
    importFn () {
    },
    dragend () {
      this.$nextTick(() => {
        this.$refs.dataTable.doLayout()
      })
    }
  }
}
</script>
