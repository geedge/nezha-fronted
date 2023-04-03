<template>
  <div class="chart-diagram" v-if="chartInfo.loaded">
    <diagram
      style="height: 100%;width: 100%"
      :topoData="chartInfo.param.topo"
      :fromChart="true"
      :isScreen="isFullscreen"
      :topologyIndexF="isFullscreen ? (chartInfo.id + '-' + 'isFullscreen') : chartInfo.id"
      :isPanel="true"
      ref="diagram"
      :chartInfo="chartInfo" />
  </div>
</template>

<script>
import diagram from '@/components/common/ChartDiagram/diagram'
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
export default {
  name: 'chart-diagram',
  mixins: [chartMixin, chartFormat],
  components: {
    diagram
  },
  methods: {
    resize () {
      this.$refs.diagram.winResize()
    }
  }
}
</script>
