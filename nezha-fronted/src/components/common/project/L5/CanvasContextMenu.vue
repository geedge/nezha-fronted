<template>
  <div class="menus">
    <div>
      <a :class="{disabled:!props.pen && !props.pens}" @click="onTop()">{{$t('project.topology.top')}}</a>
    </div>
    <div>
      <a :class="{disabled:!props.pen && !props.pens}" @click="onBottom()">{{$t('project.topology.bottom')}}</a>
    </div>
    <div class="line"></div>
    <div>
      <a :class="{disabled:!props.pen && !props.pens && !props.line}" @click="onDel()">{{$t('overall.delete')}}</a>
    </div>
    <div class="line"></div>
    <div>
      <a @click="canvascut()" class="flex">
        <span class="full">{{$t('project.topology.cut')}}</span>
        <span class="ml50">Ctrl + X</span>
      </a>
    </div>
    <div>
      <a @click="canvascopy()" class="flex">
        <span class="full">{{$t('overall.duplicate')}}</span>
        <span class="ml50">Ctrl + C</span>
      </a>
    </div>
    <div>
      <a @click="canvaspaste()" class="flex">
        <span class="full">{{$t('project.topology.paste')}}</span>
        <span class="ml50">Ctrl + V</span>
      </a>
    </div>
  </div>
</template>

<script >
import { getTopology } from '../../js/common'
export default {
  data () {
    return {}
  },
  props: {
    index: {
      require: true
    },
    props: {
      type: Object,
      require: true
    }
  },
  methods: {
    onTop () {
      if (this.props.pens) {
        for (const item of this.props.pens) {
          getTopology(this.index).top(item)
        }
      } else if (this.props.pen) {
        getTopology(this.index).top(this.props.pen)
      }

      getTopology(this.index).render()
    },

    onBottom () {
      if (this.props.pens) {
        for (const item of this.props.pens) {
          getTopology(this.index).bottom(item)
        }
      } else if (this.props.pen) {
        getTopology(this.index).bottom(this.props.pen)
      }

      getTopology(this.index).render()
    },

    onCombine (stand) {
      if (!this.props.pens) {
        return
      }
      getTopology(this.index).combine(this.props.pens, stand)
      getTopology(this.index).render()
    },

    onUncombine () {
      if (!this.props.pen) {
        return
      }
      getTopology(this.index).uncombine(this.props.pen)
      getTopology(this.index).render()
    },

    onLock () {
      // eslint-disable-next-line vue/no-mutating-props
      this.props.locked = !this.props.locked
      if (this.props.pen) {
        // eslint-disable-next-line vue/no-mutating-props
        this.props.pen.locked = this.props.locked
      }
      if (this.props.pens) {
        for (const item of this.props.pens) {
          item.locked = this.props.locked
        }
      }
      if (this.props.lines) {
        for (const item of this.props.lines) {
          item.locked = this.props.locked
        }
      }
      getTopology(this.index).render(true)
    },

    onDel () {
      getTopology(this.index).delete(this.props.pens || [this.props.pen])
    },
    canvascut () {
      getTopology(this.index).cut(this.props.pens || [this.props.pen])
    },
    canvascopy () {
      getTopology(this.index).copy(this.props.pens || [this.props.pen])
    },
    canvaspaste () {
      getTopology(this.index).paste()
    }
  }
}
</script>
