<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.alertRule"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="alert-add" v-has="'alertRule_add'" :title="$t('overall.createAlertRule')" class="top-tool-btn"
                @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <top-tool-more-options
          ref="export"
          id="alert-rule"
          :params="searchLabel"
          :permissions="{import: 'alertRule_add', export: 'alertRule_view'}"
          class="top-tool-export margin-l-10 margin-r-10"
          export-file-name="AlertRule"
          export-url="/alert/rule/export"
          import-url="/alert/rule/import"
          @afterImport="getTableData"
        >
          <template v-slot:before>
            <div>
              <el-dropdown-item>
                <delete-button :type="'link'" :title="$t('overall.batchDel')" id="alert-rule-batch-delete" v-has="'alertRule_delete'" :api="url" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
              </el-dropdown-item>
            </div>
          </template>
        </top-tool-more-options>
      </template>
      <template v-slot:default="slotProps">
        <alert-rule-table
          ref="dataTable"
          v-loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @queryMessage="queryMessage"
          @reload="getTableData"
          @addSilence="addSilence"
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
    <transition name="right-box"><alert-silence-box v-if='silenceBoxShow' :alert-silence="objectSilence" @close="closeSilenceBox"></alert-silence-box>
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
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import alertSilenceBox from '@/components/common/rightBox/alertSilenceBox'

export default {
  name: 'alert-config',
  components: {
    deleteButton,
    alertRuleBox,
    alertRuleTable,
    nzDataList,
    'export-excel': exportXLSX,
    topToolMoreOptions,
    alertSilenceBox
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
        severityId: '',
        summary: '',
        description: '',
        method: []
      },
      blankSilenceObject: {
        id: '',
        startAt: '',
        endAt: '',
        ruleId: '',
        type: 'asset',
        linkId: '',
        remark: '',
        time: [],
        matchers: [
          { name: '', value: '', regex: 0 }
        ],
        name: ''
      },
      objectSilence: {},
      silenceBoxShow: false,
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 1,
          name: 'ID',
          type: 'input',
          label: 'ids',
          disabled: false
        }, {
          id: 2,
          name: this.$t('alert.alertName'),
          type: 'input',
          label: 'name',
          disabled: false
        }, {
          id: 4,
          name: this.$t('alert.severity'),
          type: 'severity',
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
      this.$refs.dataList.showBottomBox('alertRuleAlertMessage', alertRule)
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
    edit (u) {
      this.$get(`${this.url}/${u.id}`).then(response => {
        if (response.code === 200) {
          this.object = {
            ...response.data,
            method: response.data.method ? response.data.method.split(',').map(item => Number(item)) : [],
            receiverShow: response.data.receiver ? response.data.receiver.split(',').map(item => Number(item)) : []
          }
          this.rightBox.show = true
        }
      })
    }
  },
  mounted () {
  },
  watch: {
    $route: {
      immediate: true,
      handler () {
        const add = this.$route.query.add
        if (add) {
          if (add === 'alertRule') {
            this.add()
          }
        }
      }
    }
  }
}
</script>
