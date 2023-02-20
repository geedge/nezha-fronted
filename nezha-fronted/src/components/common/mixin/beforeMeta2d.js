export default {
  data () {
    return {
      topoData: {},
      querysArray: [],
      meta2dType: '',
      timeType: 1
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
            this.timeType = res.data.topo.timeType || 1
          } else {
            this.topoData = {}
            this.querysArray = []
            this.timeType = 1
          }
        })
      }
    }
  }
}
