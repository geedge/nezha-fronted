import chartDataFormat from '@/components/chart/chartDataFormat'
import { getUUID, resetZIndex } from '@/components/common/js/common'
import { randomcolor, ColorReverse } from '@/components/common/js/radomcolor/randomcolor'
import { isStat } from '@/components/chart/chart/tools'
import lodash from 'lodash'
import iconList from '@/components/common/js/iconList'
const rz = {
  methods: {
    rz (e) {
      resetZIndex(e)
    }
  }
}
export default {
  props: {
    params: {},
    variables: {
      type: Array,
      default: () => {
        return []
      }
    },
    from: { type: String }
  },
  mixins: [rz],
  data () {
    return {
      // language: localStorage.getItem('nz-language'),
      chartConfig: {},
      expressions: [],
      expressionName: [],
      expressionsShow: [],
      spanList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      unitOptions: chartDataFormat.unitOptions(),
      nullTypeList: [{
        label: this.$t('chart.connected'),
        value: 'connected'
      }, {
        label: this.$t('chart.null'),
        value: 'null'
      }, {
        label: this.$t('chart.zero'),
        value: 'zero'
      }],
      statisticsList: this.$CONSTANTS.statisticsList,
      operatorList: [
        {
          label: 'equal',
          value: 'equal'
        }, {
          label: 'not equal',
          value: 'notEqual'
        }, {
          label: 'match',
          value: 'match'
        }, {
          label: 'contains',
          value: 'contains'
        }
      ],
      legendPositionList: [
        {
          label: this.$t('overall.bottom'),
          value: 'bottom'
        }, {
          label: this.$t('overall.left'),
          value: 'left'
        }, {
          label: this.$t('overall.right'),
          value: 'right'
        }
      ],
      mappingTypeList: [
        {
          label: this.$t('overall.value'),
          value: 'value'
        }, {
          label: this.$t('dashboard.dashboard.chartForm.valMapping.range'),
          value: 'range'
        }, {
          label: this.$t('dashboard.dashboard.chartForm.valMapping.regx'),
          value: 'regx'
        }
      ],
      mappingIconList: iconList, // 获取icon列表
      letter: [
        'A', 'B', 'C', 'D', 'E', 'F', 'G',
        'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z'
      ],
      metricsChartTypeList: [
        {
          id: 'line',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.line.label')
        },
        {
          id: 'area',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.stackArea.label')
        },
        {
          id: 'point',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.point.label')
        },
        {
          id: 'stat',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.singleStat.label')
        },
        {
          id: 'hexagon',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.hexagonFigure.label')
        },
        {
          id: 'bar',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.bar.label')
        },
        {
          id: 'pie',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.pie.label')
        },
        {
          id: 'doughnut',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.doughnut.label')
        },
        {
          id: 'rose',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.rose.label')
        },
        {
          id: 'bubble',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.bubble.label')
        },
        {
          id: 'funnel',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.funnel.label')
        },
        {
          id: 'rank',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.rank.label')
        },
        {
          id: 'sankey',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.sankey.label')
        },
        {
          id: 'gauge',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.gauge.label')
        },
        {
          id: 'treemap',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.treemap.label')
        },
        {
          id: 'table',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.table.label')
        }

      ],
      logChartTypeList: [
        {
          id: 'line',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.line.label')
        },
        {
          id: 'area',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.stackArea.label')
        },
        {
          id: 'point',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.point.label')
        },
        {
          id: 'stat',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.singleStat.label')
        },
        {
          id: 'hexagon',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.hexagonFigure.label')
        },
        {
          id: 'bar',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.bar.label')
        },
        {
          id: 'pie',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.pie.label')
        },
        {
          id: 'doughnut',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.doughnut.label')
        },
        {
          id: 'rose',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.rose.label')
        },
        {
          id: 'bubble',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.bubble.label')
        },
        {
          id: 'funnel',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.funnel.label')
        },
        {
          id: 'rank',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.rank.label')
        },
        {
          id: 'sankey',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.sankey.label')
        },
        {
          id: 'gauge',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.gauge.label')
        },
        {
          id: 'treemap',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.treemap.label')
        },
        {
          id: 'log',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.log.label')
        },
        {
          id: 'table',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.table.label')
        }
      ],
      textList: [
        {
          label: this.$t('overall.exportAll'),
          value: 'all'
        }, {
          label: this.$t('overall.value'),
          value: 'value'
        }, {
          label: this.$t('dashboard.dashboard.chartForm.legend'),
          value: 'legend'
        }, {
          label: this.$t('project.topology.none'),
          value: 'none'
        }
      ],
      timeType: [
        {
          value: 'local',
          label: this.$t('dashboard.dashboard.chartForm.typeVal.local')
        },
        {
          value: 'server',
          label: this.$t('dashboard.dashboard.chartForm.typeVal.server')
        }
      ],
      timeSeriesTypeList: [
        {
          id: 'line',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.line.label')
        },
        {
          id: 'area',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.stackArea.label')
        },
        {
          id: 'point',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.point.label')
        }
      ],
      sparklineTypeList: [
        {
          id: 'line',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.line.label')
        },
        {
          id: 'area',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.stackArea.label')
        },
        {
          id: 'none',
          name: this.$t('project.topology.none')
        }
      ],
      comparisonTypeList: [
        {
          id: 'none',
          name: this.$t('project.topology.none')
        },
        {
          id: 'hour',
          name: this.$t('dashboard.chartForm.comparison.hour')
        },
        {
          id: 'day',
          name: this.$t('dashboard.chartForm.comparison.day')
        },
        {
          id: 'week',
          name: this.$t('dashboard.chartForm.comparison.week')
        },
        {
          id: 'month',
          name: this.$t('dashboard.chartForm.comparison.month')
        }
      ]
    }
  },
  methods: {
    isStat,
    init () {
      // 重置相关属性
      this.expressions = []
      this.expressionsShow = []
      this.expressionName = []
      console.log(this.promqlKeys.length)
      if (!this.promqlKeys.length) {
        this.addExpression()
      } else {
        // 根据orderNum排序
        this.promqlKeys = this.promqlKeys.sort((a, b) => a.orderNum - b.orderNum)
        this.promqlKeys.forEach(item => {
          this.addExpression(item)
        })
        this.expressionChange()
      }
    },
    expressionChange: function (index) {
      if (this.expressions.length) {
        this.promqlKeys = []
        this.expressions.forEach((expr, i) => {
          if (this.expressionsShow[i]) {
            this.promqlKeys.push({
              elementId: this.expressionsShow[i].elementId,
              id: this.expressionsShow[i].id,
              expression: expr,
              type: 'expert',
              legend: this.expressionsShow[i].legend,
              name: this.expressionName[i],
              state: this.expressionsShow[i].state,
              orderNum: i,
              step: this.expressionsShow[i].step,
              queryType: this.expressionsShow[i].queryType
            })
          }
        })
      } else {
        this.promqlKeys = []
      }
    },
    queryTypeChange (index) {
      this.expressionsShow[index].step = undefined
      this.expressionChange()
    },
    switchExpression (index, flag) {
      if (flag === 1) {
        this.$set(this.expressionsShow[index], 'state', 0)
      } else {
        this.$set(this.expressionsShow[index], 'state', 1)
      }
      this.expressionChange()
    },
    expressionNameChange (index) {
      if (this.expressionsShow[index].error) {
        this.expressionName[index] = this.expressionsShow[index].oldName
        this.expressionsShow[index].error = ''
      } else if (!this.expressionName[index]) {
        this.expressionName[index] = this.expressionsShow[index].oldName
      } else {
        this.expressionsShow[index].oldName = this.expressionName[index]
      }
      this.expressionChange()
    },
    expressionNameInput (val, index) {
      const findIndex = this.expressionName.indexOf(val)
      const lastIndex = this.expressionName.lastIndexOf(val)
      if (findIndex !== -1 && lastIndex != -1 && lastIndex !== findIndex) {
        this.expressionsShow[index].error = this.$t('error.nameDuplicate')
      } else if (!val) {
        this.expressionsShow[index].error = this.$t('validate.required')
      } else {
        this.expressionsShow[index].error = ''
      }
    },
    showInput (index, flag) {
      this.expressionsShow[index].hideInput = flag
    },
    transformNumToLetter (num) { // 相当于26进制 获取idaddExpression
      const self = this
      let letter = ''
      const loopNum = parseInt(num / 26)
      if (loopNum > 0) {
        letter += this.transformNumToLetter(loopNum - 1)
      }
      letter += self.letter[num % 26]
      return letter
    },
    getExpressionName () {
      let name = ''
      for (let i = 0; i <= this.expressionName.length; i++) {
        name = this.transformNumToLetter(i)
        if (this.expressionName.indexOf(name) === -1) { // 判断当前id是否存在 必须走了break 返回的id才是对的
          break
        }
      }
      return name
    },
    addExpression (item) {
      if (!item) {
        this.expressions.push('')
        const expressionName = this.getExpressionName()
        console.log(expressionName)
        this.expressionName.push(expressionName)
        this.expressionsShow.push({
          id: getUUID(),
          show: true,
          hideInput: true,
          oldName: expressionName,
          name: expressionName,
          error: '',
          legend: '',
          elementId: '',
          state: 1,
          step: undefined,
          queryType: 1
        })
        this.expressionChange()
      } else {
        this.expressions.push(item.expression)
        this.expressionName.push(item.name)
        this.expressionsShow.push({
          id: getUUID(),
          show: true,
          hideInput: true,
          oldName: item.name,
          error: '',
          elementId: item.id,
          legend: item.legend,
          state: item.state,
          step: item.step,
          queryType: item.queryType
        })
      }
    },
    copyExpression (index) {
      this.expressions.push(this.expressions[index])
      const expressionName = this.getExpressionName()
      this.expressionName.push(expressionName)
      this.expressionsShow.push(
        {
          ...this.expressionsShow[index],
          id: getUUID(),
          show: true,
          hideInput: true,
          oldName: expressionName,
          error: '',
          elementId: ''
        }
      )
      this.expressionChange()
    },
    removeExpression (index) {
      if (this.expressionsShow.length > 1) {
        this.expressions.splice(index, 1)
        this.expressionName.splice(index, 1)
        this.expressionsShow.splice(index, 1)
        this.expressionChange()
      }
    },
    showExpression (index) {
      this.expressionsShow[index - 1].show = !this.expressionsShow[index - 1].show
      this.$set(this.expressionsShow, index - 1, this.expressionsShow[index - 1])
    },
    showHistoryBox (index) {
      console.log(this.$refs['promql-' + (index)])
      const historyshow = this.$refs['promql-' + (index)][0]?.historyshow
      this.$refs['promql-' + (index)][0]?.showHistoryBox(!historyshow)
    }
  }
}
