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
    },
    removeChart () {
      this.$store.dispatch('dispatchDelChart', {
        chart: this.chartInfo,
        type: 'delete'
      })
    },
    duplicate () {
      this.$store.dispatch('dispatchEditChart', {
        chart: this.chartInfo,
        type: 'duplicate'
      })
    },
    clickos () {
      this.dropdownMenuShow = false
    },
    groupShow () {
      this.$emit('groupShow', !this.chartInfo.param.collapse)
    },
    loadMore () {
      this.$emit('loadMore')
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
