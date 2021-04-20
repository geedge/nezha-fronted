<template>
  <el-table
    id="endpointTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    border
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="(selection) => { batchDeleteObjs = selection }"
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
      :width="`${item.width}`"
      class="data-column"
    >
      <template slot="header">
        <span>{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <template v-if="item.prop === 'name'">
          {{scope.row[item.prop]}}
        </template>
        <template v-else-if="item.prop === 'type'">
          {{scope.row.module.type}}
        </template>
        <template v-else-if="item.prop === 'project'">
          {{scope.row[item.prop].name}}
        </template>
        <template v-else-if="item.prop === 'module'">
          {{scope.row[item.prop].name}}
        </template>
        <template v-else-if="item.prop === 'alerts'">
          <span class="endpoint-num" :class="scope.row.alertNum>0?'bagEF7458':'bag23BF9A'">
            {{scope.row.alertNum}} active
          </span>
        </template>
        <template v-else-if="item.prop === 'configs'">
          <el-tooltip placement="right" effect="light">
            <span class="configs-endpoint">{}</span>
            <div slot="content">{{scope.row[item.prop]}}</div>
          </el-tooltip>
        </template>
        <template v-else-if="item.prop === 'state'">
          {{scope.row[item.prop]}}
        </template>
        <span v-else>{{scope.row[item.prop] ? scope.row[item.prop] : ''}}</span>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item"  @click="showBottomBox('endpointQuery', scope.row)"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <span>…</span><i class="nz-icon nz-icon-arrow-down"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item :command="['delete', scope.row, `sys/endpoint?ids=${scope.row.id}`]" :disabled="scope.row.id === 1"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
export default {
  name: 'endpointTable',
  mixins: [table],
  data () {
    return {
      tableTitle: [ // 原始table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: this.$t('project.endpoint.name'),
          prop: 'name',
          show: true
        }, {
          label: this.$t('project.module.type'),
          prop: 'type',
          show: true
        }, {
          label: this.$t('project.project.project'),
          prop: 'project',
          show: true
        },
        {
          label: this.$t('project.module.module'),
          prop: 'module',
          show: true
        }, {
          label: this.$t('project.endpoint.alerts'),
          prop: 'alerts',
          show: true
        },
        {
          label: this.$t('project.endpoint.configs'),
          prop: 'configs',
          show: true
        },
        {
          label: this.$t('project.endpoint.state'),
          prop: 'state',
          show: true
        }
      ]
    }
  },
  methods: {
  },
  computed: {}
}
</script>
<style scoped>
  .endpoint-num{
    padding: 0 3px;
    cursor: pointer;
    border-radius: 2px;
  }
  .bagEF7458{
    background: #EF7458;
    color: #fff;
  }
  .bag23BF9A{
    background: #23BF9A;
    color: #fff;
  }
  .configs-endpoint{
    background: #FA901C;
    border-radius: 4px;
    padding: 2px 7px;
    color: #fff;
  }
</style>
