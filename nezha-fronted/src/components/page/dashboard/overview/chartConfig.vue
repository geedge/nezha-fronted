<script>
import bus from '../../../../libs/bus'
import vm from '../../../../entrance/app/main'
import exportHtml from '../../../../entrance/exportHtml/exportHtml'
// const vm = window.dataJson ? exportHtml : app
window.addEventListener('load', function () {
  if (!window.dataJson) {
    commonOption.toolbox.feature.dataZoom.title.zoom = vm.$i18n.t('overall.toolBox.zoom')
    commonOption.toolbox.feature.dataZoom.title.back = vm.$i18n.t('overall.toolBox.back')
    commonOption.toolbox.feature.magicType.title.stack = vm.$i18n.t('overall.toolBox.stack')
  } else {
    commonOption.toolbox.feature.dataZoom.title.zoom = exportHtml.$i18n.t('overall.toolBox.zoom')
    commonOption.toolbox.feature.dataZoom.title.back = exportHtml.$i18n.t('overall.toolBox.back')
    commonOption.toolbox.feature.magicType.title.stack = exportHtml.$i18n.t('overall.toolBox.stack')
  }
})
const bgColorList = ['#b3424a', '#7bbfea', '#f05b72', '#596032', '#bd6758',
  '#cd9a5b', '#918597', '#70a19f', '#005344', '#FF00FF',
  '#f7acbc', '#5f5d46', '#66ffff', '#ccFF66', '#f47920',
  '#769149', '#1d953f', '#abc88b', '#7f7522', '#9b95c9',
  '#f3715c', '#ea66a6', '#d1c7b7', '#9d9087', '#77787b',
  '#f58220', '#c37e00', '#00ae9d', '#f26522', '#76becc',
  '#76624c', '#d71345', '#2468a2', '#ca8687', '#1b315e'
]
const overviewBgColor =
      ['#d64f40', '#ffdb28', '#7bfc95', '#77baf4',
        '#ac958f', '', '', '', '', '', '', '', '', '', '']
/*    let pieColor = ["#0c69ff","#59f747","#2eeab8","#b5ed8e",
      "#205299","#ffd6c6","#a0ffdf","#9be524",
      "#8abafc","#d181e8","#d88d50","#cce8ff",
      "#161ef9"]; */

const pieColor = ['#95E2C2', '#84C9E6', '#8CABEF', '#FAA995', '#FDD462']/* ['#d64f40', '#e66f60', '#f68f80', '#f6afa0',
      '#ffdb28', '#ffeb38', '#fffb48', '#ffffbb']; */

const commonOption = {
  title: {
    show: false
  },
  color: bgColorList,
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

        }
      },
      magicType: {
        type: ['stack'],
        title: {}
      }
      // restore: {},
    },
    tooltip: { // 和 option.tooltip 的配置项相同
      show: true,
      position: 'bottom',
      formatter (param) {
        return param.title // 自定义的 DOM 结构
      },
      backgroundColor: 'rgba(255,255,255,0)',
      borderColor: 'rgba(255,255,255,0)',
      textStyle: {
        fontSize: 12,
        color: '#439AC6'
      }
    }
  },
  tooltip: {
    trigger: 'axis',
    confine: false,
    extraCssText: 'z-index:99999999;',
    backgroundColor: 'rgba(221,228,237,1)',
    borderColor: 'rgba(221,228,237,1)',
    textStyle: { color: '#000' },
    axisPointer: {
      snap: false,
      animation: false
    },
    hideDelay: 0
    // formatter:null,
    // position:null,
  },
  grid: {
    top: 30,
    left: 0,
    right: 30,
    containLabel: true,
    bottom: 8// 156
  },
  dataZoom: [{
    type: 'slider',
    show: false,
    xAxisIndex: [0],
    start: 0,
    end: 100,
    height: 25,
    bottom: 10, // 96
    left: 40,
    right: 48
  }],
  xAxis: {
    type: 'time',
    // boundaryGap: false,//line-false; bar-true;
    axisLabel: {
      interval: 0,
      rotate: 0,
      formatter (value, index) {
        const tData = new Date(value)
        return [tData.getFullYear(), tData.getMonth() + 1, tData.getDate()].join('-') + '\n' +
              [tData.getHours(), tData.getMinutes()].join(':')
      }
    },
    axisPointer: { // y轴上显示指针对应的值
      show: true
    },
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: '#d9d9d9',
        opacity: 0.8,
        width: 1
      }
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
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      // formatter:null,
    }
  },
  useUTC: false, // 使用本地时间
  series: []
}
const mapOptions = {
  geo: {
    itemStyle: { areaColor: 'white' },
    map: '',
    roam: true, // 鼠标是否可以控制缩放
    // center: [67.45, 48],//当前视角的中心点，用经纬度表示
    // zoom: 5,
    label: { // 控制显示地图名称
      normal: {
        show: false
      },
      emphasis: {
        show: false
      }
    },
    emphasis: {
      itemStyle: {
        areaColor: 'white'
      }
    },
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    scaleLimit: {
      min: 4,
      max: 8
    },
    aspectScale: 1
  },
  tooltip: {
    trigger: 'item',
    type: 'cross',
    alwaysShowContent: false,
    backgroundColor: 'rgba(255,255,255,0.7)',
    confine: true
    /* borderColor:'#ffffff',
        borderRadius: 4,
        borderWidth: 1,
        padding: 0, */
  },
  backgroundColor: '#BDE3FD'
}
const assetTypePie = {
  title: {
    show: false
  },
  color: pieColor,
  grid: {
    top: 'top',
    left: 'left'
  },
  legend: {},
  series: [],
  tooltip: {}
}
const alertMessageBarByRule = {
  title: {
    show: false
  },
  legend: {
    show: false
  },
  grid: {
    top: 60,
    left: 30,
    right: 120,
    bottom: 60
  },
  series: [],
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.66)',
    textStyle: { color: '#333' }
  },
  xAxis: {
    type: 'value',
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    minInterval: 1,
    axisLabel: {
      show: true,
      fontSize: 14
    },
    inverse: true
  },
  yAxis: {
    type: 'category',
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    data: [],
    axisLabel: {
      show: true,
      fontSize: 12,
      formatter (value) {
        if (value.length > 15) {
          return '...' + value.substring(value.length - 12, value.length)
        }
        return value
      }
    },
    triggerEvent: true
  }
}
const alertMessageBarByAsset = {
  title: {
    show: false
  },
  legend: {
    show: false
  },
  grid: {
    top: 60,
    left: 80,
    right: 30,
    bottom: 60
  },
  series: [],
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.66)',
    extraCssText: 'box-shadow: 1px 2px 8px 0 rgba(0, 0, 0, 0.24);',
    textStyle: { color: '#333' }
  },
  yAxis: {
    type: 'value',
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      show: true,
      fontSize: 14
    }
  },
  xAxis: {
    type: 'category',
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    data: [],
    axisLabel: {
      show: true,
      fontSize: 12,
      formatter (value) {
        let r = value
        if (r.length > 4) {
          r = value.substring(0, 3) + '...'
        }
        return r.split('').join('\n')
      }
    },
    triggerEvent: true
  }
}
const logBar = {
  title: {
    show: false
  },
  xAxis: {
    type: 'time',
    axisLabel: {
      rotate: 0,
      fontSize: 13 * window.devicePixelRatio
    },
    axisPointer: { // y轴上显示指针对应的值
      show: true
    },
    splitLine: {
      show: false
    },
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    }
  },
  tooltip: {
    show: true
  },
  yAxis: {
    type: 'value',
    splitLine: {
      show: true
    },
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      fontSize: 13 * window.devicePixelRatio,
      formatter (value, i) {
        let y
        if (value < 1000) {
        } else if (value < 1000000) {
          y = value / 1000 + ' K'
        } else if (value >= 1000000) {
          y = value / 1000000 + ' M'
        } else {
          y = value / 1000000000 + ' G'
        }
        return y
      }
    }
  },
  useUTC: false, // 使用本地时间
  series: []
}
const overviewLine = {
  title: {
    show: false
  },
  color: overviewBgColor,
  legend: {
    show: false
  },
  toolbox: {
    show: false
  },
  tooltip: {
    trigger: 'axis',
    confine: false,
    extraCssText: 'z-index:1000;',
    formatter (v, i) {
      return v
    }
  },
  grid: {
    left: 6,
    right: 20,
    containLabel: true,
    bottom: 0
  },
  xAxis: {
    type: 'time',
    axisLabel: {
      rotate: 0,

      fontSize: 13 * window.devicePixelRatio
    },
    axisPointer: { // y轴上显示指针对应的值
      show: true
    },
    splitLine: {
      show: false
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
      show: true
    },
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      fontSize: 13 * window.devicePixelRatio,
      formatter (value, i) {
        let y
        if (value < 1000) {
          y = value + ' Bs'
        } else if (value < 1000000) {
          y = value / 1000 + ' KBs'
        } else if (value >= 1000000) {
          y = value / 1000000 + ' MBs'
        } else {
          y = value / 1000000000 + ' GBs'
        }
        return y
      }
    }
  },
  useUTC: false, // 使用本地时间
  series: []
}
const noDataOption = {
  grid: {
    top: 30,
    left: 20,
    right: 30,
    containLabel: true,
    bottom: 0// 156
  },
  xAxis: {
    type: 'category',
    data: createTempTimes(),
    splitLine: {
      show: true
    },
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    }
  },
  yAxis: {
    type: 'category',
    data: [1, 3, 5, 7, 9, 11, 13],
    splitLine: {
      show: true
    },
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    }
  },
  series: null
}
const tooltipPieOption = {
  color: ['#60C6B4', '#EEA694', '#9e9c9b'],
  title: {
    show: true,
    textStyle: {
      color: '#333333',
      fontSize: 14
    },
    top: 8,
    right: 8
  },
  legend: {
    data: [],
    show: true,
    left: '50%',
    top: '30%',
    icon: 'circle',
    itemHeight: 4,
    orient: 'vertical',
    itemGap: 6,
    textStyle: {
      fontSize: 12,
      padding: [0, 0, 10, -10]
    }
  },
  series: [
    {
      type: 'pie',
      animation: false,
      center: ['25%', '53%'],
      radius: [36, 48],
      data: [],
      label: {
        show: true,
        formatter: '',
        color: '#666666',
        position: 'center'
      }
    }
  ]
}
const topoPieOption = {
  color: ['#60C6B4', '#EEA694', '#9e9c9b'],
  title: {
    show: false
  },
  legend: {
    data: [],
    show: true,
    left: 62,
    top: 7,
    icon: 'circle',
    itemHeight: 4,
    orient: 'vertical',
    itemGap: 6,
    textStyle: {
      fontSize: 12,
      padding: [0, 0, 0, -10]
    }
  },
  series: [
    {
      type: 'pie',
      animation: false,
      center: [30, 35],
      radius: [18, 26],
      data: [],
      label: {
        show: true,
        formatter: '',
        color: '#666666',
        position: 'center'
      }
    }
  ]
}
function createTempTimes () {
  const times = []
  const tzo = (new Date().getTimezoneOffset() / 60) * (-1)// 系统时区
  let time = bus.UTCTimeToConfigTimezone(new Date().getTime() - tzo * 60 * 60 * 1000)
  for (let i = 0; i < 10; i++) {
    time = time - 5 * 60 * 1000
    times.push(bus.timeFormate(time, 'hh:mm'))
  }
  times.reverse()
  return times
}
const chartTypes = {
  line: { name: 'line', option: commonOption },
  overviewLine: { name: 'line', option: overviewLine },
  map: { name: 'map', option: mapOptions },
  pie: { name: 'assetType', option: assetTypePie },
  bar: { name: 'alertMessage', option: alertMessageBarByAsset },
  ruleBar: { name: 'ruleMessage', option: alertMessageBarByRule },
  assetBar: { name: 'assetMessage', option: alertMessageBarByAsset },
  logBar: { name: 'logBar', option: logBar },
  noData: { name: 'noData', option: noDataOption },
  tooltipPie: { option: tooltipPieOption },
  topoPie: { option: topoPieOption }
}
export default {
  getOption (type) {
    return JSON.parse(JSON.stringify(chartTypes[type].option))
  },
  getOptionNoData (type) {
    chartTypes[type].option.xAxis.data = createTempTimes()
    return JSON.parse(JSON.stringify(chartTypes[type].option))
  },
  setMap (map) {
    mapOptions.geo.map = map
  },
  getBgColorList () {
    return Object.assign([], bgColorList)
  }
}
</script>
