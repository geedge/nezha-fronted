<template>
  <div class="module-list">
    <nzDetailView
      v-my-loading="detailViewLoading || tools.loading"
      v-if="detailType !== 'list'"
      :api="url"
      ref="detailList"
      :layout="['searchInput', 'elementSet', 'pagination','detailViewSet']"
      :from="fromRoute.module"
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
          :permissions="{import: 'monitor_endpoint_add', export: 'monitor_module_edit'}"
          class="top-tool-export margin-l-10 margin-r-10"
          export-file-name="module"
          export-url="/monitor/module/export"
          import-url="/monitor/module/import"
          @afterImport="getTableData"
        >
        </top-tool-more-options>
      </template>
      <template v-slot:nz-detail-view-list>
        <module-detail
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
        </module-detail>
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
            <el-input-number ref="jumpInput" v-model="pageObj.pageNo" :controls="false" :min="1" :max="pageObj.pages" class="jump-input" @change="getTableData" @keyup.enter.native="getTableData" size="mini"/>
            <span class="jump-pages">/&nbsp{{pageObj.pages}}</span>
          </template>
        </el-pagination>
      </template>
    </nzDetailView>
    <nz-data-list
      ref="dataList"
      :api="url"
      :tableId="tableId"
      v-if="detailType === 'list'"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.module"
      :layout="['searchInput', 'elementSet', 'pagination','detailViewSet']"
      :search-msg="searchMsg"
      @search="search"
      :detailType="detailType"
      @changeDetailType="changeDetailType"
      @getTableData="getTableData"
    >
      <template v-slot:top-tool-right>
        <button id="account-add" v-has="'monitor_module_add'" :title="$t('overall.createModule')" class="top-tool-btn"
                type="button" @click="add">
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
          export-file-name="module"
          export-url="/monitor/module/export"
          import-url="/monitor/module/import"
          @afterImport="getTableData"
        >
          <template v-slot:before>
            <div>
              <el-dropdown-item :disabled="batchDeleteObjs.length==0">
                <delete-button
                  ref="deleteButton"
                  :from="'module'"
                  :forceDeleteShow="true"
                  :deleteTitle="'project.module.module'"
                  :type="'link'"
                  :title="$t('overall.batchDel')"
                  id="account-list-batch-delete"
                  v-has="'monitor_module_delete'"
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
      <template v-slot="slotProps">
        <module-table
          ref="dataTable"
          v-my-loading="tools.loading"
          :orderByFa="orderBy"
          :loading="tools.loading"
          :api="url"
          :tableId="tableId"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @copy="copy"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @sync="chartBySync"
          @addSilence="addSilence"
          @topology="topology"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></module-table>
      </template>
      <template v-slot:pagination>
        <div class="module-page">
          <Pagination ref="Pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
        </div>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <moduleBox v-if="rightBox.show" :module="object" @close="closeRightBox"></moduleBox>
    </transition>
    <transition name="right-box"><alert-silence-box v-if='silenceBoxShow' :alert-silence="objectSilence" @close="closeSilenceBox"></alert-silence-box>
</transition>
  </div>
</template>
<script>
import deleteButton from '@/components/common/deleteButton'
import moduleBox from '@/components/common/rightBox/moduleBox'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import moduleTable from '@/components/common/table/settings/moduleTable'
import alertSilenceBox from '@/components/common/rightBox/alertSilenceBox'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import nzDetailView from '@/components/common/detailView/nzDetailView'
import detailViewMixin from '@/components/common/mixin/detailViewMixin'
import moduleDetail from '@/components/common/detailView/list/module/moduleDetail'
import detailViewTopSearch from '@/components/common/detailView/detailViewTopSearch'
import routerPathParams from '@/components/common/mixin/routerPathParams'

export default {
  name: 'moduleList',
  components: {
    nzDataList,
    moduleBox,
    deleteButton,
    moduleTable,
    alertSilenceBox,
    topToolMoreOptions,
    nzDetailView,
    moduleDetail,
    detailViewTopSearch
  },
  mixins: [dataListMixin, detailViewMixin, routerPathParams],
  data () {
    return {
      url: 'monitor/module',
      blankObject: {
        id: '',
        projectId: '',
        name: '',
        endpointNameTmpl: '{{module.name}}-{{asset.name}}',
        port: '',
        chartIds: '',
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
              host: '{{asset.manageIp}}',
              scrape_interval: '',
              scrape_timeout: '',
              params: '',
              labels: '',
              relabel_config: [
                // {
                //   source_labels: [],
                //   target_label: '',
                //   action: 'replace',
                //   regex: '',
                //   replacement: '',
                //   showAllRelabelOption: false
                // }
              ],
              basic_auth: {
                username: '',
                pin: ''
              },
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
      }, // 新增/编辑的module
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
      tableId: 'moduleTable',
      queryPermission: 'account_view',
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          {
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
            name: this.$t('overall.projectName'),
            type: 'project',
            label: 'projectIds',
            id: 11,
            readonly: true,
            disabled: false
          }
        ]
      },
      needAlertDaysData: true,
      trendKey: 'moduleId'
    }
  },
  methods: {
    edit (row, copyFlag) {
      this.$get('monitor/module/' + row.id).then(res => {
        if (res.code === 200) {
          this.object = JSON.parse(JSON.stringify(res.data))
          this.object.configs = JSON.parse(this.object.configs)
          if (copyFlag) {
            this.object.id = ''
            this.object.name = this.object.name + '-copy'
            if (this.object.name.length > 64) {
              const length = this.object.name.length - 64
              this.object.name = row.name.substring(0, row.name.length - length) + '-copy'
            }
          }
          // this.object.configs.walk = this.object.configs.walk ? JSON.parse(JSON.stringify(this.object.configs.walk)) : []
          // this.object.port = this.object.configs.port ? JSON.parse(JSON.stringify(this.object.configs.port)) : ''
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
            item.labelModule = []
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
          if (!this.object.chartIds) {
            this.object.chartIds = ''
          } else {
            // this.object.chartIds = this.object.chartIds.split(',')
          }
          this.rightBox.show = true
        }
      })
    },
    copy (u) {
      this.edit(u, true)
    },
    getTableData () {
      if (this.orderBy) {
        this.$set(this.searchLabel, 'orderBy', this.orderBy)
      } else {
        delete this.searchLabel.orderBy
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      if (this.searchLabel.projectIds) {
        localStorage.setItem('moduleProjectId', this.searchLabel.projectIds)
      } else {
        localStorage.removeItem('moduleProjectId')
      }
      this.tools.loading = true
      const param = {
        ...this.searchLabel,
        ...this.searchCheckBox
      }
      const path = this.fromRoute.module
      this.updatePath(param, path)
      this.$get(this.url, this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].status = response.data.list[i].status + ''
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
    chartBySync (row) {
      this.$post('visual/panel/chart/syncTmpl', { modules: row.id }).then(res => {
        if (res.code === 200) {
          this.getTableData()
          this.$message.success(this.$t('tip.syncSuccess'))
        } else {
          this.$message.error(res.msg)
        }
      })
    }
  },
  computed: {
  },
  created () {
    if (localStorage.getItem('moduleProjectId')) {
      this.searchLabel.projectIds = JSON.parse(localStorage.getItem('moduleProjectId'))[0]
    }
    if (localStorage.getItem('moduleProjectId')) {
      const project = JSON.parse(localStorage.getItem('moduleProjectId'))
      let dataList = ''
      if (this.detailType !== 'view') {
        dataList = 'dataList'
      } else {
        dataList = 'detailList'
      }
      setTimeout(() => {
        this.$refs[dataList].$refs.searchInput.select_list.push({
          id: 11,
          name: this.$t('overall.projectName'),
          type: 'project',
          label: 'projectIds',
          disabled: false,
          val: project[1],
          valnum: project[0]
        })
        this.$refs[dataList].$refs.searchInput.sreach_num = 1
        this.$refs[dataList].$refs.searchInput.searchLabelList = this.$refs[dataList].$refs.searchInput.searchLabelList.filter(item => item.label !== 'projectIds')
      })
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
      projectIds: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'projectIds',
        type: 'number',
        defaultJson: {
          disabled: false,
          id: 11,
          label: 'projectIds',
          name: 'Project name',
          readonly: true,
          type: 'project',
          val: '',
          valnum: '',
          listStr: 'projectSelect'
        },
        jsonKey: 'valnum'
      }
    }
    this.initQueryFromPath(searchKeys)
  },
  mounted () {
    if (this.$route.query && this.$route.query.projectId) {
      this.object = {
        ...this.newObject(),
        projectId: Number(this.$route.query.projectId)
      }
      this.rightBox.show = true
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler () {
        // 是否弹出侧滑
        const add = this.$route.query.add
        if (add) {
          if (add === 'module') {
            this.add()
          }
        }
      }
    }
  },
  destroyed () {
    localStorage.removeItem('moduleProjectId')
  }
}
</script>
