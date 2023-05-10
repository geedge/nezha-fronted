<template>
  <div
    :class="calcHeight(that.position, that)"
    :style="calcPosition(that.position, that)"
    class="alert-state-info"
    ref="alertLabels"
  >
  <div v-if="that.type === 'agent'">
      <!-- v-my-loading="loading"> -->
      <!-- title -->
      <div class="alert-label-header-title">
        <span>
            Version :
        </span>
        <span class="alert-label-header-text">
            {{ that && that.version ? that.version : "--" }}
        </span>
      </div>
      <!-- body -->
      <div class="alert-label-box">
        <span :class="that.auth === 'TRUE' ? 'green-bg' : 'red-bg'" class="active-icon"></span>
        <span class="alert-label-value">Auth</span>
      </div>
       <div class="alert-label-box" v-if="that.prometheus">
        <span :class="{'green-bg': that.prometheus == 'UP','red-bg': that.prometheus == 'DOWN'}" class="active-icon"></span>
        <span class="alert-label-value">Prometheus</span>
      </div>
       <div class="alert-label-box" v-if="that.cortex">
        <span :class="{'green-bg': that.cortex == 'UP','red-bg': that.cortex == 'DOWN', 'gray-bg': that.cortex == 'UNAVAILABLE'}" class="active-icon"></span>
        <span class="alert-label-value">Cortex</span>
      </div>
       <div class="alert-label-box" v-if="that.loki">
        <span :class="{'green-bg': that.loki == 'UP','red-bg': that.loki == 'DOWN','gray-bg': that.loki == 'UNAVAILABLE'}" class="active-icon"></span>
        <span class="alert-label-value">Loki</span>
      </div>
      <div class="alert-label-box" v-if="that.snmp_exporter">
        <span :class="{'green-bg': that.snmp_exporter == 'UP','red-bg': that.snmp_exporter == 'DOWN'}" class="active-icon"></span>
        <span class="alert-label-value">SNMP exporter</span>
      </div>
      <div class="alert-label-box" v-if="that.blackbox_exporter">
        <span :class="{'green-bg': that.blackbox_exporter == 'UP','red-bg': that.blackbox_exporter == 'DOWN'}" class="active-icon"></span>
        <span class="alert-label-value">Blackbox exporter</span>
      </div>
  </div>
  </div>
</template>

<script>
import trendMixin from './trendMixins'

export default {
  name: 'alertLabel',
  mixins: [trendMixin],
  props: {
    id: {},
    type: {},
    that: {},
    detailList: Boolean,
    alertTableDialog: Boolean
  },
  data () {
    return {
      alertLabelData: null,
      loading: true,
      heightList: 0,
      boxWidth: 0
    }
  },
  watch: {
    that: {
      immediate: true,
      deep: true,
      handler (n) {
      }
    }
  },
  computed: {
    calcPosition () {
      return function (position) {
        const clientHeight =
          document.body.clientHeight < document.documentElement.clientHeight
            ? document.body.clientHeight
            : document.documentElement.clientHeight
        const clientWidth =
          document.body.clientWidth < document.documentElement.clientWidth
            ? document.body.clientWidth
            : document.documentElement.clientWidth
        let leftOffSetView = 0
        let leftOffSet = this.detailList ? -60 : 20
        let topOffSet = this.detailList ? 60 : 22
        let topOffSetView = 0
        let labelPosition = {
          top: 0,
          left: 0,
          right: 0
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
            // top: `${position.top - this.heightList - topOffSetView}px`
            top: `${position.top - this.heightList - topOffSetView + position.height / 2}px`
          }
        } else {
          labelPosition = {
            left: `${position.left + position.width + leftOffSet}px`,
            // top: `${position.top + topOffSet}px`
            top: `${position.top + position.height / 2}px`
          }
        }
        if (position.left > clientWidth / 2) {
          delete labelPosition.left
          labelPosition.right =
            clientWidth - position.left - leftOffSetView + 'px'
        }
        return labelPosition
      }
    },
    calcHeight () {
      const self = this
      return function (position) {
        const clientHeight =
          document.body.clientHeight < document.documentElement.clientHeight
            ? document.body.clientHeight
            : document.documentElement.clientHeight
        const elHeight =
          self.type === 'asset' ? 318 : self.type === 'project' ? 70 : 70
        if (position.top + elHeight > clientHeight) {
          return 'alert-labelUp'
        } else {
          return 'alert-label'
        }
      }
    }
  },
  mounted () {
    if (this.$refs.alertLabels) {
      this.heightList = this.$refs.alertLabels.getBoundingClientRect().height
      this.boxWidth = this.$refs.alertLabels.getBoundingClientRect().width
    } else {
      this.heightList = 0
      this.boxWidth = 0
    }
  }
}
</script>
<style>
</style>
