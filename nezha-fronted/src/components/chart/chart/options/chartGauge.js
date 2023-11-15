const chartGaugeOption = {
  tooltip: {
    show: true,
    trigger: 'item',
    confine: false,
    extraCssText: 'z-index:99999999;visibility:visible;',
    z: 9,
    animation: false,
    appendToBody: true,
    className: 'chart-gauge',
    hideDelay: 0
  },
  legend: {
    show: false
  },
  series: [
    {
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      progress: {
        show: true,
        width: 30
      },
      // tooltip: {
      //   trigger: 'axis',
      //   confine: false,
      //  extraCssText: 'z-index:99999999;visibility:visible;',
      //   z: 9,
      //   animation: false,
      //   appendToBody: true
      // },
      pointer: {
        show: false
      },
      axisLine: {
        lineStyle: {
          width: 30,
          color: [[1, '#F4F5F5']]
        }
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        show: false
      },
      anchor: {
        show: false
      },
      title: {
        show: false
      },
      data: [],
      center: ['50%', '60%']
    }
  ]
}
export default chartGaugeOption
