<template>
  <el-table
    id="recordRuleEvalLogTable"
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
        <template v-if="item.prop === 'state'">
          <div>
            <div :class="{'active-icon green-bg':scope.row.state == 200,'active-icon red-bg':scope.row.state != 200}" style="position: relative">
            </div>
            <span>{{scope.row.state == 200?'Ok':'Error'}}</span>
          </div>
        </template>
        <template v-else-if="item.prop === 'duration'">
          <el-tooltip :disabled="!scope.row.etts" effect="light" placement="right">
            <div slot="content">
              {{$t('overall.endTime')}}<br/>
              {{utcTimeToTimezoneStr(scope.row.etts)}}
            </div>
            <span>{{getDuration(scope.row)}}</span>
          </el-tooltip>
        </template>
        <template v-else-if="item.prop === 'stts'">
          {{utcTimeToTimezoneStr(scope.row[item.prop])}}
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
import { calcDurationByStringTimeMs } from '@/components/common/js/tools'
export default {
  name: 'recordRuleEvalLogTable',
  mixins: [table],
  props: {
    loading: Boolean,
    nowTime: {}
  },
  data () {
    return {
      tableTitle: [
        {
          label: this.$t('overall.startTime'),
          prop: 'stts',
          show: true,
          minWidth: 120
        }, {
          label: this.$t('config.terminallog.duration'),
          prop: 'duration',
          show: true,
          minWidth: 120
        }, {
          label: this.$t('overall.state'),
          prop: 'state',
          show: true,
          minWidth: 120
        }, {
          label: this.$t('alert.alertRuleMessage'),
          prop: 'msg',
          show: true,
          minWidth: 120
        }
      ]
    }
  },
  computed: {
  },
  methods: {
    getDuration (record) {
      if (record.etts) {
        return calcDurationByStringTimeMs(record.stts, record.etts)
      }
      return calcDurationByStringTimeMs(record.stts, this.utcTimeToTimezoneStr(this.nowTime))
    }
  }
}
</script>
<style scoped>
  .colorEF7458{
    color: #EF7458;
  }
  .color23BF9A{
    color: #23BF9A;
  }
  /deep/ .active-icon {
    margin-left: 5px;
  }
</style>
<style>
.severity .P1{
  background: #F5846A;
  border-radius: 2px;
  font-size: 12px;
  color: #FFFFFF;
  padding: 2px 6px;
}
.severity .P2{
  background: #F7A54A;
  border-radius: 2px;
  font-size: 12px;
  color: #FFFFFF;
  padding: 2px 6px;
}
.severity .P3{
  background: #F1C13D;
  border-radius: 2px;
  font-size: 12px;
  color: #FFFFFF;
  padding: 2px 6px;
}
.schedEnableTitle{
  padding: 20px 15px;
  margin-right: 0;
  left: 1995px !important;
  background: #FFFFFF;
  border: 1px solid rgba(119,131,145,0.60);
  box-shadow: 0 6px 16px 0 rgba(0,0,0,0.08);
  border-radius: 3px;
}
.schedEnableTitle .nz-icon-a-rilizhou, .schedEnableTitle .nz-icon-dingshishijian{
  font-size: 14px;
  color: #666666;
  margin-right: 12px;
}
.schedEnableTitle .week-item{
  width: 32px;
  height: 22px;
  line-height: 22px;
  opacity: 0.9;
  background: #F6F6FA;
  border-radius: 2px;
  display: inline-block;
  font-size: 12px;
  color: #666666;
  letter-spacing: 0;
  font-weight: 400;
  padding-left: 3px;
  margin-right: 12px;
  margin-bottom: 6px;
  }
</style>
