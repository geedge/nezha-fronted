<template>
  <div id="cortexDetailTable">
    <div class="cortex-service">
        <div class="cortex-title" style="margin-top: 0px;">{{$t('cortex.serviceStatus')}}</div>
        <el-table
        :data="servicesTableData"
        border>
          <el-table-column
          v-for="(item, index) in serviceTitle"
          :key="`col-${index}-${item.prop}`"
          :fixed="item.fixed"
          :label="item.label"
          :min-width="`${item.minWidth}`"
          :prop="item.prop"
          :resizable="true"
          :width="`${item.width}`"
          class="data-column"
          >
          <template slot="header">
             <span class="data-column__span">{{item.label}}</span>
              <div class="col-resize-area"></div>
          </template>
           <template slot-scope="scope" :column="item">
            <span v-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
            <template v-else>-</template>
            </template>
          </el-table-column>
        </el-table>
        <el-table
        :data="servicesTableData"
        border>
          <el-table-column
          v-for="(item, index) in serviceTitleSub"
          :key="`col-${index}-${item.prop}`"
          :fixed="item.fixed"
          :label="item.label"
          :min-width="`${item.minWidth}`"
          :prop="item.prop"
          :resizable="true"
          :width="`${item.width}`"
          class="data-column"
          >
          <template slot="header">
             <span class="data-column__span">{{item.label}}</span>
              <div class="col-resize-area"></div>
          </template>
           <template slot-scope="scope" :column="item">
            <span v-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
            <template v-else>-</template>
            </template>
          </el-table-column>
        </el-table>
    </div>
    <div class="cortex-ring">
        <div class="cortex-title">{{$t('cortex.ringStatus')}}</div>
        <div v-for="(items, indexs) in ringTableData" :key="`tab-${indexs}`">
          <div :class="`${indexs? 'cortex-store-gateway':'cortex-ingester'}`">
             <el-table
            :data="items"
            :border='true'
            :span-method="(param)=>objectSpanMethod(param,items)"
             >
                <el-table-column
                  v-for="(item, index) in ingesterTitle"
                  :key="`col-${index}-${item.prop}`"
                  :fixed="item.fixed"
                  :label="item.label"
                  :min-width="`${item.minWidth}`"
                  :prop="item.prop"
                  :resizable="true"
                  :width="`${item.width}`"
                  class="data-column"
                >
                  <template slot="header">
                    <span class="data-column__span">{{item.label}}</span>
                    <div class="col-resize-area"></div>
                  </template>
                  <template slot-scope="scope" :column="item">
                    <span v-if="item.prop === 'name'">{{indexs==0?'Store gateway':(indexs==1?'Ingester':$t('cortex.compactor'))}}</span>
                    <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
                    <template v-else>-</template>
                  </template>
                </el-table-column>
            </el-table>
          </div>
        </div>
    </div>
    <div class="cortex-config" :style="configTableData.length < 25 ? `height:${configTableData.length * 27 + 102}px` : 'flex:1;min-height: 436px;'">
        <div class="cortex-title">{{$t('overall.configEndpoint')}}</div>
        <div class="cortex-config-tab">
          <el-table
            :data="configTableData"
            class="config-tab">
                <el-table-column
                  type="index"
                  width="60">
                </el-table-column>
                <el-table-column
                  :resizable="true"
                  class="data-column"
                >
                  <template #header>
                    <span style="padding-right: 7px;">{{$t('cortex.IncludeDefault')}}</span>
                    <el-switch v-model="configSwitch" :active-value="1" :inactive-value="0" @change="configSwitchCheck" size="small" style="padding-right: 11px;"></el-switch>
                  </template>
                  <template slot-scope="scope">
                    <span><pre>{{scope.row}}</pre></span>
                  </template>
                </el-table-column>
          </el-table>
        </div>
    </div>
  </div>
</template>

<script>
import table from '@/components/common/mixin/table'
export default {
  name: 'cortexDetailTable',
  props: {
    loading: Boolean,
    configMode: String,
    ingesterTableData: Array,
    storeGatewayTableData: Array,
    configTableData: Array,
    servicesTableData: Array,
    ringTableData: Array
  },
  mixins: [table],
  components: {},
  watch: {
  },
  data () {
    return {
      configSwitch: 1,
      ingesterTitle: [
        {
          label: 'Name',
          prop: 'name',
          minWidth: 145
        },
        {
          label: 'ID',
          prop: 'instanceId',
          minWidth: 145
        },
        {
          label: 'Availability zone',
          prop: 'zone',
          minWidth: 180
        },
        {
          label: 'State',
          prop: 'state',
          minWidth: 150
        },
        {
          label: 'Address',
          prop: 'address',
          minWidth: 180
        }, {
          label: 'Registered at',
          prop: 'registeredAt',
          minWidth: 210
        }, {
          label: 'Last heartbeat',
          prop: 'heartbeat',
          minWidth: 210
        }, {
          label: 'Token',
          prop: 'tokens',
          minWidth: 180
        }, {
          label: 'Ownership',
          prop: 'ownership',
          minWidth: 180
        }],
      serviceTitle: [
        {
          label: 'Ready',
          prop: 'ready',
          minWidth: 180
        },
        {
          label: 'Distributor service',
          prop: 'distributor-service',
          minWidth: 180
        },
        {
          label: 'Ingester service',
          prop: 'ingester-service',
          minWidth: 180
        },
        {
          label: 'Member list KV',
          prop: 'memberlist-kv',
          minWidth: 180
        },
        {
          label: 'Querier',
          prop: 'querier',
          minWidth: 180
        },
        {
          label: 'Query frontend',
          prop: 'query-frontend',
          minWidth: 180
        }
      ],
      serviceTitleSub: [
        {
          label: 'Query frontend tripperware',
          prop: 'query-frontend-tripperware',
          minWidth: 180
        },
        {
          label: 'Ring',
          prop: 'ring',
          minWidth: 180
        },
        {
          label: 'Ruler',
          prop: 'ruler',
          minWidth: 180
        },
        {
          label: 'Server',
          prop: 'server',
          minWidth: 180
        },
        {
          label: 'Store gateway',
          prop: 'store-gateway',
          minWidth: 180
        },
        {
          label: 'Store queryable',
          prop: 'store-queryable',
          minWidth: 180
        }
      ]
    }
  },
  mounted () {
  },
  methods: {
    // 合并单元格
    objectSpanMethod ({ row, column, rowIndex, columnIndex }, items) {
      if (columnIndex === 0) {
        if (rowIndex % items.length === 0) {
          return {
            rowspan: items.length,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
    },
    configSwitchCheck () {
      if (this.configSwitch == 1) {
        this.$emit('configval', 'defaults')
      } else {
        this.$emit('configval', 'diff')
      }
    }
  }
}
</script>

<style>

</style>
