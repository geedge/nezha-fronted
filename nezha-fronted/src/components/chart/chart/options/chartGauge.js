const chartGaugeOption = {
  series: [
    {
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      progress: {
        show: true,
        width: 30
      },
      tooltip: {
        confine: false
      },
      pointer: {
        show: false
      },
      axisLine: {
        lineStyle: {
          width: 30
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
      data: []
    }
  ]
}
export default chartGaugeOption
