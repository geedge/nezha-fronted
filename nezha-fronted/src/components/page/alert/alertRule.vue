<template>
  <div>
    <nzDetailView
      v-my-loading="detailViewLoading || tools.loading"
      v-if="detailType !== 'list'"
      :api="url"
      ref="detailList"
      :layout="['searchInput', 'elementSet', 'pagination','detailViewSet']"
      :from="fromRoute.alertRule"
      :search-msg="searchMsg"
      :detailType="detailType"
      :detailViewRightObj="detailViewRightObj"
      :dataLength="tableData.length"
      @search="search"
      @changeDetailType="changeDetailType"
    >
      <template v-slot:top-tool-left>
        <!--        <detailViewTopSearch :selectValue.sync="selectValue" :detailSearchList="detailSearchList" @reload="reloadTable" />-->
      </template>
      <template v-slot:top-tool-right>
        <button id="asset-create-asset" v-has="'asset_add'" :title="$t('asset.createAsset')" class="top-tool-btn" @click.stop="add">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>
        <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="model"
          :params="searchLabel"
          :params2="searchCheckBox"
          :permissions="{import: 'alertRule_add', export: 'alertRule_edit'}"
          class="top-tool-export margin-l-10 margin-r-10"
          export-file-name="AlertRule"
          export-url="/alert/rule/export"
          import-url="/alert/rule/import"
          @afterImport="getTableData"
          v-has="['alertRule_add','alertRule_edit',]"
        >
        </top-tool-more-options>
      </template>
      <template v-slot:nz-detail-view-list>
        <alertRuleDetail
          class="data-detail"
          ref="dataDetail"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :detailViewRightObj="detailViewRightObj"
          :api="url"
          :table-data="tableData"
          @detailViewRightShow = 'detailViewRightShow'
          @orderDetail="orderDetail"
        >
        </alertRuleDetail>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <el-pagination
          @current-change="pageNo"
          :current-page.sync="pageObj.pageNo"
          :page-size="20"
          :total="pageObj.total"
          layout="prev, slot, next"
          small
        >
          <template>
            <el-input-number v-if="showInput" ref="jumpInput" v-model="pageObj.pageNo" :controls="false" :min="1" :max="pageObj.pages" class="jump-input" @change="getTableData" @keyup.enter.native="getTableData" size="mini"/>
            <span class="jump-pages">/&nbsp;{{pageObj.pages}}</span>
          </template>
        </el-pagination>
      </template>
    </nzDetailView>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.alertRule"
      :layout="['searchInput', 'elementSet', 'pagination','detailViewSet']"
      :search-msg="searchMsg"
      @search="search"
      :detailType="detailType"
      @changeDetailType="changeDetailType"
      @getTableData="getTableData"
    >
      <template v-slot:top-tool-right>
        <button id="alert-add" v-has="'alertRule_add'" :title="$t('overall.createAlertRule')" class="top-tool-btn"  @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="alert-rule"
          :params="searchLabel"
          :permissions="{import: 'alertRule_add', export: 'alertRule_edit'}"
          class="top-tool-export margin-l-10 margin-r-10"
          export-file-name="AlertRule"
          export-url="/alert/rule/export"
          import-url="/alert/rule/import"
          @afterImport="getTableData"
          v-has="['alertRule_add','alertRule_edit','alertRule_delete']"
        >
          <template v-slot:before>
            <div>
              <el-dropdown-item :disabled="batchDeleteObjs.length==0" :class="'nz-el-dropdown-menu-item'">
                <delete-button
                  ref="deleteButton"
                  :single="false"
                  :from="'alertRule'"
                  :forceDeleteShow="false"
                  :deleteTitle="'alert.alertRule'"
                  :type="'link'"
                  :title="$t('overall.batchDel')"
                  id="alert-rule-batch-delete"
                  v-has="'alertRule_delete'"
                  :api="url"
                  :delete-objs="batchDeleteObjs"
                  @after="getTableData"
                  @before="delFlag=true"
                ></delete-button>
              </el-dropdown-item>
            </div>
          </template>
        </top-tool-more-options>
      </template>
      <template v-slot:default="slotProps">
        <alert-rule-table
          ref="dataTable"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @copy="copy"
          @orderBy="tableDataSort"
          @queryMessage="queryMessage"
          @reload="getTableData"
          @addSilence="addSilence"
          @statusChange='statusChange'
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
import alertRuleBox from '@/components/common/rightBox/alertRuleBox'
import deleteButton from '@/components/common/deleteButton'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import alertRuleTable from '@/components/common/table/alert/alertRuleTable'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import alertSilenceBox from '@/components/common/rightBox/alertSilenceBox'
import nzDetailView from '@/components/common/detailView/nzDetailView'
import detailViewMixin from '@/components/common/mixin/detailViewMixin'
import alertRuleDetail from '@/components/common/detailView/list/alertRule/alertRuleDetail'
import detailViewTopSearch from '@/components/common/detailView/detailViewTopSearch'
import routerPathParams from '@/components/common/mixin/routerPathParams'

export default {
  name: 'alertRule',
  components: {
    deleteButton,
    alertRuleBox,
    alertRuleTable,
    nzDataList,
    topToolMoreOptions,
    alertSilenceBox,
    nzDetailView,
    alertRuleDetail,
    detailViewTopSearch
  },
  mixins: [dataListMixin, detailViewMixin, routerPathParams],
  data () {
    return {
      url: 'alert/rule',
      tableId: 'alertRuleTable', // 需要分页的table的id，用于记录每页数量
      orderBy: 'id',
      searchLabel: {},
      blankObject: {
        id: '',
        alertName: '',
        linkObject: { id: '', name: '' },
        expr: '',
        inr: 15,
        state: 1,
        type: 1,
        unit: 2,
        operator: '>',
        last: 60,
        // severityId: '',
        summary: '',
        description: '',
        method: [],
        name: '',
        // threshold: '',
        receiver: [],
        // autoExpired: 1,
        schedEnable: 0,
        schedDays: '',
        schedStime: '00:00',
        schedEtime: '23:59',
        notifyActive: 0,
        notifyExpired: 0,
        timeout: 300,
        trbShot: '',
        condition: []
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
        searchLabelList: [
          {
            id: 1,
            name: 'ID',
            type: 'input',
            label: 'ids',
            disabled: false
          },
          {
            id: 2,
            name: this.$t('alert.alertName'),
            type: 'input',
            label: 'name',
            disabled: false
          },
          // {
          //   id: 4,
          //   name: this.$t('alert.severity'),
          //   type: 'severity',
          //   label: 'severityIds',
          //   readonly: true,
          //   disabled: false
          // },
          {
            id: 5,
            name: this.$t('overall.type'),
            type: 'alertTypes',
            label: 'type',
            readonly: true,
            disabled: false
          }
        ]
      },
      searchTime: bus.getTimezontDateRange(),
      needAlertDaysData: true,
      trendKey: 'ruleId'
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
      if (this.orderBy) {
        this.$set(this.searchLabel, 'orderBy', this.orderBy)
      } else {
        delete this.searchLabel.orderBy
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      const param = {
        ...this.searchLabel
      }
      const path = this.fromRoute.alertRule
      this.updatePath(param, path)
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
          if (this.needAlertDaysData) {
            response.data.list.forEach(item => {
              item.trendLoading = true
              item.left = 0
              item.top = 0
              item.alertNumtooltipShow = false
              item.alertDaysData = [
                {
                  metric: { priority: 'P1' },
                  values: [[0, 0]]
                },
                {
                  metric: { priority: 'P2' },
                  values: [[0, 0]]
                },
                {
                  metric: { priority: 'P3' },
                  values: [[0, 0]]
                }
              ]
            })
          }
          this.tableData = response.data.list
          const globalSearchId = this.$store.getters.getGlobalSearchId
          let detailViewRightObj = ''
          if (globalSearchId) {
            detailViewRightObj = this.tableData.find(item => item.id === globalSearchId)
          } else {
            detailViewRightObj = this.tableData[0]
          }
          this.detailViewRightObj = this.$loadsh.cloneDeep(detailViewRightObj)
          this.pageObj.total = response.data.total
          this.pageObj.pages = response.data.pages
          if (!this.scrollbarWrap && this.$refs.dataTable && this.$refs.dataTable.$refs.dataTable) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    },
    statusChange (alertRule) {
      const params = { ...alertRule, severity: null }
      this.$put(this.url, params).then(response => {
        if (response.code === 200) {
          this.rightBox.show = false
          this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
        } else {
          this.$message.error(response.msg)
        }
        this.getTableData()
      })
    },
    edit (u, copyFlag) {
      this.$get(`${this.url}/${u.id}`).then(response => {
        if (response.code === 200) {
          this.object = {
            ...response.data,
            expr: response.data.expr,
            method: response.data.method ? response.data.method.split(',').map(item => Number(item)) : [],
            schedDays: response.data.schedDays ? response.data.schedDays.split(',').map(item => Number(item)) : [],
            receiverShow: response.data.receiver ? response.data.receiver.split(',').map(item => Number(item)) : []
          }
          if (this.object.inr == 0) {
            this.object.inr = undefined
          }
          if (copyFlag) {
            this.object.id = ''
            this.object.name = this.object.name + '-copy'
            if (this.object.name.length > 64) {
              const length = this.object.name.length - 64
              this.object.name = u.name.substring(0, u.name.length - length) + '-copy'
            }
          }
          this.rightBox.show = true
        }
      })
    },
    copy (u) {
      this.edit(u, true)
    }
  },
  created () {
    const searchKeys = {
      // key: path 键
      // value: vue set 参数
      pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
      pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
      orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
      ids: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'ids',
        type: 'string',
        defaultJson: {
          disabled: false,
          id: 1,
          label: 'ids',
          name: 'ID',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      },
      // severityIds: {
      //   target: this.searchLabel,
      //   isSearchInput: true,
      //   propertyName: 'severityIds',
      //   type: 'string',
      //   defaultJson: {
      //     disabled: false,
      //     id: 4,
      //     label: 'severityIds',
      //     name: 'Priority',
      //     readonly: true,
      //     type: 'severity',
      //     val: '',
      //     valnum: '',
      //     valString: '',
      //     listStr: 'severitySelect'
      //   },
      //   jsonKey: 'valnum'
      // },
      type: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'type',
        type: 'number',
        defaultJson: {
          name: 'Type',
          id: 5,
          type: 'alertTypes',
          label: 'type',
          disabled: false,
          readonly: true,
          val: '',
          valnum: '',
          listStr: 'alertTypesSelect'
        },
        jsonKey: 'valnum'
      },
      name: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'name',
        type: 'string',
        defaultJson: {
          disabled: false,
          id: 2,
          label: 'name',
          name: 'Name',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      }
    }
    this.initQueryFromPath(searchKeys)
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
            const newQuery = JSON.parse(JSON.stringify(this.$route.query)) // 深拷贝
            delete newQuery.add
            this.$router.replace({ query: newQuery })
          }
        }
      }
    }
  }
}
</script>
