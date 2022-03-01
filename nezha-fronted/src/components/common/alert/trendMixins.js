import alertDaysInfo from '@/components/common/alert/alertDaysInfo'
export default {
  components: {
    alertDaysInfo
  },
  data () {
    return {
      severityDataWeight: this.$store.getters.severityDataWeight,
      alertNumtooltipShow: false,
      position: {
        left: 0,
        top: 0
      },
      alertDaysData: [],
      trendLoading: false,
      trendTimer: null
    }
  },
  methods: {
    tooltipHover (item, flag, e) {
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        this.position.left = position.left
        this.$set(this.position, 'left', position.left)
        if (position.top > window.innerHeight / 2) {
          this.$set(this.position, 'top', position.top - 55)
        } else {
          this.$set(this.position, 'top', position.top + 30)
        }
        // this.$set(item, 'alertNumtooltipShow', flag)
        this.alertNumtooltipShow = flag
      }
    },
    getWeeksTime () {
      const localOffset = new Date().getTimezoneOffset() // 默认 显示时区偏移的结果 单位分钟
      const now = new Date(new Date().toLocaleDateString()).getTime() - localOffset * 60 * 1000
      const arr = []
      for (let i = 0; i < 7; i++) {
        const obj = {
          time: now - i * 24 * 60 * 60 * 1000,
          tooltipShow: false,
          position: {
            left: 0,
            top: 0
          }
        }
        this.severityDataWeight.forEach(item => {
          obj[item.name] = 0
          obj[item.name + 'Color'] = item.color
        })
        arr.unshift(obj)
      }
      return arr
    }
  }
}
