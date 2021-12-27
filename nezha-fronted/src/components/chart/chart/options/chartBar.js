const chartBarOption = {
  tooltip: {
    show: true,
    trigger: 'item',
    confine: false,
    extraCssText: 'z-index:1000;',
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
    axisTick: {
      show: false
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
        width: 200,
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
