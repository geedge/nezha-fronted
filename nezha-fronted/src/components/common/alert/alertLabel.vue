<template>
  <div :class="calcHeight(that.position,that)" :style="calcPosition(that.position,that)" ref="alertLabels">
    <div class="alert-label-info" v-if="type==='asset'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.id ? alertLabelData.id : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Name</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.name ? alertLabelData.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">SN</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.sn ? alertLabelData.sn:'--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">ManageIp</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.manageIp ? alertLabelData.manageIp : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">State</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.state && alertLabelData.state.name ? alertLabelData.state.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Ping</div>
        <div class="alert-label-value">
          <div v-if="alertLabelData" :class="{'green-bg': alertLabelData && alertLabelData.pingInfo && alertLabelData.pingInfo.status === 1,'red-bg': alertLabelData && alertLabelData.pingInfo && alertLabelData.pingInfo.status === 0}" class="active-icon"></div>
          <span v-if="alertLabelData">{{alertLabelData && alertLabelData.pingInfo && alertLabelData.pingInfo.rtt ? alertLabelData.pingInfo.rtt + 'ms':'--'}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Asset Type</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.type && alertLabelData.type.name ? alertLabelData.type.name:'--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Brand</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.brand && alertLabelData.brand.name ? alertLabelData.brand.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Model</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.model && alertLabelData.model.name ? alertLabelData.model.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">PingLastReply</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.pingInfo && alertLabelData.pingInfo.lastUpdate ? utcTimeToTimezoneStr(alertLabelData.pingInfo.lastUpdate) : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Alert</div>
        <div class="alert-label-value">
          <span v-if="alertLabelData" :class="alertLabelData && alertLabelData.alertNum > 0 ? 'danger' : 'success'">{{alertLabelData && alertLabelData.alertNum ? alertLabelData.alertNum : 0 + ' ' + alertActiveStr()}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">DC</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.dc && alertLabelData.dc.name ? alertLabelData.dc.name : '--'}}</div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type==='module'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.id ? alertLabelData.id : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Name</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.name ? alertLabelData.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Project</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.project && alertLabelData.project.name ?alertLabelData.project.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Description</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.remark ? alertLabelData.remark : '-'}}</div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type==='project'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData ? alertLabelData.id : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Name</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData ? alertLabelData.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Description</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.remark ? alertLabelData.remark : '--'}}</div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type==='endpoint'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.id ? alertLabelData.id : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">name</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.name ? alertLabelData.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Project</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.project && alertLabelData.project.name ? alertLabelData.project.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Module</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.module && alertLabelData.module.name ? alertLabelData.module.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Alert</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.alertNum ? alertLabelData.alertNum : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">State</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.state ? alertLabelData.state : '--'}}</div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type==='dc'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.id ? alertLabelData.id : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">name</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.name ? alertLabelData.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Location</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.location && alertLabelData.location ? alertLabelData.location : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Asset num</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.assetNum && alertLabelData.assetNum ? alertLabelData.assetNum: '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Alert</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.alertNum ? alertLabelData.alertNum : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">State</div>
        <div class="alert-label-value">
          <div v-if="alertLabelData" :class="{'green-bg': alertLabelData && alertLabelData.state === 'ON','red-bg': alertLabelData && alertLabelData.state === 'oFF'}" class="active-icon"></div>
          {{alertLabelData && alertLabelData.state ? alertLabelData.state : '--'}}
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'alertLabel',
  props: {
    id: {},
    type: {},
    that: {}
  },
  data () {
    return {
      alertLabelData: null,
      loading: true
    }
  },
  components: {

  },
  watch: {
    id: {
      immediate: true,
      deep: true,
      handler (n) {
        this.init()
      }
    },
    that: {
      immediate: true,
      deep: true,
      handler (n) {
      }
    },
    LRTriangle: {
      immediate: true,
      deep: true,
      handler (n) {

      }
    }
  },
  computed: {
    calcPosition () {
      const self = this
      return function (position) {
        const clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight
        const elHeight = self.type === 'asset' ? 318 : (self.type === 'project' ? 70 : 70)
        if (position.top + elHeight > clientHeight) {
          return {
            left: `${position.left + position.width + 20}px`,
            top: `${position.top - elHeight - 20}px`
          }
        } else {
          return {
            left: `${position.left + position.width + 20}px`,
            top: `${position.top - 20}px`
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
    init () {
      this.loading = true
      if (this.type === 'asset') {
        this.$get('asset/asset/' + this.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }
      if (this.type === 'project') {
        this.$get('monitor/project/' + this.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }
      if (this.type === 'module') {
        this.$get('monitor/module/' + this.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }
      if (this.type === 'endpoint') {
        this.$get('monitor/endpoint/' + this.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }
      if (this.type === 'dc') {
        this.$get('dc/' + this.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }
    },
    alertActiveStr () {
      return this.$t('overall.active')
    },
    alertStateStr (num) {
      if (num == 1) {
        return this.$t('asset.inStock')
      } else {
        return this.$t('asset.notInStock')
      }
    }
  }
}

</script>
