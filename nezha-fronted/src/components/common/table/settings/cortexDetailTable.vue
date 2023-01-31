<template>
  <div id="cortexDetailTable">
  <template v-if="noData" height='100%'>
    <div class="cortex-service">
        <div class="cortex-title" style="margin-top: 0px;">{{$t('cortex.serviceStatus')}}</div>
        <el-table
        :data="servicesTableData"
        border>
          <el-table-column
          v-for="(item, index) in serviceTitle"
          :key="`col-${index}`"
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
          :key="`col-${index}`"
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
                  :key="`col-${index}`"
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
                    <span v-if="item.prop === 'name'">{{indexs? $t('cortex.storeGateway'):$t('cortex.ingester')}}</span>
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
  </template>
  <div v-else class="table-no-data">
    <div v-if="!loading">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#nz-icon-no-data-list"></use>
      </svg>
      <div class="table-no-data__title">No results found</div>
    </div>
    <div v-else>&nbsp;</div>
  </div>
  </div>
</template>

<script>
import lodash from 'lodash'
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
    loading: {
      immediate: true,
      deep: true,
      handler (n) {
        if (!n) {
          // 判断是否有值
          if (!lodash.isEmpty(this.ingesterTableData) || !lodash.isEmpty(this.storeGatewayTableData) || !lodash.isEmpty(this.configTableData) || !lodash.isEmpty(this.servicesTableData)) {
            this.noData = true
          }
        }
      }
    }
  },
  data () {
    return {
      configSwitch: 1,
      noData: false,
      ingesterTitle: [
        {
          label: this.$t('alert.alertName'),
          prop: 'name',
          minWidth: 145
        },
        {
          label: 'ID',
          prop: 'instanceId',
          minWidth: 145
        },
        {
          label: this.$t('cortex.availabilityZone'),
          prop: 'zone',
          minWidth: 180
        },
        {
          label: this.$t('overall.state'),
          prop: 'state',
          minWidth: 150
        },
        {
          label: this.$t('overall.address'),
          prop: 'address',
          minWidth: 180
        }, {
          label: this.$t('cortex.registeredAt'),
          prop: 'registeredAt',
          minWidth: 210
        }, {
          label: this.$t('cortex.lastHeartbeat'),
          prop: 'heartbeat',
          minWidth: 210
        }, {
          label: this.$t('asset.talon.token'),
          prop: 'tokens',
          minWidth: 180
        }, {
          label: this.$t('cortex.ownership'),
          prop: 'ownership',
          minWidth: 180
        }],
      serviceTitle: [
        {
          label: this.$t('cortex.ready'),
          prop: 'ready',
          minWidth: 180
        },
        {
          label: this.$t('cortex.distributorService'),
          prop: 'distributor-service',
          minWidth: 180
        },
        {
          label: this.$t('cortex.ingesterService'),
          prop: 'ingester-service',
          minWidth: 180
        },
        {
          label: this.$t('cortex.memberlist'),
          prop: 'memberlist-kv',
          minWidth: 180
        },
        {
          label: this.$t('cortex.querier'),
          prop: 'querier',
          minWidth: 180
        },
        {
          label: this.$t('cortex.queryFrontend'),
          prop: 'query-frontend',
          minWidth: 180
        }
      ],
      serviceTitleSub: [
        {
          label: this.$t('cortex.queryFrontendTripperware'),
          prop: 'query-frontend-tripperware',
          minWidth: 180
        },
        {
          label: this.$t('cortex.ring'),
          prop: 'ring',
          minWidth: 180
        },
        {
          label: this.$t('project.topology.rule'),
          prop: 'ruler',
          minWidth: 180
        },
        {
          label: this.$t('asset.server'),
          prop: 'server',
          minWidth: 180
        },
        {
          label: this.$t('cortex.storeGateway'),
          prop: 'store-gateway',
          minWidth: 180
        },
        {
          label: this.$t('cortex.storeQueryable'),
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
