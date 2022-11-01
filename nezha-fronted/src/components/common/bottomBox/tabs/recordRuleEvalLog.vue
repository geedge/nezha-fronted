<template>
  <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
      :tableId="tableId"
    :api="url"
    :custom-table-title.sync="tools.customTableTitle"
    :layout="['elementSet']"
    :search-msg="searchMsg"
    :tabs="tabs"
    :targetTab="targetTab"
    :showPagination="false"
    @search="search"
    @changeTab="changeTab"
  >
    <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
    <template v-slot>
      <recordRuleEvalLogTable
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
        @selectionChange="selectionChange"></recordRuleEvalLogTable>
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
import recordRuleEvalLogTable from '@/components/common/table/settings/recordRuleEvalLogTable'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'

export default {
  name: 'recordRuleEvalLog',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList,
    recordRuleEvalLogTable
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
      this.searchLabel = { id: n.id }
      this.getTableData()
    }
  },
  data () {
    return {
      url: 'record/rule/1/evalLog',
      tableId: 'recordRuleEvalLogTable', // 需要分页的table的id，用于记录每页数量
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          {
            id: 11,
            name: this.$t('config.terminallog.loginHost'),
            type: 'input',
            label: 'host',
            disabled: false
          }
        ]
      },
      nowTime: '',
      searchLabel: { id: this.obj.id }
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
      this.$set(this.searchLabel, 'pageSize', -1)
      this.tools.loading = true
      if (this.obj) {
        this.$set(this.searchLabel, 'id', this.obj.id)
      }
      this.$get('record/rule/' + this.obj.id + '/evalLog').then(response => {
        this.tools.loading = false
        this.nowTime = this.utcTimeToTimezoneStr(response.time)
        if (response.code === 200) {
          this.tableData = response.data.list
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
