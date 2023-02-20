import { getTopology, setTopology, dealImg, topologyImg } from '@/components/common/js/common'
import bus from '@/libs/bus'
import axios from 'axios'
export default {
  methods: {
    topoResize (id) {
      getTopology(id).resize()
    },
    initEdit (id) {
      getTopology(id).lock(0)
      getTopology(id).stopAnimate(getTopology(id).data.pens)
      console.log(getTopology(id).data.pens)
      if (getTopology(id).data.pens) {
        getTopology(id).data.pens.forEach(item => {
          this.calcNode(item)
        })
      }
      getTopology(id).render()
      getTopology(id).centerView()
    },
    calcNode (node) { // 处理节点数据
      node = { ...node, ...node.data.params }
      getTopology(this.meta2dId)._setValue(node)
    },
    getQueryValues (elements, startTime, endTime) {
      this.meta2dLoading = true
      return new Promise(resolve => {
        const step = bus.getStep(startTime, endTime)
        endTime = parseInt(endTime / 1000)
        startTime = parseInt(startTime / 1000)
        const urlPre = '/prom'
        console.log(endTime, startTime)
        elements = elements.filter(item => item.state && item.expression)
        const requests = elements.map((element) => {
          // query_range
          let query = `${urlPre}/api/v1/query_range?start=${startTime}&end=${endTime}&step=${step}`
          query += `&nullType=${'null'}`
          if (element.filter) {
            query += `&filter=${element.filter}`
          }
          query += `&query=${encodeURIComponent(element.expression)}`
          return this.$get(query)
        })
        axios.all(requests).then((res) => {
          console.log(res)
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
                  name: this.handleLegendAlias(legend, elements[index].legend, r.metric),
                  values: r.values
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
    handleLegendAlias (legend, aliasExpression, params) {
      const self = this
      const myParams = JSON.parse(JSON.stringify(params))
      myParams.$labels = JSON.parse(JSON.stringify(params))
      myParams.$value = myParams.value
      if (/\{\{.+\}\}/.test(aliasExpression)) {
        const labelValue = aliasExpression.replace(/(\{\{.+?\}\})/g, function (i) {
          const label = i.substr(i.indexOf('{{') + 2, i.indexOf('}}') - i.indexOf('{{') - 2)
          if (!legend) {
            return label
          }
          let value = null
          if (params && self.$loadsh.get(myParams, label)) {
            value = self.$loadsh.get(myParams, label)
          }
          if (label) {
            const reg = new RegExp(label + '=".+?"', 'g')
            if (reg.test(legend)) {
              const ans = legend.match(reg)
              let find = ''
              ans.forEach(item => {
                const index = legend.indexOf(item)
                if (legend[index - 1] !== '_') {
                  find = item
                }
              })
              value = find.substr(find.indexOf('"') + 1, find.lastIndexOf('"') - find.indexOf('"') - 1)
            }
          }
          return value || ''
        })
        return labelValue
      } else {
        if (!aliasExpression) {
          return legend
          // let result =legend.substr(legend.indexOf('"') + 1,legend.lastIndexOf('"') - legend.indexOf('"') - 1);
          // return result
        }
        return aliasExpression
      }
    }
  }
}
