<template>
  <div>
    <nzDetailView
      v-my-loading="detailViewLoading || tools.loading"
      v-if="detailType !== 'list'"
      :api="url"
      ref="detailList"
      :layout="['searchInput', 'elementSet', 'pagination','detailViewSet']"
      :from="fromRoute.terminalLog"
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
      </template>
      <template v-slot:nz-detail-view-list>
        <terminalLogDetail
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
        </terminalLogDetail>
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
      v-if="detailType === 'list'"
      :layout="['searchInput', 'elementSet', 'pagination','detailViewSet']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.terminalLog"
      @search="search"
      :search-msg="searchMsg"
      :detailType="detailType"
      @changeDetailType="changeDetailType"
      @getTableData="getTableData"
    >
      <template v-slot:default="slotProps">
        <terminal-log-table
          ref="dataTable"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :now-time="nowTime"
          :table-data="tableData"
          :terminalLog="true"
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @shutdown="shutdown"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></terminal-log-table>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
  </div>
</template>
<script>
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import terminalLogTable from '@/components/common/table/settings/terminalLogTable'
import nzDetailView from '@/components/common/detailView/nzDetailView'
import detailViewMixin from '@/components/common/mixin/detailViewMixin'
import terminalLogDetail from '@/components/common/detailView/list/terminalLogDetail/terminalLogDetail'
import detailViewTopSearch from '@/components/common/detailView/detailViewTopSearch'
import routerPathParams from '@/components/common/mixin/routerPathParams'

export default {
  name: 'terminalLog',
  components: {
    nzDataList,
    terminalLogTable,
    nzDetailView,
    terminalLogDetail,
    detailViewTopSearch
  },
  mixins: [dataListMixin, detailViewMixin, routerPathParams],
  data () {
    return {
      url: 'terminal/session',
      tableId: 'terminalLogTable', // 需要分页的table的id，用于记录每页数量
      orderBy: '-id',
      searchMsg: { // 给搜索框子组件传递的信息
        searchLabelList: [
          {
            id: 11,
            name: this.$t('config.terminallog.loginHost'),
            type: 'input',
            label: 'host',
            disabled: false
          }, {
            id: 12,
            name: this.$t('config.terminallog.loginUser'),
            type: 'input',
            label: 'loginUser',
            disabled: false
          }, {
            id: 13,
            name: this.$t('ping.sourceIp'),
            type: 'input',
            label: 'remoteAddr',
            disabled: false
          }, {
            id: 14,
            name: this.$t('config.terminallog.sourceUser'),
            type: 'input',
            label: 'username',
            disabled: false
          }, {
            id: 15,
            name: this.$t('config.terminallog.uuid'),
            type: 'input',
            label: 'uuid',
            disabled: false
          }, {
            id: 16,
            name: this.$t('webshell.protocol'),
            type: 'selectString',
            label: 'protocol',
            readonly: true,
            disabled: false
          }, {
            id: 'state',
            name: this.$t('overall.state'),
            type: 'select',
            label: 'terminalStatus',
            readonly: true,
            disabled: false
          }
        ]
      },
      nowTime: ''
    }
  },
  methods: {
    getTableData () {
      if (this.orderBy) {
        this.$set(this.searchLabel, 'orderBy', this.orderBy)
      } else {
        delete this.searchLabel.orderBy
      }
      const params = {
        ...this.searchLabel,
        pageNo: this.pageObj.pageNo,
        pageSize: this.pageObj.pageSize
      }
      this.tools.loading = true
      const path = this.fromRoute.terminalLog
      this.updatePath(params, path)
      this.$get(this.url, params).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          this.tableData = response.data.list
          this.nowTime = this.utcTimeToTimezoneStr(response.time)
          const globalSearchId = this.$store.getters.getGlobalSearchId
          let detailViewRightObj = ''
          if (globalSearchId) {
            detailViewRightObj = this.tableData.find(item => item.id === globalSearchId)
          } else {
            detailViewRightObj = this.tableData[0]
          }
          this.detailViewRightObj = this.$lodash.cloneDeep(detailViewRightObj)
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
    shutdown (record) {
      this.$confirm(this.$t('tip.killTerm'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$put('/terminal/kill', { uuid: record.uuid }).then(res => {
          if (res.code === 200) {
            this.$message.success(this.$t('overall.result.success'))
            this.$refs.dataList.bottomBox.showSubList = false
            this.getTableData()
          } else {
            this.$message.error(this.$t('config.terminallog.killErrorTip'))
          }
        })
      })
    }
  },
  created () {
    const searchKeys = {
      // key: path 键
      // value: vue set 参数
      pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
      pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
      orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
      host: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'host',
        type: 'string',
        defaultJson: {
          disabled: false,
          id: 11,
          label: 'host',
          name: 'Login host',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      },
      username: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'username',
        type: 'string',
        defaultJson: {
          disabled: false,
          id: 14,
          label: 'username',
          name: 'Source user',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      },
      loginUser: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'loginUser',
        type: 'string',
        defaultJson: {
          disabled: false,
          id: 12,
          label: 'loginUser',
          name: 'Login user',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      },
      remoteAddr: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'remoteAddr',
        type: 'string',
        defaultJson: {
          disabled: false,
          id: 13,
          label: 'remoteAddr',
          name: 'Source IP',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      },
      uuid: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'uuid',
        type: 'string',
        defaultJson: {
          disabled: false,
          id: 15,
          label: 'uuid',
          name: 'UUID',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      },
      protocol: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'protocol',
        type: 'string',
        defaultJson: {
          disabled: false,
          id: 16,
          label: 'protocol',
          name: 'Protocol',
          readonly: true,
          type: 'selectString',
          val: ''
        },
        jsonKey: 'val'
      },
      state: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'state',
        type: 'number',
        defaultJson: {
          disabled: false,
          id: 17,
          label: 'state',
          name: 'State',
          readonly: true,
          type: 'terminalStatus',
          val: ''
        },
        jsonKey: 'val'
      }
    }
    this.initQueryFromPath(searchKeys)
  }
}
</script>
