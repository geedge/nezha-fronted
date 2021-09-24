<template>
  <el-table
    id="alertRuleTable"
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
        <span v-if="item.prop === 'severity'&&scope.row[item.prop]" class="severity">
            <i class="nz-icon nz-icon-circle" :style="{color:scope.row[item.prop].color,'font-size':'12px','margin-right':'5px'}"></i> {{scope.row[item.prop].name}}
        </span>
        <template v-else-if="item.prop === 'alertNum'">
          <span class="link" @click="queryMessage(scope.row)">
            <i class="nz-icon nz-icon-overview-alert" :class="scope.row[item.prop]>0?'colorEF7458':'color23BF9A'"/>
            {{scope.row.alertNum}}
          </span>
        </template>
        <template v-else-if="item.prop === 'type'">
          <span v-if="scope.row[item.prop] === 1">{{ $t('project.metrics.metrics') }}</span>
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
          <el-tag v-for="(user, index) in scope.row[item.prop]" v-if="user&&user.username" :key="index" class="alert-rule-tag" effect="dark" size="mini">{{user.name}}&nbsp;&nbsp;@{{user.username}}&nbsp;</el-tag>
        </template>
        <template v-else-if="item.prop === 'state'">
          <el-popover
            placement="right"
            trigger="hover"
            :open-delay="300"
            :width="225"
            popper-class="schedEnableTitle"
          >
            <div>
              <div class="margin-b-10">
                {{$t('alert.config.schedEnable')}} :
                <el-switch
                  style="margin-left: 14px"
                  slot="reference"
                  v-model="scope.row.schedEnable"
                  active-color="#ee9d3f"
                  :active-value="1"
                  :inactive-value="0"
                  @change="(val)=>{$emit('statusChange', scope.row)}"
                />
              </div>
              <div>
                <div class="margin-b-10">{{$t('alert.config.schedDays')}} :</div>
                <div class="margin-b-5" style="display: flex">
                  <i class="nz-icon nz-icon-a-rilizhou"/>
                  <span v-html="weekStr(scope.row.schedDays)"></span>
                </div>
                <div ><i class="nz-icon nz-icon-dingshishijian"/>{{scope.row.schedStime+' - '+scope.row.schedEtime}}</div>
              </div>
            </div>
            <el-switch
              slot="reference"
              v-model="scope.row.state"
              :disabled="!hasButton('dc_edit') || !hasButton('dc_edit') || !!Number(scope.row.buildIn)"
              active-color="#ee9d3f"
              :active-value="1"
              :inactive-value="0"
              @change="(val)=>{$emit('statusChange', scope.row)}"
            />
          </el-popover>
        </template>
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
        <button class="table-operation-item" @click="queryMessage(scope.row)"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" v-has="['alertRule_edit','alertRule_delete']" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="!scope.row.buildIn" v-has="'alertRule_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item v-if="!scope.row.buildIn" v-has="'alertRule_delete'" :command="['delete', scope.row]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
            <el-dropdown-item v-if="!scope.row.buildIn" v-has="'alertRule_edit'" :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'alertSilence_add'" :command="['fastSilence', scope.row, 'alertRule']"><i class="nz-icon nz-icon-fast-silence"></i><span class="operation-dropdown-text">{{$t('overall.silenceAlert')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
import chartDataFormat from '@/components/charts/chartDataFormat'
export default {
  name: 'alertRuleTable',
  mixins: [table],
  data () {
    return {
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
          label: this.$t('alert.alert'),
          prop: 'alertNum',
          show: true,
          width: 150,
          sortable: 'custom'
        }, {
          label: this.$t('alert.config.receiver'),
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
          label: this.$t('config.dc.state'),
          prop: 'state',
          show: true,
          minWidth: 100,
          sortable: 'custom'
        }
      ],
      weekList: [
        {
          value: 1,
          label: this.$t('week.SunAbbreviation')
        }, {
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
  padding: 15px 20px;
}
.schedEnableTitle .nz-icon-a-rilizhou, .schedEnableTitle .nz-icon-dingshishijian{
  font-size: 14px;
  color: #FA901C;
  margin-right: 12px;
}
.schedEnableTitle .week-item{
  width: 32px;
  height: 22px;
  line-height: 22px;
  opacity: 0.9;
  background: #F7F7FA;
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
