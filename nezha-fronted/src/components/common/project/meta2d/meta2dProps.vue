<template>
  <div class="props-box props" @keypress.stop="" @keydown.stop="" @keyup.stop="">
    <el-tabs v-model="activeName" type="card"  :before-leave="beforeLeave">
      <el-tab-pane :label="$t('project.topology.element')" name="elements" v-if="selectPens.length === 1">
        <meta2dElement :selectPens.sync="selectPens" @change="change" :elements="elements"/>
      </el-tab-pane>
      <el-tab-pane :label="$t('project.topology.canvas')" name="canvas">
        <meta2dCanvas :canvasProps="canvasProps" :meta2dId='meta2dId' @changeActiveName="changeActiveName" ref ='meta2dCanvas'/>
      </el-tab-pane>
      <el-tab-pane :label="$t('project.topology.data')" name="data">
        <meta2dData :querysArray.sync="querysArray" :params.sync="params" ref="meta2dData"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import meta2dElement from '@/components/common/project/meta2d/meta2dElement'
import meta2dCanvas from '@/components/common/project/meta2d/meta2dCanvas'
import meta2dData from '@/components/common/project/meta2d/meta2dData'
import { getTopology, setTopology, dealImg, topologyImg } from '@/components/common/js/common'
import { fromRoute } from '@/components/common/js/constants'
import chartTempData from '@/components/chart/chartTempData'
import { isTimeSeries } from '@/components/chart/chart/tools'
import bus from '@/libs/bus'
import axios from 'axios'
import topoUtil from '@/components/common/project/meta2d/js/topoUtil'
export default {
  name: 'meta2dProps',
  mixins: [topoUtil],
  props: {
    selectPens: {},
    querysArray: {},
    params: {},
    meta2dId: {}
  },
  components: {
    meta2dElement,
    meta2dCanvas,
    meta2dData
  },
  watch: {
    selectPens (n) {
      if (n.length === 1 && this.isUpdate) {
        this.activeName = 'elements'
      } else {
        this.activeName = 'canvas'
      }
    }
  },
  data () {
    return {
      activeName: 'canvas',
      isUpdate: true,
      canvasProps: {
        backGround: true
      },
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
    },
    beforeLeave (newName, oldName) {
      if (oldName === 'data') {
        const endTime = new Date().getTime()
        const startTime = endTime - 60 * 5 * 1000
        this.getQueryValues(this.$refs.meta2dData.elements, startTime, endTime)
      }
    },
    changeActiveName () {
      this.isUpdate = false
    }
  }
}
</script>

<style scoped lang="scss">

</style>
