<template>
  <div>
    <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
      :targetTab.sync="targetTab"
      :api="url"
      style="height: 100%"
      :custom-table-title.sync="tools.customTableTitle"
      :layout="['elementSet']"
      :search-msg="searchMsg"
      :tabs="tabs"
      @search="search"
      @changeTab="changeTab"
    >
      <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
      <template v-slot:top-tool-right>
        <div class="top-tool-right">
          <div style="margin-right: 15px;">
            <el-input size="small" ref="inputDate" v-model="inputDate" id="inputDate" class="input-with" @focus="focus" @blur="blur">
              <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
          </div>
        </div>
      </template>
      <template v-slot>
        <scrape-endpoint-table
          ref="dataTable"
          v-loading="tools.loading"
          :loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          :currentTableData="currentTableData"
          :inputDate="inputDate"
          @del="del"
          @edit="edit"
          @copy="copy"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
        ></scrape-endpoint-table>
      </template>
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-bottom-data-list>
  </div>
</template>
<script>
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import scrapeEndpointTable from '@/components/common/table/settings/scrapeEndpointTable'
import subDataList from '@/components/common/mixin/subDataList'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'
export default {
  name: 'scrapeEndpoint',
  components: {
    nzBottomDataList,
    scrapeEndpointTable
  },
  mixins: [dataListMixin, subDataList, detailViewRightMixin],
  data () {
    return {
      url: '/prom/api/v1/targets',
      tableId: 'promTargetsTable', // 需要分页的table的id，用于记录每页数量
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          name: this.$t('config.scrapeEndpoint.endpoint'),
          type: 'input',
          label: 'endpointId',
          disabled: false
        }, {
          name: this.$t('config.scrapeEndpoint.labels'),
          type: 'input',
          label: 'labels',
          disabled: false
        }, {
          name: this.$t('config.scrapeEndpoint.lastScrape'),
          type: 'input',
          label: 'lastScrape',
          disabled: false
        }, {
          name: this.$t('config.scrapeEndpoint.scrapeDuration'),
          type: 'input',
          label: 'lastScrapeDuration',
          disabled: false
        }, {
          name: this.$t('config.scrapeEndpoint.state'),
          type: 'select',
          label: 'health',
          disabled: false
        }, {
          name: this.$t('config.scrapeEndpoint.error'),
          type: 'input',
          label: 'lastError',
          disabled: false
        }]
      },
      currentTableData: [],
      hideSameLabels: true,
      inputDate: '',
      tableDataCopy: '',
      pageObj: {
        pageSize: 20,
        pageNo: 1,
        total: 0
      }
    }
  },
  watch: {
    inputDate (n, o) {
      this.handleCurrentChange()
      const temp = this
      setTimeout(function () {
        temp.tableFilter()
      }, 500)
    }
  },
  methods: {
    focus () {
      let classVal = document.getElementById('inputDate').parentElement.getAttribute('class')
      classVal = classVal.replace('input-with', 'input-with')
      document.getElementById('inputDate').parentElement.setAttribute('class', classVal)
      this.$refs.inputDate.focus()
    },
    blur () {
      if (!this.inputDate || this.inputDate == '') {
        setTimeout(function () {
          let classVal = document.getElementById('inputDate').parentElement.getAttribute('class')
          classVal = classVal.replace('input-with', 'input-with')
          document.getElementById('inputDate').parentElement.setAttribute('class', classVal)
        }, 100)
      }
    },
    getTableData () {
      this.$set(this.searchLabel, 'dcId', this.obj.dcId)
      this.$set(this.searchLabel, 'agentId', this.obj.id)
      this.$set(this.searchLabel, 'type', this.obj.type)
      this.$get(this.url, { ...this.searchLabel }).then(response => {
        this.tools.loading = false
        this.tableData = response.data.activeTargets
        // this.tableData = scrapeEndpoints[0].data.activeTargets
        this.detailViewRightObj = this.tableData[0]
        this.inputDateQuery = this.handlerTableData(this.tableData)
        this.pageObj.total = this.tableData.length
        if (!this.scrollbarWrap) {
          this.$nextTick(() => {
            this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
            this.toTopBtnHandler(this.scrollbarWrap)
            this.handleCurrentChange()
          })
        }
      })
    },
    handlerTableData (date) {
      const tableDates = []
      let endpoint = ''
      let labelsType = ''
      let lastScrape = ''
      let lastScrapeDuration = ''
      let health = ''
      let lastError = ''
      let tableDateAll = ''
      date.map(e => {
        endpoint = e.discoveredLabels.endpoint || ''
        labelsType = e.labels.type || ''
        lastScrape = e.lastScrape || ''
        lastScrapeDuration = e.lastScrapeDuration || ''
        health = e.health || ''
        lastError = e.lastError || ''
        tableDateAll = endpoint + labelsType + lastScrape + lastScrapeDuration + health + lastError + tableDateAll
        const tableData = { endpoint, labelsType, lastScrape, lastScrapeDuration, health, lastError, tableDateAll }
        tableDates.push(tableData)
      })
      return tableDates
    },
    tableFilter () {
      const temp = this
      const tableDatas = this.inputDateQuery
      console.log(tableDatas)
      this.tableData = tableDatas.filter((item) => {
        const element = temp.hideSameLabels ? item.tableDateAll : item.endpoint
        return element.indexOf(this.inputDate) !== -1
      })
      this.pageObj.pageNo = 1
      this.handleCurrentChange()
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      this.handleCurrentChange()
    },
    pageSize (val) {
      this.pageObj.pageSize = val
      localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val)
      this.handleCurrentChange()
    },
    handleCurrentChange () {
      this.pageObj.total = this.tableData.length
      this.currentTableData = this.tableData.slice(
        (this.pageObj.pageNo - 1) * this.pageObj.pageSize,
        this.pageObj.pageNo * this.pageObj.pageSize
      )
    }
  },
  mounted () {
  }
}
</script>
