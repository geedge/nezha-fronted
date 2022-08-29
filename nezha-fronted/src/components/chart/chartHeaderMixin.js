export default {
  props: {
    chartInfo: Object,
    from: String,
    isGroup: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    isError: {
      type: Boolean,
      default: false
    },
    chartData: {},
    showAllData: {
      type: Boolean,
      default: false
    },
    allDataLength: {
      type: Number,
      default: 0
    },
    isExportHtml: {
      type: Boolean,
      default: false
    },
    hiddenText: { // 隐藏图表的悬浮文字
      type: String
    }
  },
  data () {
    return {
      dropdownMenuShow: false,
      errorText: ''
    }
  },
  methods: {
    showFullscreen () {
      this.$emit('showFullscreen', true)
    },
    refreshChart () {
      this.$emit('refresh')
    },
    editChart () {
      // this.$emit('edit-chart', this.chartInfo)
      this.$store.dispatch('dispatchEditChart', {
        chart: this.chartInfo,
        type: 'edit'
      })
      this.dropdownMenuShow = false
    },
    removeChart () {
      this.$store.dispatch('dispatchDelChart', {
        chart: this.chartInfo,
        type: 'delete'
      })
      this.dropdownMenuShow = false
    },
    duplicate () {
      const obj = this.$loadsh.cloneDeep(this.chartInfo)
      obj.elements = obj.oldElements
      delete obj.oldElements
      this.$store.dispatch('dispatchEditChart', {
        chart: obj,
        type: 'duplicate'
      })
      this.dropdownMenuShow = false
    },
    sync () {
      this.$emit('sync')
      this.dropdownMenuShow = false
    },
    clickos () {
      this.dropdownMenuShow = false
    },
    groupShow () {
      this.$emit('groupShow', !this.chartInfo.param.collapse)
    },
    loadMore () {
      this.$emit('loadMore')
    },
    unitChange (val) {
      this.$emit('unitChange', val)
    }
  },
  watch: {
    isError: {
      immediate: true,
      handler (n) {
        if (n) {
          this.errorText = this.chartData.filter(item => item.error).map(item => item.error).join('\n')
        }
      }
    }
  }
}
