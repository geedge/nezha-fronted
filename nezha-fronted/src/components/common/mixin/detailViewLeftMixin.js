export default {
  props: {
    tableData: {
      type: Array
    },
    api: {
      type: String
    },
    tableId: {
      type: String
    },
    detailViewRightObj: {},
    orderByFa: {}
  },
  data () {
    return {
      orderBy: 'id',
      orderType: 'ascending',
      renderFirst: ''
    }
  },
  methods: {
    detailViewRightShow (item) {
      this.$emit('detailViewRightShow', item)
    },
    orderTypeChange () {
      if (this.orderType === 'ascending') {
        this.orderType = 'descending'
      } else {
        this.orderType = 'ascending'
      }
    }
  },
  watch: {
    orderByFa: {
      immediate: true,
      handler (n) {
        const index = n.indexOf('-')
        this.renderFirst = false
        if (index !== -1) {
          this.orderBy = n.slice(index + 1)
          this.orderType = 'descending'
        } else {
          this.orderBy = n
          this.orderType = 'ascending'
        }
        if (!n) {
          this.orderBy = 'id'
          this.orderType = 'ascending'
        }
        setTimeout(() => {
          this.renderFirst = true
        })
      }
    },
    orderBy: {
      handler (n) {
        if (this.renderFirst) {
          this.$emit('orderDetail', this.orderBy, this.orderType)
        }
      }
    },
    orderType: {
      handler (n) {
        if (this.renderFirst) {
          this.$emit('orderDetail', this.orderBy, n)
        }
      }
    }
  }
}
