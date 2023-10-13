import { getTopology, setTopology, dealImg, topologyImg } from '@/components/common/js/common'
import bus from '@/libs/bus'
import axios from 'axios'
import { getMetricTypeValue } from '@/components/common/js/tools'
import chartDataFormat from '@/components/chart/chartDataFormat'
export default {
  methods: {
    topoResize (id) {
      getTopology(id).resize()
      getTopology(id).centerView()
    },
    initEdit (id) {
      const endTime = new Date().getTime()
      const startTime = endTime - 60 * getTopology(id).data().timeType * 1000
      const elements = getTopology(id).data().elements || []
      this.getQueryValues(elements, startTime, endTime)
      bus.$emit('changeSelectPens', [])
      getTopology(id).inactive()
      getTopology(id).lock(0)
      getTopology(id).stopAnimate()
      if (getTopology(id).data().pens) {
        getTopology(id).data().pens.forEach(item => {
          this.calcNode(item)
        })
      }
      getTopology(id).render()
    },
    calcNode (node) { // 处理节点数据
      node = { id: node.id, ...node.data.params }
      getTopology(this.meta2dId)._setValue(node)
    },
    getQueryValues (elements, startTime, endTime) {
      console.log(startTime, endTime)
      this.meta2dLoading = true
      return new Promise(resolve => {
        const step = bus.getStep(startTime, endTime)
        endTime = parseInt(endTime / 1000)
        startTime = parseInt(startTime / 1000)
        const urlPre = '/prom'
        elements = elements.filter(item => item.state && item.expression)
        const requests = elements.map((element) => {
          // query_range
          let queryStep = step
          if (element.step) {
            queryStep = element.step + 's'
          }
          let query = ''
          if (element.queryType === 2) {
            query = `${urlPre}/api/v1/query_instant?time=${endTime}`
          } else {
            query = `${urlPre}/api/v1/query_range?start=${startTime}&end=${endTime}&step=${queryStep}`
          }
          query += `&nullType=${'null'}`
          if (element.filter) {
            query += `&filter=${element.filter}`
          }
          query += `&query=${encodeURIComponent(element.expression)}`
          return this.$get(query)
        })
        axios.all(requests).then((res) => {
          const arr = []
          res.forEach((request, index) => {
            arr.push({
              type: 'title',
              name: elements[index].name
            })
            if (request.code === 200 && request.status === 'success') {
              request.data.result.forEach((r, rindex) => {
                let legend = ''
                if (!r.metric) {
                  r.metric = {}
                }
                if (r.metric.__name__) {
                  legend += `${r.metric.__name__}{`
                }
                const tagKeysArr = Object.keys(r.metric)
                tagKeysArr.forEach(tagKey => {
                  if (tagKey !== '__name__' && tagKey !== 'legend' && tagKey !== 'values' && tagKey !== '$value') {
                    legend += `${tagKey}="${r.metric[tagKey]}",`
                  }
                })
                if (legend.endsWith(',')) {
                  legend = legend.substr(0, legend.length - 1)
                }
                if (r.metric.__name__) {
                  legend += '}'
                }
                if (!legend && elements) {
                  legend = elements[index].expression
                }
                const obj = {
                  type: 'item',
                  id: rindex + elements[index].name + JSON.stringify(r.metric),
                  name: this.handleLegendAlias(legend, elements[index].legend, r.metric) || legend,
                  values: r.values,
                  metric: r.metric || {},
                  elements: elements[index],
                  parent: elements[index].name
                }
                arr.push(obj)
              })
            }
          })
          this.meta2dLoading = false
          this.$store.dispatch('dispatchSetQueryValues', arr)
          resolve(arr)
        })
      })
    },
    clacTopoData (data, queryValues) { // 主要处理 属性为原始属性 处理动画属性对原始属性的影响
      return new Promise(resolve => { // 处理加载数据
        if (!data) {
          data = {}
        }
        if (!data.pens) {
          data.pens = []
        }
        data.pens.forEach((pen, index) => {
          pen.isBottom = true
          if (!pen.nzName) {
            pen.nzName = ''
          }
          if (!pen.moduleId) {
            pen.moduleId = ''
          }
          if (pen.data && pen.data.moduleId) {
            pen.moduleId = pen.data.moduleId
            delete pen.data.moduleId
          }

          if (!isNaN(pen.imageId) && pen.imageId) {
            const imageInfo = this.iconArray.find(item => item.id === pen.imageId)
            if (imageInfo) {
              pen.image = `/topology/icon/0/${imageInfo.unit}/${imageInfo.name}`
            } else {
              pen.image = ''
            }
          }
          if (pen.icon) {
            pen.iconFamily = 'nz-icon'
          }
          if (!pen.nzName) {
            if (!pen.type) {
              this.nodeInit(pen, 'element-' + index)
            } else {
              this.lineInit(pen, 'element-' + index)
            }
          }
          if (pen.isNz) {
            if (pen.data.legend && pen.data.enable.valueMapping) {
              const findItem = queryValues.find(query => query.name === pen.data.legend && query.parent === pen.data.parent)
              if (findItem) {
                pen.data.value = getMetricTypeValue(findItem.values, findItem.elements.statistic || 'last')
                pen.data.showValue = chartDataFormat.getUnit(findItem.elements.unit).compute(pen.data.value, null, 2)
                this.selectMapping(pen)
              }
            }
            if (pen.data.source === 'legend' && pen.data.textParent && pen.data.textLegend) {
              const findItem = queryValues.find(query => query.name === pen.data.textLegend && query.parent === pen.data.textParent)
              if (findItem) {
                const value = getMetricTypeValue(findItem.values, findItem.elements.statistic || 'last')
                pen.data.textValue = chartDataFormat.getUnit(findItem.elements.unit).compute(value, null, 2)
                pen.text = pen.data.textValue
              }
            }
          } else {
            // 处理 le5le的数据
          }
        })
        resolve(data)
      })
    },
    selectMapping (pen) {
      let mapping = ''
      const show = pen.data.enable.valueMapping
      const valueMapping = pen.data.valueMapping
      const value = pen.data.value
      const showValue = pen.data.showValue
      if (show && valueMapping) {
        valueMapping.forEach(item => {
          if (item.type === 'value') {
            if (value == item.value) {
              mapping = item
            }
          }
          if (item.type === 'range') {
            if (value >= item.from && value < item.to) {
              mapping = item
            }
          }
          if (item.type === 'regx') {
            const reg = new RegExp(item.regx)
            if (reg.test(showValue)) {
              mapping = item
            } else if (reg.test(value)) {
              mapping = item
            }
          }
        })
        if (mapping) {
          this.drawPen(pen, mapping)
        }
      }
    },
    drawPen (pen, mapping) {
      if (!pen.type) {
        pen.background = mapping.color.bac
        pen.color = mapping.color.border
        pen.textColor = mapping.color.text
      } else {
        pen.animateColor = mapping.color.bac
        pen.borderColor = mapping.color.border
        pen.color = mapping.color.text
        if (pen.lineAnimateType) {
          pen.autoPlay = true
        }
      }
    }
  }
}
