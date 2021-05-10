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
      v-for="(item, index) in tableTitle"
      v-if="item.show"
      :key="`col-${index}`"
      :label="item.label"
    >
      <template slot-scope="scope" :column="item">
        <template v-if="item.prop == 'assetStat'">
          <el-popover
            placement="top-start"
            offset="-100"
            trigger="hover"
            :content="$t('overall.result.total') + '：' + scope.row.assetStat.total + '，' + $t('asset.inStock') + '：' + scope.row.assetStat.inStock + '，' + $t('asset.notInStock') + '：' + scope.row.assetStat.outStock + '，' + $t('asset.suspended') + '：' + scope.row.assetStat.suspended">
            <div slot="reference" class="dc-asset-states">
              <span class="dc-asset-state dc-asset-state-total">{{scope.row.assetStat.total}}</span>
              <span class="dc-asset-state dc-asset-state-in">{{scope.row.assetStat.inStock}}</span>
              <span class="dc-asset-state dc-asset-state-out">{{scope.row.assetStat.outStock}}</span>
              <span class="dc-asset-state dc-asset-state-suspended">{{scope.row.assetStat.suspended}}</span>
            </div>
          </el-popover>

        </template >
        <template v-else-if="item.prop == 'alertStat'">
          <el-popover
            placement="top-start"
            offset="-128"
            trigger="hover"
            :content="$t('overall.result.total') + '：' + scope.row.alertStat.total + '，' + $t('alert.config.P1') + '：' + scope.row.alertStat.P1 + '，' + $t('alert.config.P2') + '：' + scope.row.alertStat.P2+ '，' + $t('alert.config.P3') + '：' + scope.row.alertStat.P3">
            <div slot="reference" class="dc-asset-states">
              <span class="dc-asset-state dc-asset-state-total">{{scope.row.alertStat.total}}</span>
              <span class="dc-asset-state alert-level-P1">{{scope.row.alertStat.P1}}</span>
              <span class="dc-asset-state alert-level-P2">{{scope.row.alertStat.P2}}</span>
              <span class="dc-asset-state alert-level-P3">{{scope.row.alertStat.P3}}</span>
            </div>
          </el-popover>
        </template >
        <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
        <template v-else>-</template>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item" @click="tableOperation(['edit', scope.row])"><i class="nz-icon nz-icon-edit"></i></button>
        <el-dropdown size="medium" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <span>…</span><i class="nz-icon nz-icon-arrow-down"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :command="['delete', scope.row]" :disabled="isBuiltIn(scope.row)"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
export default {
  name: 'cabinet Table',
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
          prop: 'assetStat',
          show: true
        },
        {
          label: this.$t('alert.alert'),
          prop: 'alertStat',
          show: true
        },
        {
          label: this.$t('config.dc.remark'),
          prop: 'remark',
          show: true
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
