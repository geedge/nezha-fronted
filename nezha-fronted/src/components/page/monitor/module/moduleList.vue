<template>
  <div class="module-list">
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.user"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg">
      <template v-slot:top-tool-right>
        <export-excel
          id="expression-template-list"
          v-has="''"
          export-url="monitor/module/export"
          import-url="monitor/module/import"
          export-file-name="expression-template"
          :params="searchLabel"
          :permissions="{import: 'asset_add', export: 'asset_add'}"
          @afterImport="getTableData"
          class="top-tool-export margin-r-10"
        >
          <template slot="optionZone">
            <button id="account-add" v-has="'monitor_module_add'" :title="$t('overall.createUser')" class="top-tool-btn margin-l-20"
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
          v-loading="slotProps.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
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
  </div>
</template>
<script>
import deleteButton from '@/components/common/deleteButton'
import moduleBox from '@/components/common/rightBox/moduleBox'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import moduleTable from '@/components/common/table/settings/moduleTable'
import exportXLSX from '@/components/common/exportXLSX'
export default {
  beforeRouteLeave (to, from, next) { // 路由离开之前触发
    localStorage.removeItem('moduleProjectId')
    next()
  },
  name: 'moduleList',
  components: {
    nzDataList,
    moduleBox,
    deleteButton,
    moduleTable,
    'export-excel': exportXLSX
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
        port: 9100,
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
            password: ''
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
      tableId: 'moduleTable',
      queryPermission: 'account_view',
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 10,
          name: 'module name',
          type: 'input',
          label: 'name',
          disabled: false
        },
        {
          id: 11,
          name: 'project id',
          type: 'input',
          label: 'projectIds',
          disabled: false
        },
        {
          id: 12,
          name: 'module id',
          type: 'input',
          label: 'ids',
          disabled: false
        }]
      },
      roles: []
    }
  },
  methods: {
    edit (u) {
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
      this.rightBox.show = true
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
    }
  },
  computed: {
  },
  created () {
    if (localStorage.getItem('moduleProjectId')) {

      this.searchLabel.projectIds = localStorage.getItem('moduleProjectId')
    }
  },
  mounted () {
    if (localStorage.getItem('moduleProjectId')) {
      this.$refs.dataList.$refs.searchInput.select_list.push({
        id: 11,
        name: 'project id',
        type: 'input',
        label: 'projectIds',
        disabled: false,
        val: localStorage.getItem('moduleProjectId')
      })
      this.$refs.dataList.$refs.searchInput.sreach_num = 1
    }
  }
}
</script>
