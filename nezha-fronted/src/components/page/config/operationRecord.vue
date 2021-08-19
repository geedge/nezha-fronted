<template>
    <nz-data-list
      ref="dataList"
      :api="url"
      :layout="layout"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.operationLog"
      @search="search"
      :search-msg="searchMsg">
      <template v-slot:top-tool-left>
        <div class="profile-right__tabs-title" style="margin-left: -20px">
          <div class="profile-right__tabs-active" :class="{'is-active': profileShow}" @click="tabsActive">{{$t('profile.operationRecord')}}</div>
          <div class="profile-right__tabs-active" :class="{'is-active': !profileShow}" @click="tabsActiveTow">{{$t('profile.changePassword')}}</div>
        </div>
        <div class="profile-hr"></div>
      </template>
      <template v-slot:default="slotProps">
        <operation-log-table
          v-if="profileShow"
          ref="dataTable"
          v-loading="tools.loading"
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
        <template v-else>
         <profileChangePin style="width: 640px; padding: 20px 0 0 20px"/>
        </template>
      </template>
      <!-- 分页组件 -->
      <template v-if="profileShow" v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
</template>
<script>
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import operationLogTable from '@/components/common/table/settings/operationLogTable'
import profileChangePin from '@/components//page/config/profileChangePin'

export default {
  name: 'oparetionLog',
  components: {
    nzDataList,
    operationLogTable,
    profileChangePin
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'sys/log',
      tableId: 'operationLogTable', // 需要分页的table的id，用于记录每页数量,
      mainTableHeight: this.$tableHeight.profileNormal,
      username: sessionStorage.getItem('nz-username'),
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
      profileShow: true
    }
  },
  mounted () {
    this.tabsActive()
  },
  methods: {
    tabsActive () {
      this.profileShow = true
      this.layout = ['searchInput', 'elementSet']
    },
    tabsActiveTow () {
      this.profileShow = false
      this.layout = []
    },
    getTableData (params) {
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
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
          if (!this.scrollbarWrap) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    },
  }
}
</script>
<style lang="scss" scoped>
.top-tool-left {
  .profile-right__tabs-title {
    display: flex;
    justify-content: flex-start;
    position: relative;
    .profile-right__tabs-active {
      margin-right: 40px;
      margin-left: -2px;
      padding-top: 25px;
      font-size: 14px;
      height: 30px;
      color: #666666;
      letter-spacing: 0;
      font-weight: 400;
      cursor: pointer;
      opacity: .6;
      transform: translateX(20%);
    }
    .is-active {
      border-bottom: 2px solid  #FA901C;
      font-size: 14px;
      color: #333333;
      letter-spacing: 0;
      font-weight: bold;
      opacity: 1;
      z-index: 1;
    }
  }
  .profile-hr {
    position: absolute;
    top: 55px;
    width: calc(100% - 40px);
    height: 2px;
    background-color: #eceef0;
  }
}
</style>
