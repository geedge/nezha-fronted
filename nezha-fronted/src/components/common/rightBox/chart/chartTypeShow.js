export default {
  methods: {
    isDiagram (type) {
      switch (type) {
        case 'diagram':
          return true
        default: return false
      }
    },
    isUrl (type) {
      switch (type) {
        case 'url':
          return true
        default: return false
      }
    },
    isText (type) {
      switch (type) {
        case 'text':
          return true
        default: return false
      }
    },
    isGroup (type) {
      switch (type) {
        case 'group':
          return true
        default: return false
      }
    },
    isTable (type) {
      switch (type) {
        case 'table':
          return true
        default: return false
      }
    },
    isLog (type) {
      switch (type) {
        case 'log':
          return true
        default: return false
      }
    },
    isStackShow (type) {
      switch (type) {
        case 'line':
        case 'area':
        case 'point':
          return true
        case 'table':
        case 'stat':
        case 'hexagon':
        case 'bar':
        case 'treemap':
        case 'gauge':
        case 'pie':
          return false
        default: return false
      }
    },
    isStatisticsShow (type) {
      switch (type) {
        case 'line':
        case 'area':
        case 'point':
          return false
        case 'table':
        case 'stat':
        case 'hexagon':
        case 'bar':
        case 'treemap':
        case 'gauge':
        case 'pie':
        case 'bubble':
        case 'rank':
        case 'sankey':
        case 'funnel':
          return true
        default: return false
      }
    },
    isShowLegend (type) {
      switch (type) {
        case 'line':
        case 'area':
        case 'point':
        case 'treemap':
        case 'pie':
        case 'bar':
          return true
        case 'table':
        case 'stat':
        case 'hexagon':
        case 'gauge':
          return false
        default: return false
      }
    },
    isThresholdConfig (type) {
      switch (type) {
        case 'line':
        case 'area':
        case 'point':
          return true
        case 'table':
        case 'stat':
        case 'hexagon':
        case 'gauge':
        case 'treemap':
        case 'pie':
        case 'bar':
          return false
        default: return false
      }
    },
    isShowLegendVlaues (type) {
      switch (type) {
        case 'line':
        case 'area':
        case 'point':
          return true
        default: return false
      }
    },
    isShowValueMapping (type) {
      switch (type) {
        case 'line':
        case 'area':
        case 'point':
        case 'table':
          return false
        case 'stat':
        case 'hexagon':
        case 'bar':
        case 'gauge':
        case 'treemap':
        case 'pie':
        case 'bubble':
        case 'rank':
        case 'sankey':
        case 'funnel':
          return true
        default: return false
      }
    },
    isShowNullType (type) {
      switch (type) {
        case 'log':
        case 'bar':
        case 'treemap':
        case 'pie':
        case 'stat':
        case 'hexagon':
        case 'gauge':
          return false
        case 'line':
        case 'area':
        case 'point':
        case 'table':
          return true
        default: return false
      }
    },
    isShowText (type) {
      switch (type) {
        case 'bar':
        case 'treemap':
        case 'pie':
        case 'stat':
        case 'hexagon':
        case 'gauge':
        case 'bubble':
        case 'rank':
        case 'sankey':
        case 'funnel':
          return true
        case 'line':
        case 'area':
        case 'point':
        case 'table':
          return false
        default: return false
      }
    },
    contentShow (type) {
      switch (type) {
        case 'group' :
        case 'map' :
        case 'topology' :
        case 'hexagon' :
        case 'clock' :
          return false
        default: return true
      }
    },
    isShowDecimals (type) {
      switch (type) {
        case 'line':
        case 'area':
        case 'point':
        case 'bar':
        case 'treemap':
        case 'pie':
        case 'stat':
        case 'hexagon':
        case 'gauge':
        case 'bubble':
        case 'rank':
        case 'sankey':
        case 'funnel':
          return true
        default: return false
      }
    },
    isShowMinMax (type) {
      switch (type) {
        case 'line':
        case 'area':
        case 'point':
        case 'gauge':
          return true
        default: return false
      }
    },
    isShowRightYAxis (type) {
      switch (type) {
        case 'line':
        case 'area':
        case 'point':
          return true
        default: return false
      }
    },
    isShowSparkline (type) {
      switch (type) {
        case 'stat':
          return true
        default: return false
      }
    }
  }
}
