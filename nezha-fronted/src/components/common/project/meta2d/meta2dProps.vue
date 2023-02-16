<template>
  <div class="props-box props">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="elements" name="elements" v-if="selectPens.length === 1">
        <meta2dElement :selectPens.sync="selectPens" @change="change" :elements="elements"/>
      </el-tab-pane>
      <el-tab-pane label="canvas" name="canvas">
        <meta2dCanvas />
      </el-tab-pane>
      <el-tab-pane label="data" name="data">
        <meta2dData :querysArray="querysArray"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import meta2dElement from '@/components/common/project/meta2d/meta2dElement'
import meta2dCanvas from '@/components/common/project/meta2d/meta2dCanvas'
import meta2dData from '@/components/common/project/meta2d/meta2dData'
export default {
  name: 'meta2dProps',
  props: {
    selectPens: {},
    querysArray: {}
  },
  components: {
    meta2dElement,
    meta2dCanvas,
    meta2dData
  },
  watch: {
    selectPens (n) {
      console.log(n)
      if (n.length === 1) {
        this.activeName = 'elements'
      }
    }
  },
  data () {
    return {
      activeName: 'canvas',
      elements: {
        backGround: true,
        border: true,
        position: true,
        text: true,
        valueMapping: true,
        tooltip: true,
        line: true,
        lineAnimate: true
      }
    }
  },
  methods: {
    change (key) {
      this.$emit('updatePens', this.selectPens[0], key)
    }
  }
}
</script>

<style scoped lang="scss">
  .props-box {
    width: 500px;
    position: absolute;
    height: calc(100% - 78px);
    top: 61px;
    padding: 0 !important;
    box-sizing: border-box;
    right: 0;
  }
</style>
