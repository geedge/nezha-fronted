<template>
  <el-table
    id="cabinetTable"
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
      type="selection"
      width="40"
      align="center">
    </el-table-column>
    <el-table-column
      :resizable="true"
      v-for="(item, index) in customTableTitle"
      v-if="item.show"
      :key="`col-${index}`"
      :label="item.label">
      <template slot-scope="scope" :column="item">
        <template v-if="item.prop === 'assetNum'">
          <span style="cursor: pointer"><i class="nz-icon nz-icon-overview-project monitorColor"></i> <span>{{scope.row.assetNum ? scope.row.assetNum : 0}}</span></span>
        </template>
        <template v-else-if="item.prop === 'alertNum'">
          <span style="cursor: pointer"><i :class="scope.row.alertNum ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i> <span>{{scope.row.alertNum ? scope.row.alertNum : 0}}</span></span>
        </template>
        <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
        <template v-else="scope.row[item.prop]">-</template>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item" v-has="'dc_edit'" @click="tableOperation(['edit', scope.row])"><i class="nz-icon nz-icon-edit"></i></button>
        <el-dropdown size="medium" v-has="['dc_delete']" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-box-dropdown-top">
            <el-dropdown-item v-has="'dc_add'" :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <el-dropdown-item :command="['delete', scope.row]" v-has="'dc_delete'"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
import Template from '../../../page/config/template'
export default {
  name: 'cabinet Table',
  components: { Template },
  mixins: [table],
  data () {
    return {
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        },
        {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true
        },
        {
          label: this.$t('asset.uSize'),
          prop: 'uSize',
          show: true
        },
        {
          label: this.$t('config.dc.assets'),
          prop: 'assetNum',
          show: true
        },
        {
          label: this.$t('alert.alert'),
          prop: 'alertNum',
          show: true
        },
        {
          label: this.$t('overall.remark'),
          prop: 'remark',
          show: true
        }
      ]
    }
  },
  methods: {
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
