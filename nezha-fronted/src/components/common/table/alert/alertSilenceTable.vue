<template>
  <el-table
    id="alertSilenceTable"
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
        <span class="data-column__span">{{ item.label }}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <template v-if="item.prop === 'duration'">
          <el-tooltip
            :disabled="!scope.row.endAt"
            effect="light"
            placement="right"
          >
            <div slot="content">
              {{ $t("overall.endTime") }}<br />
              {{ utcTimeToTimezoneStr(scope.row.endAt) }}
            </div>
            <span>{{ getDuration(scope.row) }}</span>
          </el-tooltip>
        </template>
        <template v-else-if="item.prop === 'alertNum'">
          <span
            class="num-cursor"
            @click="$emit('showBottomBox', 'alertMessageTab', scope.row)"
          >
            <i
              :class="scope.row.alertNum > 0 ? 'gray' : 'green'"
              class="nz-icon nz-icon-overview-alert vertical-align-top;"
              @mouseenter="tooltipHover(scope.row, true, $event)"
              @mouseleave="tooltipHover(scope.row, false, $event)"
            ></i
            ><span>{{ scope.row.alerts }}</span>
          </span>
        </template>
        <template v-else-if="item.prop === 'matchers'">
          <span v-for="(item1, i) in labelsSort(scope.row.matchers)" :key="i">
            <span>
              <nz-alert-tag
                :key="i"
                :cursor-point="tagType(item1.name) !== 'info'"
                :label="item1.name"
                :type="tagType(item1.name)"
                :regex="item1.regex"
                style="margin: 5px 0 5px 5px"
              >
                {{ item1.value }}
              </nz-alert-tag>
            </span>
          </span>
        </template>
        <template v-else-if="item.prop === 'state'">
          <span v-if="scope.row.state === 1">
             <div class="active-icon green-bg inline-block"></div>
            {{$t('silence.active')}}</span>
          <span v-if="scope.row.state === 2">
            <div class="active-icon bgFFECD9 inline-block"></div>
            {{$t('silence.pending')}}</span>
          <span v-if="scope.row.state === 3">
            <div class="active-icon gray-bg inline-block"></div>
            {{$t('silence.expired')}}</span>
        </template>
        <template v-else-if="item.prop === 'utime'">
          {{ utcTimeToTimezoneStr(scope.row[item.prop]) }}
        </template>
        <template v-else-if="item.prop === 'startAt'">
          {{ utcTimeToTimezoneStr(scope.row[item.prop]) }}
        </template>
        <template v-else-if="item.prop === 'name'">
          <copy :copyData='scope.row[item.prop]' :showInfo='scope.row[item.prop]'>
                  <template slot="copy-text">
                     {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
                  </template>
              </copy>
        </template>
        <span v-else-if="scope.row[item.prop]" :class="item.prop === 'remark'? 'el-table-remark':''">{{
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
        <!--        <button :class="{'table-operation-item&#45;&#45;disable': scope.row.state === 3}" class="table-operation-item" v-has="'alertSilence_edit'" @click="$emit('edit', scope.row)" :disabled="scope.row.state === 3"><i class="nz-icon nz-icon-edit"></i></button>-->
        <button
          class="table-operation-item"
          :title="$t('overall.view')"
          @click="$emit('showBottomBox', 'alertMessageTab', scope.row)"
        >
          <i class="nz-icon nz-icon-view1"></i>
        </button>
        <el-dropdown
          size="medium"
          v-has="['alertSilence_expire', 'alertSilence_edit']"
          trigger="click"
          @command="tableOperation"
        >
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu
            slot="dropdown"
            class="right-box-select-top right-public-box-dropdown-top"
          >
            <el-dropdown-item
              :command="['edit', scope.row]"
              :class="{
                'table-operation-item--disable': scope.row.state === 3,
              }"
              class="table-operation-item"
              v-has="'alertSilence_edit'"
              :disabled="scope.row.state === 3"
              ><i class="nz-icon nz-icon-edit"></i
              ><span class="operation-dropdown-text">{{
                $t("overall.edit")
              }}</span></el-dropdown-item
            >
            <el-dropdown-item
              v-has="'alertSilence_edit'"
              :command="['copy', scope.row]"
              ><i class="nz-icon nz-icon-override"></i
              ><span class="operation-dropdown-text">{{
                $t("overall.duplicate")
              }}</span></el-dropdown-item
            >
             <el-dropdown-item v-has="'alertSilence_expire'" :command="['delete-rel', scope.row, {forceDeleteShow:false, single:true, deleteTitle:'overall.silence'}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
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
import { calcDurationByStringTimeB } from '@/components/common/js/tools'
import nzAlertTag from '../../../page/alert/nzAlertTag'
import { sameLabels } from '@/components/common/js/constants'
import copy from '@/components/common/copy'
export default {
  name: 'alertSilenceTable',
  components: {
    nzAlertTag,
    copy
  },
  mixins: [table],
  props: {
    loading: Boolean,
    nowTime: {}
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
          label: this.$t('alert.silence.matchers'),
          prop: 'matchers',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        },
        {
          label: this.$t('overall.startTime'),
          prop: 'startAt',
          show: true,
          width: 300,
          sortable: 'custom'
        },
        {
          label: this.$t('config.terminallog.duration'),
          prop: 'duration',
          show: true,
          width: 120
        },
        {
          label: this.$t('overall.remark'),
          prop: 'remark',
          show: true,
          width: 120
        },
        {
          label: this.$t('alert.silence.upTime'),
          prop: 'utime',
          show: false,
          width: 300
        },
        {
          label: this.$t('overall.alert'),
          prop: 'alertNum',
          show: false,
          width: 120,
          sortable: 'custom'
        },
        {
          label: this.$t('overall.state'),
          prop: 'state',
          show: true,
          width: 120
        }
      ]
    }
  },
  computed: {
    getDuration () {
      return function (record) {
        if (record.endAt) {
          return calcDurationByStringTimeB(record.startAt, record.endAt)
        }
        return calcDurationByStringTimeB(
          record.startAt,
          this.utcTimeToTimezoneStr(this.nowTime)
        )
      }
    },
    tagType () {
      return (key) => {
        if (sameLabels.find((item) => item === key)) {
          return 'normal'
        } else {
          return 'info'
        }
      }
    }
  },
  methods: {
    labelsSort (obj) {
      obj = obj || []
      const buildIn = sameLabels
      if (typeof obj === 'string') obj = JSON.parse(obj)
      const labels = JSON.parse(JSON.stringify(obj))
      const result = []
      const result2 = []
      for (const key of buildIn) {
        labels.forEach((item) => {
          if (item.name === key) {
            result.push(item)
          }
        })
      }
      labels.forEach((item) => {
        if (buildIn.indexOf(item.name) === -1) {
          result2.push(item)
        }
      })
      // console.log([...result, ...result2])
      return [...result, ...result2]
    }
  }
}
</script>
