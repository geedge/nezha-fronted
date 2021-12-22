const chartBarOption = {
  tooltip: {
    trigger: 'axis',
    confine: false,
    extraCssText: 'z-index:1000;',
    z: 9,
    animation: false,
    appendToBody: true
  },
  legend: {
    show: false
  },
  xAxis: {
    type: 'category'
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
