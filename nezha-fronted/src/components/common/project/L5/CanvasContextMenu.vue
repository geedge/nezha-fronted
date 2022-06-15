<template>
  <div class="menus">
    <div>
      <a :class="{disabled:!props.node && !props.nodes}" @click="onTop()">{{$t('project.topology.top')}}</a>
    </div>
    <div>
      <a :class="{disabled:!props.node && !props.nodes}" @click="onBottom()">{{$t('project.topology.bottom')}}</a>
    </div>
    <div class="line"></div>
    <div>
      <a :class="{disabled:!props.node && !props.nodes && !props.line}" @click="onDel()">{{$t('overall.delete')}}</a>
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
        <span class="full">{{$t('project.topology.copy')}}</span>
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
      if (this.props.node) {
        getTopology(this.index).top(this.props.node)
      }

      if (this.props.nodes) {
        for (const item of this.props.nodes) {
          getTopology(this.index).top(item)
        }
      }

      getTopology(this.index).render()
    },

    onBottom () {
      if (this.props.node) {
        getTopology(this.index).bottom(this.props.node)
      }

      if (this.props.nodes) {
        for (const item of this.props.nodes) {
          getTopology(this.index).bottom(item)
        }
      }

      getTopology(this.index).render()
    },

    onCombine (stand) {
      if (!this.props.nodes) {
        return
      }
      getTopology(this.index).combine(this.props.nodes, stand)
      getTopology(this.index).render()
    },

    onUncombine () {
      if (!this.props.node) {
        return
      }
      getTopology(this.index).uncombine(this.props.node)
      getTopology(this.index).render()
    },

    onLock () {
      // eslint-disable-next-line vue/no-mutating-props
      this.props.locked = !this.props.locked
      if (this.props.node) {
        // eslint-disable-next-line vue/no-mutating-props
        this.props.node.locked = this.props.locked
      }
      if (this.props.nodes) {
        for (const item of this.props.nodes) {
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
      getTopology(this.index).delete()
    },
    canvascut () {
      getTopology(this.index).cut()
    },
    canvascopy () {
      getTopology(this.index).copy()
    },
    canvaspaste () {
      getTopology(this.index).paste()
    }
  }
}
</script>
