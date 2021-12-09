import * as echarts from 'echarts'
const formatUtil = echarts.format
const chartTreemapOption = {
  tooltip: {
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
        '</div>',
        'Disk Usage: ' + formatUtil.addCommas(value) + ' KB'
      ].join('')
    }
  },
  series: [
    {
      name: 'Disk Usage',
      type: 'treemap',
      visibleMin: 10,
      label: {
        show: true,
        formatter: '{b}'
      },
      itemStyle: {
        borderColor: '#fff'
      },
      levels: [
        {
          itemStyle: {
            borderWidth: 0,
            gapWidth: 5
          }
        },
        {
          itemStyle: {
            gapWidth: 1
          }
        },
        {
          colorSaturation: [0.35, 0.5],
          itemStyle: {
            gapWidth: 1,
            borderColorSaturation: 0.6
          }
        }
      ],
      data: []
    }
  ]
}
export default chartTreemapOption
