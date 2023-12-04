import bus from '@/libs/bus'
import { tableSet } from '@/components/common/js/tools'
import { fromRoute } from '@/components/common/js/constants'
import routerPathParams from '@/components/common/mixin/routerPathParams'
import defaultData from '@/components/chart/defaultLineData'
import deleteButton from '@/components/common/deleteButton'
import lodash from 'lodash'
export default {
  components: {
    deleteButton
  },
  mixins: [routerPathParams],
  props: {
    switchTab: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      fromRoute: fromRoute,
      // 侧滑
      rightBox: {
        show: false
      },
      pageObj: { // 分页对象
        pageNo: 1,
        pageSize: this.$CONSTANTS.defaultPageSize,
        pages: 1,
        total: 0
      },
      orderBy: 'id',
      /* 工具参数 */
      tools: {
        loading: true, // 是否显示table加载动画
        customTableTitle: [], // 自定义列工具的数据
        extraTableTitle: [] // 特殊页面（asset）额外的列
      },
      mainTableHeight: this.$tableHeight.normal, // 主列表table高度
      batchDeleteObjs: [],
      object: {},

      tableData: [],
      searchLabel: {}, // 搜索参数
      scrollbarWrap: null,
      delFlag: false,
      fromBottom: false,
      operationWidth: '165', // 操作列宽
      searchCheckBox: {},
      detailType: 'list',
      preferenceLoading: true
    }
  },
  provide () {
    return {
      getTableData: this.getTableData,
      delCallBack: this.delCallBack
    }
  },
  methods: {
    sortableShow: tableSet.sortableShow,
    propTitle: tableSet.propTitle,
    asce: tableSet.asce,
    desc: tableSet.desc,
    strTodate: tableSet.strTodate,
    tableOperation ([command, row]) {
      switch (command) {
        case 'edit': {
          this.edit(row)
          break
        }
        case 'delete': {
          this.del(row)
          break
        }
        case 'copy': {
          this.copy(row)
          break
        }
        default:
          break
      }
    },
    isBuildIn (row) {
      return (row.buildIn && row.buildIn == 1) || (row.builtIn && row.builtIn == 1)
    },
    selectionChange (objs) {
      this.batchDeleteObjs = objs
    },
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
      const dataListParam = {
        ...this.searchLabel,
        ...this.searchCheckBox
      }
      if (this.switchTab) {
        dataListParam.switchTab = this.switchTab
      }
      let path = this.$route.fullPath.match(/\/(\S*)\?/)
      if (!path) {
        path = ''
      } else {
        path = path[1]
      }
      this.updatePath(dataListParam, path)
      this.$get(this.url, { ...this.searchLabel, ...this.searchCheckBox }).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].status = response.data.list[i].status + ''
          }
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
          const globalSearchId = this.$store.getters.getGlobalSearchId
          let detailViewRightObj = ''
          if (this.tableId === 'notebookTable' && this.detailType === 'view') { // 防止详情视图编辑后切换到别的数据
            const obj = this.tableData.find(item => item.id === this.detailViewRightObj.id)
            if (obj) {
              detailViewRightObj = obj
            } else {
              detailViewRightObj = this.tableData[0]
            }
          } else {
            if (globalSearchId) {
              detailViewRightObj = this.tableData.find(item => item.id === globalSearchId)
            } else {
              detailViewRightObj = this.tableData[0]
            }
          }
          this.detailViewRightObj = this.$lodash.cloneDeep(detailViewRightObj)
          this.pageObj.total = response.data.total
          this.pageObj.pages = response.data.pages
          if (!this.scrollbarWrap && this.$refs.dataTable && this.$refs.dataTable.$refs.dataTable) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
          if (this.detailType === 'view') {
            this.$refs.dataDetail && (this.$refs.dataDetail.$refs.dataTable.scrollTop = 0)
          }
        } else {
          this.$message.error(response.error || response.msg)
        }
      })
    },
    del (row) {
      const self = this
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            this.$delete(this.url + '?ids=' + row.id).then(response => {
              if (response.code === 200) {
                self.delFlag = true
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
                self.getTableData()
                bus.$emit('delTableRow', [row.id])
              } else if (response.data && response.data.list && response.code !== 200) {
                self.delFlag = true
                this.$refs.deleteButton && this.$refs.deleteButton.showProcess(response.data.list)
              } else {
                this.$message.error(response.msg)
              }
              done()
            })
          } else {
            done()
          }
        }
      }).then(() => {

      })
    },
    newObject () {
      return JSON.parse(JSON.stringify(this.blankObject))
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      this.getTableData()
    },
    async pageSize (val) {
      this.pageObj.pageSize = val
      this.setPreference()
      this.getTableData()
    },
    add () {
      this.object = this.newObject()
      this.rightBox.show = true
    },
    closeRightBox (refresh) {
      this.rightBox.show = false
      this.copyFlag = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    closeSilenceBox (refresh) {
      this.silenceBoxShow = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    edit (u) {
      this.$get(`${this.url}/${u.id}`).then(response => {
        if (response.code === 200) {
          this.object = response.data
          this.rightBox.show = true
        }
      })
    },
    copy (u, copyParams) {
      const copyName = this.$lodash.get(copyParams, 'copyName', '-copy')
      this.object = { ...u, name: u.name + copyName, id: '' }
      if (this.object.name.length > 64) {
        const length = this.object.name.length - 64
        this.object.name = u.name.substring(0, u.name.length - length) + copyName
      }
      this.rightBox.show = true
    },
    esc () {
      this.rightBox.show = false
    },
    dragend () {
      this.$nextTick(() => {
        if (this.$refs.dataTable) {
          this.$refs.dataTable.$refs.dataTable && this.$refs.dataTable.$refs.dataTable.doLayout()
        }
      })
    },
    search (searchObj) {
      this.searchLabel = {}
      this.pageObj.pageNo = 1
      for (const item in searchObj) {
        if (typeof searchObj[item] !== 'undefined' && searchObj[item] !== null && searchObj[item] !== '') {
          this.$set(this.searchLabel, item, searchObj[item])
        }
      }
      this.getTableData()
    },
    tableDataSort (orderBy) {
      this.orderBy = orderBy
      this.getTableData()
    },
    tableTitleReset (src, dist) {
      dist.forEach(item => {
        const title = src.find(t => t.prop === item.prop)
        if (title && title.label) {
          item.label = title.label
        }
      })
    },
    toTop (wrap) {
      let currentTop = wrap.scrollTop
      const interval = currentTop / 10
      const intervalFunc = setInterval(function () { // 花200ms分10次回到顶部，模拟动画效果
        if (currentTop === 0) {
          clearInterval(intervalFunc)
        } else {
          currentTop = (currentTop - interval) < interval * 0.5 ? 0 : currentTop - interval
          wrap.scrollTop = currentTop
        }
      }, 20)
    },
    clickTab (showTabInfo, showTab) {
      this.$emit('changeShowTab', showTab)
    },
    toTopBtnHandler (wrap) {
      const vm = this
      wrap.addEventListener('scroll', bus.debounce(function () {
        vm.tools.showTopBtn = wrap.scrollTop > 50
        vm.tools.tableHover = wrap.scrollTop > 50
      }, 100))
    },
    showClickSearch () {
      const index = this.dataListLayout.indexOf('clickSearch')
      if (index > -1) {
        this.dataListLayout.splice(index, 1)
      } else {
        this.dataListLayout.push('clickSearch')
      }
      this.setPreference()
    },
    addSilence (row, type) {
      this.blankSilenceObject.startAt = bus.timeFormate(bus.getOffsetTimezoneData(), 'YYYY-MM-DD HH:mm:ss')
      this.blankSilenceObject.endAt = bus.timeFormate(bus.getOffsetTimezoneData(1), 'YYYY-MM-DD HH:mm:ss')
      this.objectSilence = JSON.parse(JSON.stringify(this.blankSilenceObject))
      this.objectSilence.name = 'Quick silence'
      if (type !== 'alertMessage' && type !== 'alertRule') {
        this.objectSilence.matchers = [
          { name: type, value: row.name, regex: 0 },
          { name: type + '_id', value: row.id, regex: 0 }
        ]
      } else if (type === 'alertMessage') {
        let labels = this.$lodash.cloneDeep(row.labels)
        if (typeof labels === 'string') labels = JSON.parse(labels)
        this.objectSilence.matchers = []
        const filterArr = ['alertname', 'severity_id', 'severity', 'rule_type', 'nz_agent_id', 'rule_id', 'rule_name']
        Object.keys(labels).forEach((key, i) => {
          if (filterArr.indexOf(key) != -1) {
            return
          }
          this.objectSilence.matchers.push(
            { name: key, value: labels[key], regex: 0 }
          )
        })
      } else if (type === 'alertRule') {
        this.objectSilence.matchers = [
          { name: 'rule_id', value: row.id, regex: 0 },
          { name: 'rule_name', value: row.name, regex: 0 }
        ]
      }
      this.silenceBoxShow = true
    },
    metricTarget (row, type) {
      const protocol = row.configs[0].config.protocol
      const host = row.configs[0].config.host
      const port = row.configs[0].config.port
      const metricsPath = row.configs[0].config.metrics_path
      const params = row.configs[0].config.params
      let str = ''
      if (!lodash.isEmpty(params)) {
        for (const key in params) {
          const arr = params[key]
          if (arr.length > 1) {
            arr.forEach(item => {
              str += key + '=' + item + '&'
            })
          } else {
            str += key + '=' + params[key][0] + '&'
          }
        }
      }
      const linkTarget = `${protocol}://${host}:${port + metricsPath}${str ? '?' + str.slice(0, str.length - 1) : ''}`
      // window.open(linkTarget, 'target')
      window.open(linkTarget)
    },
    topology (row, type) {
      const chartInfo = lodash.cloneDeep(defaultData)
      chartInfo.id = row.id
      chartInfo.type = 'topologyLink'
      chartInfo.linkType = type
      chartInfo.datasource = 'topology'
      chartInfo.name = this.$t('overall.topology')
      this.$store.dispatch('showTopology', chartInfo)
    },
    closeDialog () {
      this.silenceBoxShow = false
    },
    showText (row) {
      this.dialogShowText = true
      this.dialogText = row.alertRule.trbShot
    },
    // 获取用户偏好
    async getPreference () {
      this.preferenceLoading = true
      const res = await this.$get('/sys/user/preference', { key: this.tableId })
      let tableHeaders
      if (res.data[this.tableId]) {
        const data = JSON.parse(res.data[this.tableId])
        this.pageObj.pageSize = data.pageSize
        this.detailType = data.view
        this.dataListLayout = data.layout
        tableHeaders = data.tableHeaders
      }
      this.preferenceLoading = false
      this.$nextTick(() => {
        this.setCustomTableTitle(tableHeaders)
      })
      // 请求完用户偏好 打开底部弹窗
      if (this.fromBottom || this.projectPopTable) { return }
      const q = this.$route.query
      if (q.bottomBox && JSON.parse(q.bottomBox)) {
        this.$nextTick(() => {
          this.detailType = q.detailType
          const detailType = this.detailType === 'list' ? 'dataList' : 'detailList'
          this.$refs[detailType].bottomBox.showSubList = JSON.parse(q.bottomBox)
          this.$refs[detailType].bottomBox.targetTab = q.targetTab
          this.$refs[detailType].bottomBox.object = JSON.parse(q.selectObj)
        })
      } else if (this.detailType === 'view' && q.detailType && q.selectObj) {
        this.detailType = q.detailType
        this.detailViewRightObj = JSON.parse(q.selectObj)
        this.$store.commit('setGlobalSearchId', this.detailViewRightObj.id)
      }
    },
    // 设置用户偏好
    setPreference () {
      const params = {
        pageSize: this.pageObj.pageSize,
        view: this.detailType || 'list',
        tableHeaders: this.tools.customTableTitle
      }
      if (this.dataListLayout) {
        params.layout = this.dataListLayout
      }
      this.$put('/sys/user/preference', { [this.tableId]: JSON.stringify(params) }).then(res => {
        if (res.code !== 200) {
          this.$message.error(res.msg || res.error)
        }
      })
    },
    setCustomTableTitle (tableHeaders) {
      let tableTitle = ''
      if (this.$refs.dataTable) {
        tableTitle = this.$refs.dataTable.tableTitle
      } else if (this.$refs.dataDetail) {
        tableTitle = this.$refs.dataDetail.tableTitle
      }
      if (!tableTitle || !this.tableId) {
        return
      }
      let preferenceTableTitle = (tableHeaders && tableHeaders.length) ? tableHeaders : tableTitle
      preferenceTableTitle = preferenceTableTitle.filter(item => tableTitle.find(t => item.prop === t.prop || item.type === 'label'))

      // 先根据本地缓存中的prop进行排序
      tableTitle.sort(function (a, b) {
        return preferenceTableTitle.findIndex(function (c) {
          return c.prop === a.prop
        }) - preferenceTableTitle.findIndex(function (c) {
          return c.prop === b.prop
        })
      })
      this.tools.customTableTitle = tableTitle.map((item, index) => { // 修复切换中英文的问题
        item.show = preferenceTableTitle[index] ? preferenceTableTitle[index].show : true
        return item
      })

      if (preferenceTableTitle.length > tableTitle.length) { // asset label
        const arr = preferenceTableTitle.splice(tableTitle.length, preferenceTableTitle.length)
        arr.forEach(item => {
          item.minWidth = item.label.length * 16 + 20
        })
        this.tools.customTableTitle = this.tools.customTableTitle.concat(arr)
      }
    },
    updateCustomTableTitle (custom) {
      this.tools.customTableTitle = custom
      this.setPreference()
    }
  },
  watch: {
    tableData: {
      deep: true,
      handler (n) {
        if (n.length === 0 && this.pageObj.pageNo > 1) {
          this.pageNo(this.pageObj.pageNo - 1)
        }

        /* if (!this.delFlag) { // 不是删除时回到顶部
          this.$refs.dataTable.bodyWrapper.scrollTop = 0
        } else {
          this.delFlag = false
        } */
      }
    },
    'tools.customTableTitle': {
      deep: true,
      handler (n) {
        this.dragend()
      }
    }
  },

  created () {
    let path = ''
    if (this.$route.fullPath.match(/\/(\S*)\?/)) {
      path = this.$route.fullPath.match(/\/(\S*)\?/)[1]
    }
    if (this.$route.query.orderBy && !this.isSubList) {
      this.orderBy = this.$route.query.orderBy
    } else if (this.isSubList) {
      return
    }
    let searchKeys = {}
    if (path === 'dc') {
      searchKeys = {
        // key: path 键
        // value: vue set 参数
        pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
        pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
        orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
        ids: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'ids',
          type: 'string',
          defaultJson: {
            disabled: false,
            id: 'ids',
            label: 'ids',
            name: 'ID',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        name: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'name',
          type: 'string',
          defaultJson: {
            disabled: false,
            id: 'name',
            label: 'name',
            name: 'Name',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        location: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'location',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'location',
            name: 'Location',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        state: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'state',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'dcState',
            name: 'State',
            readonly: true,
            type: 'selectString',
            val: ''
          },
          jsonKey: 'val'
        }
      }
    } else if (path === 'i18n') {
      searchKeys = {
        // key: path 键
        // value: vue set 参数
        pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
        pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
        orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
        ids: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'ids',
          type: 'string',
          defaultJson: {
            disabled: false,
            id: 'ids',
            label: 'ids',
            name: 'ID',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        code: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'code',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'code',
            name: 'Code',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        value: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'value',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'value',
            name: 'Value',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        lang: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'lang',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'lang',
            name: 'Lang',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        }
      }
    } else if (path === 'model') {
      searchKeys = {
        // key: path 键
        // value: vue set 参数
        pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
        pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
        orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
        ids: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'ids',
          type: 'string',
          defaultJson: {
            disabled: false,
            id: 'ids',
            label: 'ids',
            name: 'ID',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        name: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'name',
          type: 'string',
          defaultJson: {
            disabled: false,
            id: 'name',
            label: 'name',
            name: 'Name',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        brandIds: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'brandIds',
          type: 'number',
          defaultJson: {
            disabled: false,
            label: 'brandIds',
            name: 'Brand',
            readonly: true,
            type: 'brand',
            val: '',
            valnum: '',
            listStr: 'brandSelect'
          },
          jsonKey: 'valnum'
        }
      }
    } else if (path === 'operationLog') {
      searchKeys = {
        // key: path 键
        // value: vue set 参数
        pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
        pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
        orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
        type: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'type',
          type: 'number',
          defaultJson: {
            disabled: false,
            id: 11,
            label: 'type',
            name: 'Type',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        username: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'username',
          type: 'string',
          defaultJson: {
            disabled: false,
            id: 12,
            label: 'username',
            name: 'User',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        operation: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'operation',
          type: 'string',
          defaultJson: {
            disabled: false,
            id: 13,
            label: 'operation',
            name: 'Operation',
            type: 'selectString',
            val: ''
          },
          jsonKey: 'val'
        },
        state: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'state',
          type: 'string',
          defaultJson: {
            disabled: false,
            id: 16,
            label: 'state',
            name: 'State',
            readonly: true,
            type: 'selectString',
            val: ''
          },
          jsonKey: 'val'
        },
        operaId: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'operaId',
          type: 'string',
          defaultJson: {
            disabled: false,
            id: 14,
            label: 'operaId',
            name: 'Resources',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        params: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'params',
          type: 'string',
          defaultJson: {
            disabled: false,
            id: 17,
            label: 'params',
            name: 'Params',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        }
      }
    } else if (path === 'agent') {
      searchKeys = {
        // key: path 键
        // value: vue set 参数
        pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
        pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
        orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
        ids: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'ids',
          type: 'string',
          defaultJson: {
            disabled: false,
            id: 'ids',
            label: 'ids',
            name: 'ID',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        state: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'state',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'promState',
            name: 'State',
            readonly: true,
            type: 'select',
            val: ''
          },
          jsonKey: 'val'
        },
        dc: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'dc',
          type: 'number',
          defaultJson: {
            name: 'Date center',
            type: 'dc',
            label: 'dcIds',
            disabled: false,
            val: '',
            valnum: '',
            listStr: 'dcSelect'
          },
          jsonKey: 'valnum'
        },
        type: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'type',
          type: 'number',
          defaultJson: {
            disabled: false,
            label: 'promType',
            name: 'Type',
            readonly: true,
            type: 'select',
            val: ''
          },
          jsonKey: 'val'
        }
      }
    } else if (path === 'roles') {
      searchKeys = {
        // key: path 键
        // value: vue set 参数
        pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
        pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
        orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
        name: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'name',
          type: 'string',
          defaultJson: {
            disabled: false,
            id: 'name',
            label: 'name',
            name: 'Name',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        }
      }
    } else if (path === 'template' && this.switchTab) {
      searchKeys = {
        // key: path 键
        // value: vue set 参数
        pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
        pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
        orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
        ids: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'ids',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'ids',
            name: 'ID',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        name: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'name',
          type: 'string',
          defaultJson: {
            disabled: false,
            id: 'name',
            label: 'name',
            name: 'Name',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        gname: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'gname',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'gname',
            name: 'Group',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        }
      }
    } else if (path === 'credentials') {
      searchKeys = {
        // key: path 键
        // value: vue set 参数
        pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
        pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
        orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
        ids: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'ids',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'ids',
            name: 'ID',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        name: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'name',
          type: 'string',
          defaultJson: {
            disabled: false,
            id: 'name',
            label: 'name',
            name: 'Name',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        type: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'type',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'credentialType',
            name: 'Type',
            readonly: true,
            type: 'select',
            val: ''
          },
          jsonKey: 'val'
        }
      }
    } else if (path === 'mib') {
      searchKeys = {
        // key: path 键
        // value: vue set 参数
        pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
        pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
        orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
        ids: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'ids',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'ids',
            name: 'ID',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        name: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'name',
          type: 'string',
          defaultJson: {
            disabled: false,
            id: 'name',
            label: 'name',
            name: 'Name',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        }
      }
    } else if (path === 'ipam') {
      searchKeys = {
        // key: path 键
        // value: vue set 参数
        pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
        pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
        orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
        ids: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'ids',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'ids',
            name: 'ID',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        state: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'state',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'ipamState',
            name: 'State',
            readonly: true,
            type: 'select',
            val: ''
          },
          jsonKey: 'val'
        },
        name: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'name',
          type: 'string',
          defaultJson: {
            disabled: false,
            id: 'name',
            label: 'name',
            name: 'Name',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        type: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'type',
          type: 'number',
          defaultJson: {
            disabled: false,
            label: 'ipamType',
            name: 'Type',
            readonly: true,
            type: 'select',
            val: ''
          },
          jsonKey: 'val'
        },
        addr: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'addr',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'addr',
            name: 'Addr',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        mask: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'mask',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'mask',
            name: 'Mask',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        vlan: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'vlan',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'vlan',
            name: 'Vlan',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        dc: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'dc',
          type: 'number',
          defaultJson: {
            name: 'Date center',
            type: 'dc',
            label: 'dcIds',
            disabled: false,
            val: '',
            valnum: '',
            listStr: 'dcSelect'
          },
          jsonKey: 'valnum'
        }
      }
    } else if (path === 'recordRule') {
      searchKeys = {
        // key: path 键
        // value: vue set 参数
        pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
        pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
        orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
        ids: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'ids',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'ids',
            name: 'ID',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        state: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'state',
          type: 'Number',
          defaultJson: {
            disabled: false,
            label: 'recordState',
            name: 'State',
            readonly: true,
            type: 'select',
            val: '',
            valnum: '',
            listStr: 'issue'
          },
          jsonKey: 'valnum'
        },
        name: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'name',
          type: 'string',
          defaultJson: {
            disabled: false,
            id: 'name',
            label: 'name',
            name: 'Name',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        type: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'type',
          type: 'Number',
          defaultJson: {
            disabled: false,
            label: 'recordType',
            name: 'Type',
            readonly: true,
            type: 'select',
            val: '',
            valnum: '',
            listStr: 'issue'
          },
          jsonKey: 'valnum'
        },
        expr: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'expr',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'expr',
            name: 'Expression',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        }
      }
    } else if (path === 'issue') {
      searchKeys = {
        // key: path 键
        // value: vue set 参数
        pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
        pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
        orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
        ids: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'ids',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'ids',
            name: 'ID',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        name: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'name',
          type: 'string',
          defaultJson: {
            disabled: false,
            id: 'name',
            label: 'name',
            name: 'Name',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        type: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'type',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'issueType',
            name: 'Type',
            readonly: true,
            type: 'issueType',
            val: ''
          },
          jsonKey: 'val'
        },
        state: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'state',
          type: 'number',
          defaultJson: {
            disabled: false,
            label: 'issueState',
            name: 'State',
            readonly: true,
            type: 'select',
            val: '',
            valnum: '',
            listStr: 'issue'
          },
          jsonKey: 'valnum'
        },
        priority: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'priority',
          type: 'Number',
          defaultJson: {
            disabled: false,
            label: 'priority',
            name: 'Priority',
            type: 'select',
            val: '',
            valnum: '',
            listStr: 'issue'
          },
          jsonKey: 'valnum'
        },
        assetsId: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'assetsId',
          type: 'Number',
          defaultJson: {
            disabled: false,
            label: 'assetsId',
            name: 'Assets id',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        assetName: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'assetName',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'assetName',
            name: 'Assets name',
            type: 'input',
            val: ''
          },
          jsonKey: 'val'
        },
        cid: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'cid',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'cid',
            name: 'Create user',
            type: 'issue',
            val: '',
            valnum: '',
            listStr: 'issue'
          },
          jsonKey: 'valnum'
        },
        uid: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'uid',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'uid',
            name: 'Update user',
            type: 'issue',
            val: '',
            valnum: '',
            listStr: 'issue'
          },
          jsonKey: 'valnum'
        },
        rid: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'rid',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'rid',
            name: 'Reporter',
            type: 'issue',
            val: '',
            valnum: '',
            listStr: 'issue'
          },
          jsonKey: 'valnum'
        },
        aid: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'aid',
          type: 'string',
          defaultJson: {
            disabled: false,
            label: 'aid',
            name: 'Assignee',
            type: 'issue',
            val: '',
            valnum: '',
            listStr: 'issue'
          },
          jsonKey: 'valnum'
        },
        starrd: {
          target: this.searchLabel,
          isSearchInput: true,
          propertyName: 'starrd',
          type: 'Number',
          defaultJson: {
            disabled: false,
            label: 'starrd',
            name: 'Starrd',
            type: 'select',
            val: '',
            valnum: '',
            listStr: 'issue'
          },
          jsonKey: 'valnum'
        }
      }
    }
    this.initQueryFromPath(searchKeys)
  },
  async mounted () {
    // 先设置默认的表头
    let tableTitle = ''
    if (this.$refs.dataTable) {
      tableTitle = this.$refs.dataTable.tableTitle
    } else if (this.$refs.dataDetail) {
      tableTitle = this.$refs.dataDetail.tableTitle
    }
    if (tableTitle && this.tableId) {
      this.tools.customTableTitle = tableTitle
    }
    if (!this.fromBottom && !this.projectPopTable) {
      await this.getPreference()
      this.getTableData()
    }
  },
  beforeDestroy () {
    if (this.scrollbarWrap) {
      this.scrollbarWrap.removeEventListener('scroll', bus.debounce)
    }
  }
}
