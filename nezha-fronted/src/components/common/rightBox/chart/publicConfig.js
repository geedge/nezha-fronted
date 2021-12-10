import chartDataFormat from '@/components/charts/chartDataFormat'
import { getUUID, resetZIndex } from '@/components/common/js/common'
import { randomcolor, ColorReverse } from '@/components/common/js/radomcolor/randomcolor'
import { isStat } from '@/components/chart/chart/tools'
const rz = {
  methods: {
    rz (e) {
      resetZIndex(e)
    }
  }
}
export default {
  props: {
    params: {}
  },
  data () {
    return {
      language: localStorage.getItem('nz-language'),
      chartConfig: {},
      expressions: [],
      expressionName: [],
      expressionsShow: [],
      spanList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      unitOptions: chartDataFormat.unitOptions(),
      nullTypeList: [{
        label: 'connected',
        value: 'connected'
      }, {
        label: 'null',
        value: 'null'
      }, {
        label: 'zero',
        value: 'zero'
      }],
      statisticsList: this.$CONSTANTS.statisticsList,
      legendPositionList: [
        {
          label: 'bottom',
          value: 'bottom'
        }, {
          label: 'left',
          value: 'left'
        }, {
          label: 'right',
          value: 'right'
        }
      ],
      mappingTypeList: [
        {
          label: 'Value',
          value: 'value'
        }, {
          label: 'Range',
          value: 'range'
        }, {
          label: 'Regx',
          value: 'regx'
        }
      ],
      letter: [
        'A', 'B', 'C', 'D', 'E', 'F', 'G',
        'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z'
      ],
      metricsChartTypeList: [
        {
          id: 'line',
          name: this.$t('dashboard.panel.chartForm.typeVal.line.label')
        },
        {
          id: 'area',
          name: this.$t('dashboard.panel.chartForm.typeVal.stackArea.label')
        },
        {
          id: 'point',
          name: this.$t('dashboard.panel.chartForm.typeVal.point.label')
        },
        {
          id: 'stat',
          name: this.$t('dashboard.panel.chartForm.typeVal.singleStat.label')
        },
        {
          id: 'bar',
          name: this.$t('dashboard.panel.chartForm.typeVal.bar.label')
        },
        {
          id: 'guage',
          name: this.$t('dashboard.panel.chartForm.typeVal.guage.label')
        },
        {
          id: 'treemap',
          name: this.$t('dashboard.panel.chartForm.typeVal.treemap.label')
        },
        {
          id: 'pie',
          name: this.$t('dashboard.panel.chartForm.typeVal.pie.label')
        },
        {
          id: 'table',
          name: this.$t('dashboard.panel.chartForm.typeVal.table.label')
        }

      ],
      logChartTypeList: [
        {
          id: 'line',
          name: this.$t('dashboard.panel.chartForm.typeVal.line.label')
        },
        {
          id: 'area',
          name: this.$t('dashboard.panel.chartForm.typeVal.stackArea.label')
        },
        {
          id: 'point',
          name: this.$t('dashboard.panel.chartForm.typeVal.point.label')
        },
        {
          id: 'stat',
          name: this.$t('dashboard.panel.chartForm.typeVal.singleStat.label')
        },
        {
          id: 'bar',
          name: this.$t('dashboard.panel.chartForm.typeVal.bar.label')
        },
        {
          id: 'guage',
          name: this.$t('dashboard.panel.chartForm.typeVal.guage.label')
        },
        {
          id: 'treemap',
          name: this.$t('dashboard.panel.chartForm.typeVal.treemap.label')
        },
        {
          id: 'pie',
          name: this.$t('dashboard.panel.chartForm.typeVal.pie.label')
        },
        {
          id: 'log',
          name: this.$t('dashboard.panel.chartForm.typeVal.log.label')
        },
        {
          id: 'table',
          name: this.$t('dashboard.panel.chartForm.typeVal.table.label')
        }

      ],
      textList: [
        {
          label: 'All',
          value: 'all'
        }, {
          label: 'Value',
          value: 'value'
        }, {
          label: 'Legend',
          value: 'legend'
        }, {
          label: 'None',
          value: 'none'
        }
      ]
    }
  },
  mixins: [rz],
  methods: {
    isStat,
    expressionChange: function () {
      if (this.expressions.length) {
        this.chartConfig.elements = []
        this.expressions.forEach((expr, i) => {
          this.chartConfig.elements.push({ id: this.expressionsShow[i].elementId, expression: expr, type: 'expert', legend: this.expressionsShow[i].legend, name: this.expressionName[i] })
        })
      } else {
        this.chartConfig.elements = []
      }
      this.change()
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
      this.$refs.chartForm.clearValidate('elements.' + (index - 1) + '.expression')
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
    transformNumToLetter (num) { // 相当于26进制 获取id
      const self = this
      let letter = ''
      const loopNum = parseInt(num / 26)
      if (loopNum > 0) {
        letter += this.transformNumToLetter(loopNum - 1)
      }
      letter += self.letter[num % 26]
      return letter
    },
    addExpression (item) {
      if (!item) {
        this.expressions.push('')
        const expressionName = this.getExpressionName()
        this.expressionName.push(expressionName)
        this.expressionsShow.push({
          show: true,
          hideInput: true,
          oldName: expressionName,
          error: '',
          legend: '',
          elementId: ''
        })
        this.expressionChange()
      } else {
        this.expressions.push(item.expression)
        this.expressionName.push(item.name)
        this.expressionsShow.push(
          {
            show: true,
            hideInput: true,
            oldName: item.name,
            error: '',
            elementId: item.id,
            legend: item.legend
          }
        )
      }
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
    removeExpression (index) {
      if (this.expressionsShow.length > 1) {
        this.expressions.splice(index, 1)
        this.expressionName.splice(index, 1)
        this.expressionsShow.splice(index, 1)
        this.$nextTick(() => {
          this.expressions.forEach((ex, index) => {
            if (ex) {
              this.$refs[`promql-${index}`][0].metricChange(ex)
            }
          })
        })
        this.expressionChange()
      }
    },
    copyExpression (index) {
      this.expressions.push(this.expressions[index])
      const expressionName = this.getExpressionName()
      this.expressionName.push(expressionName)
      this.expressionsShow.push(
        {
          ...this.expressionsShow[index],
          show: true,
          hideInput: true,
          oldName: this.expressionName[index],
          error: ''
        }
      )
      this.$nextTick(() => {
        this.expressions.forEach((ex, index) => {
          if (ex) {
            this.$refs[`promql-${index}`][0].metricChange(ex)
          }
        })
      })
      this.expressionChange()
    },
    showExpression (index) {
      this.expressionsShow[index - 1].show = !this.expressionsShow[index - 1].show
      this.$set(this.expressionsShow, index - 1, this.expressionsShow[index - 1])
      this.$refs.chartForm.clearValidate('elements.' + (index - 1) + '.expression')
    },
    unitSelected: function (value) {
      // this.chartConfig.unit=value[value.length-1];
      this.change()
    },
    addMapping () {
      const bacColor = randomcolor()
      this.chartConfig.param.valueMapping.mapping.push({
        type: 'value',
        show: true,
        value: undefined,
        display: '',
        color: {
          bac: bacColor + 'FF',
          text: ColorReverse(bacColor) + 'FF'
        }
      })
      this.change()
    },
    copyMapping (index) {
      this.chartConfig.param.valueMapping.mapping.push({ ...this.chartConfig.param.valueMapping.mapping[index] })
      this.change()
    },
    removeMapping (index) {
      this.chartConfig.param.valueMapping.mapping.splice(index, 1)
      this.change()
    },
    showMapping (index) {
      this.chartConfig.param.valueMapping.mapping[index].show = !this.chartConfig.param.valueMapping.mapping[index].show
    },
    mappingItemChange (index, type) {
      const mapping = this.chartConfig.param.valueMapping.mapping[index]
      if (mapping.type === 'value') {
        this.chartConfig.param.valueMapping.mapping[index] = {
          ...mapping,
          value: undefined
        }
      }
      this.$refs.chartForm.clearValidate('param.valueMapping.mapping.' + index + 'value')
      if (mapping.type === 'range') {
        this.chartConfig.param.valueMapping.mapping[index] = {
          ...mapping,
          from: undefined,
          to: undefined
        }
        this.$refs.chartForm.clearValidate('param.valueMapping.mapping.' + index + 'from')
        this.$refs.chartForm.clearValidate('param.valueMapping.mapping.' + index + 'to')
      }
      if (mapping.type === 'regx') {
        this.chartConfig.param.valueMapping.mapping[index] = {
          ...mapping,
          regx: ''
        }
        this.$refs.chartForm.clearValidate('param.valueMapping.mapping.' + index + 'regx')
      }
      this.$set(this.chartConfig.param.valueMapping.mapping, index, this.chartConfig.param.valueMapping.mapping[index])
      this.change()
    },
    colorChange (val, key, index) {
      if (key === 'thresholds') {
        this.chartConfig.param.thresholds[index].color = val
      }
      if (key === 'bac') {
        this.chartConfig.param.valueMapping.mapping[index].color.bac = val
        this.$set(this.chartConfig.param.valueMapping.mapping, index, this.chartConfig.param.valueMapping.mapping[index])
      }
      if (key === 'text') {
        this.chartConfig.param.valueMapping.mapping[index].color.text = val
        this.$set(this.chartConfig.param.valueMapping.mapping, index, this.chartConfig.param.valueMapping.mapping[index])
      }
      this.change()
    },
    change () {
      this.$nextTick(() => {
        this.$emit('change', this.chartConfig)
      })
    },
    addColumns () {
      this.chartConfig.param.columns.push({
        title: '',
        show: true,
        unit: 2,
        display: ''
      })
      this.change()
    },
    copyColumns (index) {
      this.chartConfig.param.columns.push({ ...this.chartConfig.param.columns[index] })
      this.change()
    },
    removeColumns (index) {
      this.chartConfig.param.columns.splice(index, 1)
      this.change()
    },
    showColumns (index) {
      this.chartConfig.param.columns[index].show = !this.chartConfig.param.columns[index].show
    },
    tagsChange (newTags) {
      // this.chartConfig.param.indexs = newTags.map(item => item.text)
    }
  }
}
