import nzAlertTag from '@/components/page/alert/nzAlertTag'
export default {
  components: {
    nzAlertTag
  },
  data () {
    return {
      exclusiveLabels: ['_id', 'severity', '__name__', 'rule'],
      filterArr: ['alertname', 'severity_id', 'severity', 'rule_type', 'rule_id', 'rule_name']
    }
  },
  computed: {
    tagType () {
      return (key) => {
        if (key == 'asset' || key == 'module' || key == 'project' || key == 'dc' || key == 'endpoint') {
          return 'normal'
        } else {
          return 'info'
        }
      }
    },
    tagValue () {
      return (key, value) => {
        if (key == 'type') {
          if (value == 1) {
            value = this.$t('project.project.projectName')
          } else if (value == 2) {
            value = this.$t('module.module.module')
          } else if (value == 3) {
            value = this.$t('asset.asset')
          }
        }
        return key + '：' + value
      }
    }
  },
  methods: {
    labelsSort (obj) {
      const buildIn = ['asset', 'endpoint', 'module', 'cpu', 'datacenter', 'project', 'parent_asset', 'user']
      if (typeof obj === 'string') obj = JSON.parse(obj)
      const labels = JSON.parse(JSON.stringify(obj))
      const result = []
      for (const key of this.exclusiveLabels) {
        Object.keys(labels).forEach(labelsKey => {
          if (labelsKey.indexOf(key) !== -1) {
            delete labels[labelsKey]
          }
        })
      }
      for (const key of buildIn) {
        if (key in labels) {
          if (key === 'datacenter') {
            result.push({ label: 'dc', value: labels.datacenter })
            delete labels.datacenter
          } else {
            result.push({ label: key, value: labels[key] })
          }
          delete labels[key]
        }
      }
      Object.keys(labels).sort().forEach(key => {
        result.push({ label: key, value: labels[key] })
        delete labels[key]
      })
      return result
    }
  }
}
