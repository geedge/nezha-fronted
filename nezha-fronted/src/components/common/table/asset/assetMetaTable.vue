<template>
  <el-table
    id="assetLabelTable"
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
      :key="`col-${index}-${item.prop}`"
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
        <div v-if="item.prop === 'group'">
          <copy :copyData='scope.row[item.prop].name' :showInfo='scope.row[item.prop]'>
                  <template slot="copy-text">
                     {{scope.row[item.prop]?scope.row[item.prop].name:'-'}}
                  </template>
              </copy>
        </div>
        <div v-else-if="item.prop === 'name'">
          <copy :copyData='scope.row[item.prop]' :showInfo='scope.row[item.prop]'>
                  <template slot="copy-text">
                     {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
                  </template>
              </copy>
          </div>
        <div v-else-if="item.prop === 'metaKey'">
          <copy :copyData='scope.row[item.prop]' :showInfo='scope.row[item.prop]'>
                  <template slot="copy-text">
                     {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
                  </template>
              </copy>
          </div>
        <div v-else-if=" item.prop === 'display' ">
          <div v-if="scope.row[item.prop] === 1">Enabled</div>
          <div v-else-if="scope.row[item.prop] === 0">Disabled</div>
        </div>
        <div v-else-if=" item.prop === 'search' ">
          <div v-if="scope.row[item.prop] === 1">Enabled</div>
          <div v-else-if="scope.row[item.prop] === 0">Disabled</div>
        </div>
        <div v-else-if=" item.prop === 'type' ">
          <div v-if="scope.row[item.prop].toUpperCase() == 'TEXT'"><i class="nz-icon nz-icon-text"></i>&nbsp;&nbsp;TEXT</div>
          <div v-else-if="scope.row[item.prop].toUpperCase() == 'MULTITEXT'"><i class="nz-icon nz-icon-multitext"></i>&nbsp;&nbsp;MULTITEXT</div>
          <div v-else-if="scope.row[item.prop].toUpperCase() == 'TEXTAREA'"><i class="nz-icon nz-icon-textarea"></i>&nbsp;&nbsp;TEXTAREA</div>
          <div v-else-if="scope.row[item.prop].toUpperCase() == 'RADIO'"><i class="nz-icon nz-icon-radio"></i>&nbsp;&nbsp;RADI0</div>
          <div v-else-if="scope.row[item.prop].toUpperCase() == 'CHECKBOX'"><i class="nz-icon nz-icon-checkbox"></i>&nbsp;&nbsp;CHECKBOX</div>
          <div v-else-if="scope.row[item.prop].toUpperCase() == 'SELECT'"><i class="nz-icon nz-icon-xialaxuanze"></i>&nbsp;&nbsp;SELECT</div>
          <div v-else-if="scope.row[item.prop].toUpperCase() == 'INTEGER'"><i class="nz-icon nz-icon-integer"></i>&nbsp;&nbsp;INTEGER</div>
          <div v-else-if="scope.row[item.prop].toUpperCase() == 'DOUBLE'"><i class="nz-icon nz-icon-double"></i>&nbsp;&nbsp;DOUBLE</div>
          <div v-else-if="scope.row[item.prop].toUpperCase() == 'DATETIME'"><i class="nz-icon nz-icon-dingshishijian"></i>&nbsp;&nbsp;DATETIME</div>
          <div v-else-if="scope.row[item.prop].toUpperCase() == 'EMAIL'"><i class="nz-icon nz-icon-email"></i>&nbsp;&nbsp;EMAIL</div>
          <div v-else-if="scope.row[item.prop].toUpperCase() == 'PASSWORD'"><i class="nz-icon nz-icon-password"></i>&nbsp;&nbsp;PASSWORD</div>
        </div>
        <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop] || '-'}}</span>
        <template v-else>-</template>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
<!--        <button class="table-operation-item" @click.stop><i class="nz-icon nz-icon-view1"></i></button>-->
        <button class="table-operation-item" v-has="'asset_label_edit'" @click.stop="$emit('edit', scope.row)" :title="$t('overall.edit')"><i class="nz-icon nz-icon-edit"></i></button>
        <el-dropdown size="medium" v-has="['asset_label_edit','asset_label_delete']" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
<!--            <el-dropdown-item v-has="'asset_label_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>-->
            <el-dropdown-item v-has="'asset_label_edit'" :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'asset_label_delete'" :command="['delete-rel', scope.row, {forceDeleteShow:true, single:true,from:'assetLabel'}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
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
import deleteButton from '@/components/common/deleteButton'
import copy from '@/components/common/copy'
export default {
  name: 'assetLabelTable',
  mixins: [table],
  components: { deleteButton, copy },
  props: {
    loading: Boolean
  },
  data () {
    return {
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 150,
          sortable: 'custom'
        }, {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true,
          minWidth: 250,
          sortable: 'custom'
        }, {
          label: this.$t('overall.key'),
          prop: 'metaKey',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('dashboard.dashboard.chartForm.group'),
          prop: 'group',
          show: true,
          width: 200,
          sortable: 'custom'
        }, {
          label: this.$t('overall.search'),
          prop: 'search',
          minWidth: 120,
          show: true
        }, {
          label: this.$t('config.assetLabel.display'),
          prop: 'display',
          minWidth: 120,
          show: true
        }, {
          label: this.$t('overall.type'),
          prop: 'type',
          minWidth: 150,
          show: true
        }, {
          label: this.$t('config.assetLabel.params'),
          prop: 'param',
          show: false,
          minWidth: 200
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

  }
}
</script>
