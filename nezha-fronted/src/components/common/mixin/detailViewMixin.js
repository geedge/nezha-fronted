export default {
  props: {},
  data () {
    return {
      detailType: 'list',
      detailViewRightObj: '',
      detailViewLoading: false
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
      this.pageObj.pageNo = 1
      this.detailViewLoading = true
      if (flag === 'list') {
        this.searchLabel = {}
        this.searchCheckBox = {}
        this.getTableData()
      } else {
        this.getDetail()
      }
      setTimeout(() => {
        this.detailViewLoading = false
        this.$refs.clickSearch && this.$refs.clickSearch.needMore()
      }, 100)
    },
    searchDetail (params) {
      this.getDetail()
    },
    getDetail () {
      const params = {
        pageNo: this.pageObj.pageNo,
        pageSize: this.pageObj.pageSize
      }
      this.tools.loading = true
      this.$get(this.url, { ...params }).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          this.tableData = response.data.list
          this.detailViewRightObj = this.tableData[0]
          this.pageObj.total = response.data.total
          this.pageObj.pages = response.data.pages
          if (!this.scrollbarWrap) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    },
    detailViewRightShow (item) {
      this.detailViewRightObj = item
    }
  }
}
