import chartDataFormat from '@/components/chart/chartDataFormat'
import { getUUID, resetZIndex } from '@/components/common/js/common'
import { randomcolor, ColorReverse } from '@/components/common/js/radomcolor/randomcolor'
import { isStat } from '@/components/chart/chart/tools'
import lodash from 'lodash'
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
    }
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
      mappingIconList: [
        {
          value: undefined
        }, {
          value: 'nz-icon nz-icon-Router'
        }, {
          value: 'nz-icon nz-icon-Computer'
        }, {
          value: 'nz-icon nz-icon-a-Networkdevices'
        }, {
          value: 'nz-icon nz-icon-Other'
        }, {
          value: 'nz-icon nz-icon-a-Virtualmachine'
        }, {
          value: 'nz-icon nz-icon-Switch'
        }, {
          value: 'nz-icon nz-icon-Server'
        }, {
          value: 'nz-icon nz-icon-ADC'
        }, {
          value: 'nz-icon nz-icon-Firewall'
        }, {
          value: 'nz-icon nz-icon-guide'
        }, {
          value: 'nz-icon nz-icon-Silence'
        }, {
          value: 'nz-icon nz-icon-fast-silence'
        }, {
          value: 'nz-icon nz-icon-mute'
        }, {
          value: 'nz-icon nz-icon-overview-alert'
        }, {
          value: 'nz-icon nz-icon-overview-endpoint'
        }, {
          value: 'nz-icon nz-icon-Alertrule'
        }, {
          value: 'nz-icon nz-icon-import-success1'
        }, {
          value: 'nz-icon nz-icon-import-failed1'
        }, {
          value: 'nz-icon nz-icon-stop'
        }, {
          value: 'nz-icon nz-icon-failed'
        }, {
          value: 'nz-icon nz-icon-unknown-error'
        }, {
          value: 'nz-icon nz-icon-role1'
        }, {
          value: 'nz-icon nz-icon-Cabinet1'
        }, {
          value: 'nz-icon nz-icon-user1'
        }, {
          value: 'nz-icon nz-icon-Datacenter2'
        }, {
          value: 'nz-icon nz-icon-overview-project'
        }, {
          value: 'nz-icon nz-icon-project'
        }, {
          value: 'nz-icon nz-icon-overview-module'
        }, {
          value: 'el-icon-share'
        }, {
          value: 'el-icon-d-caret'
        }, {
          value: 'el-icon-caret-left'
        }, {
          value: 'el-icon-caret-right'
        }, {
          value: 'el-icon-caret-bottom'
        }, {
          value: 'el-icon-caret-top'
        }, {
          value: 'el-icon-bottom-left'
        }, {
          value: 'el-icon-bottom-right'
        }, {
          value: 'el-icon-back'
        }, {
          value: 'el-icon-right'
        }, {
          value: 'el-icon-bottom'
        }, {
          value: 'el-icon-top'
        }, {
          value: 'el-icon-top-left'
        }, {
          value: 'el-icon-top-right'
        }, {
          value: 'el-icon-arrow-left'
        }, {
          value: 'el-icon-arrow-right'
        }, {
          value: 'el-icon-arrow-down'
        }, {
          value: 'el-icon-arrow-up'
        }, {
          value: 'el-icon-d-arrow-left'
        }, {
          value: 'el-icon-d-arrow-right'
        }, {
          value: 'el-icon-video-pause'
        }, {
          value: 'el-icon-video-play'
        }, {
          value: 'el-icon-refresh'
        }, {
          value: 'el-icon-refresh-right'
        }, {
          value: 'el-icon-refresh-left'
        }, {
          value: 'el-icon-finished'
        }, {
          value: 'el-icon-sort'
        }, {
          value: 'el-icon-sort-up'
        }, {
          value: 'el-icon-sort-down'
        }, {
          value: 'el-icon-rank'
        }, {
          value: 'nz-icon nz-icon-zhengfangxing'
        }, {
          value: 'nz-icon nz-icon-zhixian'
        }, {
          value: 'nz-icon nz-icon-sanjiaoxing'
        }, {
          value: 'nz-icon nz-icon-xingxing'
        }, {
          value: 'nz-icon nz-icon-duobianxing'
        }, {
          value: 'nz-icon nz-icon-circle'
        }
      ], // 获取icon列表
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
  mixins: [rz],
  methods: {
    isStat,
    // icon点击
    iconActive (item, subItem, index) {
      if (item.icon === subItem.value) {
        this.chartConfig.param.valueMapping[index].icon = undefined
        this.$set(this.chartConfig.param.valueMapping, index, this.chartConfig.param.valueMapping[index])
      } else {
        this.chartConfig.param.valueMapping[index].icon = subItem.value
        this.$set(this.chartConfig.param.valueMapping, index, this.chartConfig.param.valueMapping[index])
      }
      this.change()
    },
    expressionChange: function () {
      if (this.expressions.length) {
        this.chartConfig.elements = []
        this.expressions.forEach((expr, i) => {
          if (this.expressionsShow[i]) {
            this.chartConfig.elements.push({
              id: this.expressionsShow[i].elementId,
              expression: expr,
              type: 'expert',
              legend: this.expressionsShow[i].legend,
              name: this.expressionName[i],
              state: this.expressionsShow[i].state,
              orderNum: i
            })
          }
        })
      } else {
        this.chartConfig.elements = []
      }
      this.change()
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
        this.chartConfig.param.rightYAxis && this.chartConfig.param.rightYAxis.elementNames.forEach((item, index) => {
          if (item == this.expressionsShow[index].oldName) {
            this.chartConfig.param.rightYAxis.elementNames[index] = this.expressionName[index]
          }
        })
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
        this.expressionName.push(expressionName)
        this.expressionsShow.push({
          show: true,
          hideInput: true,
          oldName: expressionName,
          error: '',
          legend: '',
          elementId: '',
          state: 1
        })
        this.expressionChange()
      } else {
        this.expressions.push(item.expression)
        this.expressionName.push(item.name)
        this.expressionsShow.push({
          show: true,
          hideInput: true,
          oldName: item.name,
          error: '',
          elementId: item.id,
          legend: item.legend,
          state: item.state
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
        this.chartConfig.param.rightYAxis && this.chartConfig.param.rightYAxis.elementNames.forEach((elementName, subIndex) => {
          if (elementName == this.expressionName[index]) {
            this.chartConfig.param.rightYAxis.elementNames.splice(subIndex, 1)
          }
        })

        this.expressions.splice(index, 1)
        this.expressionName.splice(index, 1)
        this.expressionsShow.splice(index, 1)
        this.chartConfig.elements.forEach((item, index) => {
          this.$refs.chartForm.validateField('elements.' + index + '.expression')
        })
        this.expressionChange()
      }
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
      const obj = {
        type: 'value',
        show: true,
        value: undefined,
        display: '',
        color: {
          bac: bacColor + 'FF',
          text: ColorReverse(bacColor) + 'FF',
          icon: randomcolor() + 'FF'
        },
        uid: getUUID()
      }
      if (this.chartConfig.type === 'table') {
        obj.column = ''
      }
      this.chartConfig.param.valueMapping.push(obj)
      this.change()
    },
    copyMapping (index) {
      const temp = lodash.cloneDeep(this.chartConfig.param.valueMapping[index])
      temp.uid = getUUID()
      this.chartConfig.param.valueMapping.push(temp)
      this.change()
    },
    removeMapping (index) {
      this.chartConfig.param.valueMapping.splice(index, 1)
      this.change()
    },
    showMapping (index) {
      this.chartConfig.param.valueMapping[index].show = !this.chartConfig.param.valueMapping[index].show
      this.change()
    },
    mappingItemChange (index, type) {
      const mapping = this.chartConfig.param.valueMapping[index]
      if (mapping.type === 'value') {
        this.chartConfig.param.valueMapping[index] = {
          ...mapping,
          value: undefined
        }
      }
      this.$refs.chartForm.clearValidate('param.valueMapping.' + index + 'value')
      if (mapping.type === 'range') {
        this.chartConfig.param.valueMapping[index] = {
          ...mapping,
          from: undefined,
          to: undefined
        }
        this.$refs.chartForm.clearValidate('param.valueMapping.' + index + 'from')
        this.$refs.chartForm.clearValidate('param.valueMapping.' + index + 'to')
      }
      if (mapping.type === 'regx') {
        this.chartConfig.param.valueMapping[index] = {
          ...mapping,
          regx: ''
        }
        this.$refs.chartForm.clearValidate('param.valueMapping.' + index + 'regx')
      }
      this.$set(this.chartConfig.param.valueMapping, index, this.chartConfig.param.valueMapping[index])
      this.change()
    },
    colorChange (val, key, index) {
      if (key === 'thresholds') {
        this.chartConfig.param.thresholds[index].color = val
      }
      if (key === 'bac') {
        this.chartConfig.param.valueMapping[index].color.bac = val
        this.$set(this.chartConfig.param.valueMapping, index, this.chartConfig.param.valueMapping[index])
      }
      if (key === 'text') {
        this.chartConfig.param.valueMapping[index].color.text = val
        this.$set(this.chartConfig.param.valueMapping, index, this.chartConfig.param.valueMapping[index])
      }
      if (key === 'icon') {
        this.chartConfig.param.valueMapping[index].color.icon = val
        this.$set(this.chartConfig.param.valueMapping, index, this.chartConfig.param.valueMapping[index])
      }
      this.change()
    },
    change (key, index) {
      this.$nextTick(() => {
        if (key) {
          this.hideError(key, index)
        }
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
      this.change()
    },
    tagsChange (newTags) {
      this.chartConfig.param.tags = newTags
      this.chartConfig.param.indexs = newTags.map(item => item.text).join(',')
      this.change()
    },
    enableChange (type) {
      switch (type) {
        case 'valueMapping':
          break
        case 'legend':
          break
        case '':
          break
      }
      this.change()
    },
    showError () {
      this.$refs.chartForm.validate((blooen, object) => {
        Object.keys(object).forEach(item => {
          const keyArr = item.split('.')
          if (keyArr.length >= 4) {
            this.chartConfig[keyArr[0]][keyArr[1]][keyArr[2]].error = true
          }
        })
        if (!blooen) {
          this.$forceUpdate()
        }
      })
    },
    hideError (key, index) {
      if (!this.chartConfig.param[key] || !this.chartConfig.param[key].length) {
        return
      }
      this.chartConfig.param[key][index].error = false
      this.$forceUpdate()
    }
  },
  watch: {
    params: {
      deep: true,
      handler (n) {
        this.chartConfig.param.showHeader = n.param.showHeader
      }
    }
  }
}
