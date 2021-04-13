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
    url: {
      type: String
    }
  },
  data () {
    return {
      operationWidth: '165' // 操作列宽
    }
  },
  methods: {
    tableOperation ([command, row]) {
      switch (command) {
        case 'edit': {
          this.$emit('edit', row)
          break
        }
        case 'delete': {
          this.$emit('del', row)
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
        console.info(1)
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
