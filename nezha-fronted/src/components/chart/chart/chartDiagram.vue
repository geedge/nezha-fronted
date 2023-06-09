<template>
  <div class="chart-diagram" v-if="chartInfo.loaded">
<!--    <diagram-->
<!--      style="height: 100%;width: 100%"-->
<!--      :topoData="chartInfo.param.topo"-->
<!--      :fromChart="true"-->
<!--      :isScreen="isFullscreen"-->
<!--      :topologyIndexF="isFullscreen ? (chartInfo.id + '-' + 'isFullscreen') : chartInfo.id"-->
<!--      :isPanel="true"-->
<!--      ref="diagram"-->
<!--      :chartInfo="chartInfo" />-->
    <meta2dMain :meta2dId="chartInfo.id + '-' + isFullscreen" :topoData="chartInfo.param.topo" :querysArray="querysArray" :params="{ timeType: 5}" :iconArray="iconArray" :isChart="true"/>
  </div>
</template>

<script>
import beforeMeta2d from '@/components/common/mixin/beforeMeta2d'
import meta2dMain from '@/components/common/project/meta2d/meta2dMain'
import { clearTopology } from '@/components/common/js/common'
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import bus from '@/libs/bus'
export default {
  name: 'chart-diagram',
  mixins: [chartMixin, chartFormat, beforeMeta2d],
  components: {
    meta2dMain
  },
  data () {
    return {
      isPreview: {
        show: false,
        topoData: {},
        querysArray: {},
        currentProject: {},
        params: {}
      }
    }
  },
  mounted () {
    bus.$on('showMeta2dPreview', (params) => {
      this.isPreview = params
    })
    this.$get('/topology/icon').then(res => {
      this.iconArray = [...res.data.list]
    })
    this.reload()
  },
  methods: {
    resize () {
      this.$refs.diagram.winResize()
    }
  },
  destroyed () {
    bus.$off('showMeta2dPreview')
    clearTopology()
  }
}
</script>
