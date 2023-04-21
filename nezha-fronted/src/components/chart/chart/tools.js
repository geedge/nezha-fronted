import { chartType } from '@/components/common/js/constants'
import chartBarOption from './options/chartBar'
import chartPieOption from './options/chartPie'
import lodash from 'lodash'
import i18n from '@/components/common/i18n'
import {
  chartTimeSeriesLineOption,
  chartTimeSeriesScatterOption,
  chartTimeSeriesAreaOption
} from './options/chartTimeSeries'
import chartTreemapOption from './options/chartTreemap'
import chartGaugeOption from './options/chartGauge'
import chartClockOption from '@/components/chart/chart/options/chartClock'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'

export function getOption (type) {
  let chartOption = null
  chartTimeSeriesAreaOption.toolbox.feature.dataZoom.title = {
    zoom: i18n.t('overall.toolBox.zoom'),
    back: i18n.t('overall.toolBox.back')
  }
  chartTimeSeriesAreaOption.toolbox.feature.myStack.title = i18n.t('overall.toolBox.stack')
  switch (type) {
    case chartType.area: {
      chartOption = lodash.cloneDeep(chartTimeSeriesAreaOption)
      break
    }
    case chartType.point: {
      chartOption = lodash.cloneDeep(chartTimeSeriesScatterOption)
      break
    }
    case chartType.line: {
      chartOption = lodash.cloneDeep(chartTimeSeriesLineOption)
      break
    }
    case chartType.bar: {
      chartOption = lodash.cloneDeep(chartBarOption)
      break
    }
    case chartType.gauge: {
      chartOption = lodash.cloneDeep(chartGaugeOption)
      break
    }
    case chartType.pie: {
      chartOption = lodash.cloneDeep(chartPieOption)
      break
    }
    case chartType.treemap: {
      chartOption = lodash.cloneDeep(chartTreemapOption)
      break
    }
    case chartType.clock: {
      chartOption = lodash.cloneDeep(chartClockOption)
      break
    }
    case chartType.topologyLink: {
      chartOption = lodash.cloneDeep({})
      break
    }
    default:
      chartOption = {}
      break
  }
  return chartOption
}

export function isTimeSeries (type) {
  return type === chartType.line || type === chartType.area || type === chartType.point
}
export function isHexagon (type) {
  return type === chartType.hexagon
}
export function isChartPie (type) {
  return type === chartType.pie
}
export function isDoughnut (type) {
  return type === chartType.doughnut
}
export function isRose (type) {
  return type === chartType.rose
}
export function isChartBar (type) {
  return type === chartType.bar
}
export function isUrl (type) {
  return type === chartType.url
}
export function isText (type) {
  return type === chartType.text
}
export function isTreemap (type) {
  return type === chartType.treemap
}
export function isLog (type) {
  return type === chartType.log
}
export function isStat (type) {
  return type === chartType.stat
}
export function isDiagram (type) {
  return type === chartType.diagram
}
export function isGroup (type) {
  return type === chartType.group
}
export function isAutotopology (type) {
  return type === chartType.topology
}
export function isAssetInfo (type) {
  return type === chartType.assetInfo
}
export function isEndpointInfo (type) {
  return type === chartType.endpointInfo
}
export function isMap (type) {
  return type === chartType.map
}
export function isTable (type) {
  return type === chartType.table
}
export function isGauge (type) {
  return type === chartType.gauge
}
export function isClock (type) {
  return type === chartType.clock
}
export function isTopology (type) {
  return type === chartType.topologyLink
}
export function isChartBubble (type) {
  return type === chartType.bubble
}
export function isChartRank (type) {
  return type === chartType.rank
}
export function isSankey (type) {
  return type === chartType.sankey
}
export function isFunnel (type) {
  return type === chartType.funnel
}

export function getGroupHeight (arr) {
  if (arr.length) {
    let lastItem = []
    let maxY = arr[0].y
    arr.forEach((children, index) => {
      if (maxY == children.y) {
        lastItem.push(children)
      } else if (maxY < children.y) {
        maxY = children.y
        lastItem = [children]
      }
    })
    let maxHeight = 0
    lastItem.forEach(last => {
      if (maxHeight < last.height) {
        maxHeight = last.height
      }
    })
    if (maxY < 0) {
      maxY = 0
    }
    return maxHeight + maxY
  } else {
    return 1
  }
}
export function getLayoutPosition (arr) {
  if (arr.length) {
    let lastItem = []
    let maxY = 0
    arr.forEach((children, index) => {
      if (maxY == children.y) {
        lastItem.push(children)
      } else if (maxY < children.y) {
        maxY = children.y
        lastItem = [children]
      }
    })
    let maxX = 0
    lastItem.forEach(last => {
      if (maxX < last.x + last.span) {
        maxX = last.x + last.span
      }
    })
    return {
      x: maxX,
      y: maxY
    }
  } else {
    return {
      x: 0,
      y: 0
    }
  }
}

export function initColor (colorNum = 20) {
  const colorList = [
    '#3685FF', '#00DCA2', '#00BFD0', '#954Eff',
    '#FFCB01', '#f65A96', '#FF9094', '#00CCF5',
    '#FF8BEA', '#4D7693', '#72577C', '#99D750',
    '#DD8270', '#C475EE', '#7E83FB', '#7EB090',
    '#CF6684', '#4E55FF', '#FF8D00', '#FF5200'
  ]
  for (let i = 0; i < colorNum - 20; i++) {
    colorList.push(randomcolor())
  }
  return colorList
}
