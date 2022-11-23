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
        <template v-if="item.prop === 'roles'">
          <template v-if="scope.row[item.prop]">
            {{scope.row[item.prop].map(t=>t.name).join(',')}}
          </template>
          <template v-else>
            <span>-</span>
          </template>
        </template>
        <template v-else-if="item.prop === 'name'">
          <copy :copyData='scope.row[item.prop]' :showInfo='scope.row[item.prop]'>
                  <template slot="copy-text">
                     {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
                  </template>
          </copy>
          </template>
         <template v-else-if="item.prop === 'brand'">
          <copy :copyData='scope.row.brand.name' :showInfo='scope.row.brand.name'>
                  <template slot="copy-text">
                     {{scope.row.brand.name}}
                  </template>
          </copy>
         </template>
        <template v-else-if="item.prop === 'type'">
          <copy :copyData='scope.row.type.name' :showInfo='scope.row[item.prop]'>
                  <template slot="copy-text">
                     {{scope.row.type ? scope.row.type.name : '-'}}
                  </template>
          </copy>
         </template>
         <template v-else-if="item.prop === 'panel'">
          {{scope.row.panel ? scope.row.panel.name : '-'}}
         </template>
        <span v-else-if="item.prop === 'createTime'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
        <template v-else-if="item.prop === 'assetNum'">
          <span style="cursor: pointer" class="endpoint-num"  @click="showBottomBox('asset', scope.row)">
             <i class="nz-icon nz-icon-overview-project monitorColor" :class="scope.row[item.prop]>0?'color23BF9A':'color23BF9A'"/>
          {{scope.row[item.prop]}}
          </span>
        </template>
        <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
        <span v-else>-</span>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item" v-has="'model_edit'" @click="$emit('edit', scope.row)" :title="$t('overall.edit')"><i class="nz-icon nz-icon-edit"></i></button>
<!--        <button class="table-operation-item" @click="showBottomBox('operationLogTab', scope.row)"><i class="nz-icon nz-icon-view1"></i></button>-->
        <el-dropdown size="medium" v-has="['model_delete','main_edit','model_edit']" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
<!--            <el-dropdown-item :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>-->
            <el-dropdown-item v-has="'model_edit'" :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <!-- <el-dropdown-item v-has="'model_delete'" :command="['delete', scope.row]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item> -->
            <el-dropdown-item v-has="'model_delete'" :command="['delete', scope.row]">
                  <delete-button
                  ref="deleteButton"
                  :from="'model'"
                  :forceDeleteShow="true"
                  :type="'link'"
                  :title="$t('overall.delete')"
                  id="account-list-delete"
                  v-has="'model_delete'"
                  :api="api"
                  :single="true"
                  :delete-objs="singleDelete"
                  @before="delFlag=true"
                  ></delete-button>
              </el-dropdown-item>
            <el-dropdown-item v-has="'main_edit'" :command="['sync', scope.row]"><i class="nz-icon nz-icon-sync"></i><span class="operation-dropdown-text">{{$t('overall.syncChart')}}</span></el-dropdown-item>
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
  name: 'modelTable',
  mixins: [table],
  components: { deleteButton, copy },
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
          label: this.$t('config.model.name'),
          prop: 'name',
          show: true,
          minWidth: 350,
          sortable: 'custom'
        }, {
          label: this.$t('asset.brand'),
          prop: 'brand',
          show: true,
          width: 200,
          sortable: 'custom'
        }, {
          label: this.$t('asset.asset'),
          prop: 'assetNum',
          show: true,
          width: 120,
          sortable: 'custom'
        }, {
          label: this.$t('overall.type'),
          prop: 'type',
          minWidth: 200,
          show: true
        }, {
          label: this.$t('model.dashboardtemplate'),
          prop: 'panel',
          minWidth: 200,
          show: false
        }, {
          label: this.$t('config.model.sysObjectId'),
          prop: 'sysObjectId',
          minWidth: 200,
          show: false
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

  },
  created () {
  },
  computed: {

  }
}
</script>
