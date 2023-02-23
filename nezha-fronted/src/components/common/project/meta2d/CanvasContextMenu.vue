<template>
  <div class="menus">
    <div>
      <span :class="{disabled: !selectPens.length}" @click="onTop()">{{$t('project.topology.top')}}</span>
    </div>
    <div>
      <span :class="{disabled: !selectPens.length}" @click="onBottom()">{{$t('project.topology.bottom')}}</span>
    </div>
    <div>
      <span :class="{disabled: !selectPens.length}" @click="onUp()">{{$t('project.topology.up')}}</span>
    </div>
    <div>
      <span :class="{disabled: !selectPens.length}" @click="onDown()">{{$t('project.topology.down')}}</span>
    </div>
<!--    <div class="line"></div>-->
<!--    <div>-->
<!--      <span :class="{disabled: !selectPens.length}" @click="onLock()">{{$t('overall.delete')}}</span>-->
<!--    </div>-->
    <div class="line"></div>
    <div>
      <span :class="{disabled: !selectPens.length}" @click="onDel()">{{$t('overall.delete')}}</span>
    </div>
    <div class="line"></div>
    <div>
      <span @click="undo()" class="flex" :class="{disabled:!( historyIndex > -1 && !isNull(historyIndex))}">
        <span class="full">{{$t('project.topology.undo')}}</span>
        <span class="ml50">Ctrl + Z</span>
      </span>
    </div>
    <div>
      <span @click="redo()" class="flex" :class="{disabled: historyIndex >= historiesLength - 1 }">
        <span class="full">{{$t('project.topology.redo')}}</span>
        <span class="ml50">Shift + Z</span>
      </span>
    </div>
    <div class="line"></div>
    <div>
      <span @click="canvascut()" class="flex" :class="{disabled: !selectPens.length}">
        <span class="full">{{$t('project.topology.cut')}}</span>
        <span class="ml50">Ctrl + X</span>
      </span>
    </div>
    <div>
      <span @click="canvascopy()" class="flex" :class="{disabled: !selectPens.length}">
        <span class="full">{{$t('overall.duplicate')}}</span>
        <span class="ml50">Ctrl + C</span>
      </span>
    </div>
    <div>
      <span @click="canvaspaste()" class="flex">
        <span class="full">{{$t('project.topology.paste')}}</span>
        <span class="ml50">Ctrl + V</span>
      </span>
    </div>
  </div>
</template>

<script >
import { getTopology } from '../../js/common'
import bus from '@/libs/bus'
export default {
  data () {
    return {
      historyIndex: null,
      historiesLength: 0
    }
  },
  props: {
    meta2dId: {
      require: true
    },
    selectPens: {
      require: true
    }
  },
  mounted () {
    this.historyIndex = getTopology(this.meta2dId).store.historyIndex
    this.historiesLength = getTopology(this.meta2dId).store.histories.length
  },
  methods: {
    undo () { // 撤销
      getTopology(this.meta2dId).undo()
      // getTopology(this.meta2dId).inactive()
      bus.$emit('changeSelectPens', [])
    },
    redo () { // 重做
      getTopology(this.meta2dId).redo()
      // getTopology(this.meta2dId).inactive()
      bus.$emit('changeSelectPens', [])
    },
    onTop () {
      for (const item of this.selectPens) {
        getTopology(this.meta2dId).top(item)
      }
      getTopology(this.meta2dId).render()
    },
    onUp () {
      for (const item of this.selectPens) {
        getTopology(this.meta2dId).up(item)
      }
      getTopology(this.meta2dId).render()
    },
    onDown () {
      for (const item of this.selectPens) {
        getTopology(this.meta2dId).down(item)
      }
      getTopology(this.meta2dId).render()
    },
    onBottom () {
      for (const item of this.selectPens) {
        getTopology(this.meta2dId).bottom(item)
      }
      getTopology(this.meta2dId).render()
    },

    onCombine () {
      if (this.selectPens.length < 2) {
        return
      }
      getTopology(this.meta2dId).combine(this.selectPens)
      getTopology(this.meta2dId).render()
    },

    onUncombine () {
      if (this.selectPens.length < 2) {
        return
      }
      getTopology(this.meta2dId).uncombine(this.selectPens)
      getTopology(this.meta2dId).render()
    },

    onLock () {
      getTopology(this.meta2dId).render()
    },

    onDel () {
      getTopology(this.meta2dId).delete(this.selectPens)
    },
    canvascut () {
      getTopology(this.meta2dId).cut(this.selectPens)
    },
    canvascopy () {
      getTopology(this.meta2dId).copy(this.selectPens)
    },
    canvaspaste () {
      getTopology(this.meta2dId).paste()
    },
    isNull (val) {
      return this.$loadsh.isNull(val)
    }
  }
}
</script>
