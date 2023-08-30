<template>
  <div class="mc" @click.self="clickOutside">
    <div class="right-box right-box-project-asset">
      <div class="right-box-title">{{ moduleName }} / {{$t('asset.asset')}}</div>
      <nz-data-list
        ref="dataList"
        :api="url"
        :custom-table-title.sync="tableTitle"
        :from="fromRoute.asset"
        :layout="['searchInput', 'pagination']"
        :search-msg="searchMsg"
        @search="search"
        :search-right="true"
      >
        <template v-slot:default="slotProps">
          <asset-table
            ref="dataTable"
            :orderByFa="orderBy"
            v-my-loading="tools.loading"
            :loading="tools.loading"
            :api="url"
            :custom-table-title="tableTitle"
            :height="mainTableHeight"
            :table-data="tableData"
            :showOption="false"
            @orderBy="tableDataSort"
            @reload="getTableData"></asset-table>
        </template>
        <!-- 分页组件 -->
        <template v-slot:pagination>
          <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
        </template>
      </nz-data-list>
    </div>
  </div>
</template>

<script>
import dataListMixin from '@/components/common/mixin/dataList'
import assetTable from '@/components/common/table/asset/assetTable'
export default {
  name: 'assetTableProject',
  props: {
    moduleId: {},
    projectId: {},
    moduleName: String
  },
  components: {
    assetTable
  },
  mixins: [dataListMixin],
  watch: {
  },
  computed: {
    tagType () {
      return (key) => {
        if (key == 'asset' || key == 'module' || key == 'project' || key == 'datacenter' || key == 'endpoint') {
          return 'normal'
        } else {
          return 'info'
        }
      }
    },
    tagValue () {
      return (key, value) => {
        if (key == 'type') {
          if (value == 1) {
            value = this.$t('project.project.projectName')
          } else if (value == 2) {
            value = this.$t('module.module.module')
          } else if (value == 3) {
            value = this.$t('asset.asset')
          }
        }
        return key + '：' + value
      }
    }
  },
  data () {
    return {
      url: 'asset/asset',
      tableId: 'projectAsset',
      pageObj: {
        pageNo: 1,
        pageSize: this.$CONSTANTS.defaultPageSize,
        total: 0
      },
      mainTableHeight: 'calc(100% - 64px)',
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 110
        }, {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true,
          width: 110
        },
        {
          label: this.$t('asset.manageIp'),
          prop: 'manageIp',
          show: true,
          width: 140
        },
        {
          label: this.$t('asset.pingInfo'),
          prop: 'pingInfo',
          show: true,
          width: 110
        }, {
          label: this.$t('overall.alert'),
          prop: 'alertNum',
          show: true,
          width: 120
        }, {
          label: this.$t('asset.endpointNum2'),
          prop: 'endpointNum',
          show: true,
          width: 160
        }],
      searchMsg: { // 给搜索框子组件传递的信息
        searchLabelList: [{
          name: 'ID',
          type: 'input',
          label: 'ids',
          disabled: false
        }, {
          name: this.$t('overall.name'),
          type: 'input',
          label: 'name',
          disabled: false
        }, {
          name: this.$t('asset.manageIp'),
          type: 'input',
          label: 'manageIp',
          disabled: false
        }]
      },
      tableData: [],
      loading: false,
      tableHeight: '100%',
      searchLabel: {},
      deleteBox: {},
      needAlertDaysData: true,
      trendKey: 'assetId',
      projectPopTable: true
    }
  },
  created () {
  },
  async mounted () {
    await this.getPreference()
    this.getTableTitle()
    this.getTableData()
  },
  methods: {
    // 获取用户偏好
    async getPreference () {
      const res = await this.$get('/sys/user/preference', { key: this.tableId })
      if (res.data[this.tableId]) {
        const data = JSON.parse(res.data[this.tableId])
        this.pageObj.pageSize = data.pageSize
      }
    },
    // 设置用户偏好
    setPreference () {
      const params = {
        pageSize: this.pageObj.pageSize
      }
      this.$put('/sys/user/preference', { [this.tableId]: JSON.stringify(params) }).then(res => {
        if (res.code !== 200) {
          this.$message.error(res.msg || res.error)
        }
      })
    },
    getTableData: function () {
      this.tools.loading = true
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.$set(this.searchLabel, 'moduleIds', this.moduleId)
      this.$get(this.url, { ...this.searchLabel }).then(response => {
        this.tools.loading = false
        if (response.code == 200) {
          if (this.needAlertDaysData) {
            response.data.list.forEach(item => {
              item.trendLoading = true
              item.left = 0
              item.top = 0
              item.alertNumtooltipShow = false
              item.alertDaysData = [
                {
                  metric: { priority: 'P1' },
                  values: [[0, 0]]
                },
                {
                  metric: { priority: 'P2' },
                  values: [[0, 0]]
                },
                {
                  metric: { priority: 'P3' },
                  values: [[0, 0]]
                }
              ]
            })
          }
          this.tableData = response.data.list
          this.deleteBox.ids = ''
          this.pageObj.total = response.data.total
        }
      })
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      this.getTableData()
    },
    pageSize (val) {
      this.pageObj.pageSize = val
      this.setPreference()
      this.getTableData()
    },
    selectChange (s) {
      const ids = []
      this.deleteBox.ids = ''
      s.forEach(item => {
        ids.push(item.id)
      })
      this.deleteBox.ids = ids.join(',')
    },
    tableDataSort (item) {
      let orderBy = ''
      if (item.order === 'ascending') {
        orderBy = item.prop
      }
      if (item.order === 'descending') {
        orderBy = '-' + item.prop
      }
      this.pageObj.orderBy = orderBy
      this.$set(this.searchLabel, 'orderBy', orderBy)
      this.getTableData()
    },
    /* 关闭弹框 */
    esc (refresh) {
      this.$emit('close', refresh)
    },
    clickOutside () {
      this.esc(false)
    },
    messageStyle (e) {
      if (e.column.label == 'Alerts' || e.column.label == this.$t('overall.alert')) {
        if (e.row.alertNum > 0) {
          return 'danger'
        } else {
          return 'success'
        }
      }
      return ''
    },
    formatPingTime: function (str) {
      if (!str || str == '') {
        return this.$t('asset.assetStatPre') + this.$t('asset.assetStatDown')
      }
      const ds = '-'
      const ts = ':'
      const time = new Date(str)
      const year = time.getFullYear()
      const month = time.getMonth() + 1 > 9 ? time.getMonth() + 1 : ('0' + (time.getMonth() + 1))
      const day = time.getDate() > 9 ? time.getDate() : ('0' + time.getDate())
      const hours = time.getHours() > 9 ? time.getHours() : ('0' + time.getHours())
      const minutes = time.getMinutes() > 9 ? time.getMinutes() : ('0' + time.getMinutes())
      const seconds = time.getSeconds() > 9 ? time.getSeconds() : ('0' + time.getSeconds())
      return this.$t('asset.assetStatPre') + year + ds + month + ds + day + ' ' + hours + ts + minutes + ts + seconds
    },
    getTableTitle () {
      if (localStorage.getItem('nz-sys-asset-ping-switch') === 'off') {
        this.tableTitle = this.tableTitle.filter(item => item.prop !== 'pingStatus')
      }
    },
    search (searchObj) {
      let orderBy = ''
      if (this.searchLabel.orderBy) {
        orderBy = this.searchLabel.orderBy
      }
      this.searchLabel = {}
      this.pageObj.pageNo = 1
      for (const item in searchObj) {
        if (searchObj[item]) {
          this.$set(this.searchLabel, item, searchObj[item])
        }
      }
      if (orderBy) {
        this.$set(this.searchLabel, 'orderBy', orderBy)
      }
      if (this.$refs.assetTable && this.$refs.assetTable.bodyWrapper) {
        this.$refs.assetTable.bodyWrapper.scrollTop = 0
      }
      this.getTableData()
    }
  },
  beforeDestroy () {

  }
}
</script>
