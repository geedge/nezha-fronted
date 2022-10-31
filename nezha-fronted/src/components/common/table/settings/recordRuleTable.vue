<template>
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
           <copy :copyData='scope.row.name' :showInfo='scope.row.name'>
              <template slot="copy-text">
                 {{scope.row.name ? scope.row.name : '-'}}
              </template>
            </copy>
        </template>
        <template v-else-if="item.prop === 'type'">
          <template v-if="scope.row[item.prop]">
            <template v-if="scope.row[item.prop] === 1">{{$t('overall.metrics')}}</template>
            <template v-if="scope.row[item.prop] === 2">{{$t('overall.logs')}}</template>
          </template>
          <template v-else>{{"-"}}</template>
        </template>
        <template v-else-if="item.prop === 'expr'">
            <copy :copyData='scope.row[item.prop]' :showInfo='scope.row[item.prop]'>
              <template slot="copy-text">
                 {{scope.row[item.prop] ? scope.row[item.prop] : '-'}}
              </template>
            </copy>
        </template>
        <template v-else-if="item.prop === 'inr'">
          <template>{{scope.row[item.prop] ? scope.row[item.prop] : '-'}}</template>
        </template>

        <template v-else-if="item.prop === 'labels'">
          <span v-for="(item1, i) in labelsSort(scope.row.labels)" :key="i">
            <span>
              <!-- <nz-alert-tag
                :key="i"
                :cursor-point="tagType(item1.label) !== 'info'"
                :label="item1.label"
                :type="tagType(item1.label)"
                :regex="item1.regex"
                style="margin: 5px 0 5px 5px">
                {{ item1.value }}
              </nz-alert-tag> -->
              <nz-alert-tag
                :key="i"
                :cursor-point="false"
                :type="'info'"
                :label="item1.label"
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
           <div v-if="scope.row[item.prop] == '1'">
            <div class="active-icon green-bg inline-block"></div>
            {{ $t('overall.enabled') }}
          </div>
          <div v-else-if="scope.row[item.prop] == '0'">
            <div class="active-icon gray-bg inline-block"></div>
            {{ $t('overall.disabled') }}
          </div>
        </template>
        <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
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
            <el-dropdown-item v-if="!scope.row.buildIn" v-has="'record_rule_edit'" :command="['copy', scope.row, {copyName: '_copy'}]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <!-- <el-dropdown-item v-if="!scope.row.buildIn" v-has="'record_rule_delete'" :command="['delete', scope.row]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item> -->
            <el-dropdown-item v-if="!scope.row.buildIn" v-has="'record_rule_delete'" :command="['delete', scope.row]">
                  <delete-button
                  ref="deleteButton"
                  :from="'recordRule'"
                  :forceDeleteShow="false"
                  :type="'link'"
                  :title="$t('overall.delete')"
                  id="record-rule-delete"
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
import lodash from 'lodash'
import copy from '@/components/common/copy'
import table from '@/components/common/mixin/table'
import nzAlertTag from '../../../page/alert/nzAlertTag'
import deleteButton from '@/components/common/deleteButton'
export default {
  name: 'recordRuleTable',
  components: {
    nzAlertTag,
    copy,
    deleteButton
  },
  mixins: [table],
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
          minWidth: 150,
          sortable: 'custom'
        },
        {
          label: this.$t('overall.type'),
          prop: 'type',
          show: true,
          minWidth: 150,
          sortable: 'custom'
        },
        {
          label: this.$t('config.exprTemp.expression'),
          prop: 'expr',
          show: true,
          width: 300
        },
        {
          label: this.$t('config.assetLabel.interval'),
          prop: 'inr',
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
          width: 150,
          sortable: 'custom'
        }
      ]
    }
  },
  methods: {
    labelsSort (obj) {
      if (typeof obj != 'object') {
        const labels = JSON.parse(lodash.cloneDeep(obj))
        const result = []
        for (const key in labels) {
          result.push({ label: key, value: labels[key] })
        }
        return result
      }
      return obj
    }
  }
}
</script>
