<template>
  <div style="height: 100%">
  <el-table
    id="roleTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    border
    :default-sort="orderBy"
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
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <span v-if="item.prop === 'dc'" >{{scope.row[item.prop]?scope.row[item.prop].name:'-'}}</span>

        <span v-else-if="item.prop === 'type'">
                {{findServerType(scope.row[item.prop]).text}}
              </span>
        <span v-else-if="item.prop === 'checkTime'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
        <span v-else-if="item.prop === 'ts'">{{scope.row[item.prop]?momentTz(scope.row[item.prop]):'-'}}</span>
        <span v-else-if="item.prop === 'status'">
          <!-- <el-popover :content="$t('asset.assetStatPre')+(scope.row.checkTime?utcTimeToTimezoneStr(scope.row.checkTime):$t('asset.assetStatDown'))" placement="right" trigger="hover" width="200"> -->
            <div slot="reference" style="width: 80px" @mouseenter="labelHover(JSON.parse(scope.row.statusInfo), 'agent', true, $event)"
             @mouseleave="labelHover(JSON.parse(scope.row.statusInfo), 'agent', false)">
              <span :class="{'active-icon green-bg':scope.row[item.prop] == '1','active-icon red-bg':scope.row[item.prop] == '0' || scope.row[item.prop] == '-1' || scope.row[item.prop] == '-2'}"></span>
              <span>{{scope.row[item.prop] == '1' ? 'UP' : 'Down'}}</span>
            </div>
          <!-- </el-popover> -->
        </span>
        <template v-else-if="item.prop === 'name'">
          <copy :copyData='scope.row[item.prop]' :showInfo='scope.row[item.prop]'>
                  <template slot="copy-text">
                     {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
                  </template>
              </copy>
          </template>
        <template v-else-if="item.prop === 'host'">
          <copy :copyData='scope.row[item.prop]' :showInfo='scope.row[item.prop]'>
                  <template slot="copy-text">
                     {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
                  </template>
              </copy>
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
<!--        <button class="table-operation-item" v-has="'agent_edit'" @click="tableOperation(['edit', scope.row])"><i class="nz-icon nz-icon-edit"></i></button>-->
        <button class="table-operation-item"  @click="showBottomBox('scrapeEndpoint', scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" v-has="['agent_edit','agent_delete']" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
            <el-dropdown-item v-has="'agent_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'agent_edit'" :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'agent_delete'" :command="['delete-rel', scope.row, {forceDeleteShow:true, single:true}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
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
   <alertStateInfo
      v-if="alertLabelShow"
      :that="alertLabelObj"
      :type="agent"
      :detail-list="true"
    ></alertStateInfo>
  </div>
</template>

<script>
import bus from '@/libs/bus'
import table from '@/components/common/mixin/table'
import { agent } from '@/components/common/js/constants'
import alertStateInfo from '@/components/common/alert/alertStateInfo'
import copy from '@/components/common/copy'
export default {
  name: 'agentTable',
  props: {
    loading: Boolean
  },
  mixins: [table],
  components: {
    alertStateInfo, copy
  },
  data () {
    return {
      agent: agent,
      alertLabelShow: false,
      alertLabelObj: {},
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
          label: this.$t('overall.dc'),
          prop: 'dc',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('asset.host'),
          prop: 'host',
          show: true
        }, {
          label: this.$t('asset.port'),
          prop: 'port',
          show: true
        }, {
          label: this.$t('overall.type'),
          prop: 'type',
          show: true,
          minWidth: 100,
          sortable: 'custom'
        }, {
          label: this.$t('overall.state'),
          prop: 'status',
          show: true,
          minWidth: 100,
          sortable: 'custom'
        }, {
          label: this.$t('config.agent.checkTime'),
          prop: 'checkTime',
          show: false,
          minWidth: 150
        }, {
          label: this.$t('webshell.protocol'),
          prop: 'protocol',
          show: false,
          minWidth: 150
        },
        {
          label: this.$t('dashboard.dashboard.chartForm.typeVal.server'),
          prop: 'ts',
          show: false,
          minWidth: 150
        }
      ]
    }
  },
  methods: {
    findServerType (type) {
      if (!this.promServerType) {
        this.promServerType = []
        this.agent.theData.forEach(item => {
          this.promServerType = this.promServerType.concat(item.children)
        })
      }
      return this.promServerType.find(item => {
        return item.value == type
      })
    },
    computeTimezoneTime (time) {
      return bus.computeTimezoneTime(time)
    },
    // label 鼠标划入
    labelHover (item, type, loading, e) {
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        this.$set(item, 'position', position)
        this.$set(item, 'type', type)
        this.alertLabelObj = item
      }
      this.$set(item, 'loading', loading)
      this.alertLabelShow = loading
    }
  }
}
</script>
