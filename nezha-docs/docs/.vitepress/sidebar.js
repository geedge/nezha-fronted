export const sidebar = {
  '/en/': [
    {
      text: 'Guide',
      items: [
        { text: 'Button', link: '/en/' },
      ],
    },
  ],
  '/': [
    {
      text: '介绍',
      items: [
        { text: '简介', link: '/' },
      ],
    },
    {
      text: '组件',
      items: [
        {
          text: 'chartList',
          link: '/chartList',
          items: [
            { text: 'chartHeader', link: '/chartHeader' },
            {
              text: 'panelChart',
              link: '/panelChart',
              items: [
                {
                  text: 'chart',
                  link: '/chart',
                  items: [
                    {text: 'chartTimeSeries', link: '/chartTimeSeries'},
                    {text: 'chartAutotopology', link: '/chartAutotopology'},
                    {text: 'chartDiagram', link: '/chartDiagram'},
                    {text: 'chartLegend', link: '/chartLegend'},
                  ]
                }
              ]
            },
          ]
        },
        {
          text: 'table',
          link: '/table',
          items: [
            {
              text: 'nzDataList',
              link: '/nzDataList',
              items:[
                {text:'searchBox', link: '/searchBox'},
                {text:'searchInput', link: '/searchInput'},
                {text:'bottomBox', link: '/bottomBox'},
              ]
            },
            { text: 'nzDetailView', link: '/nzDetailView',},
            { text: 'deleteButton', link: '/deleteButton',},
            { text: 'rightBox', link: '/rightBox',},

          ]
        }
      ],
    },

    {
      text: '其他组件',
      items:[
        {text:'clickSearch', link: '/clickSearch'},
        {text:'promqlInput', link: '/promqlInput'},
      ]
    },
    {
      text: '引用插件',
      items:[
        {text:'le5le', link: '/le5le'},
        {text:'map', link: '/map'},
        {text:'xterm', link: '/xterm'},
        {text:'时间插件', link: '/time'},
        {text:'Quill', link: '/quill'},
      ]
    },
    {
      text: '注意事项',
      link: '/note',
    }
  ],
};
