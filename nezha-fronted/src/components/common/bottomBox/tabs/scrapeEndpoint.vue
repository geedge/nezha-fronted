<template>
  <div class="scrape-endpoint">
    <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
      :tableId="tableId"
      :targetTab.sync="targetTab"
      :api="url"
      style="height: 100%"
      :custom-table-title.sync="tools.customTableTitle"
      :layout="['elementSet']"
      :tabs="tabs"
      @changeTab="changeTab"
    >
      <template v-slot:title><span :title="obj.name || obj.dc.name">{{obj.name || obj.dc.name}}</span></template>
      <template v-slot:top-tool-right>
        <div class="top-tool-right">
          <div style="margin-right: 15px;">
            <el-input size="small" ref="inputDate" v-model="inputDateSearch" @clear="clearInput" id="inputDate" class="input-with" @focus="focus" @blur="blur">
              <el-button slot="append" :title="$t('overall.search')" icon="el-icon-search" @click="focus"></el-button>
            </el-input>
          </div>
        </div>
      </template>
      <template v-slot>
        <scrape-endpoint-table
          ref="dataTable"
          :orderByFa="'id'"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          :currentTableData="currentTableData"
          :inputDateSearch="inputDateSearch"
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
import bus from '@/libs/bus'
import { sameLabels } from '@/components/common/js/constants'
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
      currentTableData: [],
      hideSameLabels: true,
      inputDateSearch: '',
      tableDataCopy: '',
      pageObj: {
        pageSize: 20,
        pageNo: 1,
        total: 0
      },
      timer: null,
      sameLabels: ['endpointLabels', 'labelsType', 'lastScrape', 'lastScrapeDuration', 'health', 'lastError', 'str', 'healthOther'],
      orderBy: {},
      fromBottom: true
    }
  },
  watch: {
    inputDateSearch (n, o) {
      const temp = this
      setTimeout(function () {
        temp.tableFilter()
      }, 500)
    },
    obj: {
      immediate: true,
      deep: true,
      async handler (n, o) {
        if (n) {
          this.searchLabel = {}
          this.inputDateSearch = ''
          await this.getPreference()
          this.getTableData()
        }
      }
    }
  },
  methods: {
    // input 获取焦点时触发
    focus () {
      let classVal = document.getElementById('inputDate').parentElement.getAttribute('class')
      classVal = classVal.replace('input-with', 'input-with')
      document.getElementById('inputDate').parentElement.setAttribute('class', classVal)
      this.$refs.inputDate.focus()
    },
    // input 失去焦点时触发
    blur () {
      if (!this.inputDateSearch || this.inputDateSearch == '') {
        setTimeout(function () {
          let classVal = document.getElementById('inputDate').parentElement.getAttribute('class')
          classVal = classVal.replace('input-with', 'input-with')
          document.getElementById('inputDate').parentElement.setAttribute('class', classVal)
        }, 100)
      }
    },
    clearInput () {
      this.$refs.inputDate.focus()
    },
    // 数据请求
    getTableData () {
      this.timer = setTimeout(() => {
        this.$set(this.searchLabel, 'dcId', this.obj.dcId)
        this.$set(this.searchLabel, 'agentId', this.obj.id)
        this.$set(this.searchLabel, 'type', this.obj.type)
        this.$get(this.url, { ...this.searchLabel }).then(response => {
          if (response.code === 200) {
            this.tools.loading = false
            this.tableData = response.data.activeTargets.map(item => {
              const buildIn = ['asset', 'endpoint', 'module', 'cpu', 'dc', 'project', 'parent_asset', 'user']
              buildIn.forEach(label => {
                if (label === 'dc') {
                  item[label] = {
                    id: item.labels['datacenter' + '_id'],
                    position: {},
                    loading: false
                  }
                } else {
                  item[label] = {
                    id: item.labels[label + '_id'],
                    position: {},
                    loading: false
                  }
                }
              })
              item.lastScrapeDuration = (item.lastScrapeDuration * 1000).toFixed(3) + 'ms'
              item.lastScrape = this.momentTz(item.lastScrape)
              if (item.health == 'up') {
                item.healthOther = 'UP'
              }
              if (item.health == 'down') {
                item.healthOther = 'DOWN'
              }
              return item
            })
            const globalSearchId = this.$store.getters.getGlobalSearchId
            let detailViewRightObj = ''
            if (globalSearchId) {
              detailViewRightObj = this.tableData.find(item => item.id === globalSearchId)
            } else {
              detailViewRightObj = this.tableData[0]
            }
            this.detailViewRightObj = this.$lodash.cloneDeep(detailViewRightObj)
            this.inputDateQuery = this.handlerTableData(this.tableData)
            this.pageObj.total = this.tableData.length
            if (!this.scrollbarWrap) {
              this.$nextTick(() => {
                this.handleCurrentChange()
              })
            }
          } else {
            this.tools.loading = false
            this.$message.error(response.msg)
          }
        })
      }, 500)
    },
    // 搜索字段的处理
    handlerTableData (dates) {
      const tableDates = []
      for (const date of dates) {
        const endpointLabels = date.discoveredLabels.endpoint || ''
        const labelsType = date.labels.type || ''
        const lastScrape = bus.timeFormate(date.lastScrape, this.timeFormatMain) || ''
        const lastScrapeDuration = date.lastScrapeDuration || ''
        const health = date.health || ''
        const healthOther = date.healthOther || ''
        const lastError = date.lastError || ''
        const asset = date.asset
        const cpu = date.cpu
        const dc = date.dc
        const endpoint = date.endpoint
        const module = date.module
        const parent_asset = date.parent_asset
        const project = date.project
        const user = date.user
        const labels = date.labels
        const discoveredLabels = date.discoveredLabels
        const str = JSON.stringify(date.discoveredLabels)
        const tableData = {
          endpointLabels,
          endpoint,
          labelsType,
          lastScrape,
          lastScrapeDuration,
          health,
          lastError,
          asset,
          dc,
          cpu,
          module,
          project,
          parent_asset,
          user,
          labels,
          discoveredLabels,
          healthOther,
          str
        }
        let simpleTemp = ''
        const keys = Object.keys(tableData)
        for (const index in keys) {
          const key = keys[index]
          if (this.sameLabels.some((i) => { return i === key })) {
            if (tableData[key]) {
              simpleTemp += key + tableData[key]
            }
          }
        }
        if (simpleTemp.indexOf(',') !== -1) {
          simpleTemp = simpleTemp.substr(0, simpleTemp.length - 1)
        }
        tableData.tableDateAll = simpleTemp
        tableDates.push(tableData)
      }
      return tableDates
    },
    // 对字段进行匹配
    tableFilter () {
      const temp = this
      const tableDatas = this.inputDateQuery
      this.tableData = tableDatas.filter((item) => {
        if (item.endpoint) {
          const element = temp.hideSameLabels ? item.tableDateAll : item.endpoint
          return element.indexOf(this.inputDateSearch) !== -1
        }
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
      this.setPreference()
      this.handleCurrentChange()
    },
    // 计算当前分页需要返回数据的条数
    handleCurrentChange () {
      const data = this.sortShowData()
      this.pageObj.total = data.length
      this.currentTableData = data.slice(
        (this.pageObj.pageNo - 1) * this.pageObj.pageSize,
        this.pageObj.pageNo * this.pageObj.pageSize
      )
    },
    tableDataSort (orderBy) {
      this.orderBy = orderBy
      this.handleCurrentChange()
    },
    sortShowData () {
      const orderBy = this.orderBy
      const originalData = this.$lodash.cloneDeep(this.tableData)
      let data = null
      if (!orderBy || !orderBy.order) { // 没有排序 恢复默认值
        data = Object.assign([], originalData)
      } else { // 排序之后的顺序
        if (orderBy.order === 'ascending') {
          data = originalData.sort(this.asce(orderBy.prop))
        }
        if (orderBy.order === 'descending') {
          data = originalData.sort(this.desc(orderBy.prop))
        }
      }
      return data
    },
    // 本地正序
    asce (prop) {
      return function (obj1, obj2) {
        const val1 = obj1[prop]
        const val2 = obj2[prop]
        if (val1 < val2) {
          return -1
        } else if (val1 > val2) {
          return 1
        } else {
          return 0
        }
      }
    },
    // 本地倒序
    desc (prop) {
      return function (obj1, obj2) {
        const val1 = obj1[prop]
        const val2 = obj2[prop]
        if (val1 < val2) {
          return 1
        } else if (val1 > val2) {
          return -1
        } else {
          return 0
        }
      }
    }

  },
  mounted () {
  },
  beforeDestroy () {
    // 移除定时器
    clearInterval(this.timer)
  },
  created () {

  }
}
</script>
