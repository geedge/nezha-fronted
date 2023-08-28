import { initColor } from '@/components/chart/chart/tools'
import i18n from '@/components/common/i18n'
import { stackIconSvg } from '@/components/common/js/constants'
export const chartTimeSeriesLineOption = {
  title: {
    show: false
  },
  legend: {
    show: false
  },
  animation: false,
  toolbox: {
    show: false,
    top: '0',
    right: '36',
    showTitle: true,
    feature: {
      dataZoom: {
        show: false,
        yAxisIndex: false,
        title: {
          zoom: i18n.t('overall.toolBox.zoom'),
          back: i18n.t('overall.toolBox.back')
        }
      },
      // stack使用自定义按钮
      myStack: {
        show: false,
        title: i18n.t('overall.toolBox.stack'),
        icon: stackIconSvg,
        iconStyle: {}
      }
    }
  },
  tooltip: {
    show: true,
    trigger: 'axis',
    confine: false,
    extraCssText: 'z-index:99999999;visibility:visible;',
    z: 9,
    animation: false,
    appendToBody: true,
    className: 'chart-time-series',
    axisPointer: {
      type: 'cross', // 十字准星指示器,表示启用两个正交的轴的 axisPointer
      label: {
        show: false
      }
    }
  },
  dataZoom: [
    {
      disabled: true,
      type: 'inside',
      zoomOnMouseWheel: 'ctrl'
    }
  ],
  color: initColor(),
  grid: {
    left: 20,
    right: 35,
    top: 20,
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
    // axisPointer: { // y轴上显示指针对应的值
    //   show: true
    // },
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
    },
    axisPointer: {
      snap: true
    }
  },
  yAxis: [
    {
      name: '',
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
    {
      name: '',
      type: 'value',
      splitLine: {
        show: false,
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
    }
  ],
  series: [{
    name: '',
    cursor: 'pointer',
    type: 'line',
    symbol: 'emptyCircle', // 去掉点
    connectNulls: true,
    symbolSize: [6, 6],
    smooth: 0.2, // 曲线变平滑
    // showSymbol: false,
    itemStyle: {
      opacity: 0
    },
    data: [],
    lineStyle: {
      width: 1,
      opacity: 0.9
    },
    emphasis: {
      focus: 'series',
      itemStyle: {
        opacity: 1
      }
    },
    blur: {
      lineStyle: {
        opacity: 0.3
      }
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
  series: [{
    name: '',
    type: 'scatter',
    data: [],
    z: 9,
    emphasis: {
      focus: 'series'
    }
  }]
}
