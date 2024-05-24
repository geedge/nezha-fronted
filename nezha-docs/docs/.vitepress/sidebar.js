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
                  ]
                }
              ]
            },
          ]
        },
      ],
    }
  ],
};
