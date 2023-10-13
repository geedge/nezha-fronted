<template>
  <div style="height: 100%">
    <el-table
      id="roleTable"
      ref="dataTable"
      :data="tableData"
      :height="height"
      border
      :default-sort="orderBy"
      class="no-operation"
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
        :sortable="item.sortable"
        :sort-orders="['ascending', 'descending']"
        :width="`${item.width}`"
        class="data-column"
      >
        <template slot="header">
          <span class="data-column__span">{{item.label}}</span>
          <div class="col-resize-area"></div>
        </template>
        <template slot-scope="scope" :column="item">
        <span v-if="item.prop === 'time'">{{scope.row[item.prop]}} ms</span>
          <span v-else-if="item.prop === 'username'">{{formatUsername(scope.row)}}</span>
          <span v-else-if="item.prop === 'createDate'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
          <span
            v-else-if="item.prop === 'response'"
            @mouseenter="labelHover(scope.row, 'response', true, false, $event)"
            @mouseleave="labelHover(scope.row, 'response', false, false)"
          >
          <div class="text-ellipsis" style="width: 100%">
            {{scope.row[item.prop]}}
          </div>
        </span>
          <span
            v-else-if="item.prop === 'params'"
            @mouseenter="labelHover(scope.row, 'params', true, false, $event)"
            @mouseleave="labelHover(scope.row, 'params', false, false)"
          >
          <div class="text-ellipsis" style="width: 100%">
            {{scope.row[item.prop]}}
          </div>
        </span>
          <span v-else-if="item.prop === 'operation'">{{formatOperation(scope.row)}}</span>
          <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
          <span v-else>-</span>
        </template>
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
    <nzTooltip
      v-if="alertLabelShow"
      :id="alertLabelId"
      :that="alertLabelObj"
      :width="200"
      :type="alertLabelType"
      @tipHover='tipHover'
      ref="nzTooltip"
      class="data-column__"
    >
      <div style="word-break: break-all">
        <div name="default">
          <span class="copy-value-content" :title="$t('overall.duplicate')"> <i class="nz-icon nz-icon-override" @click="copyValue(alertLabelObj[alertLabelType])"></i></span>
          <pre class="copy-value-content__pre">{{JSON.stringify(JSON.parse(alertLabelObj[alertLabelType]),null,2)}}</pre>
        </div>
      </div>
    </nzTooltip>
  </div>
</template>

<script>
import table from '@/components/common/mixin/table'
import alertLabelMixin from '@/components/common/mixin/alertLabelMixin'
import searchSelectMixin from '@/components/common/searchSelectInfo'
export default {
  name: 'operationLog',
  mixins: [table, alertLabelMixin, searchSelectMixin],
  props: {
    loading: Boolean
  },
  data () {
    return {
      tableTitle: [
        {
          label: this.$t('asset.id'),
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        }, {
          label: this.$t('config.operationlog.username'),
          prop: 'username',
          show: true,
          minWidth: 80,
          sortable: 'custom'
        },
        {
          label: this.$t('config.operationlog.ip'),
          prop: 'ip',
          show: true,
          minWidth: 80
        },
        {
          label: this.$t('overall.option'),
          prop: 'operation',
          show: true,
          minWidth: 140,
          sortable: 'custom'
        },
        {
          label: this.$t('overall.type'),
          prop: 'type',
          show: true,
          minWidth: 80,
          sortable: 'custom'
        },
        {
          label: this.$t('config.operationlog.state'),
          prop: 'state',
          show: true,
          minWidth: 80
        },
        // {
        //   label: this.$t('config.user.userId'),
        //   prop: 'userId',
        //   show: false,
        // },
        {
          label: this.$t('config.operationlog.operaId'),
          prop: 'operaId',
          show: false,
          minWidth: 140
        },
        {
          label: this.$t('config.operationlog.createDate'),
          prop: 'createDate',
          show: true,
          minWidth: 80
        },
        {
          label: this.$t('config.operationlog.time'),
          prop: 'time',
          show: false,
          minWidth: 80
        },
        {
          label: this.$t('config.operationlog.params'),
          prop: 'params',
          show: false,
          ShowOverflowTooltip: true,
          minWidth: 100
        },
        {
          label: this.$t('config.operationlog.response'),
          prop: 'response',
          show: false,
          ShowOverflowTooltip: true,
          minWidth: 140
        }
      ]
    }
  },
  methods: {
    formatUsername (row) {
      if (row.username) {
        return row.username
      } else if (row.operation === 'login' && !row.username) { // 如果是登录 且登录失败
        return JSON.parse(row.params).username
      } else {
        return '-'
      }
    },
    formatOperation (row) {
      const findItem = this.searchSelectInfo.operation.find(item => item.value === row.operation)
      if (findItem) {
        return findItem.label
      } else {
        return '-'
      }
    },
    copyValue (item) {
      const str = JSON.stringify(JSON.parse(item), null, 2)
      // const domUrl = document.createElement('input')
      // domUrl.value = JSON.stringify(str)
      // domUrl.id = 'creatDom'
      // document.body.appendChild(domUrl)
      // domUrl.select() // 选择对象
      // document.execCommand('Copy') // 执行浏览器复制命令
      // const creatDom = document.getElementById('creatDom')
      // creatDom.parentNode.removeChild(creatDom)
      // this.$message.success(this.$t('overall.copySuccess'))
      this.$copyText(str).then(() => {
        this.$message.success({ message: this.$t('overall.copySuccess') })
      })
    }
  }
}
</script>
