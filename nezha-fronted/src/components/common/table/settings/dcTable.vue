<template>
  <el-table
    id="roleTable"
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
      :width="`${item.width}`"
      class="data-column"
    >
      <template slot="header">
        <span>{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <template v-if="item.prop === 'principal'">
          <template v-if="scope.row.principal">
            <template v-for="item in userData">
              <template v-if="scope.row.principal == item.userId">{{item.username}}</template>
            </template>
          </template>
          <template v-else>-</template>
        </template>
        <template v-else-if="item.prop === 'state'">
          <el-switch
            v-model="scope.row.state"
            :disabled="!hasButton('dc_toEdit') || !hasButton('dc_toEdit')"
            active-color="#ee9d3f"
            active-value="ON"
            inactive-value="OFF"
            @change="(val)=>{statusChange(scope.row)}"
          />
        </template>
        <template v-else-if="item.prop === 'longitude'">
          <template v-if="regNumTest(scope.row.longitude)">{{scope.row.longitude}}</template>
          <template v-else>-</template>
        </template>
        <template v-else-if="item.prop === 'latitude'">
          <template v-if="regNumTest(scope.row.latitude)">{{scope.row.latitude}}</template>
          <template v-else>-</template>
        </template>
        <template v-else-if="item.prop === 'assetStat' && scope.row.assetStat">
          <el-popover
            :content="$t('overall.result.total') + '：' + scope.row.assetStat.total + '，' + $t('asset.inStock') + '：' + scope.row.assetStat.inStock + '，' + $t('asset.notInStock') + '：' + scope.row.assetStat.outStock + '，' + $t('asset.suspended') + '：' + scope.row.assetStat.suspended"
            placement="top"
            trigger="hover">
            <div slot="reference" class="dc-asset-states">
              <span class="dc-asset-state dc-asset-state-total">{{scope.row.assetStat.total}}</span>
              <span class="dc-asset-state dc-asset-state-in">{{scope.row.assetStat.inStock}}</span>
              <span class="dc-asset-state dc-asset-state-out">{{scope.row.assetStat.outStock}}</span>
              <span class="dc-asset-state dc-asset-state-suspended">{{scope.row.assetStat.suspended}}</span>
            </div>
          </el-popover>

        </template >
        <template v-else-if="item.prop === 'cabinetNum'">
          <span class="link" @click="showBottomBox('cabinet', scope.row)">{{scope.row[item.prop]}}</span>
        </template>
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
  name: 'dcTable',
  mixins: [table],
  data () {
    return {
      regNum: /^[0-9]+.?[0-9]*/,
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true
        }, {
          label: this.$t('asset.location'),
          prop: 'location',
          show: true
        }, {
          label: this.$t('config.dc.cabinetNum'),
          prop: 'cabinetNum',
          show: true
        }, {
          label: this.$t('config.dc.assets'),
          prop: 'assetStat',
          show: true
        }, {
          label: this.$t('asset.tel'),
          prop: 'tel',
          show: true
        }, {
          label: this.$t('asset.principal'),
          prop: 'principal',
          show: true
        }, {
          label: this.$t('config.dc.longitude'),
          prop: 'longitude',
          show: false
        }, {
          label: this.$t('config.dc.latitude'),
          prop: 'latitude',
          show: false
        }, {
          label: this.$t('config.dc.state'),
          prop: 'state',
          show: true
        }
      ]
    }
  },
  methods: {
    regNumTest (val) { // 校验是否是数字
      return this.regNum.test(val)
    }
  }
}
</script>
