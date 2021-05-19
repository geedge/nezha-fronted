<template>
  <el-table
    id="alertRuleTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    border
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
      :sort-orders="['ascending', 'descending']"
      :sortable="item.sortable"
      :width="`${item.width}`"
      class="data-column"
    >
      <template slot="header">
        <span>{{item.label}}</span>
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
        <template v-else-if="item.prop === 'threshold'">{{formatThreshold(scope.row[item.prop], scope.row.unit)}}</template>
        <template v-else-if="item.prop === 'method'">
          <span v-if="scope.row.methods">{{scope.row.methods.map(label=>label.name).join(',')}}</span>
          <span v-else>-</span>
        </template>
        <template v-else-if="item.prop === 'receivers'">
          <el-tag v-for="(user, index) in scope.row[item.prop]" v-if="user&&user.username" :key="index" class="alert-rule-tag" effect="dark" size="mini">{{user.username}}&nbsp;</el-tag>
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
        <el-dropdown size="medium" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <span>…</span><i class="nz-icon nz-icon-arrow-down"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-has="'alertRule_edit'" :command="['edit', scope.row]" :disabled="isBuiltIn(scope.row)"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'alertRule_delete'" :command="['delete', scope.row]" :disabled="isBuiltIn(scope.row)"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
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
  name: 'roleTable',
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
          sortable: 'custom'
        },
        {
          label: this.$t('alert.config.expr'),
          prop: 'expr',
          show: true
        }, {
          label: this.$t('alert.config.operator'),
          prop: 'operator',
          show: true
        }, {
          label: this.$t('alert.config.threshold'),
          prop: 'threshold',
          show: true
        }, {
          label: this.$t('alert.config.for'),
          prop: 'last',
          show: true
        }, {
          label: this.$t('alert.severity'),
          prop: 'severity',
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('alert.summary'),
          prop: 'summary',
          show: true
        }, {
          label: this.$t('alert.description'),
          prop: 'description',
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
          show: false
        },
        {
          label: this.$t('alert.notify'),
          prop: 'method',
          show: false
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
</style>
