import bus from '@/libs/bus'
import { tableSet } from '@/components/common/js/tools'
import { fromRoute } from '@/components/common/js/constants'
export default {
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
        total: 0
      },
      /* 工具参数 */
      tools: {
        loading: false, // 是否显示table加载动画
        customTableTitle: [] // 自定义列工具的数据
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
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      this.$get(this.url, { ...this.searchLabel, ...this.searchCheckBox }).then(response => {
        this.tools.loading = false
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
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    edit (u) {
      this.object = JSON.parse(JSON.stringify(u))
      this.rightBox.show = true
    },
    esc () {
      this.rightBox.show = false
    },
    dragend () {
      this.$nextTick(() => {
        this.$refs.dataTable.$refs.dataTable.doLayout()
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
      if (this.$refs.dataTable) {
        this.$refs.dataTable.$refs.dataTable.bodyWrapper.scrollTop = 0
      }
      this.getTableData()
    },
    tableDataSort (orderBy) {
      this.$set(this.searchLabel, 'orderBy', orderBy)
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
  mounted () {
    const pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId)
    if (pageSize && pageSize !== 'undefined') {
      this.pageObj.pageSize = pageSize
    }
    console.log(this.$refs.dataTable)
    this.tools.customTableTitle = localStorage.getItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + this.tableId)
      ? JSON.parse(localStorage.getItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + this.tableId))
      : this.$refs.dataTable.tableTitle
    console.log(this.fromBottom)
    if (!this.fromBottom) {
      this.getTableData()
    }
  },
  beforeDestroy () {
    if (this.scrollbarWrap) {
      this.scrollbarWrap.removeEventListener('scroll', bus.debounce)
    }
  }
}
