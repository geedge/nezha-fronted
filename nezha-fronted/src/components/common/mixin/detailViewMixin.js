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
    searchDetail (searchObj) {
      this.searchLabel = {}
      this.pageObj.pageNo = 1
      for (const item in searchObj) {
        if (typeof searchObj[item] !== 'undefined' && searchObj[item] !== null && searchObj[item] !== '') {
          this.$set(this.searchLabel, item, searchObj[item])
        }
      }
      if (this.searchDetailObj) {
        for (const item in this.searchDetailObj) {
          if (typeof this.searchDetailObj[item] !== 'undefined' && this.searchDetailObj[item] !== null && this.searchDetailObj[item] !== '') {
            if (this.searchDetailObj[item].join(',') !== '') {
              this.$set(this.searchLabel, item, this.searchDetailObj[item].join(','))
            }
          }
        }
      }
      if (this.$refs.dataTable) {
        this.$refs.dataTable.$refs.dataTable.bodyWrapper.scrollTop = 0
      }
      this.getDetail()
    },
    searchDetailTop () {
      if (!this.detailTimer) {
        this.detailTimer = setTimeout(() => {
          this.searchDetail()
          clearTimeout(this.detailTimer)
          this.detailTimer = ''
        }, 1000)
      } else {
        clearTimeout(this.detailTimer)
        this.detailTimer = setTimeout(() => {
          this.searchDetail()
          clearTimeout(this.detailTimer)
          this.detailTimer = ''
        }, 1000)
      }
    },
    getDetail () {
      const params = {
        pageNo: this.pageObj.pageNo,
        pageSize: this.pageObj.pageSize
      }
      this.tools.loading = true
      this.$get(this.url, { ...this.searchLabel, ...params }).then(response => {
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
