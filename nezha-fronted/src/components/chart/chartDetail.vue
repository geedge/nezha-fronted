<template>
  <div ref="chartDetail" class="chart-detail">
    <div class="basic-info">
      <div class="basic-info-title">
        <span style="cursor: pointer"><i @click="hideElement" :class="{'nz-icon nz-icon-caret-right': showBasicInfo,'nz-icon nz-icon-caret-bottom': !showBasicInfo}"></i></span>
        <span>Basic info</span>
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
            <div class="basic-info-table-title">{{$t('overall.manageIp')}}</div>
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
            <div class="basic-info-table-title">{{$t('overall.cabinet')}}</div>
            <div class="basic-info-table-value">{{chartDetail.cabinet ? chartDetail.cabinet.name : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('overall.brand')}}</div>
            <div class="basic-info-table-value">{{chartDetail.brand ? chartDetail.brand.name : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('overall.model')}}</div>
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
            <div class="basic-info-table-title">{{ $t('asset') }}</div>
            <div class="basic-info-table-value">
              <i :class="chartDetail && chartDetail.alertNum > 0 ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i>&nbsp;
              <span>{{chartDetail ? chartDetail.alertNum : 0}}</span>
            </div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">Endpoint</div>
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
              <span>{{chartDetail.module && chartDetail.module ? chartDetail.module.name : '--'}}</span>
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
            <div class="basic-info-table-value">
              <i :class="chartDetail && chartDetail.alertNum > 0 ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i>&nbsp;
              <span>{{chartDetail && chartDetail.alertNum ? chartDetail.alertNum : 0}}</span>
            </div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('overall.state')}}</div>
            <div class="basic-info-table-value">
              <span style="width: auto">
              <span class="endpoint-cell-left"><i class="nz-icon nz-icon-Metrics active" /> {{$t('project.endpoint.metrics')}} </span>
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
                <span class="endpoint-cell-left" style="margin-left: 10px"><i class="nz-icon nz-icon-logs active" /> {{$t('project.endpoint.logs')}} </span>
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

export default {
  name: 'chartDetail',
  props: {
    chartDetail: Object,
    chartInfo: Object
  },
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
    }
  },
  data () {
    return {
      showBasicInfo: false
    }
  },
  methods: {
    hideElement () {
      this.showBasicInfo = !this.showBasicInfo
    }
  }
}
</script>
