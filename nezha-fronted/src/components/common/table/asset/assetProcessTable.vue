<template>
  <el-table
    id="assetProcessTable"
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
        <template v-if="item.prop === 'name'">
          <div style="height:100%;display: flex;align-items: center;">
             <el-popover trigger="hover" placement="right-start" v-if="typeof scope.row.name != 'undefined' && scope.row.name != null">
                <div>
                  <ul>
                   <li><span class="metirc-tip-list">{{$t('overall.state')}}&nbsp;:&nbsp;&nbsp;</span><span>{{'{ '+ scope.row.state +' }'}}</span></li>
                  </ul>
                </div>
                <div slot="reference"><div :class="{'bar active-icon green-bg':scope.row.state.toLowerCase() == 'running','bar active-icon red-bg':scope.row.state.toLowerCase() != 'running'}"></div></div>
             </el-popover>
             <span>{{scope.row[item.prop]}}</span>
          </div>
        </template>
        <template v-else-if="item.prop === 'startTime'">
          {{utcTimeToTimezoneStr(scope.row[item.prop])}}
        </template>
        <template v-else-if="item.prop === 'cpuUsage'">
            <div style="height:100%;">
                <progress id="container" max="100" :value= scope.row[item.prop]></progress>
                <div style="float:left">{{scope.row[item.prop] + '%'}}</div>
            </div>
        </template>
        <template v-else-if="item.prop === 'memUsage'">
            <div style="height:100%;">
                <progress id="container" max="100" :value= scope.row[item.prop]></progress>
                <div style="float:left">{{scope.row[item.prop] + '%'}}</div>
            </div>
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
  name: 'assetProcessTable',
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
          prop: 'name',
          show: true,
          minWidth: 250,
          sortable: 'custom'
        }, {
          label: this.$t('asset.process.PID'),
          prop: 'processID',
          show: true,
          minWidth: 100,
          sortable: 'custom'
        }, {
          label: 'PPID',
          prop: 'parentProcessID',
          show: false,
          minWidth: 100,
          sortable: 'custom'
        }, {
          label: this.$t('overall.startTime'),
          prop: 'startTime',
          show: true,
          minWidth: 150,
          sortable: 'custom'
        }, {
          label: '%' + this.$t('asset.process.cpu'),
          prop: 'cpuUsage',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: '%' + this.$t('asset.process.mem'),
          prop: 'memUsage',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('config.operationlog.username'),
          prop: 'user',
          show: false,
          minWidth: 120,
          sortable: 'custom'
        }, {
          label: this.$t('dashboard.panel.chartForm.group'),
          prop: 'group',
          show: false,
          minWidth: 120,
          sortable: 'custom'
        }, {
          label: this.$t('overall.state'),
          prop: 'state',
          show: false,
          minWidth: 120
        }, {
          label: this.$t('asset.process.threadCount'),
          prop: 'threadCount',
          show: false,
          minWidth: 150,
          sortable: 'custom'
        }
      ]
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>
<style scoped>
.el-popover__reference{
  display: flex;
  align-items: center;
}
.bar {
  width: 3px;
  height: 14px;
  border-radius: 0;
}
#container {
  float:left;
  width: 120px;
  height: 18px;
  margin-right: 15px;
  background-color: #e6eaed;
}
 /* 进度条被填充部分的背景颜色 */
::-webkit-progress-value {
     background-color: #00c398;
 }
  /deep/ .active-icon {
    margin-left: 5px;
  }
</style>
<style>
</style>
