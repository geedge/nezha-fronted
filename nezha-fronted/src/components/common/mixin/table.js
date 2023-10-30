import alertDaysInfo from '@/components/common/alert/alertDaysInfo'
import nzTooltip from '@/components/common/alert/nzTooltip'
export default {
  components: {
    alertDaysInfo,
    nzTooltip
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
      singleDelete: [],
      trendPromise: [],
      trendPromiseIndex: 0
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
        case 'delete-rel': {
          this.$store.dispatch('deleteTableRel', {
            row: row,
            url: this.api,
            ...param
          })
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
        case 'metricTarget': {
          this.$emit('metricTarget', row, param)
          break
        }
        case 'diagnosis': {
          this.$store.dispatch('diagnosisTab', {
            row: row,
            url: this.api,
            ...param
          })
          break
        }
        case 'configSync': {
          this.$store.dispatch('configSync', {
            row: row,
            ...param
          })
          break
        }
        case 'notebookTab': {
          this.$store.commit('setNotebookEdit', true)
          this.$emit('showBottomBox', 'notebookTab', row)
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
      if (!this.hasButton(this.viewPermission)) {
        return
      }
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
    },
    cellMouseEnter (row, column, cell, event) {
      cell.parentNode.classList.remove('nz-table-global-select')
    },
    renderTrend () {
      const weekDays = this.getWeeksTime()
      if (this.trendPromiseIndex < this.trendPromise.length) {
        Promise.all(this.trendPromise[this.trendPromiseIndex]).then(response => {
          response.forEach((res, index) => {
            const arr = res.responseURL && res.responseURL.split('=')
            let id = ''
            if (arr) {
              id = arr[arr.length - 1]
            }
            const item = this.tableData.find(row => row.id == id)
            if (!res.data) {
              return
            }
            const alertDaysData = res.data.result ? res.data.result[0].values : []
            const newWeekDays = JSON.parse(JSON.stringify(weekDays))
            alertDaysData.forEach(alertDays => {
              alertDays.values.forEach(time => {
                const findItem = newWeekDays.find(days => days.time == time[0])
                if (findItem) {
                  findItem[alertDays.metric.priority] = time[1]
                }
              })
            })
            if (item) {
              item.alertDaysData = newWeekDays
              item.trendLoading = false
            }
          })
          this.trendPromiseIndex++
          this.renderTrend()
        }).catch((msg) => {
          // console.log(msg)
        })
      }
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
        let trendArr = []
        this.trendPromise = []
        this.trendPromiseIndex = 0
        if (n && n.length) {
          const id = this.$store.getters.getGlobalSearchId
          if (id) {
            setTimeout(() => {
              if (document.getElementById('globalSearch' + id)) {
                document.getElementById('globalSearch' + id).scrollIntoView({ block: 'center', inline: 'center' })
                if (document.getElementById('globalSearch' + id).parentNode.parentNode.parentNode.classList.contains('el-table__row')) {
                  document.getElementById('globalSearch' + id).parentNode.parentNode.parentNode.classList.add('nz-table-global-select')
                }
                this.$store.commit('setGlobalSearchId', '')
              }
            }, 500)
          }
          if (this.needAlertDaysData) {
            this.trendPromise = []
            n.forEach((item, index) => {
              const params = {
                type: 'total',
                dimension: 'priority',
                step: 'd'
              }
              params[this.trendKey] = item.id // 添加其他参数 这个要放在最后 用于获取对应的id
              trendArr.push(this.$get('/stat/alertMessage/trend', params))
              if (trendArr.length > 9) {
                this.trendPromise.push(trendArr)
                trendArr = []
              }
            })
            if (trendArr.length) {
              this.trendPromise.push(trendArr)
              trendArr = []
            }
            this.trendPromiseIndex = 0
            this.renderTrend()
          }
        }
      }
    }
  //  document.querySelector("#header").scrollIntoView(true);
  },
  beforeDestroy () {
    this.trendPromise = []
  }
}
