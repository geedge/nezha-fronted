<template>
  <div class="module-list">
    <nz-data-list
      ref="dataList"
      :api="url"
      :tableId="tableId"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.module"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-right>
        <export-excel
          id="expression-template-list"
          v-has="''"
          export-url="monitor/module/export"
          import-url="monitor/module/import"
          export-file-name="module"
          :params="searchLabel"
          :permissions="{import: 'asset.add', export: 'asset.add'}"
          @afterImport="getTableData"
          class="top-tool-export margin-r-10"
        >
          <template slot="optionZone">
            <button id="account-add" v-has="'monitor_module_add'" :title="$t('overall.createModule')" class="top-tool-btn"
                    type="button" @click="add">
              <i class="nz-icon-create-square nz-icon"></i>
            </button>
          </template>
        </export-excel>
        <delete-button id="account-list-batch-delete" v-has="'monitor_module_delete'" :api="url" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot="slotProps">
        <module-table
          ref="dataTable"
          v-loading="tools.loading"
          :api="url"
          :tableId="tableId"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @sync="chartBySync"
          @addSilence="addSilence"
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
import exportXLSX from '@/components/common/exportXLSX'
import alertSilenceBox from '@/components/common/rightBox/alertSilenceBox'

export default {
  name: 'moduleList',
  components: {
    nzDataList,
    moduleBox,
    deleteButton,
    moduleTable,
    'export-excel': exportXLSX,
    alertSilenceBox
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'monitor/module',
      blankObject: {
        id: '',
        projectId: '',
        name: '',
        endpointNameTmpl: '{{module.name}}-{{asset.name}}',
        type: 'http',
        port: '',
        chartIds: '',
        configs: {
          walk: [],
          snmpCredentialsId: '',
          metrics_path: '',
          port: '',
          host: '{{asset.manageIp}}',
          scrape_interval: '',
          scrape_timeout: '',
          params: '',
          labels: '',
          basic_auth: {
            username: '',
            pin: ''
          },
          bearer_token: ''
        },
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
            disabled: false
          }
        ]
      }
    }
  },
  methods: {
    edit (row) {
      this.$get('monitor/module/' + row.id).then(res => {
        if (res.code === 200) {
          this.object = JSON.parse(JSON.stringify(res.data))
          this.object.configs = JSON.parse(this.object.configs)
          this.object.walk = this.object.configs.walk ? JSON.parse(JSON.stringify(this.object.configs.walk)) : []
          this.object.port = this.object.configs.port ? JSON.parse(JSON.stringify(this.object.configs.port)) : ''
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
          if (!this.object.chartIds) {
            this.object.chartIds = ''
          }
          this.rightBox.show = true
        }
      })
    },
    getTableData () {
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      if (this.searchLabel.projectIds) {
        localStorage.setItem('moduleProjectId', this.searchLabel.projectIds)
      } else {
        localStorage.removeItem('moduleProjectId')
      }
      this.tools.loading = true
      this.$get(this.url, this.searchLabel).then(response => {
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
      this.searchLabel.projectIds = localStorage.getItem('moduleProjectId')
    }
    if (localStorage.getItem('moduleProjectId')) {
      setTimeout(() => {
        this.$refs.dataList.$refs.searchInput.select_list.push({
          id: 11,
          name: 'project id',
          type: 'input',
          label: 'projectIds',
          disabled: false,
          val: localStorage.getItem('moduleProjectId')
        })
        this.$refs.dataList.$refs.searchInput.sreach_num = 1
      })
    }
  },
  mounted () {
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
