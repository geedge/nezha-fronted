<template>
  <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
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
    <template v-slot:top-tool-right>
        <div class="top-tool-right">
         <div class="top-tool-search margin-r-20">
           <el-input ref="elementQuery"  @clear="clearInput" id="elementQuery" @focus="focusInput" @blur="blurInput" v-model="queryExpression" class="query-input-inactive" size="mini" clearable :placeholder="$t('project.endpoint.promExpr')" >
              <i slot="suffix" class="el-input__icon nz-icon nz-icon-search" style="float:right" @click="focusInput"></i>
            </el-input>
         </div>
         <pick-time
              ref="pickTime"
              v-model="searchTime"
              :refresh-data-func="dateChange"
              :showTimePicker="false"
              :use-chart-unit="false"
              class="pickTime margin-r-10">
            </pick-time>
        </div>
    </template>
    <template v-slot>
      <assetProcessTable
        ref="dataTable"
        :orderByFa="'id'"
        v-my-loading="tools.loading"
        :loading="tools.loading"
        :api="url"
        :custom-table-title="tools.customTableTitle"
        :height="subTableHeight"
        :filterTime="filterTime"
        :table-data="tableData"
        :terminaLogTab="true"
        :queryExpression="queryExpression"
        @del="del"
        @edit="edit"
        @orderBy="tableDataSort"
        @reload="getTableData"
        @selectionChange="selectionChange"></assetProcessTable>
    </template>
    <template v-slot:pagination>
      <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
    </template>
  </nz-bottom-data-list>
</template>

<script>
import bus from '@/libs/bus'
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import assetProcessTable from '@/components/common/table/asset/assetProcessTable'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'

export default {
  name: 'processBottomTab',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList,
    assetProcessTable
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
    },
    queryExpression (n) {
      const temp = this
      setTimeout(function () {
        temp.tableFilter()
      }, 500)
    }
  },
  data () {
    return {
      url: 'asset/oshi/process/',
      tableId: 'assetProcessTable', // 需要分页的table的id，用于记录每页数量
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: []
      },
      searchLabel: { id: this.obj.id },
      tableData: [],
      // 搜索组件数据
      queryExpression: '',
      tableDataCopy: '',
      // 刷新组件数据
      searchTime: bus.getTimezontDateRange(),
      filterTime: [
        bus.timeFormate(bus.getOffsetTimezoneData(-1), 'YYYY-MM-DD HH:mm:ss'),
        bus.timeFormate(bus.getOffsetTimezoneData(), 'YYYY-MM-DD HH:mm:ss')
      ]
    }
  },
  methods: {
    getTableData () {
      this.tableDataCopy = ''
      this.$get('asset/oshi/process?id=' + this.obj.id).then(response => {
        this.tools.loading = false
        this.nowTime = this.utcTimeToTimezoneStr(response.time)
        if (response.code === 200) {
          this.tableData = response.data.list
          this.tableDataCopy = JSON.stringify(this.tableData)
          if (!this.scrollbarWrap && this.$refs.dataTable && this.$refs.dataTable.$refs.dataTable) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    },
    // 搜索组件事件
    clearInput () {
      this.$refs.elementQuery.focus()
    },
    focusInput () {
      let classVal = document.getElementById('elementQuery').parentElement.getAttribute('class')
      classVal = classVal.replace('query-input-inactive', 'query-input-active')
      document.getElementById('elementQuery').parentElement.setAttribute('class', classVal)
      this.$refs.elementQuery.focus()
    },
    blurInput () {
      if (!this.queryExpression || this.queryExpression == '') {
        setTimeout(function () {
          let classVal = document.getElementById('elementQuery').parentElement.getAttribute('class')
          classVal = classVal.replace('query-input-active', 'query-input-inactive')
          document.getElementById('elementQuery').parentElement.setAttribute('class', classVal)
        }, 100)
      }
    },
    // 搜索数据过滤
    tableFilter () {
      const tableDatas = JSON.parse(this.tableDataCopy)
      this.tableData = tableDatas.filter((item) => {
        const element = item.name
        return element.indexOf(this.queryExpression) !== -1
      })
    },
    // 刷新组件事件
    dateChange () {
      this.searchTime = bus.getTimezontDateRange()
      this.filterTime[0] = bus.timeFormate(this.searchTime[0], 'YYYY-MM-DD HH:mm:ss')
      this.filterTime[1] = bus.timeFormate(this.searchTime[1], 'YYYY-MM-DD HH:mm:ss')
      this.tableFilter()
    },
    // 数据排序
    tableDataSort (item) {
      this.filterShowData(this.tableData, item)
    },
    filterShowData (source, ord) {
      let orderBy = null
      let sourceData = null
      orderBy = ord
      sourceData = JSON.parse(this.tableDataCopy)
      if (!orderBy || !orderBy.order) { // 没有排序 恢复默认值
        source = Object.assign([], sourceData)
      } else { // 排序之后的顺序
        if (orderBy.order === 'ascending') {
          source = source.sort(this.$tableSet.asce(orderBy.prop))
        }
        if (orderBy.order === 'descending') {
          source = source.sort(this.$tableSet.desc(orderBy.prop))
        }
      }
      return source
    }
  }
}
</script>
