<template>
  <div style="padding:15px"
       :class="calcHeight(that.position,that)"
       :style="calcPosition(that.position,that)"
       class="alert-label__border response__popper"
       ref="alertLabels"
       @mouseenter="tipHover(true)"
       @mouseleave="tipHover(false)">
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
    isTopoInfo: Boolean,
    width: {
      type: Number
    }
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
        if (this.$refs.alertLabels) {
          this.heightList = this.$refs.alertLabels.getBoundingClientRect().height
          this.boxWidth = this.$refs.alertLabels.getBoundingClientRect().width
        } else {
          this.heightList = 0
          this.boxWidth = 0
        }
        const clientHeight =
          document.body.clientHeight < document.documentElement.clientHeight
            ? document.body.clientHeight
            : document.documentElement.clientHeight
        const clientWidth =
          document.body.clientWidth < document.documentElement.clientWidth
            ? document.body.clientWidth
            : document.documentElement.clientWidth
        let leftOffSetView = 0
        let leftOffSet = this.detailList ? -80 : 10
        let topOffSet = this.detailList ? 60 : 22
        let topOffSetView = 0
        let labelPosition = {
          top: 0,
          left: 0,
          right: 0,
        }
        if (this.alertTableDialog) {
          let dialog = document.querySelector(
            '#dialog-alert-massage .el-dialog'
          )
          if (!dialog) {
            dialog = document.querySelector('#viewGraphDialog .el-dialog')
          }
          const dialogHeight = dialog.getBoundingClientRect()
          leftOffSet = leftOffSet - 3 * dialogHeight.x
          leftOffSetView = dialogHeight.x
          topOffSet = topOffSet - dialogHeight.y
          topOffSetView = topOffSet
        }
        if (position.top > clientHeight / 2) {
          labelPosition = {
            left: `${position.left + position.width + leftOffSet}px`,
            top: this.that.type === 'chartTopology' ? `${position.top - this.heightList - topOffSetView}px` : `${position.top - this.heightList - topOffSetView + position.height / 2}px`
          }
        } else {
          labelPosition = {
            left: `${position.left + position.width + leftOffSet}px`,
            top: this.that.type === 'chartTopology' ? `${position.top + topOffSet}px` : `${position.top + position.height / 2}px`
          }
        }
        if (position.left > clientWidth / 2) {
          delete labelPosition.left

          labelPosition.right =
            clientWidth - position.left - leftOffSetView + 'px'
        }
        if (this.width) {
          labelPosition.width = this.width + 'px'
        } else {
          labelPosition.width = 'auto'
        }
        return labelPosition
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
    tooltipHover (item, flag, e) {
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        this.position.left = position.left
        this.$set(this.position, 'left', position.left)
        if (position.top > window.innerHeight / 2) {
          this.$set(this.position, 'top', position.top - 55)
        } else {
          this.$set(this.position, 'top', position.top + 30)
        }
        // this.$set(item, 'alertNumtooltipShow', flag)
        this.alertNumtooltipShow = flag
      }
    },
    tipHover (tipLoading) {
      this.$emit('tipHover', tipLoading)
    }
  },
  mounted () {
    this.heightList = this.$refs.alertLabels.getBoundingClientRect().height
  }
}
</script>
