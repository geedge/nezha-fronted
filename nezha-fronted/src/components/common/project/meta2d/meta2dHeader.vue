<template>
  <div class="topo-header">
    <div v-if="!isChart"> {{projectName}} </div>
    <div class="tools-left">
      <div class="tools-left-drag">
        <div
          class="icon"
          draggable="true"
          @dragstart.stop="onDragstart($event)"
          @click="onTouchstart($event)"
        >
          <div>Rectangle</div>
        </div>
      </div>
      <div class="tools-left-draw" @click="setDrawPen()">
        钢笔
      </div>
    </div>
    <div>
      <button v-has="'project_edit'" v-if="!isChart" class="top-tool-btn margin-r-10" type="button" @click="editMeta2d" :title="$t('overall.edit')">
        <i class="nz-icon nz-icon-edit"></i>
      </button>
    </div>
  </div>
</template>

<script>
import topoUtil from '@/components/common/project/meta2d/js/topoUtil'
import { getTopology, setTopology, dealImg, topologyImg } from '@/components/common/js/common'
import { deepClone } from '@meta2d/core'
export default {
  name: 'meta2dHeader',
  mixins: [topoUtil],
  props: {
    meta2dId: {},
    isChart: {
      type: Boolean,
      default: false
    },
    projectName: {}
  },
  data () {
    return {
      topoScreenState: ''
    }
  },
  computed: {
    topoScreen () {
      return this.$store.getters.getShowTopoScreen
    },
    shrink () {
      return this.$store.getters.getIsShrink
    }
  },
  methods: {
    editMeta2d () {
      console.log()
      this.topoScreenState = JSON.parse(JSON.stringify(this.topoScreen))
      this.$store.commit('setShowTopoScreen', true)
      setTimeout(() => {
        this.topoResize(this.meta2dId)
        this.initEdit(this.meta2dId)
        this.$emit('edit')
        console.log(getTopology(this.meta2dId).data())
      })
    },
    onDragstart (e) {
      const pen = {
        name: 'rectangle',
        text: '矩形',
        width: 100,
        height: 100
      }
      e.dataTransfer.setData('Text', JSON.stringify(pen))
    },

    // 支持鼠标单击添加图形
    onTouchstart  (e) {
      const pen = {
        name: 'rectangle',
        text: '矩形',
        width: 100,
        height: 100
      }
      getTopology(this.meta2dId).canvas.addCaches = deepClone([pen])
    },
    // 开启钢笔状态
    setDrawPen () {
      console.log(123123123123)
      getTopology(this.meta2dId).drawLine('line')
    }
  }
}
</script>

<style scoped lang="scss">
.topo-header {
  height: 60px;
  box-sizing: border-box;
  padding: 14px 20px 14px 10px;
  display: flex;
  .tools-left{
    display: flex;
  }
}
</style>
