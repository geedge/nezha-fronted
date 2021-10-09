export default {
  props: {},
  data () {
    return {
      detailType: 'list',
      detailViewRightObj: {}
    }
  },
  methods: {
    changeDetailType (flag) {
      if (this.detailType === flag) {
        return
      }
      this.detailType = flag
      this.pageObj.pageNo = 1
      if (flag === 'list') {
        this.getTableData()
      } else {
        this.getDetail()
      }
    },
    searchDetail (params) {
      this.getDetail()
    },
    getDetail () {
      const params = {
        pageNo: this.pageObj.pageNo,
        pageSize: 50
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
