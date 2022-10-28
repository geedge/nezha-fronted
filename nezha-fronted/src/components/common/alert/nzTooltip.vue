<template>
  <div style="padding:15px" :class="calcHeight(that.position,that)" :style="calcPosition(that.position,that)" class="alert-label__border" ref="alertLabels"
       @mouseenter="tooltipHover(true)"
       @mouseleave="tooltipHover(false)">
    <slot name="default"/>
  </div>
</template>

<script>
export default {
  name: 'nzTooltip',
  props: {
    id: {},
    type: {},
    // labelLoading:{},
    that: {},
    detailList: Boolean,
    alertTableDialog: Boolean,
    isTopoInfo: Boolean
  },
  data () {
    return {
      alertLabelData: null,
      loading: true,
      heightList: 0
    }
  },
  computed: {
    calcPosition () {
      return function (position) {
        const clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight
        const leftOffSetView = this.detailList ? -80 : 10
        const leftOffSet = this.detailList ? -80 : 10
        const topOffSet = this.detailList ? 60 : 22
        const topoOffset = this.isTopoInfo ? 155 : 0
        if (position.top + this.heightList > clientHeight) {
          return {
            left: `${position.left + position.width + leftOffSet - topoOffset}px`,
            top: `${position.top - this.heightList + topOffSet}px`
          }
        } else if (this.alertTableDialog) {
          const dialog = document.querySelector('#dialog-alert-massage .el-dialog')
          const dialogHeight = dialog.getBoundingClientRect()
          if (dialogHeight) {
            return {
              left: `${position.left + position.width + 10 - dialogHeight.x}px`,
              top: `${position.top - dialogHeight.y}px`
            }
          }
        } else {
          return {
            left: `${position.left + position.width + leftOffSet - topoOffset}px`,
            top: `${position.top}px`
          }
        }
      }
    },
    calcHeight () {
      const self = this
      return function (position) {
        const clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight
        const elHeight = self.type === 'asset' ? 318 : (self.type === 'project' ? 70 : 70)
        if (position.top + elHeight > clientHeight) {
          return 'alert-labelUp'
        } else {
          return 'alert-label'
        }
      }
    }
  },
  methods: {
    tooltipHover (show) {
      if (show) {
        clearTimeout(this.that.timeout)
        this.that.timeout = null
      } else {
        this.that.loading = false
      }
    }
  },
  mounted () {
    this.heightList = this.$refs.alertLabels.getBoundingClientRect().height
  }
}
</script>
