export default {
  props: {},
  watch: {
    detailViewRightObj: {
      handler (n) {
        if (n) {
          this.updatePath(this.$route.query, this.$route.path, 'nzDetailList')
        }
      }
    }
  },
  data () {
    return {
      detailType: localStorage.getItem('detail-view-' + this.tableId) || 'list',
      detailViewRightObj: '',
      detailViewLoading: false,
      detailTimer: ''
    }
  },
  created () {
    this.detailType = localStorage.getItem('detail-view-' + this.tableId) || 'list'
  },
  methods: {
    changeDetailType (flag) {
      if (this.detailType === flag) {
        return
      }
      // this.$refs.dataList.bottomBox.showSubList = false
      // if (this.orderBy) {
      //   this.detailViewRightObj = ''
      // }
      this.detailType = flag
      this.$router.replace({ query: { ...this.$route.query, detailType: flag } }).catch(err => {})
      let dataList = ''
      localStorage.setItem('detail-view-' + this.tableId, this.detailType)
      if (this.detailType === 'view') {
        dataList = 'detailList'
        if (this.from === this.fromRoute.asset) {
          this.setAsset(true)
        } else if (this.from === this.fromRoute.endpoint) {
          this.setEndpoint(true)
        }
      } else {
        dataList = 'dataList'
        if (this.from === this.fromRoute.asset) {
          this.setAsset(false)
        } else if (this.from === this.fromRoute.endpoint) {
          this.setEndpoint(false)
        }
      }
      setTimeout(() => {
        this.detailViewLoading = false
        this.$refs.clickSearch && this.$refs.clickSearch.needMore()
        this.$refs[dataList].$refs.searchInput.sreach_num = 0
        this.$refs[dataList].$refs.searchInput.select_list = []
        this.searchMsg.searchLabelList.forEach(searchLabel => {
          if (this.searchLabel[searchLabel.label]) {
            let val = this.searchLabel[searchLabel.label]
            if (searchLabel.label === 'projectIds') {
              const project = this.$refs.dataList.$refs.searchInput.projectSelect.find(project => val == project.id || val == project.name)
              val = project.name
              const valnum = project.id
              this.$refs[dataList].$refs.searchInput.select_list.push({
                ...searchLabel,
                val: val,
                valnum: valnum
              })
            } else {
              this.$refs[dataList].$refs.searchInput.select_list.push({
                ...searchLabel,
                val: val
              })
            }

            this.$refs[dataList].$refs.searchInput.sreach_num++
            this.$refs[dataList].$refs.searchInput.searchLabelList = this.$refs.dataList.$refs.searchInput.searchLabelList.filter(item => searchLabel.label !== item.label)
          }
        })
        if (this.orderBy) {
          const index = this.orderBy.indexOf('-')
          let orderBy = ''
          let orderType = ''

          if (index !== -1) {
            orderBy = this.orderBy.slice(index + 1)
            orderType = 'descending'
          } else {
            orderBy = this.orderBy
            orderType = 'ascending'
          }
          if (this.$refs.dataTable && this.$refs.dataTable.$refs.dataTable) {
            this.$refs.dataTable.$refs.dataTable.sort(orderBy, orderType)
          }
        }
      }, 100)
    },
    detailViewRightShow (item) {
      this.detailViewRightObj = this.$loadsh.cloneDeep(item)
    },
    orderDetail (order, orderType) {
      if (orderType === 'ascending') {
        this.orderBy = order
      } else {
        this.orderBy = '-' + order
      }
      this.getTableData()
    },
    setAsset (flag) {
      if (flag) {
        this.selectValue.modelIdsDetail = []
        this.selectValue.modelIds.forEach(modelId => {
          this.titleSearchList.model.children.forEach(model => {
            const brand = model.children.find(children => modelId == children.id)
            if (brand) {
              this.selectValue.modelIdsDetail.push(brand.brandId + '-' + modelId)
            }
          })
        })
        this.selectValue.fieldsDetail = []
        if (this.selectValue.fields) {
          const obj = JSON.parse(this.selectValue.fields)
          Object.keys(obj).forEach(key => {
            obj[key].forEach(item => {
              this.selectValue.fieldsDetail.push(key + '-' + item)
            })
          })
        }
      } else {
        const obj = {}
        this.selectValue.modelIds = this.selectValue.modelIdsDetail.map(item => item.split('-')[1])
        this.selectValue.fieldsDetail.forEach(item => {
          const arr = item.split('-')
          if (obj[arr[0]]) {
            obj[arr[0]].push(arr[1])
          } else {
            obj[arr[0]] = [arr[1]]
          }
        })
        this.selectValue.fields = JSON.stringify(obj)
        if (this.selectValue.fields === '{}') {
          this.selectValue.fields = ''
        }
      }
    },
    setEndpoint (flag) {
      if (flag) {
        this.selectValue.stateDetail = []
        if (this.selectValue.state) {
          const obj = JSON.parse(this.selectValue.state)
          Object.keys(obj).forEach(key => {
            obj[key].forEach(item => {
              this.selectValue.stateDetail.push(key + '-' + item)
            })
          })
        }
      } else {
        const obj = {}
        this.selectValue.stateDetail.forEach(item => {
          const arr = item.split('-')
          if (obj[arr[0]]) {
            obj[arr[0]].push(arr[1])
          } else {
            obj[arr[0]] = [arr[1]]
          }
        })
        this.selectValue.state = JSON.stringify(obj)
        if (this.selectValue.state === '{}') {
          this.selectValue.state = ''
        }
      }
    }
  }
}
