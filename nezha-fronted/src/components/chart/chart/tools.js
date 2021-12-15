import { chartType } from '@/components/common/js/constants'
import chartBarOption from './options/chartBar'
import chartGaugeOption from './options/chartGauge'
import chartPieOption from './options/chartPie'
import lodash from 'lodash'
import {
  chartTimeSeriesLineOption,
  chartTimeSeriesScatterOption,
  chartTimeSeriesAreaOption
} from './options/chartTimeSeries'
import chartTreemapOption from './options/chartTreemap'
import {randomcolor} from "@/components/common/js/radomcolor/randomcolor";

export function getOption (type) {
  let chartOption = null
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
    default: break
  }
  return chartOption
}

export function isTimeSeries (type) {
  return type === chartType.line || type === chartType.area || type === chartType.point
}

export function isHexagonFigure (type) {
  return type === chartType.hexagonFigure
}
export function isChartPie (type) {
  return type === chartType.pie
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
export function isAutoCarousel (type) {
  return type === chartType.carousel
}
export function isAssetInfo (type) {
  return type === chartType.assetInfo
}
export function isEndpointInfo (type) {
  return type === chartType.endpointInfo
}

export function getGroupHeight (arr) {
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
    let maxHeight = 0
    lastItem.forEach(last => {
      if (maxHeight < last.height) {
        maxHeight = last.height
      }
    })
    return maxHeight + maxY
  } else {
    return 1
  }
}

export function initColor (colorNum = 20) {
  const colorList = [
    '#FF5200', '#3685FF', '#FF8D00', '#00DCA2',
    '#954Eff', '#FFCB01', '#f65A96', '#00BFD0',
    '#FF8BEA', '#4D7693', '#72577C', '#99D750',
    '#DD8270', '#C475EE', '#7E83FB', '#7EB090',
    '#FF9094', '#00CCF5', '#CF6684', '#4E55FF'
  ]
  for (let i = 0; i < colorNum - 20; i++) {
    colorList.push(randomcolor())
  }
  return colorList
}
