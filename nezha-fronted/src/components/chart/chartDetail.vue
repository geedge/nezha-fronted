<template>
    <div class="chart-detail-new">
    <div class="asset-info">
      <el-collapse v-model="showBasicInfo">
        <el-collapse-item name="1">
          <template slot="title">
            <div class="asset-info-collapse">
              <i class="nz-icon nz-icon-basic-info"></i>
              <span>{{$t('asset.information')}}</span>
            </div>
          </template>
          <!-- assetInfo -->
          <template v-if="chartInfo.type === 'assetInfo'">
            <div class="asset-info-list">
              <div class="asset-info-row">
                <div class="asset-info-title">ID</div>
                <div class="asset-info-value">{{chartDetail ? chartDetail.id : '--'}}</div>
              </div>
              <div class="asset-info-row">
                <div class="asset-info-title">{{$t('overall.name')}}</div>
                <div class="asset-info-value">{{chartDetail? chartDetail.name : '--' }}</div>
              </div>
              <div class="asset-info-row">
                <div class="asset-info-title">{{$t('asset.manageIp')}}</div>
                <div class="asset-info-value">{{chartDetail ? chartDetail.manageIp : '--'}}</div>
              </div>
              <div class="asset-info-row">
                <div class="asset-info-title">{{$t('overall.type')}}</div>
                <div class="asset-info-value">{{chartDetail.type ? chartDetail.type.name : '--'}}</div>
              </div>
              <div class="asset-info-row">
                <div class="asset-info-title">{{$t('overall.state')}}</div>
                <div class="asset-info-value">{{chartDetail.state ? chartDetail.state.name : '--'}}</div>
              </div>
              <div class="asset-info-row">
                <div class="asset-info-title">Ping</div>
                <div class="asset-info-value">
                  <div :class="{'green-bg': chartDetail && chartDetail.pingInfo && chartDetail.pingInfo.status === 1,'red-bg': chartDetail && chartDetail.pingInfo && chartDetail.pingInfo.status === 0}" class="active-icon"></div>
                  <span>{{chartDetail && chartDetail.pingInfo && chartDetail.pingInfo.rtt ? chartDetail.pingInfo.rtt + 'ms':''}}</span>
                </div>
              </div>
              <div class="asset-info-row">
                <div class="asset-info-title">{{$t('overall.dc')}}</div>
                <div class="asset-info-value">{{chartDetail.dc ? chartDetail.dc.name : '--'}}</div>
              </div>
              <div class="asset-info-row">
                <div class="asset-info-title">{{$t('asset.cabinet')}}</div>
                <div class="asset-info-value">{{chartDetail.cabinet ? chartDetail.cabinet.name : '--'}}</div>
              </div>
              <div class="asset-info-row">
                <div class="asset-info-title">{{$t('asset.brand')}}</div>
                <div class="asset-info-value">{{chartDetail.brand ? chartDetail.brand.name : '--'}}</div>
              </div>
              <div class="asset-info-row">
                <div class="asset-info-title">{{$t('asset.model')}}</div>
                <div class="asset-info-value">{{chartDetail.model ? chartDetail.model.name : '--'}}</div>
              </div>
              <div class="asset-info-row" v-if="chartDetail.fields.length > 0">
                <div class="asset-info-title">{{$t('overall.labels')}}</div>
                <div class="asset-info-value" style="display:flex">
                  <div v-for="item in chartDetail.fields" :key="item.id">
                    <div class="label-table">
                      <div class="label-table-name">{{item.name}}</div>
                      <span class="label-table-value">{{item.value[0]}}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="asset-info-row">
                <div class="asset-info-title">{{ $t('overall.alert') }}</div>
                <div class="asset-info-value" v-if="chartDetail">
                  <i :class="chartDetail.alertNum ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert vertical-align-top;"  @mouseenter="tooltipHover('',true, $event)" @mouseleave="tooltipHover('',false, $event)"></i>
                  <div v-if="alertNumtooltipShow" class="alert-days-info-tooltip" :style="{left: position.left + 'px',top:position.top + 'px'}">
                    <div class="tooltip-title">{{$t('project.topology.alert')}}({{$t('overall.active')}})</div>
                    <div class="severity-info" style='justify-content: space-between'>
                      <div class="severity-name">{{$t('overall.result.total')}}</div>
                      <div class="severity-value">{{chartDetail.alertNum}}</div>
                    </div>
                  </div>
                  <alertDaysInfo v-show="!trendLoading" :alertDaysData="alertDaysData"/>
                </div>
              </div>
              <div class="asset-info-row">
                <div class="asset-info-title">{{$t('asset.endpoint')}}</div>
                <div class="asset-info-value">
                  <i class="nz-icon nz-icon-overview-endpoint monitorColor"></i>&nbsp;
                  <span>{{chartDetail ? chartDetail.endpointNum : 0}}</span>
                </div>
              </div>
            </div>
          </template>
          <!-- endpointInfo -->
          <template v-if="chartInfo.type === 'endpointInfo'">
            <div class="asset-info-list">
              <div class="asset-info-row">
                <div class="asset-info-title">ID</div>
                <div class="asset-info-value">{{chartDetail ? chartDetail.id : '--'}}</div>
              </div>
              <div class="asset-info-row">
                <div class="asset-info-title">{{$t('overall.name')}}</div>
                <div class="asset-info-value">{{chartDetail? chartDetail.name : '--' }}</div>
              </div>
              <div class="asset-info-row">
                <div class="asset-info-title">{{$t('overall.project')}}</div>
                <div class="asset-info-value">{{chartDetail && chartDetail.project ? chartDetail.project.name : '--' }}</div>
              </div>
              <div class="asset-info-row">
                <div class="asset-info-title">{{$t('overall.module')}}</div>
                <div class="asset-info-value">
                  <i class="nz-icon nz-icon-overview-module monitorColor"/>&nbsp;
                  <span>{{chartDetail && chartDetail.module ? chartDetail.module.name : '--'}}</span>
                </div>
              </div>
              <div class="asset-info-row">
                <div class="asset-info-title">{{$t('overall.asset')}}</div>
                <div class="asset-info-value">
                  <i class="nz-icon nz-icon-overview-project monitorColor color23BF9A"></i>&nbsp;
                  <span>{{chartDetail && chartDetail.asset ? chartDetail.asset.name : '--'}}</span>
                </div>
              </div>
              <div class="asset-info-row">
                <div class="asset-info-title">{{$t('overall.alert')}}</div>
                <div class="asset-info-value" v-if="chartDetail">
                  <i :class="chartDetail.alertNum ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert vertical-align-top;"  @mouseenter="tooltipHover('',true, $event)" @mouseleave="tooltipHover('',false, $event)"></i>
                  <div v-if="alertNumtooltipShow" class="alert-days-info-tooltip" :style="{left: position.left + 'px',top:position.top + 'px'}">
                    <div class="tooltip-title">{{$t('project.topology.alert')}}({{$t('overall.active')}})</div>
                    <div class="severity-info" style='justify-content: space-between'>
                      <div class="severity-name">{{$t('overall.result.total')}}</div>
                      <div class="severity-value">{{chartDetail.alertNum}}</div>
                    </div>
                  </div>
                  <alertDaysInfo v-show="!trendLoading" :alertDaysData="alertDaysData"/>
                </div>
              </div>
              <div class="asset-info-row">
                <div class="asset-info-title">{{$t('overall.state')}}</div>
                <div class="asset-info-value">
                  <span style="width: auto">
                  <span class="endpoint-cell-left"><i class="nz-icon nz-icon-Metrics active" /> {{$t('overall.metric')}} </span>
                  <span v-if="chartDetail && chartDetail.configs[0].state === 0">
                    <span class="active-icon red-bg inline-block"></span>
                  </span>
                  <span v-else-if="chartDetail && chartDetail.configs[0].state === 1">
                    <span class="active-icon green-bg inline-block"></span>
                  </span>
                  <span v-else-if="chartDetail && chartDetail.configs[0].state">
                    <span class="active-icon gray-bg inline-block"></span>
                  </span>
                </span>
                  <span style="width: auto">
                    <span class="endpoint-cell-left" style="margin-left: 10px"><i class="nz-icon nz-icon-logs active" /> {{$t('overall.logs')}} </span>
                    <span v-if="chartDetail && chartDetail.configs[1].state === 0">
                      <span class="active-icon red-bg inline-block"></span>
                    </span>
                    <span v-else-if="chartDetail && chartDetail.configs[1].state === 1">
                      <span class="active-icon green-bg inline-block"></span>
                    </span>
                    <span v-else-if="chartDetail && chartDetail.configs[1].state">
                      <span class="active-icon gray-bg inline-block"></span>
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </template>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import bus from '@/libs/bus'
import trendMixin from '../common/alert/trendMixins'

export default {
  name: 'chartDetail',
  props: {
    from: String,
    chartDetail: Object,
    chartInfo: Object
  },
  mixins: [trendMixin],
  watch: {
    chartDetail: {
      immediate: true,
      deep: true,
      handler (n) {
        if (n.fields) {
          n.fields.forEach(e => {
            if (e.name === 'time') {
              e.value[0] = bus.timeFormate(e.value[0], this.timeFormatMain)
            } else if (e.name === 'tetsDATETIme') {
              e.value[0] = bus.timeFormate(e.value[0], this.timeFormatMain)
            } else if (e.name == 'Production date') {
              e.value[0] = bus.timeFormate(e.value[0], this.timeFormatMain)
            }
          })
        }
      }
    },
    'chartDetail.id': {
      immediate: true,
      deep: true,
      handler (n) {
        this.init()
      }
    }
  },
  data () {
    return {
      showBasicInfo: '1',
      chartDetailList: null
    }
  },
  methods: {
    init () {
      if (window.dataJson) {
        this.severityDataWeight = JSON.parse(localStorage.getItem('nz-severityData'))
        const weekDays = this.getWeeksTime()
        const res = this.chartDetail.alertMessageTrend
        if (!res.result) {
          return
        }
        const alertDaysData = res.result ? res.result[0].values : []
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
        return
      }
      this.loading = true
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
        const newWeekDays = JSON.parse(JSON.stringify(weekDays))
        // dashboardTemp示例数据不请求接口
        if (this.from !== 'dashboardTemp') {
          if (this.chartInfo.type === 'assetInfo') {
            params.assetId = this.chartDetail.id
          } else if (this.chartInfo.type === 'endpointInfo') {
            params.endpointId = this.chartDetail.id
          }
          this.$get('/stat/alertMessage/trend', params).then((res) => {
            if (!res.data) {
              return
            }
            const alertDaysData = res.data.result ? res.data.result[0].values : []
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
        } else {
          setTimeout(() => {
            this.alertDaysData = newWeekDays
            this.trendLoading = false
          })
        }
      })
    }
  }
}
</script>
