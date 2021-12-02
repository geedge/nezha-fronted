import chartDataFormat from '@/components/charts/chartDataFormat'
import { getUUID, resetZIndex } from '@/components/common/js/common'
const rz = {
  methods: {
    rz (e) {
      resetZIndex(e)
    }
  }
}
export default {
  data () {
    return {
      language: localStorage.getItem('nz-language'),
      chartConfig: {},
      promqlCount: 0,
      promqlKeys: [],
      elementIds: [],
      expressions: [],
      expressionName: [],
      expressionsShow: [],
      spanList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      legends: [],
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
          id: 'stackArea',
          name: this.$t('dashboard.panel.chartForm.typeVal.stackArea.label')
        },
        {
          id: 'point',
          name: this.$t('dashboard.panel.chartForm.typeVal.point.label')
        },
        {
          id: 'singleStat',
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
          id: 'stackArea',
          name: this.$t('dashboard.panel.chartForm.typeVal.stackArea.label')
        },
        {
          id: 'point',
          name: this.$t('dashboard.panel.chartForm.typeVal.point.label')
        },
        {
          id: 'singleStat',
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

      ]
    }
  },
  mixins: [rz],
  methods: {
    expressionChange: function () {
      if (this.expressions.length) {
        this.chartConfig.elements = []
        this.expressions.forEach((expr, i) => {
          this.chartConfig.elements.push({ id: this.elementIds[i], expression: expr, type: 'expert', legend: this.legends[i], name: this.expressionName[i] })
        })
      } else {
        this.chartConfig.elements = []
      }
      this.change()
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
        this.legends.push('')
        this.promqlKeys.push(getUUID())
        this.elementIds.push('')
        this.expressionsShow.push(true)
        this.promqlCount++
        this.expressionChange()
      } else {
        this.expressions.push(item.expression)
        this.legends.push(item.legend)
        this.promqlKeys.push(getUUID())
        this.expressionName.push(item.name)
        this.elementIds.push(item.id)
        this.expressionsShow.push(true)
        this.promqlCount++
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
      if (this.promqlCount > 1) {
        this.expressions.splice(index, 1)
        this.legends.splice(index, 1)
        this.promqlKeys.splice(index, 1)
        this.expressionName.splice(index, 1)
        this.expressionsShow.splice(index, 1)
        this.elementIds.splice(index, 1)
        this.promqlCount--
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
      this.legends.push(this.legends[index])
      this.promqlKeys.push(getUUID())
      const expressionName = this.getExpressionName()
      this.expressionName.push(expressionName)
      this.elementIds.push('')
      this.expressionsShow.push(true)
      this.promqlCount++
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
      this.$set(this.expressionsShow, index - 1, !this.expressionsShow[index - 1])
    },
    unitSelected: function (value) {
      // this.chartConfig.unit=value[value.length-1];
      this.change()
    },
    addMapping () {
      this.chartConfig.param.valueMapping.mapping.push({
        type: 'value',
        show: true,
        value: '',
        display: '',
        color: {
          bac: '#FFFFFFFF',
          text: '#000000FF'
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
          value: ''
        }
      }
      if (mapping.type === 'range') {
        this.chartConfig.param.valueMapping.mapping[index] = {
          ...mapping,
          from: '',
          to: ''
        }
      }
      if (mapping.type === 'regx') {
        this.chartConfig.param.valueMapping.mapping[index] = {
          ...mapping,
          regx: ''
        }
      }
      this.$set(this.chartConfig.param.valueMapping.mapping, index, this.chartConfig.param.valueMapping.mapping[index])
      this.change()
    },
    colorChange (val, key, index) {
      console.log(val, key, index)
      if (key === 'thresholds') {
        this.chartConfig.param.thresholds[index].color = val
      }
      if (key === 'bac') {
        console.log(this.chartConfig.param.valueMapping.mapping, this.chartConfig.param.valueMapping.mapping[0], this.chartConfig.param.valueMapping.mapping[index])
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
