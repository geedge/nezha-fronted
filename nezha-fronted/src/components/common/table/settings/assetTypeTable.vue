<template>
  <el-table
    id="assetTypeTable"
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
    >
      <template slot="header">
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <div v-if=" item.prop === 'vm' ">
          <div v-if="scope.row[item.prop] === 1">YES</div>
          <div v-else-if="scope.row[item.prop] === 0">NO</div>
        </div>
        <div v-else-if=" item.prop === 'vmh' ">
          <div v-if="scope.row[item.prop] === 1">YES</div>
          <div v-else-if="scope.row[item.prop] === 0">NO</div>
        </div>
        <div v-else-if=" item.prop === 'authProtocol' ">
          <div v-if="scope.row[item.prop] === 1">SSH</div>
          <div v-else-if="scope.row[item.prop] === 0">nothing</div>
          <div v-else-if="scope.row[item.prop] === 2">telnet</div>
        </div>
        <div v-else-if=" item.prop === 'snmpEnable' ">
          <div v-if="scope.row[item.prop] === 1">Enabled</div>
          <div v-else-if="scope.row[item.prop] === 0">Disabled</div>
        </div>
        <div v-else-if=" item.prop === 'snmpCollect' ">
          <div v-if="scope.row[item.prop] === 1">Enabled</div>
          <div v-else-if="scope.row[item.prop] === 0">Disabled</div>
        </div>
        <div v-else-if=" item.prop === 'sshCollect' ">
          <div v-if="scope.row[item.prop] === 1">Enabled</div>
          <div v-else-if="scope.row[item.prop] === 0">Disabled</div>
        </div>
        <div v-else-if="item.prop === 'sshCollectScript'">
          <div>{{ scope.row[item.prop] || '-' }}</div>
        </div>
        <span v-else-if="scope.row[item.prop]">{{ scope.row[item.prop] || '-' }}</span>
        <template v-else>-</template>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item" @click="showBottomBox('operationLogTab', scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" v-has="['assetType_edit','assetType_delete']" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
           <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
            <el-dropdown-item v-has="'assetType_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'assetType_delete'" :command="['delete-rel', scope.row, {forceDeleteShow:false, single:true}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
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
</template>

<script>
import table from '@/components/common/mixin/table'
export default {
  name: 'asstTypeTable',
  props: {
    loading: Boolean
  },
  mixins: [table],
  data () {
    return {
      tableTitle: [ // 原始table列
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
          width: 120,
          sortable: 'custom'
        }, {
          label: this.$t('config.assetType.vm'),
          prop: 'vm',
          show: true
        }, {
          label: this.$t('config.assetType.vmh'),
          prop: 'vmh',
          show: true
        }, {
          label: this.$t('config.assetType.authProtocol'),
          prop: 'authProtocol',
          show: true
        }, {
          label: this.$t('config.assetType.snmpEnable'),
          prop: 'snmpEnable',
          show: true
        }, {
          label: this.$t('config.assetType.snmpCollect'),
          prop: 'snmpCollect',
          show: true
        },
        {
          label: this.$t('config.assetType.sshCollect'),
          prop: 'sshCollect',
          show: true
        },
        {
          label: this.$t('config.assetType.sshCollectScript'),
          prop: 'sshCollectScript',
          show: true
        }
      ]
    }
  },
  methods: {

  },
  computed: {

  }
}
</script>
