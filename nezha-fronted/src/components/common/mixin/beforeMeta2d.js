export default {
  data () {
    return {
      topoData: {},
      querysArray: [],
      meta2dType: '',
      params: {}
    }
  },
  watch: {
    currentProject: {
      handler (n) {
        this.reload()
      }
    },
    chart: {}
  },
  methods: {
    reload () {
      if (this.currentProject.id) {
        this.$get('monitor/project/topo', { projectId: this.currentProject.id }).then(res => {
          if (res.data && res.data.topo) {
            this.topoData = res.data.topo.topo || {}
            this.querysArray = res.data.topo.elements || []
            this.params = {
              timeType: res.data.topo.timeType || 1,
              unit: res.data.topo.unit || 1,
              statistic: res.data.topo.statistic || 'last',
            }
          } else {
            this.topoData = {}
            this.querysArray = []
            this.params = {
              timeType: 1,
              unit: 1,
              statistic: 'last'
            }
          }
        })
      }
    }
  }
}
