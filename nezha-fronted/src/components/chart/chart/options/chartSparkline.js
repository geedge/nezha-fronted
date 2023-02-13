const chartSparklineOption = {
  xAxis: {
    show: false,
    type: 'time'
  },
  yAxis: {
    show: false,
    type: 'value'
  },
  grid: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
  animation: false,
  axisLabel: {},
  series: [
    {
      name: '',
      type: 'line',
      smooth: false,
      symbol: 'none',
      silent: true,
      data: []
    }
  ]
}
export default chartSparklineOption
