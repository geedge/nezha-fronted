const chartBarOption = {
  tooltip: {
    trigger: 'item',
    confine: false
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
