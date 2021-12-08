const chartBarOption = {
  tooltip: {
    trigger: 'item'
  },
  legend: {
    show: false
  },
  xAxis: {
    type: 'category',
    show: true,
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    showAllSymbol: false,
    axisPointer: { // y轴上显示指针对应的值
      show: false
    },
    axisLabel: {
      margin: 8,
      formatter (params) {
        console.log(params)
        const chartWidth = 900
        const length = Math.ceil((chartWidth) / 16)
        let val = ''
        if (params.length > length) {
          val = params.substr(0, length) + '...'
          return val
        } else {
          return params
        }
      }
    }
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      type: 'bar',
      data: [],
      label: {
        show: true,
        color: '#333',
        width: 100,
        align: 'center',
        overflow: 'break',
        ellipsis: '...'
      },
      labelLine: {
        show: true
      }
    }
  ]
}
export default chartBarOption
