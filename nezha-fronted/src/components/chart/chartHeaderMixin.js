import bus from '@/libs/bus'
import {isTimeSeries} from './chart/tools'
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
    showTool: {
      type: Boolean,
      default: true
    },
    hiddenText: { // 隐藏图表的悬浮文字
      type: String
    },
    isPreview: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      dropdownMenuShow: false,
      errorText: '',
      isStack: ''
    }
  },
  methods: {
    showFullscreen () {
      this.$emit('showFullscreen', true)
    },
    isTimeSeries,
    refreshChart () {
      this.$emit('refresh')
    },
    editChart () {
      if (this.chartInfo.type === 'text' && this.from === 'notebook') {
        this.$set(this.chartInfo.param, 'isEdit', true)
        return
      }
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
    downloadCSV () {
      this.$emit('downloadCSV')
      this.dropdownMenuShow = false
    },
    duplicate () {
      if (this.chartInfo.type === 'text' && this.from === 'notebook') {
        bus.$emit('copyChartText', this.chartInfo)
        return
      }
      const obj = this.$lodash.cloneDeep(this.chartInfo)
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
    },
    changeStack () {
      this.isStack = !this.isStack
      this.$emit('changeStack', this.isStack)
    },
    showDownloadCsv (type) {

      switch (type) {
        case 'line' :
        case 'area' :
        case 'point' :
          return true
          break
        case 'stat' :
        case 'hexagon':
        case 'bar' :
        case 'pie' :
        case 'doughnut' :
        case 'rose' :
        case 'bubble' :
        case 'funnel' :
        case 'rank' :
        case 'sankey' :
        case 'gauge' :
        case 'treemap' :
          // case 'log' :
          // case 'diagram' :
          // case 'url':
          // case 'clock':
          return true
        case 'table' :
          return true
        default:
          return false
      }
    }
  },
  computed: {
    variablesArr () {
      return this.$store.getters.getVariablesArr
    },
    // 所有类型 chart name 支持变量替换
    nameFormate () {
      let str = this.chartInfo.name
      // group图表设置repeat的name替换
      if (this.chartInfo.repeatVariable) {
        const variable = this.chartInfo.repeatVariable
        const reg = new RegExp('\\$' + variable, 'g')
        str = str.replace(reg, this.chartInfo.repeatValue.replace(/\\"/g, '"').replace(/\\'/g, "'"))
      }
      let confirmReg = []
      this.variablesArr.forEach(item => {
        const reg = '$' + item.name // 后续需要考虑 item,name 使用特殊字符的问题
        const index = this.chartInfo.name.indexOf(reg)
        if (index !== -1) {
          confirmReg.push(item)
        }
      })
      confirmReg = this.$lodash.orderBy(confirmReg, function (item) { // 根据 匹配的name的长度排序 避免匹配的 $a 没匹配 $asset的问题
        return item.name.length
      }, 'desc')
      if (confirmReg.length) {
        confirmReg.forEach(item => {
          const reg = new RegExp('\\$' + item.name, 'g') // 后续需要考虑 item,name 使用特殊字符的问题
          str = str.replace(reg, item.checked.map(label => label.replace(/\\"/g, '"').replace(/\\'/g, "'")).join('+'))
        })
      }
      this.chartInfo.modifiedName = str
      return str
    },
    notebookEdit () { // 是否是编辑状态
      return this.$store.getters.getNotebookEdit
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
  },
  mounted() {
    try {
      this.isStack = !!this.chartInfo.param.stack
    } catch (e) {}
  }
}
