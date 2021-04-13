<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.alertRule"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg">
      <template v-slot:top-tool-right>
        <export-excel
          id="alert-rule"
          :params="searchLabel"
          :permissions="{import: 'rule_import', export: 'rule_export'}"
          export-file-name="AlertRule"
          export-url="/alert/rule/export"
          import-url="/alert/rule/import"
          @afterImport="getTableData"
        >
          <template slot="optionZone">
            <button id="alert-add" v-has="'alertRule_add'" :title="$t('overall.createAlertRule')" class="top-tool-btn margin-r-10"
                    @click="add">
              <i class="nz-icon-create-square nz-icon"></i>
            </button>
          </template>
        </export-excel>
        <delete-button id="alert-rule-batch-delete" v-has="'alertRule_delete'" :api="url" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <alert-rule-table
          ref="dataTable"
          v-loading="slotProps.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @queryMessage="queryMessage"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></alert-rule-table>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <alert-rule-box v-if="rightBox.show" ref="alertConfigBox" :alert-rule="object" @close="closeRightBox"></alert-rule-box>
    </transition>
  </div>
</template>
<script>
import bus from '@/libs/bus'
import exportXLSX from '@/components/common/exportXLSX'
import alertRuleBox from '@/components/common/rightBox/alertRuleBox'
import deleteButton from '@/components/common/deleteButton'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import alertRuleTable from '@/components/common/table/alert/alertRuleTable'
export default {
  name: 'alert-config',
  components: {
    deleteButton,
    alertRuleBox,
    alertRuleTable,
    nzDataList,
    'export-excel': exportXLSX
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'alert/rule',
      tableId: 'alertRuleTable', // 需要分页的table的id，用于记录每页数量
      blankObject: {
        id: '',
        alertName: '',
        linkObject: { id: '', name: '' },
        expr: '',
        unit: 2,
        operator: '>',
        last: 60,
        severity: 'P2',
        summary: '',
        description: ''
      },
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 1,
          name: 'ID',
          type: 'input',
          label: 'id',
          disabled: false
        }, {
          id: 2,
          name: this.$t('alert.alertName'),
          type: 'input',
          label: 'alertName',
          disabled: false
        }, {
          id: 4,
          name: this.$t('alert.severity'),
          type: 'selectString',
          label: 'severity',
          disabled: false
        }]
      },
      searchTime: bus.getTimezontDateRange()
    }
  },
  methods: {
    queryMessage (alertRule) {
      if (!this.hasButton('alertMessage_view')) {
        return
      }
      this.$refs.dataList.showBottomBox('alertMessage', alertRule)
    },
    getTableData () {
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      this.$get(this.url, this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          response.data.list.forEach(item => {
            let temp = []
            if (item.receiver) {
              temp = item.receiver.split(',').map(t => {
                return parseInt(t)
              })
            }
            item.receiverShow = temp
          })
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
          if (!this.scrollbarWrap) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    },
    initEvent () {
      bus.$on('alert-rule-list-change', () => {
        this.getTableData()
      })
      bus.$on('dc-list-change', () => {
        this.getTableData()
      })
      bus.$on('alert-message-change', () => {
        this.getTableData()
      })
    }
  },
  beforeDestroy () {
    bus.$off('alert-rule-list-change')
    bus.$off('dc-list-change')
    bus.$off('alert-message-change')
  },
  mounted () {
    this.initEvent()
  }
}
</script>
