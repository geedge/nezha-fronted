const chartBarOption = {
  tooltip: {
    show: true,
    trigger: 'item',
    confine: false,
    extraCssText: 'z-index:99999999;visibility:visible;',
    z: 9,
    animation: false,
    appendToBody: true,
    className: 'chart-bar'
  },
  legend: {
    show: false
  },
  xAxis: {
    type: 'category',
    animation: false,
    showAllSymbol: false,
    axisLabel: {
      interval: '0',
      showMaxLabel: false,
      rotate: 0,
      show: false,
      fontSize: 10
      // formatter: 动态生成
    },
    axisPointer: { // y轴上显示指针对应的值
      show: false
    },
    splitLine: {
      show: false,
      lineStyle: {
        color: '#d9d9d9',
        opacity: 0.8,
        width: 1
      }
    },
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      show: true,
      fontSize: 10
      // formatter: 动态生成
    }
  },
  series: [
    {
      type: 'bar',
      data: [],
      label: {
        show: true,
        color: '#333',
        width: 200,
        align: 'center',
        overflow: 'break',
        ellipsis: '...'
      },
      labelLine: {
        show: true
      },
      emphasis: {
        focus: 'series'
      }
    }
  ]
}
export default chartBarOption
