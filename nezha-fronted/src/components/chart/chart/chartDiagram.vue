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
    <meta2dMain
      ref="diagram"
      v-if="iconArrayLoad"
      :showHeader="false"
      :meta2dId="chartInfo.id + '-' + isFullscreen"
      :topoData="chartInfo.param.topo"
      :querysArray="querysArray"
      :params="{ timeType: 5}"
      :timeRange="timeRange"
      :iconArray="iconArray"
      :isChart="true"
    />
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
      isChart: true,
      isPreview: {
        show: false,
        topoData: {},
        querysArray: {},
        currentProject: {},
        params: {}
      },
      timeRange: ['', '']
    }
  },
  created () {
    this.$get('/topology/icon').then(res => {
      this.iconArray = [...res.data.list]
      this.iconArrayLoad = true
    })
    const timeRange = this.$lodash.cloneDeep(this.filterTime)
    timeRange[0] = this.momentStrToTimestamp(timeRange[0])
    timeRange[1] = this.momentStrToTimestamp(timeRange[1])
    this.timeRange = timeRange
  },
  mounted () {
    bus.$on('showMeta2dPreview', (params) => {
      this.isPreview = params
    })
    this.reload()
  },
  methods: {
    resize () {
      this.$refs.diagram.resize()
    },
    refresh (timeRange) {
      console.log(timeRange)
      this.timeRange = timeRange
      this.reload(true)
    }
  },
  destroyed () {
    bus.$off('showMeta2dPreview')
    clearTopology()
  }
}
</script>
