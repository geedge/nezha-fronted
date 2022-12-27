<template>
  <el-table
    id="issueTable"
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
          <copy :copyData='scope.row.type' :showInfo='scope.row.type'>
              <template slot="copy-text">
                 {{scope.row.type ? scope.row.type : '-'}}
              </template>
            </copy>
        </template>
        <template v-else-if="item.prop === 'reporter'">
          <template>{{scope.row[item.prop] ? scope.row[item.prop].name : '-'}}</template>
        </template>
        <template v-else-if="item.prop === 'assignee'">
          <template>{{scope.row[item.prop] ? scope.row[item.prop].name : '-'}}</template>
        </template>
        <template v-else-if="item.prop === 'priority'">
           <div v-if="scope.row[item.prop] == 1">
            {{ $t('dashboard.panel.chartForm.high') }}
           </div>
           <div v-else-if="scope.row[item.prop] == 2">
            {{ $t('issue.middle') }}
           </div>
            <div v-else-if="scope.row[item.prop] == 3">
            {{ $t('issue.low') }}
           </div>
        </template>
        <template v-else-if="item.prop === 'state'">
           <div v-for="key in stateData" :key="key.id">
             <div v-if="scope.row[item.prop] === key.id">
              {{ key.value }}
             </div>
           </div>
        </template>
        <template v-else-if="item.prop === 'createUser'">
          <template>{{scope.row[item.prop] ? scope.row[item.prop].name : '-'}}</template>
        </template>
        <template v-else-if="item.prop === 'cts'">
          <template>{{scope.row[item.prop] ? utcTimeToTimezoneStr(scope.row[item.prop]) : '-'}}</template>
        </template>
        <template v-else-if="item.prop === 'updateUser'">
          <template>{{scope.row[item.prop] ? scope.row[item.prop].name : '-'}}</template>
        </template>
        <template v-else-if="item.prop === 'uts'">
          <template>{{scope.row[item.prop] ? utcTimeToTimezoneStr(scope.row[item.prop]) : '-'}}</template>
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
        <button class="table-operation-item" @click="showBottomBox('issue', scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" v-has="['record_rule_edit','record_rule_delete']" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
            <el-dropdown-item v-if="!scope.row.buildIn" v-has="'record_rule_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item v-if="!scope.row.buildIn" v-has="'record_rule_edit'" :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
            <!-- <el-dropdown-item v-if="!scope.row.buildIn" v-has="'record_rule_delete'" :command="['delete', scope.row]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item> -->
            <el-dropdown-item v-if="!scope.row.buildIn" v-has="'record_rule_delete'" :command="['delete', scope.row]" :class="'nz-el-dropdown-menu-item'">
                  <delete-button
                  ref="deleteButton"
                  :from="'issue'"
                  :forceDeleteShow="false"
                  id="issue-delete"
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
import copy from '@/components/common/copy'
import deleteButton from '@/components/common/deleteButton'
export default {
  name: 'issueTable',
  mixins: [table],
  components: {
    copy,
    deleteButton
  },

  props: {
    loading: Boolean
  },
  data () {
    return {
      /* 表格相关 */
      tableTitle: [
        {
          label: this.$t('asset.id'),
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        },
        {
          label: this.$t('project.topology.title'),
          prop: 'name',
          show: true,
          minWidth: 150,
          sortable: 'custom'
        },
        {
          label: this.$t('overall.type'),
          prop: 'type',
          show: true,
          minWidth: 150
        },
        {
          label: this.$t('issue.reporter'),
          prop: 'reporter',
          show: true,
          width: 300
        },
        {
          label: this.$t('issue.assignee'),
          prop: 'assignee',
          show: true,
          width: 300
        },
        {
          label: this.$t('alert.severity'),
          prop: 'priority',
          show: true,
          width: 300,
          sortable: 'custom'
        },
        {
          label: this.$t('overall.state'),
          prop: 'state',
          show: true,
          minWidth: 150,
          sortable: 'custom'
        },
        {
          label: this.$t('issue.createUser'),
          prop: 'createUser',
          show: false,
          width: 150
        },
        {
          label: this.$t('issue.createTime'),
          prop: 'cts',
          show: false,
          width: 300,
          sortable: 'custom'
        },
        {
          label: this.$t('config.mib.updateUser'),
          prop: 'updateUser',
          show: false,
          width: 150
        },
        {
          label: this.$t('alert.silence.upTime'),
          prop: 'uts',
          show: false,
          width: 300,
          sortable: 'custom'
        }
      ],
      stateData: [
        {
          id: 1,
          value: this.$t('issue.open')
        }, {
          id: 2,
          value: this.$t('issue.hasBeenAssigned')
        }, {
          id: 3,
          value: this.$t('issue.beingProcessed')
        }, {
          id: 4,
          value: this.$t('issue.hangUp')
        }, {
          id: 5,
          value: this.$t('issue.resolved')
        }, {
          id: 6,
          value: this.$t('overall.close')
        }, {
          id: 7,
          value: this.$t('overall.cancel')
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
