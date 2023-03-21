<template>
  <div class="integration-metric">
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
              <span v-if="item.prop == 'remark'" class="metric-remark">{{$t(scope.row[item.prop])}}</span>
              <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
              <template v-else>-</template>
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
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'integration-metric',
  props: {
    moduleId: Number
  },
  data () {
    return {
      tableTitle: [
        {
          label: this.$t('overall.name'),
          prop: 'name',
          minWidth: 180
        },
        {
          label: this.$t('overall.remark'),
          prop: 'remark',
          show: true,
          minWidth: 250
        },
        {
          label: this.$t('overall.type'),
          prop: 'type',
          width: 150
        }
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
      const res = await this.$get('/integration/metadata', { moduleIds: this.moduleId, pageSize: -1 })
      this.tableData = res.data.list
      this.loading = false
    },
    selectionChange (objs) {
      this.batchObjs = objs
    },
    dragend () {
      this.$nextTick(() => {
        this.$refs.dataTable.doLayout()
      })
    }
  }
}
</script>
