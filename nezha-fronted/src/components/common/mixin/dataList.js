import bus from '@/libs/bus'
import { tableSet } from '@/components/common/js/tools'
import { fromRoute } from '@/components/common/js/constants'
import routerPathParams from '@/components/common/mixin/routerPathParams'
export default {
  mixins: [routerPathParams],
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
      orderBy: '',
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
      searchCheckBox: {}
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
      const path = this.$route.fullPath.match(/\/(\S*)\?/)[1]
      this.updatePath(dataListParam, path)
      this.$get(this.url, { ...this.searchLabel, ...this.searchCheckBox }).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].status = response.data.list[i].status + ''
          }
          this.tableData = response.data.list
          this.detailViewRightObj = this.tableData[0]
          this.pageObj.total = response.data.total
          this.pageObj.pages = response.data.pages
          if (!this.scrollbarWrap && this.$refs.dataTable.$refs.dataTable) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
          if (this.detailType === 'view') {
            this.$refs.dataDetail && (this.$refs.dataDetail.$refs.dataTable.scrollTop = 0)
          }
        }
      })
    },
    del (row) {
      const self = this
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete(this.url + '?ids=' + row.id).then(response => {
          if (response.code === 200) {
            self.delFlag = true
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
            self.getTableData()
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    newObject () {
      return JSON.parse(JSON.stringify(this.blankObject))
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      this.getTableData()
    },
    pageSize (val) {
      this.pageObj.pageSize = val
      localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val)
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
    copy (u) {
      this.object = { ...u, name: u.name + '-copy', id: '' }
      if (this.object.name.length > 64) {
        const length = this.object.name.length - 64
        this.object.name = u.name.substring(0, u.name.length - length) + '-copy'
      }
      this.rightBox.show = true
    },
    esc () {
      this.rightBox.show = false
    },
    dragend () {
      this.$nextTick(() => {
        this.$refs.dataTable.$refs.dataTable && this.$refs.dataTable.$refs.dataTable.doLayout()
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
      localStorage.setItem('dataList-layout' + this.tableId, JSON.stringify(this.dataListLayout))
    },
    addSilence (row, type) {
      this.blankSilenceObject.startAt = bus.timeFormate(bus.getOffsetTimezoneData(), 'yyyy-MM-dd hh:mm:ss')
      this.blankSilenceObject.endAt = bus.timeFormate(bus.getOffsetTimezoneData(1), 'yyyy-MM-dd hh:mm:ss')
      this.objectSilence = JSON.parse(JSON.stringify(this.blankSilenceObject))
      this.objectSilence.name = 'Quick silence'
      if (type !== 'alertMessage' && type !== 'alertRule') {
        this.objectSilence.matchers = [
          { name: type, value: row.name, regex: 0 },
          { name: type + '_id', value: row.id, regex: 0 }
        ]
      } else if (type === 'alertMessage') {
        if (typeof row.labels === 'string') row.labels = JSON.parse(row.labels)
        const labels = JSON.parse(JSON.stringify(row.labels))
        this.objectSilence.matchers = []
        const filterArr = ['alertname', 'severity_id', 'severity', 'rule_type']
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
          { name: 'alertName', value: row.name, regex: 0 }
        ]
      }
      this.silenceBoxShow = true
    },
    closeDialog () {
      this.silenceBoxShow = false
    },
    showText (row) {
      this.dialogShowText = true
      this.dialogText = row.alertRule.trbShot
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
    const searchKeys = {
      // key: path 键
      // value: vue set 参数
      pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
      pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
      orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
      id: { target: this.searchLabel, propertyName: 'id', type: 'number' },
      severityIds: { target: this.searchLabel, propertyName: 'severityIds', type: 'string' },
      type: { target: this.searchLabel, propertyName: 'type', type: 'number' },
      name: { target: this.searchLabel, propertyName: 'name', type: 'string' },
      typeIds: { target: this.searchCheckBox, propertyName: 'typeIds', type: 'number' },
      ping: { target: this.searchCheckBox, propertyName: 'ping', type: 'string' },
      modelIds: { target: this.searchCheckBox, propertyName: 'modelIds', type: 'number' },
      fields: { target: this.searchCheckBox, propertyName: 'fields', type: 'json' }
    }
    this.initQueryFromPath(searchKeys)
  },
  mounted () {
    const pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId)
    if (pageSize && pageSize !== 'undefined') {
      this.pageObj.pageSize = pageSize
    }
    let localStorageTableTitle = localStorage.getItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + this.tableId)
    localStorageTableTitle = localStorageTableTitle ? JSON.parse(localStorageTableTitle) : this.$refs.dataTable.tableTitle
    this.tools.customTableTitle = this.$refs.dataTable.tableTitle.map((item, index) => { // 修复切换中英文的问题
      item.show = localStorageTableTitle[index].show
      return item
    })
    if (localStorageTableTitle && (localStorageTableTitle.length > this.$refs.dataTable.tableTitle.length)) {
      const arr = localStorageTableTitle.splice(this.$refs.dataTable.tableTitle.length, localStorageTableTitle.length)
      arr.forEach(item => {
        item.minWidth = item.label.length * 16 + 20
      })
      this.tools.customTableTitle = this.tools.customTableTitle.concat(arr)
    }
    if (!this.fromBottom) {
      this.getTableData()
      this.$nextTick(() => {
        this.$refs.dataTable.$refs.dataTable && this.$refs.dataTable.$refs.dataTable.doLayout()
      })
    }
  },
  beforeDestroy () {
    if (this.scrollbarWrap) {
      this.scrollbarWrap.removeEventListener('scroll', bus.debounce)
    }
  }
}
