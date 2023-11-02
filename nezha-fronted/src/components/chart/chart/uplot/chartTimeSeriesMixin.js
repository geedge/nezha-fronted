export default {
  methods: {
    initSeriesData (chartData) {
      const time = []
      const seriesData = []
      chartData.forEach(series => { // 首先处理时间 对应点没有值（不包括null 则添加undefind）
        console.log(series);
      })
      return seriesData
    }
  }
}
