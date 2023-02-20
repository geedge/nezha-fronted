<template>
  <div class="topo-header">
    <div v-if="!isChart"> {{project && project.name}} </div>
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
      <button v-has="'project_edit'" v-if="!isChart" class="top-tool-btn margin-r-10" type="button" @click="saveMeta2d" :title="$t('overall.edit')">
        save
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
    project: {}
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
      this.topoScreenState = JSON.parse(JSON.stringify(this.topoScreen))
      this.$store.commit('setShowTopoScreen', true)
      setTimeout(() => {
        this.topoResize(this.meta2dId)
        this.initEdit(this.meta2dId)
        this.$emit('edit')
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
      getTopology(this.meta2dId).drawLine('line')
    },
    saveMeta2d () {
      if (this.isChart) {
        this.saveChart()
      } else {
        this.saveProject()
      }
    },
    saveChart () {

    },
    saveProject () {
      const elements = this.$parent.$refs.meta2dProps.$refs.meta2dData.elements
      console.log(elements)
      const params = {
        topo: getTopology(this.meta2dId).data(),
        elements: elements,
        timeType: ''
      }

      this.$put('monitor/project/topo', { topo: JSON.stringify(params), projectId: this.project.id }).then(res => {
        this.prevent_opt.save = false
        if (res.code === 200) {
          this.$message({
            message: this.$t('tip.saveSuccess'),
            type: 'success'
          })
          this.$store.commit('setShowTopoScreen', this.topoScreenState)
          this.$nextTick(() => {
            getTopology(this.meta2dId).lock(1)
            getTopology(this.meta2dId).resize()
          })
          this.$emit('exitEdit', true)
        }
      }).catch(res => {
        this.prevent_opt.save = false
        this.$message({
          message: res.msg,
          type: 'error'
        })
      })
    }
  }
}
</script>

<style scoped lang="scss">

</style>
