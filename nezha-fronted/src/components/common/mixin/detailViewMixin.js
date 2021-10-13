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
      setTimeout(() => {
        this.detailViewLoading = false
        this.$refs.clickSearch && this.$refs.clickSearch.needMore()
      }, 100)
    },
    searchDetailTop () {
      if (!this.detailTimer) {
        this.detailTimer = setTimeout(() => {
          this.getTableData()
          clearTimeout(this.detailTimer)
          this.detailTimer = ''
        }, 1000)
      } else {
        clearTimeout(this.detailTimer)
        this.detailTimer = setTimeout(() => {
          this.getTableData()
          clearTimeout(this.detailTimer)
          this.detailTimer = ''
        }, 1000)
      }
    },
    detailViewRightShow (item) {
      this.detailViewRightObj = item
    }
  }
}
