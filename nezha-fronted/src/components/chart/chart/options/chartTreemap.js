import * as echarts from 'echarts'
const formatUtil = echarts.format
const chartTreemapOption = {
  tooltip: {
    trigger: 'item',
    confine: false,
    extraCssText: 'z-index:99999999;visibility:visible;',
    z: 9,
    animation: false,
    appendToBody: true,
    className: 'chart-treemap',
    formatter: function (info) {
      const value = info.value
      const treePathInfo = info.treePathInfo
      const treePath = []
      for (let i = 1; i < treePathInfo.length; i++) {
        treePath.push(treePathInfo[i].name)
      }
      return [
        '<div class="tooltip-title">' +
        formatUtil.encodeHTML(treePath.join('/')) +
        '</div>'
      ].join('')
    },
    hideDelay: 0
  },
  series: [
    {
      name: 'Parent',
      type: 'treemap',
      visibleMin: 40,
      childrenVisibleMin: 40,
      nodeClick: false,
      roam: false,
      label: {
        show: true,
        position: 'inside',
        verticalAlign: 'middle',
        overflow: 'truncate',
        lineHeight: 16,
        height: 40
      },
      itemStyle: {
        borderColor: '#fff'
      },
      breadcrumb: {
        show: false
      },
      levels: [
        {
          itemStyle: {
            borderColor: 'rgba(0,0,0,0)',
            borderWidth: 0,
            gapWidth: 2
          }
        },
        {
          itemStyle: {
            borderColor: 'rgba(0,0,0,0)',
            gapWidth: 1
          }
        },
        {
          colorSaturation: [0.35, 0.5],
          itemStyle: {
            borderColor: 'rgba(0,0,0,0)',
            gapWidth: 1,
            borderColorSaturation: 0.6
          }
        }
      ],
      data: [],
      width: '99%',
      height: '99%'
    }
  ]
}
export default chartTreemapOption
