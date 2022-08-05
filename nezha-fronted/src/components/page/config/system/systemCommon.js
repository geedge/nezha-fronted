import routerPathParams from '@/components/common/mixin/routerPathParams'

export const tableCommon = {
  data () {
    return {
      copy: null
    }
  },
  methods: {
    saveOrUpdate: function (obj) {
      if (this.prevent_opt.save) {
        return
      }
      if (!this.validateData(obj)) {
        return
      }
      this.prevent_opt.save = true
      const param = JSON.parse(JSON.stringify(obj))
      if (param.id) {
        this.$put(this.api, param).then(response => {
          this.prevent_opt.save = false
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
            this.$emit('reload')
          } else {
            this.$message.error(response.msg)
          }
        })
      } else {
        this.$post(this.api, param).then(response => {
          this.prevent_opt.save = false
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
            this.$emit('reload')
          } else {
            this.$message.error(response.msg)
          }
        })
      }
    },
    toEdit: function (obj) {
      if (this.tableData.every(t => !t.edit)) {
        this.copy = JSON.parse(JSON.stringify(obj))
        this.$set(obj, 'edit', true)
      } else {
        this.setWarning()
      }
    },
    cancel: function (obj) {
      if (obj.id) {
        for (const key in obj) {
          this.$set(obj, key, this.copy[key])
        }
        this.$set(obj, 'edit', false)
      } else {
        this.tableData.shift()
      }
    },
    setWarning: function () {
      const getArrayIndex = function (arr) {
        let i = arr.length
        while (i--) {
          if (arr[i].edit) {
            return i
          }
        }
        return -1
      }
      const index = getArrayIndex(this.tableData)
      const trs = document.querySelectorAll('#' + this.tableId + ' .el-table__body .el-table__row')
      trs[index].style = 'animation-name: warnBackground;animation-duration: 1s;'
      setTimeout(() => {
        trs[index].style = ''
      }, 1000)
    },
    validateData: function (data) {
      let result = true
      for (const field in this.rules) {
        const rule = this.rules[field]
        if (rule.required && !data[field]) {
          rule.switch = true
          result = false
        }
      }
      return result
    },
    popShow: function (rule) {
      const timeout = setTimeout(() => {
        rule.switch = false
        clearTimeout(timeout)
      }, 1000)
    }
  }
}
export const parentTableCommon = {
  mixins: [routerPathParams],
  props: {
    switchTab: {
      type: String,
      default: ''
    }
  },
  methods: {
    getTableData: function () {
      this.searchLabel.pageSize = -1
      this.tools.loading = true
      const systemParam = {
        ...this.searchLabel
      }
      // if (this.switchTab) {
      //   systemParam.switchTab = this.switchTab
      // }
      const path = this.$route.fullPath.match(/\/(\S*)\?/)[1]
      this.updatePath(systemParam, path)
      this.$get(this.url, this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          this.tableData = []
          this.tableData = response.data.list
          if (!this.scrollbarWrap && this.$refs.dataTable && this.$refs.dataTable.$refs.dataTable) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    }
  },
  created () {
    const path = this.$route.fullPath.match(/\/(\S*)\?/)[1]
    let searchKeys = {}
    if (path === 'link') {
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
    } else if (path === 'apiKey') {
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
    } else if (path === 'notification') {
      searchKeys = {
        // key: path 键
        // value: vue set 参数
        pageNo: {
          target: this.pageObj,
          propertyName: 'pageNo',
          type: 'number'
        },
        pageSize: {
          target: this.pageObj,
          propertyName: 'pageSize',
          type: 'number'
        },
        orderBy: {
          target: this.$data,
          propertyName: 'orderBy',
          type: 'string'
        },
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
    }
    this.initQueryFromPath(searchKeys)
  }
}
