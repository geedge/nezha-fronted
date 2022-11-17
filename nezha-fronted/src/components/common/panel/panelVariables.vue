<template>
  <div style="" class="panel-variables-box">
    <div v-for="(item,index) in labelArr" :key="index" v-if="item.show" class="panel-variables-content" style="display: flex">
      <div class="variable-key" :title="item.name">{{item.name}}</div>
      <el-popover
        trigger="manual"
        placement="bottom-start"
        v-model="item.visible"
        v-clickoutside="close"
        popper-class="no-style-class ping-popover panel-variables"
      >
        <ul class="pop-list-wrap">
          <li class="el-dropdown-menu__item" v-if="item.allOption">
            <el-checkbox :indeterminate="item.isIndeterminate" v-model="item.checkAll" @change="(value)=>{checkAllChange(item)}">{{$t('overall.all')}}</el-checkbox>
          </li>
          <ul class="pop-list">
            <el-checkbox-group v-model="item.checked" @change="(value)=>{checkedChange(item,value)}" v-if="item.multi">
              <li class="el-dropdown-menu__item" v-for="value in labelValue[item.name]" :key="value.value" :title="value.value">
                <el-checkbox :label="value.value" >{{value.label}}</el-checkbox>
              </li>
            </el-checkbox-group>
            <div v-else>
              <li class="el-dropdown-menu__item" v-for="(value, j) in labelValue[item.name]" :key="j" @click="selectLabelValue(item,value)" :title="value.value">
                <div class="el-dropdown-menu__item-label" :class="value.value === item.checked[0] && !item.checkAll ? 'checked': ''">
                  {{value.label}}
                </div>
              </li>
            </div>
          </ul>
        </ul>
        <div slot="reference" class="choose-box"  @click="triggerVisible(item)">
          <div class="no-select" :class="item.visible? 'is-select': ''">
            <div class="choose-box-content" :title="item.checked.map(value=> labelValue[item.name].find(labelObj=>labelObj.value === value).label).join(' + ')">
              {{item.checked.map(value=> labelValue[item.name].find(labelObj=>labelObj.value === value).label).join(' + ')}}
            </div>
            <i class="nz-icon nz-icon-arrow-down6" style="cursor:pointer"/>
          </div>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script>
export default {
  name: 'panelVariables',
  props: {
    labelArrs: {
      type: Array,
      default: () => {
        return []
      }
    },
    timeRange: Array
  },

  data () {
    return {
      timer: null,
      labelValue: {},
      labelArr: [],
      specialKey: [
        { name: 'label_names', reg: /^label_names\(\)\s*$/ },
        { name: 'label_values', reg: /^label_values\((?:(.+),\s*)?([a-zA-Z_][a-zA-Z0-9_]*)\)\s*$/ },
        { name: 'metrics', reg: /^metrics\((.+)\)\s*$/ },
        { name: 'query_result', reg: /^query_result\((.+)\)\s*$/ }
      ]
    }
  },
  watch: {
    labelArrs: {
      handler (n) {
        this.labelArr = this.labelArrs.map(item => {
          return {
            ...item,
            checked: [],
            checkAll: false,
            visible: false,
            isIndeterminate: false
          }
        })
        this.getLabelData()
      }
    }
  },
  methods: {
    getLabelData () { // 获取所有变量组合的可选择的值
      const isRegExp = (v) => {
        let isReg
        try {
          isReg = eval(v) instanceof RegExp
        } catch (e) {
          isReg = false
        }
        return isReg
      }
      const arrPromise = []
      this.labelValue = {}
      this.labelArr.forEach((item, index) => { // 根据变量的type类型 以及 expression 对应的值 查询不同的接口
        this.labelValue[item.name] = []
        if (item.type === 'custom') {
          arrPromise.push('')
          const arr = item.customOptions.split(',')
          arr.forEach(key => {
            key = key.trim()
            const arr1 = key.split(':')
            if (arr1.length > 1) {
              this.labelValue[item.name].push({
                label: arr1[0],
                value: arr1.splice(1, arr1.length - 1).join(':')
              })
            } else if (arr1.length === 1) {
              this.labelValue[item.name].push({
                label: arr1[0],
                value: arr1[0]
              })
            }
          })
        } else if (item.type === 'query') {
          let match = item.expression.match(this.specialKey[0].reg)
          if (match) {
            arrPromise.push(this.labelNamesQuery())
            return
          }
          match = item.expression.match(this.specialKey[1].reg)
          if (match) {
            if (match[1]) {
              arrPromise.push(this.labelValuesQuery(match[2], match[1]))
              return
            } else {
              arrPromise.push(this.labelValuesQuery(match[2]))
              return
            }
          }
          match = item.expression.match(this.specialKey[2].reg)
          if (match) {
            arrPromise.push(this.metricNameQuery(match[1]))
            return
          }
          match = item.expression.match(this.specialKey[3].reg)
          if (match) {
            arrPromise.push(this.queryResultQuery(match[1]))
            return
          }
          arrPromise.push(this.metricNameAndLabelsQuery(item.expression))
        }
      })
      Promise.all(arrPromise).then((res) => {
        res.forEach((response, index) => {
          if (response) {
            if (this.labelArr[index].regex) {
              const reg = isRegExp(this.labelArr[index].regex) ? eval(this.labelArr[index].regex) : new RegExp(this.labelArr[index].regex, 'g')
              let arr = []
              response.forEach(label => {
                if (reg.test(label.label)) {
                  const str = label.label.match(reg)
                  if (str.groups) {
                    arr.push({
                      label: str.groups.text,
                      value: str.groups.value || str.groups.text
                    })
                  } else {
                    arr.push({
                      label: label.label,
                      value: label.label
                    })
                  }
                }
              })
              arr = this.$loadsh.uniqBy(arr, 'value')
              // arr = this.$loadsh.uniqBy(arr, 'label')
              arr.filter(item => item.value)
              response = arr
            }
            this.labelValue[this.labelArr[index].name] = response.filter(item => item.value)
          }
        })
        this.setLabelArrDefault()
      })
    },
    labelNamesQuery () {
      const params = {
        start: this.momentStrToTimestamp(this.timeRange[0]) / 1000,
        end: this.momentStrToTimestamp(this.timeRange[1]) / 1000
      }

      const url = '/prom/api/v1/labels'
      return new Promise(resolve => {
        this.$get(url, params).then(res => {
          if (res.status === 'error') {
            resolve([])
            return
          }
          let arr = res.data.map(item => {
            return {
              value: item,
              label: item
            }
          })
          arr = this.$loadsh.uniqBy(arr, 'value')
          arr.filter(item => item.value)
          resolve(arr)
        })
      })
    },
    labelValuesQuery (label, metric) {
      const start = this.momentStrToTimestamp(this.timeRange[0])
      const end = this.momentStrToTimestamp(this.timeRange[1])
      let url = ''
      if (!metric) {
        const params = {
          start: start / 1000,
          end: end / 1000
        }
        // return label values globally
        url = `/prom/api/v1/label/${label}/values`
        return new Promise(resolve => {
          this.$get(url, params).then(res => {
            if (res.status === 'error') {
              resolve([])
              return
            }
            let arr = res.data.map(item => {
              return {
                value: item,
                label: item
              }
            })
            arr = this.$loadsh.uniqBy(arr, 'value')
            arr = arr.filter(item => item.value)
            resolve(arr)
          })
        })
      } else {
        const params = {
          'match[]': metric,
          start: start / 1000,
          end: end / 1000
        }
        url = '/prom/api/v1/series'
        return new Promise(resolve => {
          this.$get(url, params).then(res => {
            if (res.status === 'error') {
              resolve([])
              return
            }
            let arr = res.data.map(item => {
              return {
                value: item[label],
                label: item[label]
              }
            })
            arr = this.$loadsh.uniqBy(arr, 'value')
            arr.filter(item => item.value)
            resolve(arr)
          })
        })
      }
    },
    metricNameQuery (metricFilterPattern) {
      const start = this.momentStrToTimestamp(this.timeRange[0])
      const end = this.momentStrToTimestamp(this.timeRange[1])
      const params = {
        start: start / 1000,
        end: end / 1000
      }
      const url = '/prom/api/v1/label/__name__/values'
      return new Promise(resolve => {
        this.$get(url, params).then(res => {
          if (res.status === 'error') {
            resolve([])
            return
          }
          let arr = res.data
          arr = arr.filter((metricName) => {
            const r = new RegExp(metricFilterPattern)
            return r.test(metricName)
          })
          arr = arr.map((matchedMetricName) => {
            return {
              value: matchedMetricName,
              label: matchedMetricName,
              expandable: true
            }
          })
          resolve(arr)
        })
      })
    },
    queryResultQuery (query) {
      const end = this.momentStrToTimestamp(this.timeRange[1]) / 1000
      const url = '/prom/api/v1/query'
      return new Promise(resolve => {
        const params = {
          end,
          query: encodeURIComponent(query)
        }
        this.$get(url, params).then(res => {
          if (res.status === 'error') {
            resolve([])
            return
          }
          const arr = res.data.result.map((metricData) => {
            let text = metricData.metric.__name__ || ''
            delete metricData.metric.__name__
            text += '{'
            const arr = []
            Object.keys(metricData.metric).forEach(key => {
              arr.push(key + '="' + metricData.metric[key] + '"')
            })
            text += arr.join(',')
            text += '}'
            text += ' ' + metricData.value[1] + ' ' + metricData.value[0] * 1000
            return {
              label: text,
              value: text,
              expandable: true
            }
          })
          resolve(arr)
        })
      })
    },
    metricNameAndLabelsQuery (query) {
      const start = this.momentStrToTimestamp(this.timeRange[0])
      const end = this.momentStrToTimestamp(this.timeRange[1])
      const params = {
        'match[]': query,
        start: start / 1000,
        end: end / 1000
      }
      const url = '/prom/api/v1/series'
      return new Promise(resolve => {
        this.$get(url, params).then(res => {
          if (res.status === 'error') {
            resolve([])
            return
          }
          const arr = res.data.map(metric => {
            return {
              label: this.getOriginalMetricName(metric),
              value: this.getOriginalMetricName(metric),
              expandable: true
            }
          })
          resolve(arr)
        })
      })
    },
    getOriginalMetricName (labelData) {
      const metricName = labelData.__name__ || ''
      delete labelData.__name__
      const labelPart = Object.entries(labelData)
        .map((label) => `${label[0]}="${label[1]}"`)
        .join(',')
      return `${metricName}{${labelPart}}`
    },
    setLabelArrDefault () { // 设置变量默认值 默认第一个
      this.labelArr.forEach((item, index) => {
        item.checked = this.labelValue[item.name][0] ? [this.labelValue[item.name][0].value] : []
      })
      this.$emit('getPanelData') // 同步加载chart 拿不到使用的变量值
      this.$store.dispatch('dispatchVariablesArr', this.labelArr) // 通过vuex 管理变量值
    },
    checkAllChange (item) {
      const allValue = this.labelValue[item.name].map(value => {
        return value.value
      })
      item.checked = item.checkAll ? allValue : []
      item.isIndeterminate = false
      if (!item.multi) {
        this.close()
        this.$store.dispatch('dispatchVariablesArr', [...this.labelArr])
      }
    },
    checkedChange (item, value) {
      const checkedCount = value.length
      item.checkAll = checkedCount === this.labelValue[item.name].length
      item.isIndeterminate = checkedCount > 0 && checkedCount < this.labelValue[item.name].length
    },
    selectLabelValue (item, value) {
      item.checked = [value.value]
      this.close()
      this.$store.dispatch('dispatchVariablesArr', [...this.labelArr])
    },
    triggerVisible (item) {
      this.$nextTick(() => {
        item.visible = !item.visible
      })
    },
    close () {
      let flag = false
      this.labelArr.forEach((item) => {
        if (item.visible && item.multi) {
          flag = true
        }
        item.visible = false
      })
      if (flag) {
        const oldVariables = this.$store.state.panel.variablesArr
        // 如果新旧值相等 则不执行
        if (JSON.stringify(oldVariables) !== JSON.stringify(this.labelArr)) {
          this.$store.dispatch('dispatchVariablesArr', [...this.labelArr])
        }
      }
    }

  },
  beforeDestroy () {
    this.$store.dispatch('dispatchVariablesArr', [])
  }
}
</script>

<style scoped>

</style>
