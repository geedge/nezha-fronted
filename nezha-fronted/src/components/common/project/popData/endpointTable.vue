<template>
  <div class="mc" @click.self="clickOutside">
    <div class="right-box right-box-project-endpoint">
      <div class="right-box-title">{{ moduleName }} / {{$t('asset.endpoint')}}</div>
      <nz-data-list
        ref="dataList"
        :api="url"
        :custom-table-title.sync="tableTitle"
        :from="fromRoute.endpoint"
        :layout="['searchInput', 'pagination']"
        :search-msg="searchMsg"
        :search-right="true"
        @search="search"
      >
        <template  v-slot:default="slotProps">
          <endpoint-table
            style="height: 100%"
            :isTopoInfo="true"
            ref="dataTable"
            :orderByFa="orderBy"
            v-my-loading="tools.loading"
            :loading="tools.loading"
            :api="url"
            :custom-table-title="tableTitle"
            :height="mainTableHeight"
            :table-data="tableData"
            :tableId="tableId"
            :showOption="false"
            @orderBy="tableDataSort"
            @reload="getTableData"
           ></endpoint-table>
        </template>
        <template v-slot:pagination>
          <div class="endpoint-page">
            <Pagination ref="Pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
          </div>
        </template>
      </nz-data-list>
    </div>
  </div>
</template>

<script>
import endpointTable from '@/components/common/table/settings/endpointTable'
import dataListMixin from '@/components/common/mixin/dataList'
export default {
  name: 'endpointTableProject',
  props: {
    moduleId: {},
    projectId: {},
    moduleName: String
  },
  watch: {
  },
  components: {
    endpointTable
  },
  mixins: [dataListMixin],
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
      url: 'monitor/endpoint',
      tableId: 'projectEndpoint',
      pageObj: {
        pageNo: 1,
        pageSize: this.$CONSTANTS.defaultPageSize,
        total: 0
      },
      mainTableHeight: 'calc(100% - 70px)',
      tableTitle: [
        {
          label: this.$t('project.endpoint.endpointId'),
          prop: 'id',
          show: true,
          width: 100
        }, {
          label: this.$t('asset.asset'),
          prop: 'asset',
          show: true,
          width: 150
        }, {
          label: this.$t('asset.port'),
          prop: 'port',
          show: true
        }, {
          label: this.$t('overall.state'),
          prop: 'state',
          width: 200,
          show: true
        }
      ],
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          {
            id: 13,
            name: 'ID',
            type: 'input',
            label: 'ids',
            disabled: false
          }, {
            name: this.$t('asset.asset'),
            type: 'input',
            label: 'assetName',
            disabled: false
          }
        ]
      },
      tableData: [],
      loading: false,
      tableHeight: '100%',
      searchLabel: {

      },
      deleteBox: {},
      needAlertDaysData: true,
      trendKey: 'endpointId',
      projectPopTable: true
    }
  },
  created () {
  },
  async mounted () {
    await this.getPreference()
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
      this.$get(this.url, this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          // for (let i = 0; i < response.data.list.length; i++) {
          //   try {
          //     let tempObj = JSON.parse(response.data.list[i].param);
          //     response.data.list[i].paramObj = [];
          //     for (let k in tempObj) {
          //       response.data.list[i].paramObj.push({key: k, value: tempObj[k]})
          //     }
          //   } catch (err) {
          //     //console.error(response.data.list[i], err);
          //   }
          // }
          response.data.list.forEach(d => {
            d.port = JSON.parse(d.configs[0].config).port
            d.path = JSON.parse(d.configs[0].config).protocol
          })
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
    getStateErrorMsg (row) {
      const errCodes = [230009, 230010, 230011]
      if (row) {
        if (row.state == 0) {
          if (errCodes.find((item) => { return row.stateInfo.code == item })) {
            return this.$t('project.endpoint.stateInfo_' + row.stateInfo.code)
          } else {
            this.$message.error('state code error')
            return row.stateInfo.msg
          }
        }
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
          if (item == 'alertMessageState') {
            this.$set(this.searchLabel, 'state', searchObj[item])
          } else {
            this.$set(this.searchLabel, item, searchObj[item])
          }
        }
      }
      if (orderBy) {
        this.$set(this.searchLabel, 'orderBy', orderBy)
      }
      if (this.$refs.endpointTable) {
        this.$refs.endpointTable.bodyWrapper.scrollTop = 0
      }
      this.getTableData()
    }
  },
  beforeDestroy () {

  }
}
</script>
