<template>
  <el-table
    id="modelTable"
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
    >
      <template slot="header">
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <span v-if="item.prop === 'dc'">{{scope.row[item.prop]?scope.row[item.prop].name:'-'}}</span>
        <template v-else-if="item.prop === 'CIDR'">
          <copy :copyData='scope.row.addr + "/" + scope.row.mask' :showInfo='scope.row.addr || scope.row.mask'>
                  <template slot="copy-text">
                     {{ scope.row.addr }}/{{scope.row.mask}}
                  </template>
          </copy>
        </template>
        <span v-else-if="item.prop === 'type'">
          <template v-if="scope.row.type === 4">IPV4</template>
          <template v-else-if="scope.row.type === 6">IPV6</template>
        </span>
        <template v-else-if="item.prop === 'name'">
           <copy :copyData='scope.row[item.prop]' :showInfo='scope.row[item.prop]'>
                  <template slot="copy-text">
                     {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
                  </template>
              </copy>
          </template>
        <span v-else-if="scope.row[item.prop]" :class="item.prop === 'remark'? 'el-table-remark':''">{{scope.row[item.prop]}}</span>
        <span v-else>-</span>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item"  @click="showBottomBox('ipam', scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" trigger="click" v-has="['ipam_edit', 'ipam_delete']" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
            <el-dropdown-item v-has="'ipam_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'ipam_edit'" :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'ipam_delete'" :command="['delete-rel', scope.row, {forceDeleteShow:true, single:true}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
            <!-- <el-dropdown-item v-has="'ipam_edit'" :command="['sync', scope.row]"><i class="nz-icon nz-icon-sync"></i><span class="operation-dropdown-text">{{$t('overall.syncChart')}}</span></el-dropdown-item> -->
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
    <template slot="empty">
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
import deleteButton from '@/components/common/deleteButton'
import copy from '@/components/common/copy'
export default {
  name: 'ipamTable',
  mixins: [table],
  components: {
    deleteButton,
    copy
  },
  props: {
    loading: Boolean
  },
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
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('overall.type'),
          prop: 'type',
          show: true,
          width: 200,
          sortable: 'custom'
        }, {
          label: 'CIDR',
          prop: 'CIDR',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('overall.dc'),
          prop: 'dc',
          show: true,
          width: 200,
          sortable: 'custom'
        }, {
          label: this.$t('overall.vlan'),
          prop: 'vlan',
          show: true,
          width: 200
        }, {
          label: this.$t('overall.remark'),
          prop: 'remark',
          minWidth: 200,
          show: true
        }
      ]
    }
  },
  methods: {
    tableDataSort (item) {
      let orderBy = ''
      let str = item.prop
      if (str === 'dc') {
        orderBy = str
      }
      if (str === 'CIDR') {
        str = 'addr'
        orderBy = str
      }
      if (item.order === 'ascending') {
        orderBy = str
      }
      if (item.order === 'descending') {
        orderBy = '-' + str
      }
      this.$emit('orderBy', orderBy)
    }
  }
}
</script>
