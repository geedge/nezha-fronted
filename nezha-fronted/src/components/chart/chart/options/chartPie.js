const chartPieOption = {
  tooltip: {
    trigger: 'item'
  },
  legend: {
    show: false
  },
  series: [
    {
      type: 'pie',
      radius: '55%',
      center: ['50%', '50%'],
      data: [],
      label: {
        show: true,
        color: '#333',
        position: 'inside',
        width: 200,
        overflow: 'truncate',
        ellipsis: '...'
      },
      labelLine: {
        show: true
      }
    }
  ]
}
export default chartPieOption
