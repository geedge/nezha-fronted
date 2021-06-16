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
        <span v-else-if="item.prop === 'status'">
          <el-popover :content="$t('asset.assetStatPre')+(scope.row.checkTime?utcTimeToTimezoneStr(scope.row.checkTime):$t('asset.assetStatDown'))" placement="right" trigger="hover" width="200">
            <div slot="reference" style="width: 20px">
              <div :class="{'active-icon green-bg':scope.row[item.prop] == '1','active-icon red-bg':scope.row[item.prop] == '0' || scope.row[item.prop] == '-1' || scope.row[item.prop] == '-2'}"></div>
            </div>
          </el-popover>
        </span>
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
        <button class="table-operation-item" v-has="'agent_edit'" @click="tableOperation(['edit', scope.row])"><i class="nz-icon nz-icon-edit"></i></button>
        <el-dropdown size="medium" v-has="['agent_delete']" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-has="'agent_delete'" :command="['delete', scope.row]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
import { agent } from '@/components/common/js/constants'
export default {
  name: 'agentTable',
  mixins: [table],
  data () {
    return {
      agent: agent,
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80,
          sortable:'custom'
        }, {
          label: this.$t('config.agent.dataCenter'),
          prop: 'dc',
          show: true,
          sortable:'custom'
        }, {
          label: this.$t('config.agent.host'),
          prop: 'host',
          show: true
        }, {
          label: this.$t('config.agent.port'),
          prop: 'port',
          show: true
        }, {
          label: this.$t('config.agent.type'),
          prop: 'type',
          show: true,
          sortable:'custom'
        }, {
          label: this.$t('asset.state'),
          prop: 'status',
          show: true,
          sortable:'custom'
        }, {
          label: this.$t('config.agent.checkTime'),
          prop: 'checkTime',
          show: false
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
    }
  }
}
</script>
