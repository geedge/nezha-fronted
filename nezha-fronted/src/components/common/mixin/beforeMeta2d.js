export default {
  data () {
    return {
      topoData: {},
      querysArray: [],
      meta2dType: '',
      params: {},
      iconArray: []
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
      if (this.currentProject && this.currentProject.id) {
        this.$get('monitor/project/topo', { projectId: this.currentProject.id }).then(res => {
          if (res.data && res.data.topo) {
            this.topoData = res.data.topo || {}
            if (res.data.topo.topo) {
              this.topoData = res.data.topo.topo || {}
            }
            this.querysArray = res.data.topo.elements || []
            this.params = {
              timeType: res.data.topo.timeType || 5
            }
          } else {
            this.topoData = {}
            this.querysArray = []
            this.params = {
              timeType: 5
            }
          }
        })
      } else if (this.isChart) {
        const res = {
          data: this.chartInfo.param
        }
        if (res.data && res.data.topo) {
          this.topoData = res.data.topo || {}
          if (res.data.topo.topo) {
            this.topoData = res.data.topo.topo || {}
          }
          this.querysArray = res.data.topo.elements || []
          this.params = {
            timeType: res.data.topo.timeType || 5
          }
        } else {
          this.topoData = {}
          this.querysArray = []
          this.params = {
            timeType: 5
          }
        }
      }
    }
  }
}
