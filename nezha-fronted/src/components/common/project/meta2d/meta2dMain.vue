<template>
  <div class="meta2d-box list-page" :class="editFlag ? 'topology-dialog' : ''" v-my-loading="meta2dLoading" ref="meta2dBox" v-clickoutside="showNodeTools">
    <meta2dHeader
      ref="header"
      v-if="!isPreview && showHeader"
      :meta2dId="meta2dId"
      :isChart="isChart"
      :project="project"
      :editFlag="editFlag"
      @edit="beforeEdit"
      @exitEdit="exitEdit"
      @reload="reload"
      @saveChart="saveChart"
      @getNodesArr="getNodesArr"
    />
    <div class="meta2d-main" :class="isChart ? 'meta2d-chart': 'meta2d-project'" @contextmenu="onContextMenu($event)" style="position: relative" :style="{border: editFlag ? '1px solid' : ''}">
      <div v-for="(item,index) in nodesArr" v-if="!editFlag && project"
           :key="index"
           v-show="(item.y + offsetY - 48 > -20) && (item.x + item.width/2 + offsetX - 24 > - 20)"
           :style="{position: 'absolute',top:item.y + offsetY - 48 + 'px',left:item.x + item.width/2 + offsetX - 24 +'px', 'z-index': 10}"
           class="network-pop"
           @click="showNodeTools(index,item)"
      >

        <i
          :ref="'modelTopId'+index"
          :class="{'nz-icon':true, 'nz-icon-shuidi':true,'model-error':item.moduleData.state&&item.moduleData.state.error&&!item.moduleData.show,'model-error-active':item.moduleData.state&&item.moduleData.state.error&&item.moduleData.show}"
        >
          <i style="cursor: pointer" class="nz-icon nz-icon-model"></i>
        </i>
        <!--'selpop':selpopIs(item),'no-selPop':!selpopIs(item),'error-model-stat':modelPopError(item)  @click="popClick(item.id)" -->
        <div v-for="(item1, index) in popData" :key="index">
          <transition name="scaleTool">
            <i v-if="item.moduleData.show"
               :class="{'nz-icon':true,'nz-icon-hexagonBorder':true,'error-model-stat':item.moduleData.state[item1.id],'selpop':selpopIs(item,item1),'no-selPop':!selpopIs(item,item1),}"
               :style="{top:item1.top,left:item1.left}"
               :title="item1.title"
               @click.stop="nodeTools(item,item1)"
            >
              <i class="nz-icon nz-icon-liubianxing"></i>
              <i :class="[item1.className,{'nz-icon':item1.className},'noMove']"></i>
            </i>
          </transition>
        </div>
      </div>
      <div :id="meta2dId" style="height: 100%;width: 100%"></div>
    </div>
    <meta2dProps
      v-if="editFlag"
      ref="meta2dProps"
      :modules="modules"
      :selectPens.sync="selectPens"
      :querysArray="querysArray"
      :params="params"
      :is-chart="isChart"
      :meta2dId="meta2dId"
      @updatePens="updatePens"
    />
    <div class="context-menu" v-if="contextmenu.left && editFlag " :style="this.contextmenu">
      <CanvasContextMenu :meta2dId="meta2dId" :selectPens.sync="selectPens"></CanvasContextMenu>
    </div>
    <div
      v-show="position.show && (!editFlag)"
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
        :meta2dId="meta2dId"
        :params="chartParams"
      />
    </div>
    <!--悬浮network部分-->
    <div class="network-info">
      <div v-if="popDataShow.main">
        <popDataMain :moduleId="moduleId" :projectId="project.id"></popDataMain>
      </div>
      <div v-if="popDataShow.info">
        <popDataInfo :moduleId="moduleId" :projectId="project.id"></popDataInfo>
      </div>
    </div>
    <!--endpoint-->
    <transition name="right-box">
      <endpointTable v-if="popDataShow.endpoint" :moduleId="moduleId" :moduleName="moduleName" :projectId="project.id"
                     @close="popDataShowUpdate('',true)">
      </endpointTable>
    </transition>
    <!--asset-->
    <transition name="right-box">
      <assetTable v-if="popDataShow.asset" :moduleId="moduleId" :moduleName="moduleName" :projectId="project.id"
                  @close="popDataShowUpdate('',true)">
      </assetTable>
    </transition>
    <!--alert-->
    <transition name="right-box">
      <alertTable v-if="popDataShow.alert" :moduleId="moduleId" :moduleName="moduleName" :projectId="project.id"
                  @close="popDataShowUpdate('',true)">
      </alertTable>
    </transition>
    <div v-if="!editFlag&&showZoom" class="right-bottom-zoom">
      <div class="zoom-option" style="border-bottom: 1px solid #c5c8cb;" @click="zoomMap(0.25)" :title="$t('overall.enlargement')"><span><i class="nz-icon nz-icon-enlarge"></i></span></div>
      <div class="zoom-option" @click="zoomMap(-0.25)" :title="$t('overall.shrink')"><span><i class="nz-icon nz-icon-narrow"></i></span></div>
    </div>
  </div>
</template>

<script>
import meta2dHeader from '@/components/common/project/meta2d/meta2dHeader'
import meta2dProps from '@/components/common/project/meta2d/meta2dProps'
import meta2dMainCalc from '@/components/common/project/meta2d/js/meta2dMainCalc'
import meta2dTooltip from '@/components/common/project/meta2d/meta2dTooltip'
import CanvasContextMenu from '@/components/common/project/meta2d/CanvasContextMenu'
import popDataMain from '@/components/common/project/popData/Main'
import popDataInfo from '@/components/common/project/popData/Info'
import alertTable from '@/components/common/project/popData/alertTable'
import assetTable from '@/components/common/project/popData/assetTable'
import endpointTable from '@/components/common/project/popData/endpointTable'
import { getTopology, setTopology } from '@/components/common/js/common'
import topoUtil from '@/components/common/project/meta2d/js/topoUtil'
import bus from '@/libs/bus'
import { globalStore } from '@meta2d/core'
export default {
  name: 'meta2dMain',
  mixins: [meta2dMainCalc, topoUtil],
  props: {
    meta2dId: {}, // 唯一id 不可重复
    iconArray: {
      type: Array,
      default: () => {
        return []
      }
    },
    topoData: {}, // topo图数据
    isChart: {
      type: Boolean,
      default: false
    },
    querysArray: {},
    params: {},
    project: {},
    isPreview: {
      type: Boolean,
      default: false
    },
    showZoom: {
      type: Boolean,
      default: true
    },
    showHeader: {
      type: Boolean,
      default: true
    },
  },
  computed: {
  },
  components: {
    meta2dHeader,
    meta2dProps,
    meta2dTooltip,
    CanvasContextMenu,
    popDataMain,
    popDataInfo,
    alertTable,
    assetTable,
    endpointTable
  },
  watch: {
    topoData: {
      immediate: false,
      handler () {
        console.log(123213)
        if (!this.isChart) {
          this.reload()
        }
      }
    }
  },
  mounted () {
    setTimeout(() => {
      this.init()
    })
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
    },
    zoomMap (num) {
      getTopology(this.meta2dId).scale(getTopology(this.meta2dId).store.data.scale + num)
    },
    resize () {
      getTopology(this.meta2dId).resize()
      getTopology(this.meta2dId).centerView()
    }
  },
  beforeDestroy () {
    if (getTopology(this.meta2dId)) {
      getTopology(this.meta2dId).off('translate', this.topTranslate) // 平移·
      getTopology(this.meta2dId).off('scale', this.topoScale) // 缩放·
      getTopology(this.meta2dId).off('active', this.pensActive) // 选中·
      getTopology(this.meta2dId).off('translatePens', () => {}) // 移动画笔结束·
      getTopology(this.meta2dId).off('translatingPens', () => {}) // 移动画笔进行中·
      getTopology(this.meta2dId).off('enter', this.penEnter) // 移入画笔·
      getTopology(this.meta2dId).off('leave', this.penLeave) // 移出画笔·
      getTopology(this.meta2dId).off('add', this.appPen) // 添加新画笔·
      getTopology(this.meta2dId).off('click', this.topoClick) // click画笔·
      getTopology(this.meta2dId).destroy(true)
      for (const k in globalStore) {
        if (!globalStore[k]) {
          delete globalStore[k]
        }
      }
      setTopology(this.meta2dId, null)
    }
    bus.$off('changeSelectPens', this.pensActive)
    this.$refs.meta2dBox.removeEventListener('mousemove', this.mousemove)
    this.$refs.meta2dBox.removeEventListener('mouseup', this.mouseup)
    window.removeEventListener('click', this.contextmenuNone)
  }

}
</script>
