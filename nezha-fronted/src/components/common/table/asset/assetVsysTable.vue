<template>
  <el-table
    id="assetVsysTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    tooltip-effect="light"
    border
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="selectionChange"
    @row-dblclick="(row)=>{queryMessage(row)}"
  >
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
      :show-overflow-tooltip="item.prop === 'description'"
      class="data-column"
    >
      <template slot="header">
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <template v-if="item.prop === 'vsysId'">
          {{scope.row.delFlag == 1 ? '-' + scope.row[item.prop] : scope.row[item.prop]}}
        </template>
        <template v-else-if="item.prop === 'uts'">
           {{scope.row[item.prop] ? momentTz(scope.row[item.prop]) : '-'}}
        </template>
        <template v-else-if="item.prop === 'state'">
          <div :class="{'active-icon green-bg':scope.row.state == 1,'active-icon red-bg':scope.row.state == 0}" style="position: relative"></div>
          {{scope.row.state === 1 ? $t('overall.result.success') : $t('overall.result.failed')}}
        </template>
        <template v-else-if="item.prop === 'vsysInfo'">
          <span
                @mouseenter="labelHover1(scope.row, item.prop, true, $event)"
                @mouseleave="labelHover1(scope.row, item.prop, false, $event, true)">
                <span v-if="scope.row[item.prop]" class="configs-endpoint">{ ... }</span>
                <span v-else style="padding-left:7px">-</span>
          </span>
            <nz-tooltip :that="scope.row[item.prop]" class="data-column__" v-if="scope.row[item.prop] && scope.row[item.prop].loading" :type="item.prop">
              <div name="default">
                <span class="copy-value-content" style="margin-right: 10px" :title="$t('overall.duplicate')"> <i class="nz-icon nz-icon-override" @click='copyValue(scope.row[item.prop])'></i></span>
                <pre class="copy-value-content__pre">{{`{
    "deviceTag": "${scope.row[item.prop].deviceTag || ''}",
    "params": "${scope.row[item.prop].params || ''}"
}`}}</pre>
              </div>
            </nz-tooltip>
        </template>
        <template v-else-if="item.prop === 'vsysResult'">
          <div :title="scope.row[item.prop] && scope.row[item.prop].msg ? scope.row[item.prop].msg : '-'">
            <copy :copyData='scope.row[item.prop] && scope.row[item.prop].msg ? scope.row[item.prop].msg : ""' :showInfo='scope.row[item.prop] && scope.row[item.prop].msg'>
              <template slot="copy-text">
                 {{scope.row[item.prop] && scope.row[item.prop].msg ? scope.row[item.prop].msg : '-'}}
              </template>
            </copy>
          </div>
        </template>
        <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
        <template v-else>-</template>
      </template>
    </el-table-column>
    <template slot="empty">
      <div  v-if="!loading"  class="table-no-data">
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
import copy from '@/components/common/copy'
import table from '@/components/common/mixin/table'
import nzTooltip from '@/components/common/alert/nzTooltip'
export default {
  name: 'assetVsysTable',
  mixins: [table],
  props: {
    loading: Boolean
  },
  components: {
    nzTooltip,
    copy
  },
  data () {
    return {
      tableTitle: [
        {
          label: this.$t('asset.vsysId'),
          prop: 'vsysId',
          show: true,
          minWidth: 120
        },
        {
          label: this.$t('overall.state'),
          prop: 'state',
          show: true,
          minWidth: 120
        }, {
          label: this.$t('project.module.configs'),
          prop: 'vsysInfo',
          show: false,
          minWidth: 120
        }, {
          label: this.$t('alert.alertRuleMessage'),
          prop: 'vsysResult',
          show: false,
          minWidth: 120
        }, {
          label: this.$t('overall.time'),
          prop: 'uts',
          show: true,
          minWidth: 120
        }
      ]
    }
  },
  methods: {
    // label 鼠标划入
    labelHover1 (item, type, loading, e, slow) {
      if (item[type] != null) {
        if (e) {
          const dom = e.currentTarget
          const position = dom ? dom.getBoundingClientRect() : ''
          this.$set(item[type], 'position', position)
        }
        if (slow) {
          item[type].timeout = setTimeout(() => {
            this.$set(item[type], 'loading', loading)
          }, 200)
        } else {
          if (item[type].timeout) {
            clearTimeout(item[type].timeout)
            item[type].timeout = null
          }
          this.$set(item[type], 'loading', loading)
        }
      }
      // this.$set(this.tableData,index,item);// 调用父组件
    },
    copyValue (item) {
      const str = `{
    "deviceTag": "${item.deviceTag || ''}",
    "params": "${item.params || ''}"
}`
      const domUrl = document.createElement('input')
      domUrl.value = JSON.stringify(str)
      domUrl.id = 'creatDom'
      document.body.appendChild(domUrl)
      domUrl.select() // 选择对象
      document.execCommand('Copy') // 执行浏览器复制命令
      const creatDom = document.getElementById('creatDom')
      creatDom.parentNode.removeChild(creatDom)
      this.$message.success(this.$t('overall.copySuccess'))
    }
  }
}
</script>
<style>
#assetVsysTable .document-copy-text{
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
#assetVsysTable .endpoint-cell-left{
  margin-right: 5px;
}
#assetVsysTable .configs-endpoint{
  padding: 0 7px;
  cursor: pointer;
  color: #3C92F1;
}
#assetVsysTable .copy-value-content__pre {
  width: 400px;
  margin-top: 20px;
  overflow-y: scroll;
  overflow-x: scroll;
}
</style>
