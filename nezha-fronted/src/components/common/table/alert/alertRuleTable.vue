<template>
  <el-table
    id="alertRuleTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    tooltip-effect="light"
    border
    :default-sort="orderBy"
    @header-dragend="dragend"
    @cell-mouse-enter="cellMouseEnter"
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
        <span v-if="item.prop === 'severity'&&scope.row[item.prop]" class="severity">
          <i class="nz-icon nz-icon-circle" :style="{color:scope.row[item.prop].color,'font-size':'12px','margin-right':'5px'}"></i> {{scope.row[item.prop].name}}
        </span>
        <template v-else-if="item.prop === 'alertNum'">
          <span style="cursor: pointer" @click="queryMessage(scope.row)">
            <i :class="scope.row.alertNum ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert vertical-align-top;"  @mouseenter="tooltipHover(scope.row,true, $event)" @mouseleave="tooltipHover(scope.row,false, $event)"></i>
            <div v-if="scope.row.alertNumtooltipShow" class="alert-days-info-tooltip" :style="{left: scope.row.left + 'px',top:scope.row.top + 'px'}">
              <div class="tooltip-title">{{$t('project.topology.alert')}}({{$t('overall.active')}})</div>
              <div class="severity-info" style='justify-content: space-between'>
                <div class="severity-name">{{$t('overall.result.total')}}</div>
                <div class="severity-value">{{scope.row.alertNum}}</div>
              </div>
            </div>
            <alertDaysInfo
              v-show="!scope.row.trendLoading"
              :alertDaysData="scope.row.alertDaysData"
            />
          </span>
        </template>
        <template v-else-if="item.prop === 'type'">
          <span v-if="scope.row[item.prop] === 1">{{ $t('overall.metric') }}</span>
          <span v-else-if="scope.row[item.prop] === 2">{{ $t('overall.logs') }}</span>
          <span v-else-if="scope.row[item.prop] === 3">SNMP trap</span>
          <span v-else>-</span>
        </template>
        <template v-else-if="item.prop === 'threshold'">{{formatThreshold(scope.row[item.prop], scope.row.unit)}}</template>
        <template v-else-if="item.prop === 'method'">
          <span v-if="scope.row.methods">{{scope.row.methods.map(label=>label.name).join(',')}}</span>
          <span v-else>-</span>
        </template>
        <template v-else-if="item.prop === 'receivers'">
          <el-tag v-for="(user, index) in scope.row[item.prop]" v-if="user&&user.username" :key="index" class="alert-rule-tag" effect="dark" size="mini" :title="user.name">{{user.name}}&nbsp;&nbsp;</el-tag>
        </template>
        <template v-else-if="item.prop === 'state'">
          <el-popover
            placement="right"
            trigger="hover"
            :open-delay="300"
            :width="215"
            popper-class="schedEnableTitle nz-tooltip-bac"
          >
            <div>
              <div class="margin-b-10" v-has="'alertRule_edit'">
                {{$t('alert.config.schedEnable')}}
                <el-switch
                  style="margin-left: 14px"
                  slot="reference"
                  v-model="scope.row.schedEnable"
                  :active-value="1"
                  :inactive-value="0"
                  @change="(val)=>{$emit('statusChange', scope.row)}"
                />
              </div>
              <div>
                <div class="margin-b-10">{{$t('alert.config.schedDays')}}</div>
                <div class="margin-b-5" style="display: flex">
                  <i class="nz-icon nz-icon-a-rilizhou" style="color: #FA901C;"/>
                  <span v-html="weekStr(scope.row.schedDays)"></span>
                </div>
                <div ><i class="nz-icon nz-icon-dingshishijian" style="color: #FA901C;"/>{{scope.row.schedStime+' - '+scope.row.schedEtime}}</div>
              </div>
            </div>
<!--            <el-switch-->
<!--              slot="reference"-->
<!--              v-model="scope.row.state"-->
<!--              :disabled="!hasButton('dc_edit') || !hasButton('dc_edit') || !!Number(scope.row.buildIn)"-->
<!--              active-color="#ee9d3f"-->
<!--              :active-value="1"-->
<!--              :inactive-value="0"-->
<!--              @change="(val)=>{$emit('statusChange', scope.row)}"-->
<!--            />-->
            <div slot="reference" v-if="scope.row[item.prop] === 1">
              <div class="active-icon green-bg inline-block"></div>
              {{ $t('overall.enabled') }}
            </div>
            <div slot="reference" v-else-if="scope.row[item.prop] === 0">
              <div class="active-icon gray-bg inline-block"></div>
              {{ $t('overall.disabled') }}
            </div>
          </el-popover>
        </template>
        <template v-else-if="item.prop === 'name'">
          <copy :copyData='scope.row[item.prop]' :showInfo='scope.row[item.prop]'>
                  <template slot="copy-text">
                     {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
                  </template>
          </copy>
          </template>
        <template v-else-if="item.prop === 'expr'">
            <copy :copyData='scope.row[item.prop]' :showInfo='scope.row[item.prop]'>
                  <template slot="copy-text">
                     {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
                  </template>
              </copy>
          </template>
        <span v-else-if="item.prop === 'id'" :id="'globalSearch' + scope.row.id">{{scope.row[item.prop]}}</span>
        <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
        <template v-else>-</template>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item" @click="queryMessage(scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" v-has="['alertRule_edit','alertRule_delete', 'alertSilence_add']" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
            <el-dropdown-item v-if="!scope.row.buildIn" v-has="'alertRule_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item v-if="!scope.row.buildIn" v-has="'alertRule_delete'" :command="['delete-rel', scope.row, {forceDeleteShow:false, single:true, deleteTitle:'alert.alertRule'}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
            <el-dropdown-item v-if="!scope.row.buildIn" v-has="'alertRule_edit'" :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'alertSilence_add'" :command="['fastSilence', scope.row, 'alertRule']"><i class="nz-icon nz-icon-fast-silence"></i><span class="operation-dropdown-text">{{$t('overall.silenceAlert')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
    <template slot="empty">
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
import copy from '@/components/common/copy'
import chartDataFormat from '@/components/chart/chartDataFormat'
export default {
  name: 'alertRuleTable',
  components: { copy },
  mixins: [table],
  props: {
    loading: Boolean
  },
  data () {
    return {
      needAlertDaysData: true,
      trendKey: 'ruleId',
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        }, {
          label: this.$t('alert.alertName'),
          prop: 'name',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('overall.type'),
          prop: 'type',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('alert.config.expr'),
          prop: 'expr',
          minWidth: 200,
          show: true
        }, {
          label: this.$t('alert.config.operator'),
          prop: 'operator',
          minWidth: 100,
          show: true
        }, {
          label: this.$t('alert.config.threshold'),
          prop: 'threshold',
          minWidth: 100,
          show: true
        }, {
          label: this.$t('alert.config.for'),
          prop: 'last',
          minWidth: 100,
          show: true
        }, {
          label: this.$t('alert.severity'),
          prop: 'severity',
          show: true,
          minWidth: 100,
          sortable: 'custom'
        }, {
          label: this.$t('alert.summary'),
          prop: 'summary',
          minWidth: 200,
          show: true
        }, {
          label: this.$t('overall.remark'),
          prop: 'description',
          minWidth: 200,
          show: true
        }, {
          label: this.$t('overall.alert'),
          prop: 'alertNum',
          show: true,
          width: 120,
          sortable: 'custom'
        }, {
          label: this.$t('dashboard.dashboard.receivers'),
          prop: 'receivers',
          show: false,
          minWidth: 100
        },
        {
          label: this.$t('alert.notify'),
          prop: 'method',
          show: false,
          minWidth: 100
        }, {
          label: this.$t('overall.state'),
          prop: 'state',
          show: true,
          minWidth: 100,
          sortable: 'custom'
        }
      ],
      weekList: [
        {
          value: 2,
          label: this.$t('week.MonAbbreviation')
        }, {
          value: 3,
          label: this.$t('week.TueAbbreviation')
        }, {
          value: 4,
          label: this.$t('week.WedAbbreviation')
        }, {
          value: 5,
          label: this.$t('week.ThuAbbreviation')
        }, {
          value: 6,
          label: this.$t('week.FriAbbreviation')
        }, {
          value: 7,
          label: this.$t('week.SatAbbreviation')
        }, {
          value: 1,
          label: this.$t('week.SunAbbreviation')
        }
      ]
    }
  },
  methods: {
    queryMessage (row) {
      this.$emit('queryMessage', row)
    },
    formatThreshold (value, unit) {
      const unitMethod = chartDataFormat.getUnit(unit)
      if (unitMethod && value) {
        return unitMethod.compute(value, null, 2)
      } else {
        return value
      }
    },
    weekStr (weekstr) {
      const arr = weekstr.split(',')
      let str = ''
      arr.forEach((item, index) => {
        if (!item) return
        str += `<span class="week-item">${this.weekList[item - 1].label}</span>`
      })
      return str
    }
  }
}
</script>
