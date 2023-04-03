<template>
  <div>
    <el-table
      id="dcTable"
      ref="dataTable"
      :data="tableData"
      :height="height"
      border
      :default-sort="orderBy"
      @cell-mouse-enter="cellMouseEnter"
      @header-dragend="dragend"
      @sort-change="tableDataSort"
      @selection-change="selectionChange"
      @row-dblclick="(row)=>{showBottomBox('cabinet', row)}"
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
          <span class="data-column__span">{{item.label}}</span>
          <div class="col-resize-area"></div>
        </template>
        <template slot-scope="scope" :column="item">
          <template v-if="item.prop === 'principal'">
            <template v-if="scope.row.adminUser">
              {{scope.row.adminUser.name}}
            </template>
            <template v-else>-</template>
          </template>
          <template v-else-if="item.prop === 'state'">
            <div v-if="scope.row[item.prop] === 'ON'">
              <div class="active-icon green-bg inline-block"></div>
              {{ $t('overall.enabled') }}
            </div>
            <div v-else-if="scope.row[item.prop] === 'OFF'">
              <div class="active-icon gray-bg inline-block"></div>
              {{ $t('overall.disabled') }}
            </div>
          </template>
          <template v-else-if="item.prop === 'longitude'">
            <template v-if="regNumTest(scope.row.longitude)">{{scope.row.longitude}}</template>
            <template v-else>-</template>
          </template>
          <template v-else-if="item.prop === 'latitude'">
            <template v-if="regNumTest(scope.row.latitude)">{{scope.row.latitude}}</template>
            <template v-else>-</template>
          </template>
          <template v-else-if="item.prop === 'assetNum'">
          <span style="cursor: pointer" class="asset-num"  @click.stop="showBottomBox('asset', scope.row)" @dblclick.stop="">
             <i class="nz-icon nz-icon-overview-project monitorColor" :class="scope.row[item.prop]>0?'color23BF9A':'color23BF9A'"/>
          {{scope.row[item.prop]}}
          </span>
          </template>
          <template v-else-if="item.prop === 'alertNum'">
           <span style="cursor: pointer" @click.stop="$emit('showBottomBox', 'alertMessageTab', scope.row)" @dblclick.stop="">
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

          <template v-else-if="item.prop === 'cabinetNum'">
          <span style="cursor: pointer" class="cabinet-num" @click.stop="showBottomBox('cabinet', scope.row)" @dblclick.stop="">
            <i class="nz-icon nz-icon-cabinet monitorColor" :class="scope.row[item.prop]>0?'color23BF9A':'colorEF7458'"/>
            {{scope.row[item.prop]}}
          </span>
          </template>
          <template v-else-if="item.prop === 'name'">
            <copy :copyData='scope.row[item.prop]' :showInfo='scope.row[item.prop]'>
              <template slot="copy-text">
                {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
              </template>
            </copy>
          </template>
          <span v-else-if="item.prop === 'id'" :id="'globalSearch' + scope.row.id">{{scope.row[item.prop]}}</span>
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
          <button class="table-operation-item" @click="showBottomBox('cabinet', scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button>
          <el-dropdown size="medium" v-has="['dc_delete','dc_edit']" trigger="click" @command="tableOperation">
            <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
              <i class="nz-icon nz-icon-more3"></i>
            </div>
            <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
              <el-dropdown-item v-has="'dc_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'dc_edit'" :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'dc_delete'" :command="['delete-rel', scope.row, {forceDeleteShow:true, single:true}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'asset_add'" :command="['topology', scope.row, 'datacenter']"><i class="nz-icon nz-icon-Topology"></i><span class="operation-dropdown-text">{{$t('overall.topology')}}</span></el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-table-column>
      <template  slot="empty">
        <div v-if="!loading" class="table-no-data">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#nz-icon-no-data-list"></use>
          </svg>
          <div class="table-no-data__title">No results found</div>
        </div>
        <div v-else>&nbsp;</div>
      </template>
    </el-table>
  </div>
</template>

<script>
import table from '@/components/common/mixin/table'
import { showTableTooltip, hideTableTooltip } from '@/components/common/js/tools'
import alertDaysInfo from '@/components/common/alert/alertDaysInfo'
import deleteButton from '@/components/common/deleteButton'
import copy from '@/components/common/copy'
export default {
  name: 'dcTable',
  mixins: [table],
  components: {
    alertDaysInfo, deleteButton, copy
  },
  props: {
    loading: Boolean
  },
  data () {
    return {
      regNum: /^[0-9]+.?[0-9]*/,
      needAlertDaysData: true,
      trendKey: 'dcId',
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        }, {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('asset.location'),
          prop: 'location',
          show: true
        }, {
          label: this.$t('asset.cabinet'),
          prop: 'cabinetNum',
          show: true,
          minWidth: 110,
          sortable: 'custom'
        }, {
          label: this.$t('asset.asset'),
          prop: 'assetNum',
          show: true,
          minWidth: 90,
          sortable: 'custom'
        }, {
          label: this.$t('overall.alert'),
          prop: 'alertNum',
          width: 120,
          show: true
        }, {
          label: this.$t('config.dc.tel'),
          prop: 'tel',
          show: false,
          minWidth: 100
        }, {
          label: this.$t('config.dc.principal'),
          prop: 'principal',
          show: false,
          minWidth: 120
        }, {
          label: this.$t('config.dc.longitude'),
          prop: 'longitude',
          show: false,
          minWidth: 100
        }, {
          label: this.$t('config.dc.latitude'),
          prop: 'latitude',
          show: false,
          minWidth: 100
        }, {
          label: this.$t('overall.state'),
          prop: 'state',
          show: true,
          minWidth: 100,
          sortable: 'custom'
        }
      ]
    }
  },
  mounted () {
    // console.log(this.customTableTitle)
  },
  methods: {
    showTableTooltip,
    hideTableTooltip,
    regNumTest (val) { // 校验是否是数字
      return this.regNum.test(val)
    },
    messageStyle (title, row) {
      if (title.prop === 'alertNum') {
        if (row.alertNum > 0) {
          return 'danger'
        } else {
          return 'success'
        }
      }
      if (title.label === 'assettNum') {
        if (row.state === 3) {
          return 'suspended'
        } else {
          if (row.endpointDownNum > 0) {
            return 'danger'
          } else {
            return 'success'
          }
        }
      }
      return ''
    }
  }
}
</script>
