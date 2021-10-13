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
      }, 100)
    },
    detailViewRightShow (item) {
      this.detailViewRightObj = item
    }
  }
}
