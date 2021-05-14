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
        case 'edit': {
          console.info(1, command, row)
          this.$emit('edit', row)
          break
        }
        case 'delete': {
          this.$emit('del', row)
          break
        }
        case 'recordTab': {
          this.$emit('showBottomBox', 'recordTab', row)
          break
        }
        case 'cli': {
          this.$emit('cli', row)
          break
        }
        case 'duplicate': {
          this.$emit('duplicate', row)
          break
        }
        case 'copy': {
          this.$emit('copy', row)
          break
        }
        case 'shutdown': {
          // this.$emit('copy', row)
          this.$emit('shutdown', row)
          break
        }
        default:
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
