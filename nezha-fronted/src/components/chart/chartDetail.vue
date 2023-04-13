<template>
  <div ref="chartDetail" class="chart-detail">
    <div class="basic-info">
      <div class="basic-info-title">
        <span style="cursor: pointer"><i @click="hideElement" :class="{'nz-icon nz-icon-caret-right': showBasicInfo,'nz-icon nz-icon-caret-bottom': !showBasicInfo}"></i></span>
        <span>{{$t('overall.basicInfo')}}</span>
      </div>
      <el-collapse-transition>
        <!--asset info-->
        <div v-if="!showBasicInfo && chartInfo.type === 'assetInfo'" class="basic-info-table">
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">ID</div>
            <div class="basic-info-table-value">{{chartDetail ? chartDetail.id : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('overall.name')}}</div>
            <div class="basic-info-table-value">{{chartDetail? chartDetail.name : '--' }}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('asset.manageIp')}}</div>
            <div class="basic-info-table-value">{{chartDetail ? chartDetail.manageIp : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('overall.type')}}</div>
            <div class="basic-info-table-value">{{chartDetail.type ? chartDetail.type.name : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('overall.state')}}</div>
            <div class="basic-info-table-value">{{chartDetail.state ? chartDetail.state.name : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">Ping</div>
            <div class="basic-info-table-value">
              <div :class="{'green-bg': chartDetail && chartDetail.pingInfo && chartDetail.pingInfo.status === 1,'red-bg': chartDetail && chartDetail.pingInfo && chartDetail.pingInfo.status === 0}" class="active-icon"></div>
              <span>{{chartDetail && chartDetail.pingInfo && chartDetail.pingInfo.rtt ? chartDetail.pingInfo.rtt + 'ms':''}}</span>
            </div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('overall.dc')}}</div>
            <div class="basic-info-table-value">{{chartDetail.dc ? chartDetail.dc.name : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('asset.cabinet')}}</div>
            <div class="basic-info-table-value">{{chartDetail.cabinet ? chartDetail.cabinet.name : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('asset.brand')}}</div>
            <div class="basic-info-table-value">{{chartDetail.brand ? chartDetail.brand.name : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('asset.model')}}</div>
            <div class="basic-info-table-value">{{chartDetail.model ? chartDetail.model.name : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('overall.labels')}}</div>
            <div class="basic-info-table-value" style="display:flex" v-if="chartDetail.fields.length > 0">
              <div v-for="item in chartDetail.fields" :key="item.id">
                <div class="label-table">
                  <div class="label-table-name">{{item.name}}</div>
                  <span class="label-table-value">{{item.value[0]}}</span>
                </div>
              </div>
            </div>
            <div v-else class="basic-info-table-value">--</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{ $t('overall.alert') }}</div>
            <div class="basic-info-table-value" v-if="chartDetail">
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
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('asset.endpoint')}}</div>
            <div class="basic-info-table-value">
              <i class="nz-icon nz-icon-overview-endpoint monitorColor"></i>&nbsp;
              <span>{{chartDetail ? chartDetail.endpointNum : 0}}</span>
            </div>
          </div>
        </div>
        <!--Endpoint info-->
        <div v-else-if="!showBasicInfo && chartInfo.type === 'endpointInfo'" class="basic-info-table">
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">ID</div>
            <div class="basic-info-table-value">{{chartDetail ? chartDetail.id : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('overall.name')}}</div>
            <div class="basic-info-table-value">{{chartDetail? chartDetail.name : '--' }}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('overall.project')}}</div>
            <div class="basic-info-table-value">{{chartDetail && chartDetail.project ? chartDetail.project.name : '--' }}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('overall.module')}}</div>
            <div class="basic-info-table-value">
              <i style="cursor: pointer" class="nz-icon nz-icon-overview-module monitorColor"/>&nbsp;
              <span>{{chartDetail && chartDetail.module ? chartDetail.module.name : '--'}}</span>
            </div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('overall.asset')}}</div>
            <div class="basic-info-table-value">
              <i class="nz-icon nz-icon-overview-project monitorColor color23BF9A"></i>&nbsp;
              <span>{{chartDetail && chartDetail.asset ? chartDetail.asset.name : '--'}}</span>
            </div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('overall.alert')}}</div>
            <div class="basic-info-table-value" v-if="chartDetail">
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
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('overall.state')}}</div>
            <div class="basic-info-table-value">
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
      </el-collapse-transition>
    </div>
  </div>
</template>

<script>
import bus from '@/libs/bus'
import trendMixin from '../common/alert/trendMixins'

export default {
  name: 'chartDetail',
  props: {
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
      showBasicInfo: false,
      chartDetailList: null
    }
  },
  methods: {
    hideElement () {
      this.showBasicInfo = !this.showBasicInfo
    },
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
          console.log(this.alertDaysData)
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
    }
  }
}
</script>
