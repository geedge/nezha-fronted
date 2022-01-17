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
    },
    orderByFa: {}
  },
  data () {
    return {
      operationWidth: '165', // 操作列宽
      orderBy: {}
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
        case 'fastSilence': {
          // this.$emit('copy', row)
          this.$emit('addSilence', row, param)
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
      let str = item.prop
      if (str === 'dc') {
        str = 'datacenter'
      }
      if (item.order === 'ascending') {
        orderBy = str
      }
      if (item.order === 'descending') {
        orderBy = '-' + str
      }
      this.$emit('orderBy', orderBy)
    }
  },
  watch: {
    orderByFa: {
      immediate: true,
      handler (n) {
        if (n) {
          const index = n.indexOf('-')
          if (index !== -1) {
            this.orderBy[n.slice(index + 1)] = 'descending'
          } else {
            this.orderBy[n] = 'descending'
          }
        }
      }
    },
    tableData: {
      immediate: true,
      handler (n) {
        if (n && n.length) {
          const id = this.$store.getters.getGlobalSearchId
          if (id) {
            setTimeout(() => {
              if (document.getElementById('globalSearch' + id)) {
                document.getElementById('globalSearch' + id).scrollIntoView(true)
                this.$store.commit('setGlobalSearchId', '')
              }
            }, 500)
          }
        }
      }
    }
  //  document.querySelector("#header").scrollIntoView(true);
  }
}
