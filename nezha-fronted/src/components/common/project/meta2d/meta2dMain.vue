<template>
  <div class="meta2d-box">
    <meta2dHeader :meta2dId="meta2dId" :isChart="isChart" :projectName="projectName" @edit="editFlag = true"/>
    <div class="meta2d-main" :class="isChart ? 'meta2d-chart': 'meta2d-project'">
      <div :id="meta2dId" style="height: 100%;width: 100%"></div>
    </div>
    <meta2dProps ref="meta2dProps" :selectPens.sync="selectPens" :querysArray="querysArray" @updatePens="updatePens" v-if="editFlag"/>
  </div>
</template>

<script>
import meta2dHeader from '@/components/common/project/meta2d/meta2dHeader'
import meta2dProps from '@/components/common/project/meta2d/meta2dProps'
import meta2dMain from '@/components/common/project/meta2d/js/meta2dMain'
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

  }

}
</script>

<style scoped lang="scss">
  .meta2d-box{
    width: 100%;
    height: 100%;
    position: relative;
  }
  .meta2d-main{
    width: 100%;
    height: 100%;
  }
  .meta2d-chart{

  }
  .meta2d-project{
    height: calc(100% - 78px);
    border: 1px solid;
    border-color: #999999;
  }
</style>
