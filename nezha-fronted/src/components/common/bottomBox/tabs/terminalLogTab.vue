<template>
  <nz-bottom-data-list
    :showTitle='showTitle'
    :obj='obj'
    :targetTab="targetTab"
    :api="url"
    :tableId="tableId"
    :title="$t('config.user.name')"
    :custom-table-title.sync="tools.customTableTitle"
    :layout="['searchInput', 'elementSet']"
    :search-msg="searchMsg"
    :tabs="tabs"
    @search="search"
    @changeTab="changeTab"
  >
    <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
    <template v-slot>
      <terminal-log-table
        ref="dataTable"
        :orderByFa="'id'"
        v-my-loading="tools.loading"
        :loading="tools.loading"
        :api="url"
        :custom-table-title="tools.customTableTitle"
        :height="subTableHeight"
        :now-time="nowTime"
        :table-data="tableData"
        :terminaLogTab="true"
        @del="del"
        @edit="edit"
        @orderBy="tableDataSort"
        @reload="getTableData"
        @selectionChange="selectionChange"></terminal-log-table>
    </template>
    <template v-slot:pagination>
      <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
    </template>
  </nz-bottom-data-list>
</template>

<script>
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import terminalLogTable from '@/components/common/table/settings/terminalLogTable'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'

export default {
  name: 'terminalLogTab',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList,
    terminalLogTable
  },
  props: {
    obj: Object,
    showTitle: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    obj (n) {
      this.searchLabel = { userId: n.id }
      this.getTableData()
    }
  },
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
            id: 17,
            name: this.$t('overall.state'),
            type: 'terminalStatus',
            label: 'state',
            readonly: true,
            disabled: false
          }
        ]
      },
      nowTime: '',
      searchLabel: { userId: this.obj.id }
    }
  },
  methods: {
    getTableData (params) {
      if (params && Object.keys(params).length > 0) {
        for (const key in params) {
          this.$set(this.searchLabel, key, params[key])
        }
      }
      if (this.orderBy) {
        this.$set(this.searchLabel, 'orderBy', this.orderBy)
      } else {
        delete this.searchLabel.orderBy
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      if (this.obj) {
        this.$set(this.searchLabel, 'userId', this.obj.id)
      }
      this.$get(this.url, { ...this.searchLabel, ...this.searchCheckBox }).then(response => {
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
