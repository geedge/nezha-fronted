<template>
  <div class="meta2d-box list-page" v-my-loading="meta2dLoading">
    <meta2dHeader :meta2dId="meta2dId" :isChart="isChart" :project="project" :editFlag="editFlag" @edit="editFlag = true" @exitEdit="exitEdit"/>
    <div class="meta2d-main" :class="isChart ? 'meta2d-chart': 'meta2d-project'">
      <div :id="meta2dId" style="height: 100%;width: 100%"></div>
    </div>
    <meta2dProps
      v-if="editFlag"
      ref="meta2dProps"
      :selectPens.sync="selectPens"
      :querysArray="querysArray"
      :params="params"
      :meta2dId="meta2dId"
      @updatePens="updatePens"
    />
  </div>
</template>

<script>
import meta2dHeader from '@/components/common/project/meta2d/meta2dHeader'
import meta2dProps from '@/components/common/project/meta2d/meta2dProps'
import meta2dMain from '@/components/common/project/meta2d/js/meta2dMain'
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
  components: {
    meta2dHeader,
    meta2dProps
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
  },
  methods: {

  },
  beforeDestroy () {
    getTopology(this.meta2dId).destroy()
    setTopology(this.meta2dId, null)
    bus.$off('changeSelectPens', this.pensActive)
  }

}
</script>

<style scoped lang="scss">

</style>
