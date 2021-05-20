export default {
  props: {
    tableData: {
      type: Array
    },
    customTableTitle: {
      type: Array
    },
    height: {
      type: String,
      default: '100%'
    },
    api: {
      type: String
    },
    tableId: {
      type: String
    }
  },
  data () {
    return {
      operationWidth: '165' // 操作列宽
    }
  },
  methods: {
    tableOperation ([command, row, param]) {
      switch (command) {
        case 'delete': {
          this.$emit('del', row)
          break
        }
        case 'recordTab': {
          this.$emit('showBottomBox', 'recordTab', row)
          break
        }
        case 'endpointQuery': {
          this.$emit('showBottomBox', 'endpointQuery', row)
          break
        }
        case 'sync': {
          // this.$emit('copy', row)
          this.$emit('sync', row)
          break
        }
        default:
          this.$emit(command, row)
          break
      }
    },
    selectionChange (objs) {
      this.$emit('selectionChange', objs)
    },
    isBuiltIn (row) {
      return (row.buildIn && row.buildIn == 1) || (row.builtIn && row.builtIn == 1)
    },
    dragend () {
      this.$nextTick(() => {
        this.$refs.dataTable.doLayout()
      })
    },
    showBottomBox (targetTab, row) {
      this.$emit('showBottomBox', targetTab, JSON.parse(JSON.stringify(row)))
    },
    tableDataSort (item) {
      let orderBy = ''
      if (item.order === 'ascending') {
        orderBy = item.prop
      }
      if (item.order === 'descending') {
        orderBy = '-' + item.prop
      }
      this.$emit('orderBy', orderBy)
    }
  }
}
