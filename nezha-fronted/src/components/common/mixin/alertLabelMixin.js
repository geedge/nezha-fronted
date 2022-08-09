import alertLabel from '@/components/common/alert/alertLabel'
export default {
  components: {
    alertLabel
  },
  data () {
    return {
      alertLabelShow: false,
      alertLabelId: '',
      alertLabelObj: {},
      alertLabelType: '',
      timer: null,
      flag: null
    }
  },
  methods: {
    // label 鼠标划入
    labelHover (item, type, loading, isUseType = true, e) {
      clearTimeout(this.timer)
      if (this.labelToolTipDis(type)) {
        return
      }
      if (isUseType) {
        if (e) {
          const dom = e.currentTarget
          const position = dom.getBoundingClientRect()
          this.$set(item[type], 'position', position)
          this.alertLabelId = item[type].id
          this.alertLabelObj = item[type]
          this.alertLabelType = type
        }
        this.$set(item[type], 'loading', loading)
      } else {
        if (e) {
          const dom = e.currentTarget
          const position = dom.getBoundingClientRect()
          this.$set(item, 'position', position)
          this.alertLabelId = item.id
          this.alertLabelObj = item
          this.alertLabelType = type
        }
        this.$set(item, 'loading', loading)
      }
      this.timer = setTimeout(() => {
        this.alertLabelShow = loading
      }, 500)
      this.flag = loading
    },
    tipHover (tipLoading) {
      clearTimeout(this.timer)
      if (this.flag === false) {
        this.alertLabelShow = tipLoading
      }
    },
    // label tooltip是否显示
    labelToolTipDis (labelType) {
      switch (labelType) {
        case 'asset':
        case 'module':
        case 'endpoint':
        case 'project':
        case 'dc':
        case 'user':
        case 'recordRule':
          return false
        default: return true
      }
    }
  }
}
