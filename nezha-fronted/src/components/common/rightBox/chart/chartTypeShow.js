export default {
  methods: {
    isStackShow (type) {
      switch (type) {
        case 'line':
        case 'stackArea':
        case 'point':
          return true
        case 'table':
        case 'stat':
        case 'bar':
        case 'treemap':
        case 'guage':
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
        case 'stat':
        case 'bar':
        case 'treemap':
        case 'guage':
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
        case 'stat':
        case 'bar':
        case 'guage':
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
        case 'stat':
        case 'bar':
        case 'guage':
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
        case 'stat':
        case 'bar':
        case 'guage':
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
        case 'stat':
        case 'bar':
        case 'treemap':
        case 'pie':
          return false
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
    isDiagram (type) {
      switch (type) {
        case 'diagram':
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
    }
  }
}
