const chartPieOption = {
  tooltip: {
    show: true,
    trigger: 'item',
    confine: false,
    extraCssText: 'z-index:99999999;visibility:visible;',
    z: 9,
    animation: false,
    appendToBody: true,
    className: 'chart-pie'
  },
  legend: {
    show: false
  },
  series: [
    {
      type: 'pie',
      radius: '60%',
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      zlevel: 1,
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
