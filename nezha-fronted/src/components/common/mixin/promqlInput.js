export default {
  data () {
    return {
      metricOptions: [],
      showTemp: true
    }
  },
  methods: {
    queryMetrics () {
      this.metricOptions = []
      const metricsList = []
      this.$get('prom/api/v1/label/__name__/values').then(response => {
        if (response.status == 'success') {
          const metrics = response.data.sort()
          const metricMap = new Map()
          metrics.forEach((item) => {
            let key = ''
            if (/^[a-zA-Z0-9]+?_[a-zA-Z0-9]*/.test(item)) {
              key = item.split('_')[0]
            } else if (/^_\w*/.test(item)) {
              key = '      '
            } else {
              key = item
            }
            if (metricMap.get(key)) {
              const values = metricMap.get(key)
              values.push({ label: item, value: item })
            } else {
              const values = [{ label: item, value: item }]
              metricMap.set(key, values)
            }
            // this.metricStore.push({label:item,value:item,insertText:item})
          })
          for (const key of metricMap.keys()) {
            const option = {
              label: key,
              value: key
            }
            if (metricMap.get(key) && metricMap.get(key).length > 1) {
              option.children = []
              this.metricOptions.push({ ...option })
              option.children = metricMap.get(key)
              metricsList.push(option)
            } else {
              this.metricOptions.push(option)
              metricsList.push(option)
            }
          }
          this.$store.commit('setMetricsList', metricsList)
          if (this.showTemp) {
            this.getExprTemp()
          }
        }
      })
    },
    getExprTemp () {
      this.$get('/expression/tmpl/gname').then(res => {
        this.loading = false
        if (res.code === 200) {
          res.data.list.forEach(item => {
            this.metricOptions.unshift({
              label: item,
              value: item,
              children: [],
              temp: true,
              child: false
            })
          })
        }
      })
    }
  },
  watch: {
  },
  created () {
    // this.queryMetrics()
  },
  beforeDestroy () {
    this.$store.commit('setMetricsList', [])
  }
}
