export default {
  props: {},
  data () {
    return {
      detailType: 'list',
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
      this.detailType = flag
      localStorage.setItem('detail-view-' + this.tableId, this.detailType)
      if (this.detailType === 'view') {
        // modelIdsDetail
        this.selectValue.modelIdsDetail = []
        this.selectValue.modelIds.forEach(modelId => {
          this.titleSearchList.model.children.forEach(model => {
            const brand = model.children.find(children => modelId == children.id)
            if (brand) {
              console.log(brand)
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
      this.pageObj.pageNo = 1
      setTimeout(() => {
        this.detailViewLoading = false
        this.$refs.clickSearch && this.$refs.clickSearch.needMore()
        this.$refs.dataList.$refs.searchInput.sreach_num = 0
        this.searchMsg.searchLabelList.forEach(searchLabel => {
          if (this.searchLabel[searchLabel.label]) {
            console.log(searchLabel.label, this.searchLabel[searchLabel.label])
            this.$refs.dataList.$refs.searchInput.select_list.push({
              ...searchLabel,
              val: this.searchLabel[searchLabel.label]
            })
            this.$refs.dataList.$refs.searchInput.sreach_num++
            this.$refs.dataList.$refs.searchInput.searchLabelList = this.$refs.dataList.$refs.searchInput.searchLabelList.filter(item => searchLabel.label !== item.label)
          }
        })
      }, 100)
    },
    detailViewRightShow (item) {
      this.detailViewRightObj = item
    },
    orderDetail (order, orderType) {
      if (orderType === 'ascending') {
        this.orderBy = order
      } else {
        this.orderBy = '-' + order
      }
      this.getTableData()
    }
  }
}
