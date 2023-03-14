<template>
  <div class="topo-header top-tools">
    <div v-if="!isChart && !editFlag"> {{project && project.name}} </div>
    <div class="tools-left" v-if="editFlag">
      <topology-top-tool
        v-if="editFlag&&toolShow&&!isPreview"
        :meta2dId="meta2dId"
        ref="topTool"
       >
      </topology-top-tool>
    </div>
    <div v-if="!editFlag" class="top-tool-right">
      <pick-time
        v-show="!editFlag"
        ref="pickTime"
        v-model="searchTime"
        :refresh-data-func="dateChange"
        :showTimePicker="false"
        :use-chart-unit="false"
        class="pickTime margin-r-10">
      </pick-time>
      <button v-has="'project_edit'" class="top-tool-btn margin-r-10" type="button" @click="editMeta2d()" :title="$t('overall.edit')">
        <i class="nz-icon nz-icon-edit"></i>
      </button>
      <button class="top-tool-btn" type="button" @click="changeScreen" :title="topoScreen? $t('dashboard.screen.exit') : $t('dashboard.screen')">
        <i :class="topoScreen?'nz-icon-exit-full-screen':'nz-icon-full-screen'" class="nz-icon"></i>
      </button>
    </div>
    <div v-if="editFlag" class="top-tool-right float-right">
      <button @click="previewTopology" v-if="!isPreview" class="nz-btn nz-btn-size-normal nz-btn-style-light"
              style="margin-right: 20px"
      >
        {{$t('overall.preview')}}
      </button>
      <button v-if="isPreview" class="nz-btn nz-btn-size-normal nz-btn-style-light" @click="previewExit"
              style="margin-right: 20px"
      >
        {{$t('project.topology.previewExit')}}
      </button>
      <button class="nz-btn nz-btn-size-normal nz-btn-style-normal" @click="saveMeta2d"
              :disabled="prevent_opt.save"
              :class="{'nz-btn-disabled':prevent_opt.save}"
              style="margin-right: 20px">
        {{$t('overall.save')}}
      </button>
      <button class="nz-btn nz-btn-size-normal nz-btn-style-normal" style="margin-right: 20px" @click="cancelTopology">
        {{$t('project.topology.exit')}}
      </button>
    </div>
  </div>
</template>

<script>
import topoUtil from '@/components/common/project/meta2d/js/topoUtil'
import { getTopology, setTopology, dealImg, topologyImg } from '@/components/common/js/common'
import { deepClone } from '@meta2d/core'
import bus from '@/libs/bus'
import topologyTopTool from '@/components/common/project/meta2d/topologyTopTool'

export default {
  name: 'meta2dHeader',
  mixins: [topoUtil],
  components: {
    topologyTopTool
  },
  props: {
    meta2dId: {},
    isChart: {
      type: Boolean,
      default: false
    },
    project: {},
    editFlag: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      topoScreenState: '',
      isPreview: false,
      searchTime: bus.getTimezontDateRange(),
      toolShow: true
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
      this.$emit('edit')
      this.initEdit(this.meta2dId)
      setTimeout(() => {
        this.topoResize(this.meta2dId)
      })
    },
    saveMeta2d () {
      if (this.$refs.topTool.option.map) {
        getTopology(this.meta2dId).hideMap()
      }
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
      const timeType = this.$parent.$refs.meta2dProps.$refs.meta2dData.dataTimeType
      const params = {
        ...getTopology(this.meta2dId).data()
      }
      params.elements = elements
      params.timeType = timeType
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
    },
    dateChange () {
      this.$emit('reload')
    },
    changeScreen () {
      this.$store.commit('setShowTopoScreen', !this.topoScreen)
      this.$nextTick(() => {
        getTopology(this.meta2dId).resize()
        getTopology(this.meta2dId).centerView()
        getTopology(this.meta2dId).translate(0, 0)
      })
    },
    previewTopology () {
      console.log(getTopology(this.meta2dId).data())
      this.isPreview = true
      const elements = this.$parent.$refs.meta2dProps.$refs.meta2dData.elements
      const endTime = new Date().getTime()
      const startTime = endTime - 60 * 5 * 1000
      this.getQueryValues(elements, startTime, endTime).then(arr => {
        this.clacTopoData(getTopology(this.meta2dId).data(), arr).then((data) => {
          getTopology(this.meta2dId).resize()
          getTopology(this.meta2dId).open(data)
          getTopology(this.meta2dId).centerView()
          getTopology(this.meta2dId).lock(1)
        })
      })
    },
    previewExit () {
      this.isPreview = false
      getTopology(this.meta2dId).lock(0)
      getTopology(this.meta2dId).stopAnimate()
      if (getTopology(this.meta2dId).data().pens) {
        getTopology(this.meta2dId).data().pens.forEach(item => {
          this.calcNode(item)
        })
      }
      getTopology(this.meta2dId).render()
      getTopology(this.meta2dId).centerView()
      this.$emit('getNodesArr')
    },
    cancelTopology () {
      this.isPreview = false
      this.$store.commit('setShowTopoScreen', this.topoScreenState)
      if (this.$refs.topTool.option.map) {
        getTopology(this.meta2dId).hideMap()
      }
      this.$emit('exitEdit', true)
    }
  }
}
</script>

<style scoped lang="scss">
.tools-left-drag{
  margin-left: 10px;
  margin-right: 10px;
}
</style>
