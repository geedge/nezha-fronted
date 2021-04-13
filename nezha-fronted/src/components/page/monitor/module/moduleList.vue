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
        <button id="account-add" v-has="'monitor_module_add'" :title="$t('overall.createUser')" class="top-tool-btn margin-l-20"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
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

export default {
  name: 'moduleList',
  components: {
    nzDataList,
    moduleBox,
    deleteButton,
    moduleTable
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
        endpointHostTmpl: '',
        type: 'http',
        port: 9100,
        configs: {
          scrape_interval: '',
          scrape_timeout: '',
          metrics_path: '',
          basic_auth: {
            username: '',
            password: ''
          },
          bearer_token: '',
          labels: '',
          params: '',
          paramObj: [],
          labelModule: [],
          walk: [],
          host: '{{asset.manageIp}}',
          port: '',
          snmpCredentialsId: 'public'
        },
        walk: []
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
          id: 10,
          name: 'module id',
          type: 'input',
          label: 'id',
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
      this.rightBox.show = true
    }
  },
  computed: {
  },
  mounted () {
  }
}
</script>
