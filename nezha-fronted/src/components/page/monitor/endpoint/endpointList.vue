<template>
  <div class="endpoint-list">
    <nz-data-list
      ref="dataList"
      :api="url"
      class="dataList"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.endpoint"
      :layout="['searchInput', 'elementSet']"
      :hasSearch="true"
      :search-msg="searchMsg">
      <template v-slot:top-tool-right>
        <export-excel
          id="expression-template-list"
          v-has="''"
          export-url="monitor/endpoint/export"
          import-url="monitor/endpoint/import"
          export-file-name="expression-template"
          :params="searchLabel"
          :permissions="{import: 'asset_add', export: 'asset_add'}"
          @afterImport="getTableData"
          class="top-tool-export margin-r-10"
        >
          <template slot="optionZone">
            <button id="account-add" v-has="'monitor_endpoint_add'" :title="$t('overall.createUser')" class="top-tool-btn margin-l-20"
                    type="button" @click="add">
              <i class="nz-icon-create-square nz-icon"></i>
            </button>
          </template>
        </export-excel>
        <delete-button id="account-list-batch-delete" v-has="'monitor_endpoint_delete'" :api="url" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot:search>
        <clickSearch :titleSearchList="titleSearchList" :selectValue.sync="selectValue" @reload="reloadTable"/>
      </template>
      <template v-slot="slotProps">
        <endpoint-table
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
      <edit-endpoint-box-new v-if="rightBox.editShow" :module="object" @close="closeRightEditBox" :disabled="true" :type="'edit'"></edit-endpoint-box-new>
    </transition>
  </div>
</template>
<script>
import deleteButton from '@/components/common/deleteButton'
import addEndpointBox from '@/components/common/rightBox/addEndpointBox'
import exportXLSX from '@/components/common/exportXLSX'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import endpointTable from '@/components/common/table/settings/endpointTable'
import EditEndpointBoxNew from '@/components/common/rightBox/editEndpointBoxNew'
import clickSearch from '@/components/common/clickSearch'

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
    'export-excel': exportXLSX,
    clickSearch
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'monitor/endpoint',
      blankObject: {}, // 新增/编辑的endpoint
      tableId: 'endpointTable',
      queryPermission: 'account_view',
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 11,
          name: 'project id',
          type: 'input',
          label: 'projectIds',
          disabled: false
        }, {
          id: 12,
          name: 'endpoint name',
          type: 'input',
          label: 'name',
          disabled: false
        },
        {
          id: 13,
          name: 'endpoint id',
          type: 'input',
          label: 'id',
          disabled: false
        }]
      },
      roles: [],
      rightBox: {
        editShow: false,
        show: false
      },
      titleSearch: {},
      titleSearchList: {
        project: {
          label: 'Project',
          key: 'projectIds',
          type: 'checkBox',
          children: [],
          show: true
        },
        module: {
          label: 'Module',
          key: 'moduleIds',
          type: 'checkBox',
          children: [],
          show: true
        },
        state: {
          label: 'state',
          key: 'state',
          type: 'checkBox',
          children: [],
          show: true
        }
      },
      selectValue: {
        projectIds: [],
        moduleIds: [],
        state: []
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
    getTableData () {
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      if (this.searchLabel.projectIds) {
        localStorage.setItem('endpointProjectId', this.searchLabel.projectIds)
      } else {
        localStorage.removeItem('endpointProjectId')
      }
      const params = {
        ...this.searchLabel,
        ...this.titleSearch
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
    reloadTable () {
      this.getTableData()
    },
    getTitleSearch () {
      this.$get('monitor/project', { pageSize: -1 }).then(res => {
        console.log(res)
        if (res.code === 200) {
          res.data.list.forEach((item) => {
            this.titleSearchList.project.children.push(
              { key: item.name, value: item.id, name: item.name }
            )
          })
        }
      })
      this.$get('monitor/module', { pageSize: -1 }).then(res => {
        console.log(res)
        if (res.code === 200) {
          res.data.list.forEach((item) => {
            this.titleSearchList.module.children.push(
              { key: item.name, value: item.id, name: item.name }
            )
          })
        }
      })
      this.titleSearchList.state.children = [{ key: 'up', value: 'up', name: 'up' }, { key: 'down', value: 'down', name: 'up' }]
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
