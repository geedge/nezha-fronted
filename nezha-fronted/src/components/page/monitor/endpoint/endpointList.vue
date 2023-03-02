<template>
  <div>
    <nzDetailView
      v-my-loading="detailViewLoading || tools.loading"
      v-if="detailType !== 'list'"
      :api="url"
      ref="detailList"
      :layout="dataListLayout"
      :from="fromRoute.endpoint"
      :search-msg="searchMsg"
      :detailType="detailType"
      :detailViewRightObj="detailViewRightObj"
      :dataLength="tableData.length"
      @search="search"
      @changeDetailType="changeDetailType"
    >
      <template v-slot:top-tool-left>
        <detailViewTopSearch :selectValue.sync="selectValue" :detailSearchList="detailSearchList" @reload="reloadTable" />
      </template>
      <template v-slot:top-tool-right>
        <button id="asset-create-asset" v-has="'monitor_endpoint_add'" :title="$t('asset.createAsset')" class="top-tool-btn" @click.stop="add">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>
       <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="model"
          :params="searchLabel"
          :params2="searchCheckBox"
          :permissions="{import: 'monitor_endpoint_add', export: 'monitor_module_edit'}"
          class="top-tool-export margin-l-10 margin-r-10"
          export-file-name="endpoint"
          export-url="/monitor/endpoint/export"
          import-url="/monitor/endpoint/import"
          @afterImport="getTableData"
          v-has="['monitor_endpoint_add','monitor_endpoint_edit']"
        >
        </top-tool-more-options>
      </template>
      <template v-slot:nz-detail-view-list>
        <endpoint-detail
          class="data-detail"
          ref="dataDetail"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :detailViewRightObj="detailViewRightObj"
          :api="url"
          :table-data="tableData"
          @detailViewRightShow = 'detailViewRightShow'
          @orderDetail="orderDetail"
        >
        </endpoint-detail>
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
      v-my-loading="detailViewLoading"
      ref="dataList"
      v-if="detailType === 'list'"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.endpoint"
      :layout="dataListLayout"
      :search-msg="searchMsg"
      :nz-table-height-offset="endpointNzTableHeightOffset"
      @search="search"
      :detailType="detailType"
      @changeDetailType="changeDetailType"
      @getTableData="getTableData"
    >
      <template v-slot:top-tool-right>
        <button id="asset-filter" :class="{ 'is-focus': dataListLayout.indexOf('clickSearch') > -1 }" class="top-tool-btn margin-r-10" @click.stop="showClickSearch" :title="$t('dashboard.panel.chartForm.filter')">
          <i class="nz-icon nz-icon-funnel"></i>
        </button>
        <button id="account-add" v-has="'monitor_endpoint_add'" :title="$t('overall.createEndpoint')" class="top-tool-btn" type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
       <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="endpoint-template-list"
          :params="searchLabel"
          :params2="searchCheckBox"
          :permissions="{import: 'monitor_endpoint_add', export: 'monitor_module_edit'}"
          class="top-tool-export margin-l-10 margin-r-10"
          export-file-name="endpoint"
          export-url="/monitor/endpoint/export"
          import-url="/monitor/endpoint/import"
          @afterImport="getTableData"
          v-has="['monitor_endpoint_add','monitor_endpoint_edit','monitor_endpoint_delete']"
        >
          <template v-slot:before>
            <div>
              <el-dropdown-item>
                <div id="batch-add" v-has="'monitor_endpoint_add'" @click="batchAdd"><i class="nz-icon nz-icon-batchadd"></i>{{$t('overall.batchAdd')}}</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div id="asset-batch-asset" v-has="'asset_edit'" @click="batchEdit"><i class="nz-icon nz-icon-batch-edit"></i>{{$t('overall.batchEdit')}}</div>
              </el-dropdown-item>
              <el-dropdown-item :disabled="batchDeleteObjs.length==0" :class="'nz-el-dropdown-menu-item'">
                <delete-button
                  ref="deleteButton"
                  :single="false"
                  :from="'endpoint'"
                  :forceDeleteShow="false"
                  :deleteTitle="'project.endpoint.endpoint'"
                  :type="'link'"
                  :title="$t('overall.batchDel')"
                  id="account-list-batch-delete"
                  v-has="'monitor_endpoint_delete'"
                  :api="url"
                  :delete-objs="batchDeleteObjs"
                  @after="getTableData"
                  @before="delFlag=true"
                ></delete-button>
              </el-dropdown-item>
            </div>
          </template>
        </top-tool-more-options>
<!--        <button id="account-batch-modify" v-has="'monitor_endpoint_add'" :class="{'nz-btn-disabled' : batchDeleteObjs.length<1}" class="top-tool-btn margin-r-20"-->
<!--                type="button" @click="batchModify">-->
<!--          <i class="nz-icon-batch-edit nz-icon"></i>-->
<!--        </button>-->

      </template>
      <template v-slot:search>
        <click-search ref="clickSearch" :select-value.sync="selectValue" :title-search-list="titleSearchList" @reload="reloadTable"></click-search>
      </template>
      <template  v-slot:default="slotProps">
        <endpoint-table
          ref="dataTable"
           v-my-loading="tools.loading"
          :orderByFa="orderBy"
          :loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          :tableId="tableId"
          @del="del"
          @edit="edit"
          @copy="copy"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @addSilence="addSilence"
          @topology="topology"
          @metricTarget="metricTarget"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, item) => { $refs.dataList.showBottomBox(targetTab, item) }"></endpoint-table>
      </template>
      <template v-slot:pagination>
        <div class="endpoint-page">
          <Pagination ref="Pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
        </div>
      </template>
    </nz-data-list>
    <transition name="right-box">
<!--      <addEndpointBox v-if="rightBox.show" :endpoint="object" @close="closeRightBox"></addEndpointBox>-->
      <edit-endpoint-box-new :blankObject="blankObject" v-if="rightBox.show" :module="object" @close="closeRightEditBox" :disabled="false" :optionType="'add'"></edit-endpoint-box-new>
    </transition>
    <transition name="right-box">
      <edit-endpoint-box-new :blankObject="blankObject" v-if="rightBox.editShow" :module="object" @close="closeRightEditBox" :disabled="true" :optionType="'edit'"></edit-endpoint-box-new>
    </transition>
    <transition name="right-box">
      <batchModifyEndpoint v-if="rightBox.batchModify" :module="object" @close="closeRightBatchModify" :selectEndpointList="batchDeleteObjs" :disabled="true" :type="'edit'"></batchModifyEndpoint>
    </transition>
    <transition name="right-box">
      <batchAddEndpoint v-if="rightBox.batchAdd" @close="closeRightBatchAdd"></batchAddEndpoint>
    </transition>
    <transition name="right-box">
      <alert-silence-box v-if='silenceBoxShow' :alert-silence="objectSilence" @close="closeSilenceBox"></alert-silence-box>
    </transition>
    <transition name="right-box">
      <batchEditEndpoint
        v-if="rightBox.batchShow"
        @close="closeRightBatchModify"
        @refresh="getTableData">
      </batchEditEndpoint>
    </transition>
    <el-dialog :close-on-click-modal="false" :show-close="true" destroy-on-close :title='$t("overall.batchAddEndpoint")' :visible.sync="importBoxShow" :width="'580px'" append-to-body class="nz-dialog" @close="closeDialog">
      <div class="upload-body result-body">
        <div v-if="importResult&&importResult.failNum">
          <div class="result-title-top">
            <div class="">
              <i class="nz-icon nz-icon-import-success"/>
              <span v-if="importResult">{{$t('overall.result.successNum',{successNum:importResult.successNum})}}</span><br/>
            </div>
            <div class="">
              <i class="nz-icon nz-icon-import-failed"/>
              <span v-if="importResult">{{$t('overall.result.failedNum',{failedNum:importResult.failNum,total:importResult.totalNum})}}</span>
            </div>
          </div>
          <div>
            <div v-if="importResult&&importResult.failDetail" class="result-detail">
              <div style="height: 100%; overflow: auto">
                <template v-for="(item, index) in importResult.failDetail">
                  <div :key="index" class="import-result-block">
                    <div class="import-result-item">
                      <div style="display: flex;">
                        <span class="import-result-item-left">•</span>
                        <div class="line-num">{{$t('overall.result.line',[item.lineNo])}}</div>
                      </div>
                      <div class="line-content" :title="item.errorMsg">{{item.errorMsg}}</div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="result-success-box">
          <div>
            <i class="nz-icon nz-icon-import-success"/>
          </div>
          <div class="result-success-txt">{{$t('overall.result.successfully')}}</div>
          <div class="result-success-txt">
            {{$t('overall.result.imported')}}
            <span style="color: #333333" v-if="importResult">{{importResult.successNum}}</span>
            {{$t('overall.result.records')}}
          </div>
        </div>
      </div>
      <div class="footer">
        <div class="el-message-box__btns">
          <button :id="'xlsx-import-rollback'"  class="nz-btn el-button el-button--small nz-btn-style-error" @click="rollbackImport">
            <span>{{$t('overall.rollbackImport')}}</span>
          </button>
          <button :id="'xlsx-import-close'" class="nz-btn el-button el-button--small el-button--default" @click="closeDialog">
            <span>{{$t('overall.close')}}</span>
          </button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import deleteButton from '@/components/common/deleteButton'
import addEndpointBox from '@/components/common/rightBox/addEndpointBox'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import endpointTable from '@/components/common/table/settings/endpointTable'
import EditEndpointBoxNew from '@/components/common/rightBox/editEndpointBoxNew'
import batchModifyEndpoint from '@/components/common/rightBox/batchModifyEndpoint'
import batchAddEndpoint from '@/components/common/rightBox/batchAddEndpoint'
import clickSearch from '@/components/common/labelFilter/clickSearchNew'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import alertSilenceBox from '@/components/common/rightBox/alertSilenceBox'
import nzDetailView from '@/components/common/detailView/nzDetailView'
import detailViewMixin from '@/components/common/mixin/detailViewMixin'
import endpointDetail from '@/components/common/detailView/list/endpoint/endpointDetail'
import detailViewTopSearch from '@/components/common/detailView/detailViewTopSearch'
import routerPathParams from '@/components/common/mixin/routerPathParams'
import batchEditEndpoint from '@/components/common/rightBox/batchEditEndpoint'
import lodash from 'lodash'

export default {
  name: 'endpointList',
  components: {
    EditEndpointBoxNew,
    nzDataList,
    addEndpointBox,
    deleteButton,
    endpointTable,
    clickSearch,
    batchModifyEndpoint,
    topToolMoreOptions,
    alertSilenceBox,
    batchAddEndpoint,
    nzDetailView,
    endpointDetail,
    detailViewTopSearch,
    batchEditEndpoint
  },
  mixins: [dataListMixin, detailViewMixin, routerPathParams],
  data () {
    return {
      url: 'monitor/endpoint',
      from: 'endpoint',
      importBoxShow: false,
      importResult: {},
      blankObject: {
        id: '',
        projectId: '',
        assetId: '',
        name: '',
        port: '',
        // chartIds: '',
        metricsEnable: 1,
        configs: [
          {
            type: 'metrics',
            config: {
              protocol: 'http',
              walk: [],
              snmpCredentialsId: '',
              metrics_path: '',
              port: '',
              host: '',
              scrape_interval: '',
              scrape_timeout: '',
              params: '',
              labels: '',
              basic_auth: {
                username: '',
                pin: ''
              },
              relabel_config: [],
              bearer_token: ''
            },
            enable: 1
          },
          {
            type: 'logs',
            config: [{
              type: 'file',
              fileName: '',
              unit: '',
              appName: '',
              listenAddress: '',
              apiServer: '',
              role: '',
              namespaces: {
                tags: '',
                names: []
              },
              labels: '',
              labelModule: [{ key: '', value: '' }],
              pipeline: [],
              basic_auth: {
                username: '',
                password: ''
              },
              bearer_token: '',
              relabel_config: []
            }],
            enable: 1
          }
        ],
        walk: [],
        labelModule: [{
          key: '',
          value: ''
        }],
        paramObj: [{
          key: '',
          value: []
        }]
      }, // 新增/编辑的endpoint
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
      tableId: 'endpointTable',
      queryPermission: 'account_view',
      endpointTableHeight: 'calc(100% - 244px)', // 主列表table高度
      dataListLayout: localStorage.getItem('dataList-layout' + 'endpointTable') ? JSON.parse(localStorage.getItem('dataList-layout' + 'endpointTable')) : ['searchInput', 'elementSet', 'clickSearch', 'pagination', 'detailViewSet'],
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          {
            id: 13,
            name: 'ID',
            type: 'input',
            label: 'ids',
            disabled: false
          }, {
            name: this.$t('overall.name'),
            type: 'input',
            label: 'name',
            disabled: false
          },
          {
            name: this.$t('overall.asset'),
            type: 'input',
            label: 'assetName',
            disabled: false
          }
        ]
      },
      roles: [],
      rightBox: {
        editShow: false,
        show: false,
        batchModify: false,
        batchAdd: false,
        batchShow: false
      },
      titleSearch: {},
      titleSearchList: {
        project: {
          label: this.$t('overall.project'),
          key: 'projectIds',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1,
          needMore: false,
          height: 'auto',
          hide: false
        },
        module: {
          label: this.$t('overall.module'),
          key: 'moduleIds',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1,
          needMore: false,
          height: 'auto',
          hide: false
        },
        state: {
          label: this.$t('overall.state'),
          key: 'state',
          type: 'dropdownCheckBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1,
          needMore: false,
          height: 'auto',
          hide: false
        }
        // type: {
        //   label: 'Type',
        //   key: 'type',
        //   type: 'checkBox',
        //   children: [],
        //   show: false,
        //   showMore: false,
        //   width: 0,
        //   index: -1
        // }
      },
      detailSearchList: {
        project: {
          label: this.$t('overall.project'),
          key: 'projectIds',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1,
          needMore: false,
          height: 'auto',
          hide: false
        },
        module: {
          label: this.$t('overall.module'),
          key: 'moduleIds',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1,
          needMore: false,
          height: 'auto',
          hide: false
        },
        state: {
          label: this.$t('overall.state'),
          key: 'stateDetail',
          type: 'dropdownCheckBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1,
          needMore: false,
          height: 'auto',
          hide: false
        }
        // type: {
        //   label: 'Type',
        //   key: 'type',
        //   type: 'checkBox',
        //   children: [],
        //   show: false,
        //   showMore: false,
        //   width: 0,
        //   index: -1
        // }
      },
      selectValue: {
        projectIds: [],
        moduleIds: [],
        state: '',
        stateDetail: [],
        type: []
      },
      searchCheckBox: {},
      endpointNzTableHeightOffset: 204,
      needAlertDaysData: true,
      trendKey: 'endpointId'
    }
  },
  methods: {
    edit (row, copyFlag) {
      this.$get('monitor/endpoint/' + row.id).then(res => {
        this.object = JSON.parse(JSON.stringify(res.data))
        if (copyFlag) {
          this.object.id = ''
          this.object.name = this.object.name + '-copy'
          if (this.object.name.length > 64) {
            const length = this.object.name.length - 64
            this.object.name = row.name.substring(0, row.name.length - length) + '-copy'
          }
        }
        this.object.configs.forEach(item => {
          item.config = JSON.parse(item.config)
        })
        this.object.paramObj = []
        this.object.labelModule = []
        if (!this.object.configs[0].config.relabel_config) {
          this.object.configs[0].config.relabel_config = []
        }
        this.object.configs[0].config.relabel_config && this.object.configs[0].config.relabel_config.forEach(item => {
          this.$set(item, 'showAllRelabelOption', false)
          this.$set(item, 'tags', '')
        })
        this.object.configs[1].config.forEach(item => {
          this.$set(item, 'labelModule', [])
          if (JSON.stringify(item.labels) !== '{}' && item.labels) {
            Object.keys(item.labels).forEach(key => {
              item.labelModule.push({ key, value: item.labels[key] })
            })
          } else {
            item.labelModule.push({ key: '', value: '' })
          }
          item.pipeline && item.pipeline.forEach((pipeline) => {
            if (pipeline.type === 'labels') {
              const labelsArr = []
              if (JSON.stringify(pipeline.labels) !== '{}' && pipeline.labels) {
                Object.keys(pipeline.labels).forEach(key => {
                  labelsArr.push({ key, value: pipeline.labels[key] })
                })
              } else {
                labelsArr.push({ key: '', value: '' })
              }
              pipeline.labels = labelsArr
            }
            if (pipeline.type === 'json') {
              const expressionsArr = []
              if (JSON.stringify(pipeline.expressions) !== '{}' && pipeline.expressions) {
                Object.keys(pipeline.expressions).forEach(key => {
                  expressionsArr.push({ key, value: pipeline.expressions[key] })
                })
              } else {
                expressionsArr.push({ key: '', value: '' })
              }
              pipeline.expressions = expressionsArr
            }
          })
          if (!item.relabel_config) {
            this.$set(item, 'relabel_config', [])
          }
          item.relabel_config && item.relabel_config.forEach(item => {
            this.$set(item, 'showAllRelabelOption', false)
            this.$set(item, 'tags', '')
          })
        })
        if (JSON.stringify(this.object.configs[0].config.labels) !== '{}' && this.object.configs[0].config.labels) {
          Object.keys(this.object.configs[0].config.labels).forEach(key => {
            this.object.labelModule.push({ key, value: this.object.configs[0].config.labels[key] })
          })
        } else {
          this.object.labelModule.push({ key: '', value: '' })
        }
        if (JSON.stringify(this.object.configs[0].config.params) !== '{}' && this.object.configs[0].config.params) {
          Object.keys(this.object.configs[0].config.params).forEach(key => {
            this.object.paramObj.push({ key, value: this.object.configs[0].config.params[key] })
          })
        } else {
          this.object.paramObj.push({ key: '', value: [] })
        }
        this.object.assetName = this.object.asset ? this.object.asset.name : ''
        this.object.assetId = this.object.asset ? this.object.asset.id + '' : ''
        this.object.projectId = this.object.project.id
        this.object.moduleId = this.object.module.id
        this.object.type = this.object.module.type
        if (copyFlag) {
          this.rightBox.show = true
        } else {
          this.rightBox.editShow = true
        }
      })
    },
    copy (u) {
      this.edit(u, true)
    },
    closeRightEditBox (refresh) {
      this.rightBox.editShow = false
      this.rightBox.show = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    closeRightBatchModify (refresh) {
      this.rightBox.batchModify = false
      this.rightBox.batchShow = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    closeRightBatchAdd (refresh, importResult) {
      this.rightBox.batchAdd = false
      this.importResult = importResult
      if (refresh && importResult) {
        this.delFlag = true
        this.importBoxShow = true
        // this.getTableData()
      }
    },
    getTableData () {
      if (this.orderBy) {
        this.$set(this.searchLabel, 'orderBy', this.orderBy)
      } else {
        delete this.searchLabel.orderBy
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      if (this.$route.path === '/endpoint') {
        this.$set(this.searchLabel, 'statistics', 1)
      }
      const params = {
        ...this.searchLabel,
        ...this.searchCheckBox
      }
      localStorage.removeItem('endpointProjectId')
      this.tools.loading = true
      const param = {
        ...this.searchLabel,
        ...this.searchCheckBox
      }
      const path = this.fromRoute.endpoint
      const pathParam = lodash.cloneDeep(param)
      pathParam.state = this.selectValue.state
      delete pathParam.metricsStates
      delete pathParam.logsStates
      delete pathParam.statistics
      this.updatePath({ ...pathParam }, path)
      this.$get(this.url, params).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          if (response.statistics && this.$route.path === '/endpoint') {
            this.setSearchData(response.statistics)
          }
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].configs && response.data.list[i].configs.forEach(item => {
              item.config = JSON.parse(item.config)
            })
          }
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
    reloadTable (obj) {
      this.pageObj.pageNo = 1
      const params = JSON.parse(JSON.stringify(obj))
      delete this.searchCheckBox.metricsStates
      delete this.searchCheckBox.logsStates
      if (this.detailType === 'view') {
        const obj = {}
        params.stateDetail.forEach(item => {
          const arr = item.split('-')
          if (obj[arr[0]]) {
            obj[arr[0]].push(arr[1])
          } else {
            obj[arr[0]] = [arr[1]]
          }
        })
        params.state = JSON.stringify(obj)
        if (params.state === '{}') {
          params.state = ''
        }
        delete params.stateDetail
      }
      Object.keys(params).forEach(key => {
        if (typeof params[key] === 'string') {
          if (key === 'state' && params[key]) {
            const state = JSON.parse(params[key])
            if (state.metrics) {
              this.searchCheckBox.metricsStates = state.metrics.join(',')
            }
            if (state.logs) {
              this.searchCheckBox.logsStates = state.logs.join(',')
            }
          }
        } else {
          params[key] && params[key].length > 0 ? this.searchCheckBox[key] = params[key].join(',') : this.searchCheckBox[key] = null
        }
      })
      if (!this.timer) {
        this.timer = setTimeout(() => {
          this.getTableData()
          clearTimeout(this.timer)
          this.timer = ''
          this.scrollbarToTop()
        }, 1000)
      } else {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.getTableData()
          clearTimeout(this.timer)
          this.timer = ''
          this.scrollbarToTop()
        }, 1000)
      }
    },
    scrollbarToTop () {
      this.$nextTick(() => {
        const wraps = document.querySelectorAll('.el-table__body-wrapper')
        wraps.forEach(wrap => {
          if (wrap) {
            wrap.scrollTop = 0
            wrap.scrollLeft = 0
          }
        })
      })
    },
    getSearchableStateData (data) {
      return new Promise(resolve => {
        setTimeout(()=>{
          // this.$get('asset/model?pageSize=-1').then(response => {
          let states = []
          if (this.$route.query && this.$route.query.state) {
            states = Object.keys(JSON.parse(this.$route.query.state))
          }
          if (data) {
            this.modelData = data
            const titleSearchData = {}
            this.modelData.forEach(m => {
              m.value = []
              m.metaId = m.type
              if (!titleSearchData[m.type]) {
                titleSearchData[m.type] = {
                  ...m,
                  isInit: true,
                  children: [],
                  name: m.type,
                  id: m.type
                }
              }
              if (m.id == '1') {
                titleSearchData[m.type].children[0] = m
              } else if (m.id == '0') {
                titleSearchData[m.type].children[1] = m
              } else if (m.id == '2') {
                titleSearchData[m.type].children[2] = m
              }
            })
            this.modelData.forEach(m => {
              titleSearchData[m.type].children = titleSearchData[m.type].children.filter(item => item)
            })
            resolve(Object.keys(titleSearchData).map(b => titleSearchData[b]))
            // this.titleSearchList.model.children = Object.keys(titleSearchData).map(b => titleSearchData[b])
          }
          resolve()
          // })
        }, 100)
      })
    },
    setSearchData (statistics) {
      Object.keys(this.titleSearchList).forEach(key => {
        let keys = key
        if (key === 'projectIds') {
          keys = 'project'
        } else if (key === 'moduleIds') {
          keys = 'module'
        }
        if (key === 'state') {
          this.getSearchableStateData(statistics[keys]).then(res => {
            this.titleSearchList.state.children = res
            this.detailSearchList.state.children = res
            this.titleSearchList.state.show = true
            this.detailSearchList.state.show = true
            this.titleSearchList[key].hide = !this.titleSearchList[key].children.length
            this.detailSearchList[key].hide = !this.detailSearchList[key].children.length
          })
        } else {
          this.titleSearchList[key].children = statistics[keys].map(d => { return { ...d, value: d.id, key: d.name, name: d.name } })
          this.detailSearchList[key].children = statistics[keys].map(d => { return { ...d, value: d.id, key: d.name, name: d.name } })
          this.titleSearchList[key].hide = !this.titleSearchList[key].children.length
          this.detailSearchList[key].hide = !this.detailSearchList[key].children.length
        }
        this.titleSearchList[key].show = true
        this.detailSearchList[key].show = true
      })
    },
    batchModify () {
      if (!this.batchDeleteObjs.length) {
        return
      }
      this.rightBox.batchModify = true
    },
    batchAdd () {
      this.rightBox.batchAdd = true
    },
    batchEdit () {
      this.rightBox.batchShow = true
    },
    rollbackImport () {
      this.$delete('monitor/endpoint/cancelImport' + '?seq=' + this.importResult.seq).then(response => {
        if (response.code == 200) {
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
          this.getTableData()
          this.importBoxShow = false
        } else {
          this.$message.error(response.msg)
        }
      })
    },
    closeDialog () {
      this.getTableData()
      this.importBoxShow = false
    }
  },
  computed: {
  },
  created () {
    if (localStorage.getItem('endpointProjectId')) {
      this.selectValue.projectIds = [Number(localStorage.getItem('endpointProjectId'))]
      this.searchCheckBox.projectIds = this.selectValue.projectIds.join(',')
    }
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
          id: 'ids',
          label: 'ids',
          name: 'ID',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      },
      name: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'name',
        type: 'string',
        defaultJson: {
          disabled: false,
          id: 'name',
          label: 'name',
          name: 'Name',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      },
      assetName: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'assetName',
        type: 'string',
        defaultJson: {
          disabled: false,
          label: 'assetName',
          name: 'Asset',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      },
      projectIds: { target: this.searchCheckBox, propertyName: 'projectIds', type: 'string', target2: this.selectValue, type2: 'array' },
      moduleIds: { target: this.searchCheckBox, propertyName: 'moduleIds', type: 'string', target2: this.selectValue, type2: 'array' },
      state: { target: this.searchCheckBox, propertyName: 'state', type: 'string', target2: this.selectValue, type2: 'json' }
    }
    this.initQueryFromPath(searchKeys)
  },
  mounted () {
    if (this.$route.query && this.$route.query.assetId) {
      this.object = {
        ...this.newObject(),
        assetId: JSON.stringify(this.$route.query.assetId)
      }
      this.rightBox.show = true
    }
    if (this.$route.query && this.$route.query.moduleId) {
      this.object = {
        ...this.newObject(),
        moduleId: Number(this.$route.query.moduleId),
        projectId: Number(this.$route.query.projectId)
      }
      this.rightBox.show = true
    }
    if (localStorage.getItem('endpointProjectId')) {
      this.selectValue.projectIds = [Number(localStorage.getItem('endpointProjectId'))]
      // this.$refs.clickSearch.selectValueOut.projectIds = [localStorage.getItem('endpointProjectId')]
    }
    // this.getTitleSearch()
  },
  watch: {
    $route: {
      immediate: true,
      handler () {
        // 是否弹出侧滑
        const add = this.$route.query.add
        const importEndpoint = this.$route.query.importEndpoint
        if (add) {
          if (add === 'endpoint') {
            this.add()
          }
          const newQuery = JSON.parse(JSON.stringify(this.$route.query)) // 深拷贝
          delete newQuery.add
          this.$router.replace({ query: newQuery })
        }
        if (importEndpoint) {
          this.$nextTick(() => {
            this.$refs.export.showImportBox(1)
            const newQuery = JSON.parse(JSON.stringify(this.$route.query)) // 深拷贝
            delete newQuery.importEndpoint
            this.$router.replace({ query: newQuery })
          })
        }
      }
    }
  },
  beforeDestroy () {
    clearTimeout(this.timer)
  },
  destroyed () {
    localStorage.removeItem('endpointProjectId')
  }
}
</script>
<style scoped>
  .endpoint-list{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .dataList{
    flex: 1;
    width: 100%;
  }
</style>
