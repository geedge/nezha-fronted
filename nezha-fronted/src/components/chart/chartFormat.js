export default {
  methods: {
    pieFormatterLabel (params) {
      const self = this
      let str = ''
      if (this.chartInfo.type == 'bar') { // 柱状图 单独处理
        if (this.chartInfo.param.text === 'value' || !this.chartInfo.param.text || this.chartInfo.param.text === 'all') {
          str += params.data.mapping && params.data.mapping.display ? self.handleDisplay(params.data.mapping.display, { ...params.data.labels, value: params.data.showValue }) : params.data.showValue
          return str
        }
        if (this.chartInfo.param.text === 'none' || this.chartInfo.param.text === 'legend') {
          return str
        }
      }
      if (this.chartInfo.param.text === 'all') {
        str += params.data.alias
        str += '\n'
        str += params.data.mapping && params.data.mapping.display ? self.handleDisplay(params.data.mapping.display, { ...params.data.labels, value: params.data.showValue }) : params.data.showValue
      }
      if (this.chartInfo.param.text === 'value' || !this.chartInfo.param.text) {
        str += params.data.mapping && params.data.mapping.display ? self.handleDisplay(params.data.mapping.display, { ...params.data.labels, value: params.data.showValue }) : params.data.showValue
      }
      if (this.chartInfo.param.text === 'legend') {
        str += params.data.alias
      }
      if (this.chartInfo.param.text === 'none') {
        str += ''
      }
      str += ''
      return str
    },
    handleDisplay (display, params) {
      const self = this
      const myParams = JSON.parse(JSON.stringify(params))
      myParams.$labels = JSON.parse(JSON.stringify(params))
      myParams.$value = myParams.value
      myParams.$legend = myParams.legend
      if (/\{\{.+\}\}/.test(display)) {
        const labelValue = display.replace(/(\{\{.+?\}\})/g, function (i) {
          const label = i.substr(i.indexOf('{{') + 2, i.indexOf('}}') - i.indexOf('{{') - 2)
          let value = null
          if (self.$lodash.get(myParams, label)) {
            value = self.$lodash.get(myParams, label)
          }
          // return value || label
          return value || ''
        })
        return labelValue
      } else {
        return display
      }
    },
    getMinMaxFromData (originalDatas) {
      let minTime = null
      let maxTime = null
      let minValue = null
      let maxValue = null
      // 将数据提为二维数组
      let datas = []
      originalDatas.forEach((originalData, expressionIndex) => {
        originalData.forEach((data, dataIndex) => {
          datas = [...datas, ...data.values]
        })
      })
      const timeSorted = datas.sort((a, b) => {
        return a[0] - b[0]
      })
      const valueSorted = datas.sort((a, b) => {
        return a[1] - b[1]
      })
      minTime = timeSorted.length ? timeSorted[0][0] : ''
      maxTime = timeSorted.length ? timeSorted[timeSorted.length - 1][0] : ''
      minValue = valueSorted.length ? valueSorted[0][1] : ''
      maxValue = valueSorted.length ? valueSorted[valueSorted.length - 1][1] : ''
      return { minTime, maxTime, minValue, maxValue }
    }
  }
}
