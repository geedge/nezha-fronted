import { initColor } from '@/components/chart/chart/tools'
import i18n from '@/components/common/i18n'
export const chartTimeSeriesLineOption = {
  title: {
    show: false
  },
  legend: {
    show: false
  },
  toolbox: {
    show: false,
    top: '0',
    right: '18',
    showTitle: false,
    feature: {
      dataZoom: {
        yAxisIndex: false,
        title: {
          zoom: i18n.t('overall.toolBox.zoom'),
          back: i18n.t('overall.toolBox.back')
        }
      },
      magicType: {
        type: ['stack'],
        title: {
          stack: i18n.t('overall.toolBox.stack')
        },
        iconStyle: {
          borderColor: '#7e7e7e'
        },
        emphasis: {
          borderColor: '#7e7e7e'
        }
      }
    }
  },
  tooltip: {
    trigger: 'axis',
    confine: false,
    extraCssText: 'z-index:1000;'
    // formatter: 动态生成
  },
  color: initColor(),
  grid: {
    left: 20,
    right: 35,
    top: 35,
    bottom: 15,
    containLabel: true
  },
  xAxis: {
    type: 'time',
    animation: false,
    showAllSymbol: false,
    axisLabel: {
      interval: '0',
      showMaxLabel: false,
      rotate: 0,
      show: true,
      fontSize: 10
      // formatter: 动态生成
    },
    axisPointer: { // y轴上显示指针对应的值
      show: true
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: '#d9d9d9',
        opacity: 0.8,
        width: 1
      }
    },
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    }
  },
  yAxis: {
    type: 'value',
    splitLine: {
      show: true,
      lineStyle: {
        color: '#d9d9d9',
        opacity: 0.8,
        width: 1
      }
    },
    // 去掉y轴
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      show: true,
      fontSize: 10
      // formatter: 动态生成
    }
  },
  series: [{
    name: '',
    type: 'line',
    symbol: 'emptyCircle', // 去掉点
    symbolSize: [2, 2],
    smooth: 0.2, // 曲线变平滑
    showSymbol: false,
    data: [],
    lineStyle: {
      width: 1,
      opacity: 0.9
    }
  }],
  useUTC: false // 使用本地时间
}
export const chartTimeSeriesAreaOption = {
  ...chartTimeSeriesLineOption,
  series: [{
    ...chartTimeSeriesLineOption.series[0],
    areaStyle: {}
  }]
}
export const chartTimeSeriesScatterOption = {
  ...chartTimeSeriesLineOption,
  toolbox: {},
  series: [{
    name: '',
    type: 'scatter',
    data: []
  }]
}
