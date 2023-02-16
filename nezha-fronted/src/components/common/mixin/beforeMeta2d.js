export default {
  data () {
    return {
      topoData: {},
      querysArray: {},
      meta2dType: '',
      timeType: 1,
    }
  },
  mounted () {
    if (this.meta2dType === 'project') {
      setTimeout(() => {
        const res = {
          topo: {},
          elements: [],
          timeType: 4
        }
        this.topoData = res.topo
        this.querysArray = res.elements
      })
    } else {
      setTimeout(() => {
        const res = {
          topo: {},
          elements: [],
          timeType: 4
        }
        this.topoData = res.topo
        this.querysArray = res.elements
        this.timeType = res.timeType || 1
      })
    }
  }
}
