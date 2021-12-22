const chartPieOption = {
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
