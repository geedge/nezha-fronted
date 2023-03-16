import bus from '@/libs/bus'
export default {
  data () {
    return {
      fileName: 'panel'
    }
  },
  methods: {
    exportToHtml (name) {
      const vars = this.$store.getters.getVariablesArr.map(item => {
        return {
          name: item.name,
          value: item.checked.join('|')
        }
      })
      const params = {
        format: 'html',
        dashboardId: this.showPanel.id,
        start: this.$stringTimeParseToUnix(bus.formateTimeToTime(this.searchTime[0])),
        end: this.$stringTimeParseToUnix(bus.formateTimeToTime(this.searchTime[1])),
        vars: vars
      }
      this.$store.dispatch('dispatchHomeLoading', true)
      this.$get('/visual/dashboard/snapshot', params, 'blob').then(res => {
        this.$store.dispatch('dispatchHomeLoading', false)
        const self = this
        let fileName = name
        const resFileName = ''
        if (resFileName) {
          fileName = resFileName
        }
        if (res.type == 'application/json') {
          const reader = new FileReader() // 创建一个FileReader实例
          reader.readAsText(res, 'utf-8') // 读取文件,结果用字符串形式表示
          reader.onload = function () { // 读取完成后,**获取reader.result**
            const { msg } = JSON.parse(reader.result)
            self.$message.error(msg) // 弹出错误提示
          }
          return
        }
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res])
          window.navigator.msSaveOrOpenBlob(blobObject, fileName + '.html')
        } else {
          const blob = new Blob([res])
          const link = document.createElement('a')
          const href = window.URL.createObjectURL(blob) // 下载链接
          link.href = href
          link.download = fileName + '.html' // 下载后文件名
          document.body.appendChild(link)
          link.click() // 点击下载
          document.body.removeChild(link) // 下载完成移除元素
          window.URL.revokeObjectURL(href) // 释放blob对象
        }
        this.$refs.topTool.closeDialog()
      }, () => {
        this.$message.error('123')
      })
    }
  }
}
