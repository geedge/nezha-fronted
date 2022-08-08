<template>
<div>
  <el-table
    id="recordRuleTable"
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
      width="55"
    >
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
        <span class="data-column__span">{{ item.label }}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <template v-if="item.prop === 'name'">
           <div class="document-copy-block">
              <span class="document-copy-text">{{scope.row.name ? scope.row.name : '-'}}</span>
              <i v-if="scope.row.name" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(scope.row.name)" :title="$t('overall.copyText')"></i>
            </div>
        </template>
        <!-- <template v-else-if="item.prop === 'type'">
          <template v-if="scope.row[item.prop]">
            <template v-if="scope.row[item.prop] === 1">{{$t('overall.metrics')}}</template>
            <template v-if="scope.row[item.prop] === 2">{{$t('overall.logs')}}</template>
          </template>
          <template v-if="scope.row[item.prop]">{{"-"}}</template>
        </template>
        <template v-else-if="item.prop === 'expr'">
          <div class="document-copy-block">
              <span class="document-copy-text">{{scope.row[item.prop] ? scope.row[item.prop] : '-'}}</span>
              <i v-if="scope.row[item.prop]" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(scope.row[item.prop])" :title="$t('overall.copyText')"></i>
            </div>
        </template>
        <template v-else-if="item.prop === 'inr'">
          <template>{{scope.row[item.prop] ? scope.row[item.prop] : '-'}}</template>
        </template>
        <template v-else-if="item.prop === 'labels'">
          <span v-for="(item1, i) in labelsSort(scope.row.labels)" :key="i">
            <span
            @mouseenter="labelHover(scope.row, item.label, true, true, $event)"
              @mouseleave="labelHover(scope.row, item.label, false, true,)">
              <nz-alert-tag
                :key="i"
                :cursor-point="tagType(item1.name) !== 'info'"
                :label="item1.name"
                :type="tagType(item1.name)"
                :regex="item1.regex"
                style="margin: 5px 0 5px 5px">
                {{ item1.value }}
              </nz-alert-tag>
            </span>
          </span>
        </template>
        <template v-else-if="item.prop === 'remark'">
          <template>{{scope.row[item.prop] ? scope.row[item.prop] : '-'}}</template>
        </template>
        <template v-else-if="item.prop === 'state'">
          <span v-if="scope.row.state === 0" class="silence-active">active</span>
          <span v-if="scope.row.state === 1" class="silence-pending">pending</span>
        </template> -->
        <span v-else-if="scope.row[item.prop]">{{
          scope.row[item.prop] || "-"
        }}</span>
        <template v-else>-</template>
      </template>
    </el-table-column>
    <el-table-column :resizable="false" :width="operationWidth" fixed="right">
      <div slot="header" class="table-operation-title">
        {{ $t("overall.option") }}
      </div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item" @click="showBottomBox('recordRule', scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" v-has="['record_rule_edit','record_rule_delete']" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
            <el-dropdown-item v-if="!scope.row.buildIn" v-has="'record_rule_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item v-if="!scope.row.buildIn" v-has="'record_rule_edit'" :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <el-dropdown-item v-if="!scope.row.buildIn" v-has="'record_rule_delete'" :command="['delete', scope.row]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
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
  <alertLabel
      v-if="alertLabelShow"
      :id="alertLabelId"
      :that="alertLabelObj"
      :type="alertLabelType"
      :alert-table-dialog="chartAlertList"
      @tipHover='tipHover'
    ></alertLabel>
  </div>
</template>

<script>
import table from '@/components/common/mixin/table'
import nzAlertTag from '../../../page/alert/nzAlertTag'
import alertLabelMixin from '@/components/common/mixin/alertLabelMixin'
// import { calcDurationByStringTimeB } from '@/components/common/js/tools'
// import { sameLabels } from '@/components/common/js/constants'
export default {
  name: 'recordRuleTable',
  components: {
    nzAlertTag
  },
  mixins: [table, alertLabelMixin],
  props: {
    loading: Boolean
  },
  data () {
    return {
      /* 表格相关 */
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        },
        {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true,
          minWidth: 150
        },
        {
          label: this.$t('overall.type'),
          prop: 'type',
          show: true,
          minWidth: 150
        },
        {
          label: this.$t('config.exprTemp.expression'),
          prop: 'expression',
          show: true,
          width: 300
        },
        {
          label: this.$t('config.assetLabel.interval'),
          prop: 'interval',
          show: true,
          width: 300
        },
        {
          label: this.$t('project.endpoint.labels2'),
          prop: 'labels',
          show: false,
          minWidth: 300,
          sortable: 'custom'
        },
        {
          label: this.$t('overall.remark'),
          prop: 'remark',
          show: true,
          width: 300
        },
        {
          label: this.$t('overall.state'),
          prop: 'state',
          show: true,
          width: 150
        }
      ]
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>
