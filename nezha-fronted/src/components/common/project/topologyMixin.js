import { getTopology } from '@/components/common/js/common'

export default {
  methods: {
    pensActive (pens) {
      console.log(pens)
      if (!pens.length) return
      this.props = {
        line: null,
        multi: false,
        expand: this.props.expand,
        nodes: null,
        locked: pens[0].locked,
        pen: pens[0],
        pens: null
      }
    },
    topTranslate () {
      this.moduleId = ''
      this.showNodeTools('')
      this.popDataShowUpdate('', false)
      if (!this.editTopologyFlag) {
        getTopology(this.topologyIndex)
      }
      this.getNodesArr()
    }
  }
}
