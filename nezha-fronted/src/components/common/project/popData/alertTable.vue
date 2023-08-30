<template>
  <div class="mc" @click.self="clickOutside">
    <div class="right-box right-box-project-alert">
      <div class="right-box-title">{{ moduleName }} / {{$t('project.topology.alert')}}</div>
      <nz-data-list
        ref="dataList"
        :api="url"
        :custom-table-title.sync="tableTitle"
        :from="fromRoute.alertMessage"
        :layout="['searchInput', 'pagination']"
        :search-msg="searchMsg"
        @search="search"
        v-my-loading="tools.loading"
      >
        <template v-slot:top-tool-right>
          <el-select v-model="state" size="small" value-key="value" popper-class="right-box-select-top right-public-box-dropdown-top" @change="getTableData">
            <el-option v-for="item in stateOptions" :key="item.value" :label="$t(item.label)" :value="item.value"></el-option>
          </el-select>
        </template>
        <template v-slot:default="slotProps">
          <alert-message-table
            ref="dataTable"
            :api="url"
            :orderByFa="orderBy"
            :custom-table-title="tableTitle"
            :height="mainTableHeight"
            :now-time="nowTime"
            :table-data="tableData"
            :showOption="false"
            @del="del"
            @edit="edit"
            @orderBy="tableDataSort"
            @reload="getTableData"
            @selectionChange="selectionChange"></alert-message-table>
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
import bus from '@/libs/bus'
import nzAlertTag from '@/components/page/alert/nzAlertTag'
import alertRuleInfo from '@/components/common/alert/alertRuleInfo'
import alertLabel from '@/components/common/alert/alertLabel'
import dataListMixin from '@/components/common/mixin/dataList'
import alertMessageTable from '@/components/common/table/alert/alertMessageTable.vue'
import { alertMessage as alertMessageConstant } from '@/components/common/js/constants'
export default {
  name: 'alertTableProject',
  props: {
    moduleId: {},
    projectId: {},
    moduleName: String
  },
  components: {
    'nz-alert-tag': nzAlertTag,
    alertRuleInfo: alertRuleInfo,
    alertLabel: alertLabel,
    alertMessageTable
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
      url: 'alert/message',
      mainTableHeight: 'calc(100% - 64px)',
      state: '1',
      tableId: 'projectAlert',
      stateOptions: alertMessageConstant.states,
      pageObj: {
        pageNo: 1,
        pageSize: this.$CONSTANTS.defaultPageSize,
        total: 0
      },
      tableTitle: [
        {
          label: this.$t('alert.alertName'),
          prop: 'alertRule',
          show: true,
          width: 180
        }, {
          label: this.$t('project.endpoint.labels2'),
          prop: 'labels',
          show: true,
          NotSet: true,
          minWidth: 220
        }, {
          label: this.$t('alert.severity'),
          prop: 'severityId',
          show: true,
          width: 110
        }, {
          label: this.$t('alert.summary'),
          prop: 'summary',
          show: true,
          minWidth: 100
        }, {
          label: this.$t('overall.state'),
          prop: 'state',
          show: true,
          width: 100
        }, {
          label: this.$t('overall.startTime'),
          prop: 'startAt',
          show: true,
          width: 150
        }
      ],
      searchTime: [],
      searchMsg: { // 给搜索框子组件传递的信息
        searchLabelList: [
          {
            name: this.$t('alert.alertRule'),
            type: 'input',
            label: 'ruleName',
            disabled: false
          }, {
            name: this.$t('asset.asset'),
            type: 'input',
            label: 'assetName',
            disabled: false
          }, {
            name: this.$t('asset.endpoint'),
            type: 'input',
            label: 'endpointName',
            disabled: false
          }, {
            name: this.$t('alert.summary'),
            type: 'input',
            label: 'summary',
            disabled: false
          }, {
            name: this.$t('project.endpoint.labels2'),
            type: 'input',
            label: 'labels',
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
      nowTime: '',
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
      if (this.searchTime && this.searchTime.length > 1) {
        this.$set(this.searchLabel, 'startAt', bus.timeFormate(this.searchTime[0], 'YYYY-MM-DD HH:mm:ss'))
        this.$set(this.searchLabel, 'endAt', bus.timeFormate(this.searchTime[1], 'YYYY-MM-DD HH:mm:ss'))
      } else {
        delete this.searchLabel.startAt
        delete this.searchLabel.endAt
      }
      this.$get(this.url, { state: this.state, ...this.searchLabel }).then(response => {
        this.tools.loading = false
        if (response.code == 200) {
          this.nowTime = this.utcTimeToTimezoneStr(response.time)
          this.tableData = response.data.list
          this.tableData.forEach((item) => {
            item.labels = JSON.parse(item.labels)
          })
          this.deleteBox.ids = ''
          this.pageObj.total = response.data.total
        }
      })
    },
    labelsSort: function (obj) {
      const buildIn = ['asset', 'endpoint', 'module', 'project', 'datacenter']
      const labels = JSON.parse(JSON.stringify(obj))
      const result = []
      for (const key of buildIn) {
        if (key in labels) {
          result.push({ label: key, value: labels[key] })
          delete labels[key]
        }
      }
      Object.keys(labels).sort().forEach(key => {
        result.push({ label: key, value: labels[key] })
      })
      return result
    },
    labelsClassName (row) {
      if (row.column.label == this.$t('project.endpoint.labels2')) {
        return 'alert-message-list-labels'
      } else {
        return ''
      }
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
    // alertNmae鼠标划入
    alertMessagehover (item, loading, e) {
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        this.$set(item, 'position', position)
      }
      this.$set(item, 'loading', loading)
      // item.loading = true;
      // this.$set(this.tableData,index,item);// 调用父组件
    },
    // label 鼠标划入
    labelHover (item, index, type, loading, e) {
      if (this.labelToolTipDis(type)) {
        return
      }
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        this.$set(item[type], 'position', position)
      }
      this.$set(item[type], 'loading', loading)
      this.$set(this.tableData, index, item)// 调用父组件
    },
    // label tooltip是否显示
    labelToolTipDis (labelType) {
      switch (labelType) {
        case 'asset':
        case 'module':
        case 'project':
          return false
        default: return true
      }
    },
    // Severity Label
    returnSeverityLabel (key) {
      return this.$t(this.$CONSTANTS.alertMessage.severityData.find(s => { return s.value == key }).label)
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
      if (this.$refs.alertListTable && this.$refs.alertListTable.bodyWrapper) {
        this.$refs.alertListTable.bodyWrapper.scrollTop = 0
      }
      this.getTableData()
    },

    showExportDialog () {
      this.importBox.show = true
    }
  },
  beforeDestroy () {

  }
}
</script>
