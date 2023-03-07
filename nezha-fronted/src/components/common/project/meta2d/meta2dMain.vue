<template>
  <div class="meta2d-box list-page" :class="editFlag ? 'topology-dialog' : ''" v-my-loading="meta2dLoading" ref="meta2dBox">
    <meta2dHeader
      ref="header"
      :meta2dId="meta2dId"
      :isChart="isChart"
      :project="project"
      :editFlag="editFlag"
      @edit="beforeEdit"
      @exitEdit="exitEdit"
      @reload="reload"
    />
    <div class="meta2d-main" :class="isChart ? 'meta2d-chart': 'meta2d-project'" @contextmenu="onContextMenu($event)">
      <div :id="meta2dId" style="height: 100%;width: 100%"></div>
    </div>
    <meta2dProps
      v-if="editFlag && !isPreview"
      ref="meta2dProps"
      :selectPens.sync="selectPens"
      :querysArray="querysArray"
      :params="params"
      :meta2dId="meta2dId"
      @updatePens="updatePens"
    />
    <div class="context-menu" v-if="contextmenu.left && editFlag && !isPreview" :style="this.contextmenu">
      <CanvasContextMenu :meta2dId="meta2dId" :selectPens.sync="selectPens"></CanvasContextMenu>
    </div>
    <div
      v-show="position.show && (!editFlag || isPreview )"
      @mouseleave="tooltipOut"
      @mouseenter="tooltipOver"
      style="position: absolute"
      :style="{
        top: position.top + 'px',
        left: position.left + 'px',
      }"
    >
      <meta2dTooltip
        ref="meta2dTooltip"
        :params="chartParams"
      />
    </div>
  </div>
</template>

<script>
import meta2dHeader from '@/components/common/project/meta2d/meta2dHeader'
import meta2dProps from '@/components/common/project/meta2d/meta2dProps'
import meta2dMain from '@/components/common/project/meta2d/js/meta2dMain'
import meta2dTooltip from '@/components/common/project/meta2d/meta2dTooltip'
import CanvasContextMenu from '@/components/common/project/meta2d/CanvasContextMenu'
import { getTopology, setTopology } from '@/components/common/js/common'
import topoUtil from '@/components/common/project/meta2d/js/topoUtil'
import bus from '@/libs/bus'
export default {
  name: 'meta2dMain',
  mixins: [meta2dMain, topoUtil],
  props: {
    meta2dId: {}, // 唯一id 不可重复
    topoData: {}, // topo图数据
    isChart: {
      type: Boolean,
      default: false
    },
    querysArray: {},
    params: {},
    project: {}
  },
  computed: {
    isPreview () {
      return this.$refs.header && this.$refs.header.isPreview
    }
  },
  components: {
    meta2dHeader,
    meta2dProps,
    meta2dTooltip,
    CanvasContextMenu
  },
  watch: {
    topoData: {
      immediate: true,
      handler () {
        this.reload()
      }
    }
  },
  mounted () {
    this.init()
    bus.$on('changeSelectPens', this.pensActive)
    this.$refs.meta2dBox.addEventListener('mousemove', this.mousemove)
    // this.$refs.meta2dBox.addEventListener('mousedown', this.mousedown)
    this.$refs.meta2dBox.addEventListener('mouseup', this.mouseup)
    window.addEventListener('click', this.contextmenuNone)
  },
  methods: {
    mousemove (e) {
      window.ePosition = e
    },
    mouseup () {
      setTimeout(() => {
        this.setContextmenu = true
      }, 100)
    }
  },
  beforeDestroy () {
    getTopology(this.meta2dId).destroy()
    setTopology(this.meta2dId, null)
    bus.$off('changeSelectPens', this.pensActive)
    this.$refs.meta2dBox.removeEventListener('mousemove', this.mousemove)
    this.$refs.meta2dBox.removeEventListener('mouseup', this.mouseup)
  }

}
</script>

<style scoped lang="scss">

</style>
