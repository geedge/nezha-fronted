<template>
  <div :class="calcHeight(that.position,that)" :style="calcPosition(that.position,that)" class="alert-label__border" ref="alertLabels">
    <div class="alert-label-info" v-if="type==='asset'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.id ? alertLabelData.id : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.name')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.name ? alertLabelData.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.manageIp')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.manageIp ? alertLabelData.manageIp : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.type')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.type && alertLabelData.type.name ? alertLabelData.type.name:'--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.state')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.state && alertLabelData.state.name ? alertLabelData.state.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Ping</div>
        <div class="alert-label-value">
          <div v-if="alertLabelData" :class="{'green-bg': alertLabelData && alertLabelData.pingInfo && alertLabelData.pingInfo.status === 1,'red-bg': alertLabelData && alertLabelData.pingInfo && alertLabelData.pingInfo.status === 0}" class="active-icon"></div>
          <span v-if="alertLabelData">{{alertLabelData && alertLabelData.pingInfo && alertLabelData.pingInfo.rtt ? alertLabelData.pingInfo.rtt + 'ms':''}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.dc')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.dc && alertLabelData.dc.name ? alertLabelData.dc.name:'--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.cabinet')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.cabinet && alertLabelData.cabinet.name ? alertLabelData.cabinet.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.brand')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.brand && alertLabelData.brand.name ? alertLabelData.brand.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.model')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.model && alertLabelData.model.name ? alertLabelData.model.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.alert')}}</div>
        <div class="alert-label-value">
          <i v-if="alertLabelData" :class="alertLabelData && alertLabelData.alertNum > 0 ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i>&nbsp;
          <span>{{alertLabelData && alertLabelData.alertNum ? alertLabelData.alertNum : 0}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Endpoint</div>
        <div class="alert-label-value">
          <i class="nz-icon nz-icon-overview-endpoint monitorColor"></i>&nbsp;
          <span>{{alertLabelData && alertLabelData.endpointNum ? alertLabelData.endpointNum : 0}}</span></div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type==='module'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.id ? alertLabelData.id : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.name')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.name ? alertLabelData.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.project')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.project && alertLabelData.project.name ?alertLabelData.project.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Endpoint</div>
        <div class="alert-label-value">
          <i class="nz-icon nz-icon-overview-endpoint monitorColor"></i>&nbsp;
          <span>{{alertLabelData && alertLabelData.endpointNum ? alertLabelData.endpointNum : 0}}</span></div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.asset')}}</div>
        <div class="alert-label-value">
          <i class="nz-icon nz-icon-overview-project monitorColor color23BF9A"/>&nbsp;
          <span>{{alertLabelData && alertLabelData.assetNum ? alertLabelData.assetNum: 0}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.alert')}}</div>
        <div class="alert-label-value">
          <i v-if="alertLabelData" :class="alertLabelData && alertLabelData.alertNum > 0 ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i>&nbsp;
          <span>{{alertLabelData && alertLabelData.alertNum ? alertLabelData.alertNum : 0}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.remark')}}</div>
        <div class="alert-label-value alert-label-remark">{{alertLabelData && alertLabelData.remark ? alertLabelData.remark : '--'}}</div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type==='project'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData ? alertLabelData.id : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.name')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData ? alertLabelData.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.module')}}</div>
        <div class="alert-label-value">
          <i style="cursor: pointer" class="nz-icon nz-icon-overview-module monitorColor"/>&nbsp;
          <span>{{alertLabelData && alertLabelData.moduleNum  ? alertLabelData.moduleNum : '--'}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Endpoint</div>
        <div class="alert-label-value">
          <i class="nz-icon nz-icon-overview-endpoint monitorColor"></i>&nbsp;
          <span>{{alertLabelData && alertLabelData.endpointNum ? alertLabelData.endpointNum : 0}}</span></div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.asset')}}</div>
        <div class="alert-label-value">
          <i class="nz-icon nz-icon-overview-project monitorColor color23BF9A"/>
          <span>{{alertLabelData && alertLabelData.assetNum ? alertLabelData.assetNum: 0}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.alert')}}</div>
        <div class="alert-label-value">
          <i v-if="alertLabelData" :class="alertLabelData && alertLabelData.alertNum > 0 ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i>&nbsp;
          <span>{{alertLabelData && alertLabelData.alertNum ? alertLabelData.alertNum : 0}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.remark')}}</div>
        <div class="alert-label-value alert-label-remark">{{alertLabelData && alertLabelData.remark ? alertLabelData.remark : '--'}}</div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type==='endpoint'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.id ? alertLabelData.id : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.name')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.name ? alertLabelData.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.project')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.project && alertLabelData.project.name ? alertLabelData.project.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.module')}}</div>
        <div class="alert-label-value">
          <i style="cursor: pointer" class="nz-icon nz-icon-overview-module monitorColor"/>&nbsp;
          <span>{{alertLabelData && alertLabelData.module && alertLabelData.module.name ? alertLabelData.module.name : '--'}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.asset')}}</div>
        <div class="alert-label-value">
          <i class="nz-icon nz-icon-overview-project monitorColor color23BF9A"></i>&nbsp;
          <span>{{alertLabelData && alertLabelData.asset.name ? alertLabelData.asset.name : '--'}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.alert')}}</div>
        <div class="alert-label-value">
          <i v-if="alertLabelData" :class="alertLabelData && alertLabelData.alertNum > 0 ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i>&nbsp;
          <span>{{alertLabelData && alertLabelData.alertNum ? alertLabelData.alertNum : 0}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.state')}}</div>
        <div class="alert-label-value">
           <span style="width: auto">
            <span class="endpoint-cell-left"><i class="nz-icon nz-icon-Metrics active" /> {{$t('project.endpoint.metrics')}} </span>
            <span v-if="alertLabelData && alertLabelData.configs[0].state === 0">
              <span class="active-icon red-bg inline-block"></span>
            </span>
            <span v-else-if="alertLabelData && alertLabelData.configs[0].state === 1">
              <span class="active-icon green-bg inline-block"></span>
            </span>
            <span v-else-if="alertLabelData && alertLabelData.configs[0].state">
              <span class="active-icon gray-bg inline-block"></span>
            </span>
          </span>
          <span style="width: auto">
            <span class="endpoint-cell-left" style="margin-left: 10px"><i class="nz-icon nz-icon-logs active" /> {{$t('project.endpoint.logs')}} </span>
            <span v-if="alertLabelData && alertLabelData.configs[1].state === 0">
              <span class="active-icon red-bg inline-block"></span>
            </span>
            <span v-else-if="alertLabelData && alertLabelData.configs[1].state === 1">
              <span class="active-icon green-bg inline-block"></span>
            </span>
            <span v-else-if="alertLabelData && alertLabelData.configs[1].state">
              <span class="active-icon gray-bg inline-block"></span>
            </span>
          </span>
        </div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type==='dc'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.id ? alertLabelData.id : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.name')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.name ? alertLabelData.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.location')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.location && alertLabelData.location ? alertLabelData.location : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.cabinet')}}</div>
        <div class="alert-label-value">
          <i v-if="alertLabelData" class="nz-icon nz-icon-cabinet monitorColor" :class="alertLabelData && alertLabelData.cabinetNum> 0 ? 'color23BF9A' : 'colorEF7458'"/>&nbsp;
          <span>{{alertLabelData && alertLabelData.cabinetNum ? alertLabelData.cabinetNum : 0}}</span></div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.asset')}}</div>
        <div class="alert-label-value">
          <i class="nz-icon nz-icon-overview-project monitorColor color23BF9A"/>&nbsp;
          <span>{{alertLabelData && alertLabelData.assetNum && alertLabelData.assetNum ? alertLabelData.assetNum: 0}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.alert')}}</div>
        <div class="alert-label-value">
          <i v-if="alertLabelData" :class="alertLabelData && alertLabelData.alertNum > 0 ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i>&nbsp;
          <span>{{alertLabelData && alertLabelData.alertNum ? alertLabelData.alertNum : 0}}</span></div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.state')}}</div>
        <div class="alert-label-value" style="margin-left: 3px">
          <div v-if="alertLabelData" :class="{'green-bg': alertLabelData && alertLabelData.state === 'ON','red-bg': alertLabelData && alertLabelData.state === 'OFF'}" class="active-icon"></div>
          <span v-if="alertLabelData && alertLabelData.state === 'ON'">{{ $t('overall.enabled') }}</span>
          <span v-if="alertLabelData && alertLabelData.state === 'OFF'">{{ $t('overall.disabled') }}</span>
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
      return function (position) {
        const clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight
        const leftOffSetView = this.detailList ? -80 : 10
        const leftOffSet = this.detailList ? -80 : 10
        const topOffSet = this.detailList ? 60 : 22
        if (position.top > clientHeight / 2) {
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
  },
  mounted () {
    this.heightList = this.$refs.alertLabels.getBoundingClientRect().height
  },
  beforeDestroy () {

  }
}

</script>
