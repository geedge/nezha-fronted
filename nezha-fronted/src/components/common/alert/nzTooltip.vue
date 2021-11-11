<template>
  <div :class="calcHeight(that.position,that)" :style="calcPosition(that.position,that)" class="alert-label__border" ref="alertLabels"
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
    alertTableDialog: Boolean
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
        if (position.top + this.heightList > clientHeight) {
          return {
            left: `${position.left + position.width + leftOffSet}px`,
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
            left: `${position.left + position.width + leftOffSetView}px`,
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

<style scoped>
  .alert-label {
    position: fixed;
    background-color: white;
    z-index: 3000;
    padding: 10px 23px 10px 10px;
    border-radius: 4px;
    box-shadow: -1px 1px 9px -1px rgba(205,205,205,0.77);
  }
  .alert-label__border {
    background: #FFFFFF;
    border: 1px solid #E7EAED;
    box-shadow: 0 6px 16px 0 rgba(0,0,0,0.08);
    border-radius: 3px 3px 3px 3px 0 0;
  }
  .alert-labelUp {
    position: fixed;
    background-color: white;
    z-index: 3000;
    padding: 10px;
    border-radius: 4px;
    box-shadow: -1px 1px 9px -1px rgba(205,205,205,0.77);
  }
  .alert-label::after {
    content: '';
    display: block;
    width:0;
    height:0;
    overflow: hidden;
    font-size: 0;
    line-height: 0;
    /*border: 5px;*/
    /*border-style: dashed solid dashed dashed;*/
    /*border-color: transparent #fff transparent transparent;*/
    position: absolute;
    top: 20px;
    left: 0;
    transform: translate(-100%, -50%);
  }
  .alert-labelUp::after {
    content: '';
    display: block;
    width:0;
    height:0;
    overflow: hidden;
    font-size: 0;
    line-height: 0;
    /*border: 5px;*/
    /*border-style: dashed solid dashed dashed;*/
    /*border-color: transparent #fff transparent transparent;*/
    position: absolute;
    bottom: 20px;
    left: 0;
    transform: translate(-100%, -50%);
  }
  .alert-label-info{
    /*border: 1px solid #ebeef5;*/
    border-bottom: none;
    font-size: 13px;
    line-height: 26px;
  }
  .alert-label-box{
    display: flex;
    flex-direction: row;
    /*border-bottom: 1px solid #ebeef5;*/
  }
  .alert-label-title{
    font-size: 14px;
    color: #666666;
    letter-spacing: 0;
    line-height: 26px;
    min-width: 110px;
    padding: 0 3px 0 13px;
  }
  .alert-label-value{
    word-wrap: break-word;
    white-space: normal;
    overflow: hidden;
    max-width: 200px;
    font-size: 14px;
    color: #333333;
    letter-spacing: 0;
    line-height: 26px;
  }
  .danger{
    background-color: #d64f40;
    color: white;
    padding: 2px 5px;
    border-radius: 4px;
  }
  .success{
    background-color: #50d050;
    color: white;
    padding: 2px 5px;
    border-radius: 4px;
  }
  /deep/.active-icon{
    margin-top: 0;
  }
  .colorFA901C{
    color: #fa901c;
  }
</style>
