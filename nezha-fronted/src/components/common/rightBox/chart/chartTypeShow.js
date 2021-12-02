export default {
  methods: {
    isStackShow (type) {
      switch (type) {
        case 'line':
        case 'stackArea':
        case 'point':
          return true
        case 'table':
        case 'singleStat':
        case 'bar':
        case 'treemap':
        case 'pie':
          return false
        default: return false
      }
    },
    isStatisticsShow (type) {
      switch (type) {
        case 'line':
        case 'stackArea':
        case 'point':
          return false
        case 'table':
        case 'singleStat':
        case 'bar':
        case 'treemap':
        case 'pie':
          return true
        default: return false
      }
    },
    isShowLegend (type) {
      switch (type) {
        case 'line':
        case 'stackArea':
        case 'point':
          return true
        case 'table':
        case 'singleStat':
        case 'bar':
        case 'treemap':
        case 'pie':
          return false
        default: return false
      }
    },
    isShowValueMapping (type) {
      switch (type) {
        case 'line':
        case 'stackArea':
        case 'point':
        case 'table':
          return false
        case 'singleStat':
        case 'bar':
        case 'treemap':
        case 'pie':
          return true
        default: return false
      }
    },
    isTable (type) {
      switch (type) {
        case 'table':
          return true
        case 'line':
        case 'stackArea':
        case 'point':
        case 'singleStat':
        case 'bar':
        case 'treemap':
        case 'pie':
          return false
        default: return false
      }
    },
    isLog (type) {
      switch (type) {
        case 'log':
          return true
        case 'table':
        case 'line':
        case 'stackArea':
        case 'point':
        case 'singleStat':
        case 'bar':
        case 'treemap':
        case 'pie':
          return false
        default: return false
      }
    }
  }
}
