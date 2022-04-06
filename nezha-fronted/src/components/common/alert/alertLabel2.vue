<template>
  <div
    ref="alertLabels"
    :class="['alert-labelUp',LRTriangle?'left-triangle':'right-triangle']"
    :style="{top:that.position.top + 'px',
    left:that.position.left ? (that.position.left  + 'px') : 'unset',
    right:that.position.right ? (that.position.right  + 'px') : 'unset',
    '--mt': that.position.mt+'px'
  }">
    <div class="alert-label-info" v-if="type==='asset'" v-my-loading="loading">
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
          <span v-if="alertLabelData">{{alertLabelData && alertLabelData.pingInfo && alertLabelData.pingInfo.rtt ? alertLabelData.pingInfo.rtt + 'ms':'--'}}</span>
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
        <div class="alert-label-value" v-if="alertLabelData">
          <i :class="alertLabelData.alertNum ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert vertical-align-top;"  @mouseenter="tooltipHover('',true, $event)" @mouseleave="tooltipHover('',false, $event)"></i>
          <div v-if="alertNumtooltipShow" class="alert-days-info-tooltip" :style="{left: position.left + 'px',top:position.top + 'px'}">
            <div class="tooltip-title">{{$t('project.topology.alert')}}({{$t('asset.pingActive')}})</div>
            <div class="severity-info" style='justify-content: space-between'>
              <div class="severity-name">{{$t('overall.result.total')}}</div>
              <div class="severity-value">{{alertLabelData.alertNum}}</div>
            </div>
          </div>
          <alertDaysInfo
            v-show="!trendLoading"
            :alertDaysData="alertDaysData"
          />
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Endpoint</div>
        <div class="alert-label-value">
          <i class="nz-icon nz-icon-overview-endpoint monitorColor"></i>&nbsp;
          <span>{{alertLabelData && alertLabelData.endpointNum ? alertLabelData.endpointNum : 0}}</span></div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type==='module'" v-my-loading="loading">
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
        <div class="alert-label-value" v-if="alertLabelData">
          <i :class="alertLabelData.alertNum ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert vertical-align-top;"  @mouseenter="tooltipHover('',true, $event)" @mouseleave="tooltipHover('',false, $event)"></i>
          <div v-if="alertNumtooltipShow" class="alert-days-info-tooltip" :style="{left: position.left + 'px',top:position.top + 'px'}">
            <div class="tooltip-title">{{$t('project.topology.alert')}}({{$t('asset.pingActive')}})</div>
            <div class="severity-info" style='justify-content: space-between'>
              <div class="severity-name">{{$t('overall.result.total')}}</div>
              <div class="severity-value">{{alertLabelData.alertNum}}</div>
            </div>
          </div>
          <alertDaysInfo
            v-show="!trendLoading"
            :alertDaysData="alertDaysData"
          />
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.remark')}}</div>
        <div class="alert-label-value alert-label-remark">{{alertLabelData && alertLabelData.remark ? alertLabelData.remark : '--'}}</div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type==='project'" v-my-loading="loading">
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
          <span>{{alertLabelData && alertLabelData.module && alertLabelData.module.name ? alertLabelData.module.name : '--'}}</span></div>
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
        <div class="alert-label-value" v-if="alertLabelData">
          <i :class="alertLabelData.alertNum ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert vertical-align-top;"  @mouseenter="tooltipHover('',true, $event)" @mouseleave="tooltipHover('',false, $event)"></i>
          <div v-if="alertNumtooltipShow" class="alert-days-info-tooltip" :style="{left: position.left + 'px',top:position.top + 'px'}">
            <div class="tooltip-title">{{$t('project.topology.alert')}}({{$t('asset.pingActive')}})</div>
            <div class="severity-info" style='justify-content: space-between'>
              <div class="severity-name">{{$t('overall.result.total')}}</div>
              <div class="severity-value">{{alertLabelData.alertNum}}</div>
            </div>
          </div>
          <alertDaysInfo
            v-show="!trendLoading"
            :alertDaysData="alertDaysData"
          />
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.remark')}}</div>
        <div class="alert-label-value alert-label-remark">{{alertLabelData && alertLabelData.remark ? alertLabelData.remark : '--'}}</div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type==='endpoint'" v-my-loading="loading">
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
        <div class="alert-label-value" v-if="alertLabelData">
          <i :class="alertLabelData.alertNum ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert vertical-align-top;"  @mouseenter="tooltipHover('',true, $event)" @mouseleave="tooltipHover('',false, $event)"></i>
          <div v-if="alertNumtooltipShow" class="alert-days-info-tooltip" :style="{left: position.left + 'px',top:position.top + 'px'}">
            <div class="tooltip-title">{{$t('project.topology.alert')}}({{$t('asset.pingActive')}})</div>
            <div class="severity-info" style='justify-content: space-between'>
              <div class="severity-name">{{$t('overall.result.total')}}</div>
              <div class="severity-value">{{alertLabelData.alertNum}}</div>
            </div>
          </div>
          <alertDaysInfo
            v-show="!trendLoading"
            :alertDaysData="alertDaysData"
          />
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.state')}}</div>
        <div class="alert-label-value">
           <span style="width: auto">
            <span class="endpoint-cell-left"><i class="nz-icon nz-icon-Metrics colorFA901C" /> {{$t('project.endpoint.metrics')}} </span>
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
            <span class="endpoint-cell-left" style="margin-left: 10px"><i class="nz-icon nz-icon-logs colorFA901C" /> {{$t('project.endpoint.logs')}} </span>
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

    <div class="alert-label-info" v-if="type==='dc'" v-my-loading="loading">
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
        <div class="alert-label-value" v-if="alertLabelData">
          <i :class="alertLabelData.alertNum ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert vertical-align-top;"  @mouseenter="tooltipHover('',true, $event)" @mouseleave="tooltipHover('',false, $event)"></i>
          <div v-if="alertNumtooltipShow" class="alert-days-info-tooltip" :style="{left: position.left + 'px',top:position.top + 'px'}">
            <div class="tooltip-title">{{$t('project.topology.alert')}}({{$t('asset.pingActive')}})</div>
            <div class="severity-info" style='justify-content: space-between'>
              <div class="severity-name">{{$t('overall.result.total')}}</div>
              <div class="severity-value">{{alertLabelData.alertNum}}</div>
            </div>
          </div>
          <alertDaysInfo
            v-show="!trendLoading"
            :alertDaysData="alertDaysData"
          />
        </div>
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
import trendMixin from './trendMixins'
export default {
  name: 'alertLabel',
  mixins: [trendMixin],
  props: {
    id: {},
    type: {},
    that: {},
    LRTriangle: {}
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
  data () {
    return {
      alertLabelData: null,
      loading: true,
      severityDataWeight: this.$store.getters.severityDataWeight,
      alertNumtooltipShow: false,
      position: {
        left: 0,
        top: 0
      },
      alertDaysData: [],
      trendLoading: false,
      trendTimer: null
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
            left: `${position.left + position.width + 120}px`,
            top: `${position.top - elHeight - 20}px`
          }
        } else {
          return {
            left: `${position.left + position.width + 120}px`,
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
      const weekDays = this.getWeeksTime()
      if (this.trendTimer) {
        clearTimeout(this.trendTimer)
        this.trendTimer = null
      }
      this.trendTimer = setTimeout(() => {
        this.trendLoading = true
        const params = {
          type: 'total',
          dimension: 'priority',
          step: 'd'
        }
        params[this.type + 'Id'] = this.id
        this.$get('/stat/alertMessage/trend', params).then((res) => {
          if (!res.data) {
            return
          }
          const alertDaysData = res.data.result ? res.data.result[0].values : []
          const newWeekDays = JSON.parse(JSON.stringify(weekDays))
          alertDaysData.forEach(item => {
            item.values.forEach(time => {
              const findItem = newWeekDays.find(days => days.time == time[0])
              if (findItem) {
                findItem[item.metric.priority] = time[1]
              }
            })
          })
          setTimeout(() => {
            this.alertDaysData = newWeekDays
            this.trendLoading = false
          })
        })
      })
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
