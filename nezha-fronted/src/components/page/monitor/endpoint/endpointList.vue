<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.endpoint"
      :layout="dataListLayout"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="asset-filter" :class="{ 'is-focus': dataListLayout.indexOf('clickSearch') > -1 }" class="top-tool-btn margin-r-10" @click.stop="showClickSearch">
          <i class="nz-icon nz-icon-funnel"></i>
        </button>
        <button id="account-add" v-has="'monitor_endpoint_add'" class="top-tool-btn"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <top-tool-more-options
          ref="export"
          id="endpoint-template-list"
          :params="searchLabel"
          :permissions="{import: 'monitor_endpoint_add', export: 'monitor_module_view'}"
          class="top-tool-export margin-l-10 margin-r-10"
          export-file-name="expression-template"
          export-url="monitor/endpoint/export"
          import-url="monitor/endpoint/import"
          @afterImport="getTableData"
        >
          <template v-slot:before>
            <div>
              <el-dropdown-item>
                <delete-button :type="'link'" :title="$t('overall.batchDel')" id="account-list-batch-delete" v-has="'monitor_endpoint_delete'" :api="url" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
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
        <clickSearch :titleSearchList="titleSearchList" :selectValue.sync="selectValue" @reload="reloadTable"/>
      </template>
      <template  v-slot:default="slotProps">
        <endpoint-table
          ref="dataTable"
           v-loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="dataListLayout.indexOf('clickSearch') > -1 ? endpointTableHeight : mainTableHeight"
          :table-data="tableData"
          :tableId="tableId"
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @addSilence="addSilence"
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
      <addEndpointBox v-if="rightBox.show" :endpoint="object" @close="closeRightBox"></addEndpointBox>
    </transition>
    <transition name="right-box">
      <edit-endpoint-box-new v-if="rightBox.editShow" :module="object" @close="closeRightEditBox" :disabled="true" :optionType="'edit'"></edit-endpoint-box-new>
    </transition>
    <transition name="right-box">
      <batchModifyEndpoint v-if="rightBox.batchModify" :module="object" @close="closeRightBatchModify" :selectEndpointList="batchDeleteObjs" :disabled="true" :type="'edit'"></batchModifyEndpoint>
    </transition>
    <el-dialog :show-close="true" :title="$t('overall.quickSilent')" :visible.sync="silenceBoxShow" append-to-body destroy-on-close class="nz-dialog silence-box" @close="closeDialog">
      <alert-silence-box :alert-silence="objectSilence" @close="closeSilenceBox"></alert-silence-box>
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
import clickSearch from '@/components/common/labelFilter/clickSearch'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import alertSilenceBox from "@/components/common/dialog/alertSilenceBox";

export default {
  beforeRouteLeave (to, from, next) { // 路由离开之前触发
    localStorage.removeItem('endpointProjectId')
    next()
  },
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
    alertSilenceBox
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'monitor/endpoint',
      blankObject: {}, // 新增/编辑的endpoint
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
      endpointTableHeight: 'calc(100% - 193px)', // 主列表table高度
      dataListLayout: ['searchInput', 'elementSet'],
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
        batchModify: false
      },
      titleSearch: {},
      titleSearchList: {
        project: {
          label: 'Project',
          key: 'projectIds',
          type: 'checkBox',
          children: [],
          show: true,
          showMore: false,
          width: 0,
          index: 0
        },
        module: {
          label: 'Module',
          key: 'moduleIds',
          type: 'checkBox',
          children: [],
          show: true,
          showMore: false,
          width: 0,
          index: 0
        },
        state: {
          label: 'State',
          key: 'states',
          type: 'checkBox',
          children: [],
          show: true,
          showMore: false,
          width: 0,
          index: 0
        }
      },
      selectValue: {
        projectIds: [],
        moduleIds: [],
        states: []
      }
    }
  },
  methods: {
    edit (row) {
      this.$get('monitor/endpoint/' + row.id).then(res => {
        const u = res.data
        this.object = JSON.parse(JSON.stringify(u))
        this.object.configs = JSON.parse(this.object.configs)
        this.object.walk = this.object.configs.walk ? JSON.parse(JSON.stringify(this.object.configs.walk)) : []
        this.object.port = this.object.configs.port ? JSON.parse(JSON.stringify(this.object.configs.port)) : 9100
        this.object.paramObj = []
        this.object.labelModule = []
        if (JSON.stringify(this.object.configs.labels) !== '{}' && this.object.configs.labels) {
          Object.keys(this.object.configs.labels).forEach(key => {
            this.object.labelModule.push({ key, value: this.object.configs.labels[key] })
          })
        } else {
          this.object.labelModule.push({ key: '', value: '' })
        }
        if (JSON.stringify(this.object.configs.params) !== '{}' && this.object.configs.params) {
          Object.keys(this.object.configs.params).forEach(key => {
            this.object.paramObj.push({ key, value: this.object.configs.params[key] })
          })
        } else {
          this.object.paramObj.push({ key: '', value: [] })
        }
        this.object.assetName = this.object.asset ? this.object.asset.name : ''
        this.object.projectId = this.object.project.id
        this.object.moduleId = this.object.module.id
        this.object.type = this.object.module.type
        this.rightBox.editShow = true
      })
    },
    closeRightEditBox (refresh) {
      this.rightBox.editShow = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    closeRightBatchModify (refresh) {
      this.rightBox.batchModify = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    getTableData () {
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      const params = {
        ...this.searchLabel,
        ...this.searchCheckBox
      }
      if (this.searchLabel.projectIds) {
        localStorage.setItem('endpointProjectId', this.searchLabel.projectIds)
        if (params.projectIds) {
          params.projectIds += ',' + this.searchLabel.projectIds
        } else {
          params.projectIds = this.searchLabel.projectIds
        }
      } else {
        localStorage.removeItem('endpointProjectId')
      }
      this.tools.loading = true
      this.$get(this.url, params).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].status = response.data.list[i].status + ''
          }
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
    reloadTable (obj) {
      Object.keys(obj).forEach(key => {
        if (key === 'change') {
          return
        }
        this.searchCheckBox[key] = obj[key].join(',')
      })
      this.getTableData()
    },
    getTitleSearch () {
      this.$get('monitor/project', { pageSize: -1 }).then(res => {
        if (res.code === 200) {
          res.data.list.forEach((item) => {
            this.titleSearchList.project.children.push(
              { key: item.name, value: item.id, name: item.name }
            )
          })
        }
      })
      this.$get('monitor/module', { pageSize: -1 }).then(res => {
        if (res.code === 200) {
          res.data.list.forEach((item) => {
            this.titleSearchList.module.children.push(
              { key: item.name, value: item.id, name: item.name }
            )
          })
        }
      })
      this.titleSearchList.state.children = [
        { key: 'Down', value: 0, name: 'Down' },
        { key: 'Up', value: 1, name: 'Up' },
        { key: 'Suspended', value: 2, name: 'Suspended' }
      ]
    },
    batchModify () {
      if (!this.batchDeleteObjs.length) {
        return
      }
      this.rightBox.batchModify = true
    }
  },
  computed: {
  },
  created () {
    if (localStorage.getItem('endpointProjectId')) {
      this.searchLabel.projectIds = localStorage.getItem('endpointProjectId')
    }
    this.getTitleSearch()
  },
  mounted () {
    if (localStorage.getItem('endpointProjectId')) {
      this.$refs.dataList.$refs.searchInput.select_list.push({
        id: 11,
        name: 'project id',
        type: 'input',
        label: 'projectIds',
        disabled: false,
        val: localStorage.getItem('endpointProjectId')
      })
      this.$refs.dataList.$refs.searchInput.sreach_num = 1
    }
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
        }
        if (importEndpoint) {
          this.$nextTick(() => {
            this.$refs.export.showImportBox(1)
          })
        }
      }
    }
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
