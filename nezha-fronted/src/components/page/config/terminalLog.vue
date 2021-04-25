<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :layout="['searchInput', 'elementSet']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.terminalLog"
      @search="search"
      :search-msg="searchMsg">
      <template v-slot:default="slotProps">
        <terminal-log-table
          ref="dataTable"
          v-loading="slotProps.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :now-time="nowTime"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
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

export default {
  name: 'terminalLog',
  components: {
    nzDataList,
    terminalLogTable
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'terminal/session',
      tableId: 'terminalLogTable', // 需要分页的table的id，用于记录每页数量
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
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
            name: this.$t('config.terminallog.sourceIp'),
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
            name: this.$t('config.terminallog.protocol'),
            type: 'selectString',
            label: 'protocol',
            disabled: false
          }, {
            id: 17,
            name: this.$t('config.terminallog.status'),
            type: 'terminalStatus',
            label: 'state',
            disabled: false
          }
        ]
      },
      nowTime: ''
    }
  },
  methods: {
    getTableData () {
      const params = {
        ...this.searchLabel,
        pageNo: this.pageObj.pageNo,
        pageSize: this.pageObj.pageSize
      }
      this.$get(this.url, params).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          this.tableData = response.data.list
          this.nowTime = this.utcTimeToTimezoneStr(response.time)
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
    shutdown (record) {
      this.$confirm(this.$t('tip.killTerm'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$put('/terminal/kill', { uuid: record.uuid }).then(res => {
          if (res.code === 200) {
            this.$message.success(this.$t('config.terminallog.success'))
            this.bottomBox.showSubList = false
            this.getTableData()
          } else {
            this.$message.error(this.$t('config.terminallog.killErrorTip'))
          }
        })
      })
    }
  }
}
</script>
