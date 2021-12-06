const chartData = {
  msg: 'success',
  code: 200,
  data: {
    total: 3,
    pageSize: -1,
    pages: 1,
    pageNo: 1,
    list: [
      {
        id: 690483,
        name: '123',
        panelId: 1243,
        groupId: 0,
        dataSource: 1,
        span: 12,
        height: 6,
        updateBy: 1,
        updateAt: '2021-11-10 07:06:09',
        type: 'line',
        unit: 2,
        weight: 0,
        param: '{' +
          '   "style":"area",' +
          '   "showHeader":false,' +
          '   "stack":true,' +
          '   "legend":{' +
          '        "placement":"bottom",' +
          '        "values":["min","max","avg","first","last","total"]' +
          '    },' +
          '    "thresholds":[{' +
          '        "color":"#eee",' +
          '        "val":"0.9"' +
          '    },{' +
          '        "color":"#aaa",' +
          '        "val":"1.1"' +
          '    }],' +
          '    "nullType":"zero"' +
          '}',
        pid: null,
        buildIn: 0,
        remark: '123',
        seq: null,
        x: 0,
        y: 0,
        w: 6,
        h: 4,
        i: 690483,
        elements: [
          {
            id: 68527,
            chartId: 690483,
            // expression: 'up{asset="44.37"}',
            expression: 'label_replace(up{instance=~\'.*10090\',job=\'\'},"asset","$1","instance","(.*)")',
            type: 'expert',
            legend: '{{asset}}',
            buildIn: 0,
            seq: null
          },
          {
            id: 68528,
            chartId: 690483,
            expression: 'Hadoop_HBase_Healthy',
            type: 'expert',
            legend: '',
            buildIn: 0,
            seq: null
          }
        ],
        sync: null,
        panel: {
          id: 1243,
          name: 'test',
          createBy: null,
          type: null,
          link: null,
          pid: null,
          weight: null,
          buildIn: null,
          seq: null,
          children: null,
          parent: null,
          chartNum: null
        },
        group: {
          id: 0,
          name: null,
          panelId: null,
          groupId: null,
          span: null,
          height: null,
          updateBy: null,
          updateAt: null,
          type: null,
          unit: null,
          weight: null,
          param: null,
          pid: null,
          buildIn: null,
          remark: null,
          seq: null,
          x: null,
          y: null,
          elements: null,
          sync: null,
          panel: null,
          group: null,
          children: null,
          chartNums: null,
          asset: null,
          varType: null,
          varId: null,
          varName: null
        },
        children: [

        ],
        chartNums: null,
        asset: null,
        varType: null,
        varId: null,
        varName: null
      },
      {
        id: 690500,
        name: '233',
        panelId: 1243,
        groupId: 0,
        dataSource: 1,
        span: 6,
        height: 4,
        updateBy: 1,
        updateAt: '2021-11-10 09:05:13',
        type: 'point',
        unit: 2,
        weight: 1,
        param: '{' +
          '   "style":"point",' +
          '   "showHeader":true,' +
          '   "stack":false,' +
          '    "legend":{' +
          '        "placement":"right"' +
          //  '        "values":["min","max","avg","first","last","total"]' +
          '    },' +
          '    "thresholds":[{' +
          '        "color":"#ff0000",' +
          '        "val":"100"' +
          '    },{' +
          '        "color":"#00ff00",' +
          '        "val":"250"' +
          '    }],' +
          '    "nullType":"zero"' +
          '}',
        pid: null,
        buildIn: 0,
        remark: '',
        seq: null,
        x: 6,
        y: 0,
        w: 3,
        h: 4,
        i: 690484,
        elements: [
          {
            id: 68542,
            chartId: 690500,
            expression: '233',
            type: 'expert',
            legend: '',
            buildIn: 0,
            seq: null
          }
        ],
        sync: null,
        panel: {
          id: 1243,
          name: 'test',
          createBy: null,
          type: null,
          link: null,
          pid: null,
          weight: null,
          buildIn: null,
          seq: null,
          children: null,
          parent: null,
          chartNum: null
        },
        group: {
          id: 0,
          name: null,
          panelId: null,
          groupId: null,
          span: null,
          height: null,
          updateBy: null,
          updateAt: null,
          type: null,
          unit: null,
          weight: null,
          pid: null,
          buildIn: null,
          remark: null,
          seq: null,
          x: null,
          y: null,
          elements: null,
          sync: null,
          panel: null,
          group: null,
          children: null,
          chartNums: null,
          asset: null,
          varType: null,
          varId: null,
          varName: null
        },
        children: [

        ],
        chartNums: null,
        asset: null,
        varType: null,
        varId: null,
        varName: null
      },
      {
        id: 690501,
        name: '323',
        panelId: 1243,
        groupId: 0,
        span: 6,
        height: 4,
        updateBy: 1,
        updateAt: '2021-11-10 09:51:06',
        type: 'line',
        unit: 2,
        weight: 2,
        dataSource: 1,
        param: '{' +
          '   "style":"line",' +
          '   "showHeader":true,' +
          '   "stack":true,' +
          '    "legend":{' +
          '        "placement":"left"' +
          //  '        "values":["min","max","avg","first","last","total"]' +
          '    },' +
          '    "thresholds":[{' +
          '        "color":"#eee",' +
          '        "val":"10.1"' +
          '    },{' +
          '        "color":"#aaa",' +
          '        "val":"base"' +
          '    }],' +
          '    "nullType":"zero"' +
          '}',
        pid: null,
        buildIn: 0,
        remark: '123',
        seq: null,
        x: 0,
        y: 4,
        w: 6,
        h: 4,
        i: 690485,
        elements: [
          {
            id: 68527,
            chartId: 690483,
            expression: 'up{asset="44.37"}',
            type: 'expert',
            legend: '',
            buildIn: 0,
            seq: null
          },
          {
            id: 68528,
            chartId: 690483,
            expression: 'Hadoop_HBase_Healthy',
            type: 'expert',
            legend: '',
            buildIn: 0,
            seq: null
          }
        ],
        sync: null,
        panel: {
          id: 1243,
          name: 'test',
          createBy: null,
          type: null,
          link: null,
          pid: null,
          weight: null,
          buildIn: null,
          seq: null,
          children: null,
          parent: null,
          chartNum: null
        },
        group: {
          id: 0,
          name: null,
          panelId: null,
          groupId: null,
          span: null,
          height: null,
          updateBy: null,
          updateAt: null,
          type: null,
          unit: null,
          weight: null,
          param: null,
          pid: null,
          buildIn: null,
          remark: null,
          seq: null,
          x: null,
          y: null,
          elements: null,
          sync: null,
          panel: null,
          group: null,
          children: null,
          chartNums: null,
          asset: null,
          varType: null,
          varId: null,
          varName: null
        },
        children: [
          {
            id: 690502,
            name: '123',
            panelId: 1243,
            groupId: 690501,
            span: 12,
            height: 4,
            updateBy: 1,
            updateAt: '2021-11-10 09:51:15',
            type: 'line',
            unit: 2,
            weight: 3,
            param: {
              last: 0,
              legendValue: {
                total: 'off',
                min: 'off',
                avg: 'off',
                last: 'off',
                max: 'off'
              },
              threshold: '123',
              valueMapping: {
                mapping: [
                  {
                    color: {
                      bac: '#fff',
                      text: '#000'
                    },
                    text: '',
                    value: ''
                  }
                ],
                type: 'text'
              },
              url: '',
              nullType: 'null'
            },
            pid: null,
            buildIn: 0,
            remark: '',
            seq: null,
            x: 0,
            y: 0,
            w: 12,
            h: 4,
            i: 690489,
            elements: [
              {
                id: 68543,
                chartId: 690502,
                expression: '123',
                type: 'expert',
                legend: '',
                buildIn: 0,
                seq: null
              }
            ],
            sync: null,
            panel: {
              id: 1243,
              name: 'test',
              createBy: null,
              type: null,
              link: null,
              pid: null,
              weight: null,
              buildIn: null,
              seq: null,
              children: null,
              parent: null,
              chartNum: null
            },
            group: {
              id: 690501,
              name: '123',
              panelId: null,
              groupId: null,
              span: null,
              height: null,
              updateBy: null,
              updateAt: null,
              type: null,
              unit: null,
              weight: null,
              param: null,
              pid: null,
              buildIn: null,
              remark: null,
              seq: null,
              x: null,
              y: null,
              elements: null,
              sync: null,
              panel: null,
              group: null,
              children: null,
              chartNums: null,
              asset: null,
              varType: null,
              varId: null,
              varName: null
            },
            children: [

            ],
            chartNums: null,
            asset: null,
            varType: null,
            varId: null,
            varName: null
          }
        ],
        chartNums: null,
        asset: null,
        varType: null,
        varId: null,
        varName: null
      },
      {
        id: 690502,
        name: '324',
        panelId: 1243,
        groupId: 0,
        span: 6,
        height: 4,
        updateBy: 1,
        updateAt: '2021-11-10 09:51:06',
        type: 'hexagonFigure',
        unit: 2,
        weight: 2,
        dataSource: 4,
        param: '{' +
          '   "from":"module",' +
          '   "length":"48",' +
          '   "showTooltip": true ,' +
          '   "col":"8"' +
          '}',
        pid: null,
        buildIn: 0,
        remark: '123',
        seq: null,
        x: 6,
        y: 4,
        w: 6,
        h: 4,
        i: 690502,
        elements: [
          {
            id: 68527,
            chartId: 690483,
            expression: 'up{asset="44.37"}',
            type: 'expert',
            legend: '',
            buildIn: 0,
            seq: null
          },
          {
            id: 68528,
            chartId: 690483,
            expression: 'Hadoop_HBase_Healthy',
            type: 'expert',
            legend: '',
            buildIn: 0,
            seq: null
          }
        ],
        sync: null,
        panel: {
          id: 1243,
          name: 'test',
          createBy: null,
          type: null,
          link: null,
          pid: null,
          weight: null,
          buildIn: null,
          seq: null,
          children: null,
          parent: null,
          chartNum: null
        },
        group: {
          id: 0,
          name: null,
          panelId: null,
          groupId: null,
          span: null,
          height: null,
          updateBy: null,
          updateAt: null,
          type: null,
          unit: null,
          weight: null,
          param: null,
          pid: null,
          buildIn: null,
          remark: null,
          seq: null,
          x: null,
          y: null,
          elements: null,
          sync: null,
          panel: null,
          group: null,
          children: null,
          chartNums: null,
          asset: null,
          varType: null,
          varId: null,
          varName: null
        },
        children: [
          {
            id: 690502,
            name: '123',
            panelId: 1243,
            groupId: 690501,
            span: 12,
            height: 4,
            updateBy: 1,
            updateAt: '2021-11-10 09:51:15',
            type: 'line',
            unit: 2,
            weight: 3,
            param: {
              last: 0,
              legendValue: {
                total: 'off',
                min: 'off',
                avg: 'off',
                last: 'off',
                max: 'off'
              },
              threshold: '123',
              valueMapping: {
                mapping: [
                  {
                    color: {
                      bac: '#fff',
                      text: '#000'
                    },
                    text: '',
                    value: ''
                  }
                ],
                type: 'text'
              },
              url: '',
              nullType: 'null'
            },
            pid: null,
            buildIn: 0,
            remark: '',
            seq: null,
            x: 0,
            y: 0,
            w: 12,
            h: 4,
            i: 690489,
            elements: [
              {
                id: 68543,
                chartId: 690502,
                expression: '123',
                type: 'expert',
                legend: '',
                buildIn: 0,
                seq: null
              }
            ],
            sync: null,
            panel: {
              id: 1243,
              name: 'test',
              createBy: null,
              type: null,
              link: null,
              pid: null,
              weight: null,
              buildIn: null,
              seq: null,
              children: null,
              parent: null,
              chartNum: null
            },
            group: {
              id: 690501,
              name: '123',
              panelId: null,
              groupId: null,
              span: null,
              height: null,
              updateBy: null,
              updateAt: null,
              type: null,
              unit: null,
              weight: null,
              param: null,
              pid: null,
              buildIn: null,
              remark: null,
              seq: null,
              x: null,
              y: null,
              elements: null,
              sync: null,
              panel: null,
              group: null,
              children: null,
              chartNums: null,
              asset: null,
              varType: null,
              varId: null,
              varName: null
            },
            children: [

            ],
            chartNums: null,
            asset: null,
            varType: null,
            varId: null,
            varName: null
          }
        ],
        chartNums: null,
        asset: null,
        varType: null,
        varId: null,
        varName: null
      },
      {
        id: 690487,
        name: '123',
        panelId: 1243,
        groupId: 0,
        dataSource: 6,
        span: 12,
        height: 6,
        updateBy: 1,
        updateAt: '2021-11-10 07:06:09',
        type: 'url',
        unit: 2,
        weight: 0,
        param: '{' +
          '   "style":"area",' +
          '   "showHeader":false,' +
          '   "stack":true,' +
          '   "legend":{' +
          '        "placement":"bottom",' +
          '        "values":["min","max","avg","first","last","total"]' +
          '    },' +
          '    "thresholds":[{' +
          '        "color":"#eee",' +
          '        "val":"0.9"' +
          '    },{' +
          '        "color":"#aaa",' +
          '        "val":"1.1"' +
          '    }],' +
          '    "nullType":"zero",' +
          '    "url":"http://192.168.36.91"' +
          '}',
        pid: null,
        buildIn: 0,
        remark: 'url',
        seq: null,
        x: 8,
        y: 6,
        w: 6,
        h: 4,
        i: 690487,
        elements: [
          {
            id: 68527,
            chartId: 690487,
            // expression: 'up{asset="44.37"}',
            expression: 'label_replace(up{instance=~\'.*10090\',job=\'\'},"asset","$1","instance","(.*)")',
            type: 'expert',
            legend: '{{asset}}',
            buildIn: 0,
            seq: null
          },
          {
            id: 68528,
            chartId: 690487,
            expression: 'Hadoop_HBase_Healthy',
            type: 'expert',
            legend: '',
            buildIn: 0,
            seq: null
          }
        ],
        sync: null,
        panel: {
          id: 1243,
          name: 'test',
          createBy: null,
          type: null,
          link: null,
          pid: null,
          weight: null,
          buildIn: null,
          seq: null,
          children: null,
          parent: null,
          chartNum: null
        },
        group: {
          id: 0,
          name: null,
          panelId: null,
          groupId: null,
          span: null,
          height: null,
          updateBy: null,
          updateAt: null,
          type: null,
          unit: null,
          weight: null,
          param: null,
          pid: null,
          buildIn: null,
          remark: null,
          seq: null,
          x: null,
          y: null,
          elements: null,
          sync: null,
          panel: null,
          group: null,
          children: null,
          chartNums: null,
          asset: null,
          varType: null,
          varId: null,
          varName: null
        },
        children: [

        ],
        chartNums: null,
        asset: null,
        varType: null,
        varId: null,
        varName: null
      },
      {
        id: 690489,
        name: '123',
        panelId: 1243,
        groupId: 0,
        dataSource: 5,
        span: 12,
        height: 6,
        updateBy: 1,
        updateAt: '2021-11-10 07:06:09',
        type: 'text',
        unit: 2,
        weight: 0,
        param: '{' +
          '   "style":"area",' +
          '   "showHeader":false,' +
          '   "stack":true,' +
          '   "legend":{' +
          '        "placement":"bottom",' +
          '        "values":["min","max","avg","first","last","total"]' +
          '    },' +
          '    "thresholds":[{' +
          '        "color":"#eee",' +
          '        "val":"0.9"' +
          '    },{' +
          '        "color":"#aaa",' +
          '        "val":"1.1"' +
          '    }],' +
          '    "nullType":"zero",' +
          '    "text": "<div class=\\"editor-core ql-container ql-snow\\"><div class=\\"ql-editor\\"><p>ss</p></div></div>"' +
          '}',
        pid: null,
        buildIn: 0,
        remark: 'text',
        seq: null,
        x: 10,
        y: 8,
        w: 6,
        h: 4,
        i: 690489,
        elements: [
          {
            id: 68531,
            chartId: 690489,
            // expression: 'up{asset="44.37"}',
            expression: 'label_replace(up{instance=~\'.*10090\',job=\'\'},"asset","$1","instance","(.*)")',
            type: 'expert',
            legend: '{{asset}}',
            buildIn: 0,
            seq: null
          },
          {
            id: 68532,
            chartId: 690489,
            expression: 'Hadoop_HBase_Healthy',
            type: 'expert',
            legend: '',
            buildIn: 0,
            seq: null
          }
        ],
        sync: null,
        panel: {
          id: 1243,
          name: 'test',
          createBy: null,
          type: null,
          link: null,
          pid: null,
          weight: null,
          buildIn: null,
          seq: null,
          children: null,
          parent: null,
          chartNum: null
        },
        group: {
          id: 0,
          name: null,
          panelId: null,
          groupId: null,
          span: null,
          height: null,
          updateBy: null,
          updateAt: null,
          type: null,
          unit: null,
          weight: null,
          param: null,
          pid: null,
          buildIn: null,
          remark: null,
          seq: null,
          x: null,
          y: null,
          elements: null,
          sync: null,
          panel: null,
          group: null,
          children: null,
          chartNums: null,
          asset: null,
          varType: null,
          varId: null,
          varName: null
        },
        children: [

        ],
        chartNums: null,
        asset: null,
        varType: null,
        varId: null,
        varName: null
      }
    ]
  },
  time: '2021-11-10 09:51:27'
}
export default chartData
