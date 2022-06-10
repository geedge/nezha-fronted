<template>
    <nz-data-list
      ref="dataList"
      :api="profileShowLabel === 1 ? url : url2"
      :layout="layout"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.operationLog"
      class="operation-log"
      :operation-record="true"
      @search="search"
      :search-msg="searchMsg">
      <template v-slot:top-tool-left>
        <div class="profile-right__tabs-title">
          <div class="profile-right__tabs-active" :class="{'is-active': profileShowLabel === 1}" @click="tabsActive">{{$t('profile.operationRecord')}}</div>
          <div class="profile-right__tabs-active" style="margin-left: 10px" :class="{'is-active': profileShowLabel === 3}" @click="tabsActiveThree">{{$t('system.apikey.apiKey')}}</div>
          <div class="profile-right__tabs-active" style="margin-left: 10px" :class="{'is-active': profileShowLabel === 2}" @click="tabsActiveTow">{{$t('profile.changePassword')}}</div>
        </div>
        <div class="profile-hr"></div>
      </template>
      <template v-slot:default="slotProps">
        <operation-log-table
          v-if="profileShowLabel === 1"
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
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></operation-log-table>
        <self-api-key-tab v-if="profileShowLabel === 3"></self-api-key-tab>
        <template v-else-if="profileShowLabel === 2">
         <profileChangePin/>
        </template>
      </template>
      <!-- 分页组件 -->
      <template v-if="profileShowLabel ===1" v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
</template>
<script>
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import operationLogTable from '@/components/common/table/settings/operationLogTable'
import selfApiKeyTab from '@/components/page/config/system/selfApiKeyTab'
import profileChangePin from '@/components//page/config/profileChangePin'

export default {
  name: 'oparetionLog',
  components: {
    nzDataList,
    operationLogTable,
    profileChangePin,
    selfApiKeyTab
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'sys/log',
      url2: 'sys/apiKey/self',
      tableId: 'operationLogTable', // 需要分页的table的id，用于记录每页数量,
      mainTableHeight: this.$tableHeight.profile,
      username: localStorage.getItem('nz-username'),
      layout: [],
      searchMsg: { // 给搜索框子组件传递的信息
        searchLabelList: [
          {
            id: 11,
            name: this.$t('config.operationlog.type'),
            type: 'input',
            label: 'type',
            disabled: false
          }, {
            id: 13,
            name: this.$t('config.operationlog.operation'),
            type: 'selectString',
            label: 'operation',
            disabled: false
          }, {
            id: 14,
            name: this.$t('config.operationlog.operaId'),
            type: 'input',
            label: 'operaId',
            disabled: false
          }, {
            id: 16,
            name: this.$t('config.operationlog.state'),
            type: 'selectString',
            label: 'state',
            disabled: false
          }, {
            id: 17,
            name: this.$t('config.operationlog.params'),
            type: 'input',
            label: 'params',
            disabled: false
          }
        ]
      },
      profileShowLabel: 1
    }
  },
  mounted () {
    this.tabsActive()
    // this.getTableData()
  },
  methods: {
    tabsActive () {
      this.profileShowLabel = 1
      this.layout = ['searchInput', 'elementSet', 'pagination']
    },
    tabsActiveTow () {
      this.profileShowLabel = 2
      this.layout = []
    },
    tabsActiveThree () {
      this.profileShowLabel = 3
      this.layout = []
    },
    getTableData () {
      if (this.orderBy) {
        this.$set(this.searchLabel, 'orderBy', this.orderBy)
      } else {
        delete this.searchLabel.orderBy
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      // 获取 userId 作为过滤条件传给后台
      this.$set(this.searchLabel, 'userId', localStorage.getItem('nz-user-id'))
      this.tools.loading = true
      this.$get(this.url, { ...this.searchLabel }).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].status = response.data.list[i].status + ''
          }
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
          if (!this.scrollbarWrap && this.$refs.dataTable && this.$refs.dataTable.$refs.dataTable) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    }
  }
}
</script>
