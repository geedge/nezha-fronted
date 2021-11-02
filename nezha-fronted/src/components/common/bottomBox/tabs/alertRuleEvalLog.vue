<template>
  <nz-bottom-data-list
    :showTitle='showTitle'
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
      <alertRuleEvalLogTable
        ref="dataTable"
        v-loading="tools.loading"
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
        @selectionChange="selectionChange"></alertRuleEvalLogTable>
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
import alertRuleEvalLogTable from '@/components/common/table/alert/alertRuleEvalLogTable'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'

export default {
  name: 'alertRuleEvalLog',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList,
    alertRuleEvalLogTable
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
      url: 'alert/rule/1/evalLog',
      tableId: 'alertRuleEvalLogTable', // 需要分页的table的id，用于记录每页数量
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
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', -1)
      this.tools.loading = true
      if (this.obj) {
        this.$set(this.searchLabel, 'id', this.obj.id)
      }
      this.$get(this.url, { ...this.searchLabel, ...this.searchCheckBox }).then(response => {
        this.tools.loading = false
        this.nowTime = this.utcTimeToTimezoneStr(response.time)
        // response = {
        //   code: 200,
        //   msg: 'success',
        //   data: {
        //     list: [{
        //       ruleId: 1,
        //       state: 200,
        //       msg: 'success',
        //       stts: 1634215095277,
        //       etts: 1634215095377
        //     }, {
        //       ruleId: 1,
        //       state: 201,
        //       msg: 'success',
        //       stts: 1634215095477,
        //       etts: 1634215095577
        //     }
        //     ]
        //   }
        // }
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
  }
}
</script>
