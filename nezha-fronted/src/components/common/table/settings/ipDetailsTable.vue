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
        <template v-if="item.prop === 'asset'">{{scope.row.asset ? scope.row.asset.name : '-'}}</template>
        <template v-else-if="item.prop === 'state'">
          <div v-if="scope.row[item.prop] === 1">
            <span class="nz-icon nz-icon-circle ip-detail-available"></span>
            {{ 'Available' }}
          </div>
          <div v-else-if="scope.row[item.prop] === 2">
            <span class="nz-icon nz-icon-circle ip-detail-transient"></span>
            {{ 'Transient' }}
          </div>
          <div v-else-if="scope.row[item.prop] === 3">
            <span class="nz-icon nz-icon-circle ip-detail-used"></span>
            {{ 'Used' }}
          </div>
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
        <button class="table-operation-item" v-has="'ipam_edit'" @click="$emit('edit', scope.row)" :title="$t('overall.edit')"><i class="nz-icon nz-icon-edit"></i></button>
        <el-dropdown size="medium" trigger="click" v-has="['ipam_delete']" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
            <!-- <el-dropdown-item v-has="'ipam_delete'" :command="['delete', scope.row]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item> -->
            <el-dropdown-item v-has="'ipam_delete'" :command="['delete', scope.row]">
                  <delete-button
                  ref="deleteButton"
                  :from="'ipDetails'"
                  :forceDeleteShow="false"
                  :title="$t('overall.delete')"
                  v-has="'ipam_delete'"
                  :type="'link'"
                  id="account-list-delete"
                  :api="api"
                  :single="true"
                  :delete-objs="singleDelete"
                  @before="delFlag=true"
                  ></delete-button>
              </el-dropdown-item>
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
export default {
  name: 'ipDetailsTable',
  mixins: [table],
  components: {
    deleteButton
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
          label: 'IP',
          prop: 'addr',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true,
          width: 200,
          sortable: 'custom'
        }, {
          label: 'MAC',
          prop: 'mac',
          show: true,
          minWidth: 200
        }, {
          label: this.$t('asset.asset'),
          prop: 'asset',
          show: true,
          width: 200
        }, {
          label: this.$t('overall.state'),
          prop: 'state',
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
  }
}
</script>
