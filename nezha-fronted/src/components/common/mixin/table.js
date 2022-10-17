import alertDaysInfo from '@/components/common/alert/alertDaysInfo'

export default {
  components: {
    alertDaysInfo
  },
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
      orderBy: null,
      severityDataWeight: this.$store.getters.severityDataWeight,
      singleDelete: []
    }
  },
  methods: {
    tableOperation ([command, row, param]) {
      switch (command) {
        // case 'delete': {
        //   this.$emit('del', row)
        //   break
        // }
        case 'delete': {
          if (param == 'singleDel') {
            this.$emit('del', row)
            break
          }
          if (this.singleDelete.length === 0) {
            this.singleDelete.push(row)
          } else {
            this.singleDelete = []
            this.singleDelete.push(row)
          }
          break
        }
        case 'ack': {
          this.$emit('acknowledge', row)
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
        case 'topology': {
          // this.$emit('copy', row)
          this.$emit('topology', row, param)
          break
        }
        default:
          this.$emit(command, row, param)
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
    },
    getWeeksTime () {
      const localOffset = new Date().getTimezoneOffset() // 默认 显示时区偏移的结果 单位分钟
      const now = new Date(new Date().toLocaleDateString()).getTime() - localOffset * 60 * 1000
      const arr = []
      for (let i = 0; i < 7; i++) {
        const obj = {
          time: now - i * 24 * 60 * 60 * 1000,
          tooltipShow: false,
          position: {
            left: 0,
            top: 0
          }
        }
        this.severityDataWeight.forEach(item => {
          obj[item.name] = 0
          obj[item.name + 'Color'] = item.color
        })
        arr.unshift(obj)
      }
      return arr
    },
    tooltipHover (item, flag, e) {
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        item.left = position.left
        this.$set(item, 'left', position.left)
        if (position.top > window.innerHeight / 2) {
          this.$set(item, 'top', position.top - 55)
        } else {
          this.$set(item, 'top', position.top + 30)
        }
        this.$set(item, 'alertNumtooltipShow', flag)
      }
    },
    rowKey (row) { // ping trace的 唯一key
      return row.ip + '-' + row.dc.id
    }
  },
  watch: {
    orderByFa: {
      immediate: true,
      handler (n) {
        if (n) {
          const index = n.indexOf('-')
          if (index !== -1) {
            this.orderBy = { prop: n.slice(index + 1), order: 'descending' }
          } else {
            this.orderBy = { prop: n, order: 'ascending' }
          }
          // this.orderBy = JSON.parse(JSON.stringify(this.orderBy))
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
          if (this.needAlertDaysData) {
            const weekDays = this.getWeeksTime()
            n.forEach(item => {
              const params = {
                type: 'total',
                dimension: 'priority',
                step: 'd'
              }
              params[this.trendKey] = item.id
              setTimeout(() => {
                this.$get('/stat/alertMessage/trend', params).then((res) => {
                  if (!res.data) {
                    return
                  }
                  const alertDaysData = res.data.result ? res.data.result[0].values : []
                  const newWeekDays = JSON.parse(JSON.stringify(weekDays))
                  alertDaysData.forEach(item => {
                    item.values.forEach(time => {
                      const findItem = newWeekDays.find(days => days.time == time[0])
                      if (findItem) {
                        findItem[item.metric.priority] = time[1]
                      }
                    })
                  })
                  setTimeout(() => {
                    item.alertDaysData = newWeekDays
                    item.trendLoading = false
                  })
                })
              })
            })
          }
        }
      }
    }
  //  document.querySelector("#header").scrollIntoView(true);
  }
}
