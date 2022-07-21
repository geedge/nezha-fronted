const chartBubble = {
  dataset: {
    source: []
  },
  tooltip: {
    show: true,
    trigger: 'item',
    confine: false,
    extraCssText: 'z-index:1000;',
    z: 9,
    animation: false,
    appendToBody: true,
    className: 'chart-bubble'
  },
  hoverLayerThreshold: Infinity,
  series: [{
    type: 'custom',
    renderItem: undefined,
    progressive: 0,
    coordinateSystem: 'none'
  }]
}
export default chartBubble
