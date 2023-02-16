import { getTopology, setTopology, dealImg, topologyImg } from '@/components/common/js/common'
export default {
  methods: {
    topoResize (id) {
      getTopology(id).resize()
    },
    initEdit (id) {
      console.log(getTopology(id))
      getTopology(id).lock(0)
      getTopology(id).centerView()
      getTopology(id).stopAnimate(getTopology(id).data.pens)
    }
  }
}
