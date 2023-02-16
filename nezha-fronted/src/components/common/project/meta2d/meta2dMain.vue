<template>
  <div class="meta2d-box">
    <meta2dHeader :meta2dId="meta2dId" :isChart="isChart" :projectName="projectName" @edit="editFlag = true"/>
    <div class="meta2d-main" :class="isChart ? 'meta2d-chart': 'meta2d-project'">
      <div :id="meta2dId" style="height: 100%;width: 100%"></div>
    </div>
    <meta2dProps ref="meta2dProps" :selectPens.sync="selectPens" :querysArray="querysArray" :timeType="timeType" @updatePens="updatePens" v-if="editFlag"/>
  </div>
</template>

<script>
import meta2dHeader from '@/components/common/project/meta2d/meta2dHeader'
import meta2dProps from '@/components/common/project/meta2d/meta2dProps'
import meta2dMain from '@/components/common/project/meta2d/js/meta2dMain'
import { getTopology, setTopology } from '@/components/common/js/common'
export default {
  name: 'meta2dMain',
  mixins: [meta2dMain],
  props: {
    meta2dId: {}, // 唯一id 不可重复
    topoData: {}, // topo图数据
    isChart: {
      type: Boolean,
      default: false
    },
    querysArray: {},
    timeType: {},
    projectName: {}
  },
  components: {
    meta2dHeader,
    meta2dProps
  },
  watch: {
    topoData: {
      immediate: true,
      handler () {
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {

  },
  beforeDestroy () {
    getTopology(this.meta2dId).destroy()
    setTopology(this.meta2dId, null)
  }

}
</script>

<style scoped lang="scss">

</style>
