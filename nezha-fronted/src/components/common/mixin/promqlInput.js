export default {
  data () {
    return {
      metricOptions: [],
      showTemp: true,
      metricArr: [
        { expr: 'rate' },
        { expr: 'count_over_time' },
        { expr: 'bytes_rate' },
        { expr: 'bytes_over_time' },
        { expr: 'absent_over_time' },
        { expr: 'duration_seconds' },
        { expr: 'bytes' },
        { expr: 'rate_counter' },
        { expr: 'sum_over_time' },
        { expr: 'avg_over_time' },
        { expr: 'max_over_time' },
        { expr: 'min_over_time' },
        { expr: 'first_over_time' },
        { expr: 'last_over_time' },
        { expr: 'stdvar_over_time' },
        { expr: 'stddev_over_time' },
        { expr: 'quantile_over_time' },
        { expr: 'absent_over_time' },
        { expr: 'sum' },
        { expr: 'avg' },
        { expr: 'min' },
        { expr: 'max' },
        { expr: 'stddev' },
        { expr: 'stdvar' },
        { expr: 'count' },
        { expr: 'topk' },
        { expr: 'bottomk' },
        { expr: 'sort' },
        { expr: 'sort_desc' },
        { expr: 'vector' }
      ]

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
    },
    validateMetric (text) {
      const flag = this.metricArr.some(item => {
        const regex = new RegExp(`${item.expr}\\(.*\\)`)
        return regex.test(text)
      })
      return flag
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
