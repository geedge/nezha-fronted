<template>
  <div class="tool-top" id="tool-top">
    <div id="undo" :class="['top-tool-item',]"  @click="undo"> <i class="nz-icon nz-icon-revoke" :title="$t('overall.revocation')"/> </div>
    <div id="redo" :class="['top-tool-item',]" @click="redo"> <i class="nz-icon nz-icon-revoke1"  :title="$t('overall.redo')"/> </div>
    <!--<div> 保存为图片 </div>-->
    <div class="top-tool-item" @click="del" :title="$t('overall.delete')">  <i class="nz-icon nz-icon-delete"/> </div>
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
  </div>
</template>

<script>
import { getTopology } from '../../js/common'

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
        rule: false
      },
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
      redoFlag: false
    }
  },
  props: {
    selection: {
      type: Object,
      require: true
    },
    index: {
      type: Number,
      require: true
    },
    toolShow: {
      type: Object,
      require: true
    },
    cachesIndex: {
      type: Number,
      require: true
    }
  },
  mounted () {
    const dataOption = getTopology(this.index).data
    Object.keys(this.option).forEach(key => {
      if (key === 'scale') {
        this.scaleNum = (JSON.stringify(dataOption[key]) ? parseInt(dataOption[key] * 100) : this.scaleNum)
      } else {
        this.option[key] = (JSON.stringify(dataOption[key]) ? dataOption[key] : this.option[key])
      }
    })
  },
  methods: {
    changeOption (key) {
      // getTopology(this.index).data[key] = this.option[key]
      const obj = {}
      obj[key] = this.option[key]
      console.log(obj)
      if (key === 'grid') {
        getTopology(this.index).setGrid(obj)
      } else {
        getTopology(this.index).setRule(obj)
      }
      getTopology(this.index).render()
    },
    undo () { // 撤销
      getTopology(this.index).undo()
    },
    redo () { // 重做
      getTopology(this.index).redo()
    },
    centerView () { // 居中显示
      getTopology(this.index).centerView()
    },
    fitView () { // 自适应画布大小
      getTopology(this.index).fitView()
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
      getTopology(this.index).scaleTo(val / 100)
    },
    del () {
      const delObj = this.selection.pen ? [this.selection.pen] : this.selection.pens
      this.$emit('del', delObj)
    },
    clear () {
      const data = { ...getTopology(this.index).data }
      data.pens = []
      getTopology(this.index).open({})
    },
    toolShowChange (attr) {
      this.$emit('toolShowChange', attr)
    },
    changeOpt (key, val) {

    }
  }
}
</script>
