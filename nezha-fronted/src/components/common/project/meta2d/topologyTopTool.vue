<template>
  <div class="tool-top" id="tool-top"  @mouseup="changeDrawLineFlag(false)">
    <div id="tools-left-drag"
         class="top-tool-item top-tool-item-delete"
         :title="$t('project.topology.addNode')"
         @click="addNode">
      <div
      >
        <i class="nz-icon nz-icon-juxing" />
      </div>
    </div>
    <div id="tools-left-addline"
         class="top-tool-item top-tool-item-delete"
         :title="$t('project.topology.addNode')"
         @click="addLine">
      <div
      >
        <i class="nz-icon nz-icon-xiantiao" />
      </div>
    </div>
<!--    <div id="tools-left-draw"-->
<!--         class="top-tool-item"-->
<!--         :class="drawLineFlag ? 'is-active-meta2d' : ''"-->
<!--         @click="changeState('drawLineFlag')"-->
<!--         :title="$t('project.topology.addLine')">-->
<!--      <i  class="nz-icon nz-icon-xiantiao" />-->
<!--    </div>-->
    <div id="undo"
         class="top-tool-item"
         :class="undoFlag ? '' : 'is-active-meta2d' "
         @click="undo">
      <i class="nz-icon nz-icon-revoke" :title="$t('overall.revocation')"/>
    </div>
    <div id="redo"
         class="top-tool-item"
         :class="redoFlag ? '' : 'is-active-meta2d' "
         @click="redo"
    >
      <i class="nz-icon nz-icon-revoke1"  :title="$t('overall.redo')"/>
    </div>
    <!--<div> 保存为图片 </div>-->
    <div class="top-tool-item top-tool-item-delete" @click="del" :title="$t('overall.delete')">  <i class="nz-icon nz-icon-delete"/> </div>
    <div class="top-tool-item top-tool-item-scale">
      <span class="scale-number">
          <span class="scale-number-minus scale-number-symbol" @click="changeScale(-25)">-</span>
          <el-popover
            placement="bottom"
            width="111"
            trigger="hover"
            class="scale-number-box"
            popper-class="scale-number-popover no-style-class"
           >
            <div class="scale-num-pop" style=" width: 91px;min-width: 91px">
              <div>缩放级别</div>
              <div @click="scale(50)" :class="['scale-num-pop',scaleNum==50?'is-active':'']">50</div>
              <div @click="scale(100)" :class="['scale-num-pop',scaleNum==100?'is-active':'']">100</div>
              <div @click="scale(200)" :class="['scale-num-pop',scaleNum==200?'is-active':'']">200</div>
            </div>
            <span class="scale-number-content" slot="reference">{{scaleNum}}%</span>
          </el-popover>
          <span class="scale-number-add scale-number-symbol" @click="changeScale(25)">+</span>
        </span>
    </div>
    <div  class="top-tool-item top-tool-item-switch">
      <label>{{$t('project.topology.grids')}}</label>
      <el-switch
        v-model="option.grid"
        :active-value="true"
        :inactive-value="false"
        @change="changeOption('grid')">
      </el-switch>
    </div>
    <div class="top-tool-item top-tool-item-switch">
      <label>{{$t('project.topology.rule')}}</label>
      <el-switch
        v-model="option.rule"
        :active-value="true"
        :inactive-value="false"
        @change="changeOption('rule')">
      </el-switch>
    </div>
    <div  class="top-tool-item top-tool-item-switch">
      <label>{{$t('project.topology.thumbnail')}}</label>
      <el-switch
        v-model="option.map"
        :active-value="true"
        :inactive-value="false"
        @change="showMap()">
      </el-switch>
    </div>
  </div>
</template>

<script>
import { getTopology } from '../../js/common'
import bus from '@/libs/bus'
import { deepClone, s8 } from '@meta2d/core'
import lineData from './js/defaultPenLineData'
export default {
  name: 'topologyTopTool',
  data () {
    return {
      option: {
        lineName: 'curve',
        lineWidth: 1,
        fromArrow: '',
        toArrow: 'triangleSolid',
        scale: 100,
        grid: false,
        rule: false,
        map: false
      },
      dragstartFlag: false,
      drawLineFlag: false,
      scaleNum: 100,
      penLineType: [
        { d: 'M5 14 a100,50 0 0,1 85,0', 'stroke-dasharray': '', name: 'curve' },
        { d: 'M5 8 l40 0 l0 12 l40 0', 'stroke-dasharray': '', name: 'polyline' },
        { d: 'M5 14 l85 0', 'stroke-dasharray': '', name: 'line' },
        { d: 'M5 20 C0,8 50,0 85,0', 'stroke-dasharray': '', name: 'mind' }
      ],
      penLineFromTOArrow: [
        { d: 'M5 14 l85 0', points: '', fill: '', stroke: '', 'stroke-width': '', name: '' },
        { d: 'M5 14 l85 0', points: '5 14,20 9,20 19', fill: '#000000', stroke: '', 'stroke-width': '', name: 'triangleSolid' },
        { d: 'M5 14 l85 0', points: '5 14,20 9,20 19', fill: '#ffffff', stroke: '#000000', 'stroke-width': '1', name: 'triangle' },
        { d: 'M5 14 l85 0', fill: '#000000', stroke: '', 'stroke-width': '', cx: '10', cy: '14', r: '5', name: 'circleSolid' },
        { d: 'M5 14 l85 0', fill: '#ffffff', stroke: '#000000', 'stroke-width': '1', cx: '10', cy: '14', r: '5', name: 'circle' }
      ],
      redoFlag: false,
      undoFlag: false,
      store: {}
    }
  },
  props: {
    meta2dId: {
      require: true
    }
  },
  computed: {
  },
  watch: {
    'store.historyIndex': {
      handler (n) {
        const historyIndex = this.store.historyIndex
        const histories = this.store.histories
        if (historyIndex < histories.length - 1) {
          this.redoFlag = true
        } else {
          this.redoFlag = false
        }
        if (historyIndex > -1 && !this.$loadsh.isNull(historyIndex)) {
          this.undoFlag = true
        } else {
          this.undoFlag = false
        }
      }
    }
  },
  mounted () {
    const dataOption = getTopology(this.meta2dId).store.data
    Object.keys(this.option).forEach(key => {
      if (key === 'scale') {
        this.scaleNum = (dataOption[key] ? parseInt(dataOption[key] * 100) : this.scaleNum)
      } else {
        this.option[key] = (JSON.stringify(dataOption[key]) ? dataOption[key] : this.option[key])
      }
    })
    getTopology(this.meta2dId).on('scale', this.topoScale) // 缩放·
    this.store = getTopology(this.meta2dId).store
    bus.$on('changeDrawState', this.waiveDraw)
  },
  methods: {
    getTopology,
    onDragstart (e) {
      const pen = {
        name: 'rectangle',
        text: 'rectangle',
        width: 100,
        height: 100
      }
      e.dataTransfer.setData('Text', JSON.stringify(pen))
    },

    // 支持鼠标单击添加图形
    onTouchstart  (e) {
      const pen = {
        name: 'rectangle',
        text: 'rectangle',
        width: 100,
        height: 100
      }
      getTopology(this.meta2dId).canvas.addCaches = deepClone([pen])
    },
    addNode () {
      const data = getTopology(this.meta2dId).data()
      const offestX = data.x
      const offestY = data.y
      const pen = {
        name: 'rectangle',
        text: 'rectangle',
        width: 100,
        height: 100,
        x: 100 - offestX,
        y: 100 - offestY
      }
      getTopology(this.meta2dId).addPen(pen , true)
    },
    addLine () {
      const data = getTopology(this.meta2dId).data()
      const offestX = data.x
      const offestY = data.y
      const penId = s8()
      lineData.anchors[0].id = s8()
      lineData.anchors[1].id = s8()
      lineData.anchors[0].penId = penId
      lineData.anchors[1].penId = penId
      const pen = {
        ...lineData,
        id: penId,
        nzName: 'elements-' + getTopology(this.meta2dId).store.data.pens.length,
        type: 1,
        x: 100 - offestX,
        y: 100 - offestY,
        width: 150,
        length: 150,
        lineName: 'line',
        ex: 100 - offestX + 150,
        ey: 100 - offestY
      }
      getTopology(this.meta2dId).addPen(pen , true)
    },
    changeDrawLineFlag () {
      if (this.dragstartFlag) {
        this.dragstartFlag = false
      }
    },
    // 变更状态
    changeState (key) {
      if (key === 'dragstartFlag') {
        this.dragstartFlag = !this.dragstartFlag
      }
      if (key === 'drawLineFlag') {
        this.drawLineFlag = !this.drawLineFlag
        if (this.drawLineFlag) { // 开启钢笔
          getTopology(this.meta2dId).drawLine('line')
        } else {
          getTopology(this.meta2dId).drawLine()
        }
      }
    },
    waiveDraw () {
      this.drawLineFlag = false
      getTopology(this.meta2dId).drawLine()
      this.dragstartFlag = false
    },
    changeOption (key) {
      // getTopology(this.meta2dId).data[key] = this.option[key]
      const obj = {}
      obj[key] = this.option[key]
      if (key === 'grid') {
        getTopology(this.meta2dId).setGrid(obj)
      } else {
        getTopology(this.meta2dId).setRule(obj)
      }
      getTopology(this.meta2dId).render()
    },
    showMap () { // 显示鹰眼
      if (this.option.map) {
        getTopology(this.meta2dId).showMap()
      } else {
        getTopology(this.meta2dId).hideMap()
      }
    },
    undo () { // 撤销
      getTopology(this.meta2dId).undo()
      // getTopology(this.meta2dId).inactive()
      bus.$emit('changeSelectPens', [])
    },
    redo () { // 重做
      getTopology(this.meta2dId).redo()
      // getTopology(this.meta2dId).render()
      // getTopology(this.meta2dId).inactive()
      bus.$emit('changeSelectPens', [])
    },
    centerView () { // 居中显示
      getTopology(this.meta2dId).centerView()
    },
    fitView () { // 自适应画布大小
      getTopology(this.meta2dId).fitView()
    },
    changeScale (num) {
      this.scaleNum += num
      if (this.scaleNum < 25) {
        this.scaleNum = 25
      }
      if (this.scaleNum > 400) {
        this.scaleNum = 400
      }
      this.scale(this.scaleNum)
    },
    scale (val) {
      this.scaleNum = val
      getTopology(this.meta2dId).scale(val / 100)
    },
    del () {
      bus.$emit('changeSelectPens', [])
      getTopology(this.meta2dId).delete(getTopology(this.meta2dId).store.active)
    },
    clear () {
      const data = { ...getTopology(this.meta2dId).data }
      data.pens = []
      getTopology(this.meta2dId).open({})
    },
    toolShowChange (attr) {
      this.$emit('toolShowChange', attr)
    },
    changeOpt (key, val) {

    },
    topoScale (num) {
      this.scaleNum = parseInt(num * 100)
    }
  }
}
</script>
