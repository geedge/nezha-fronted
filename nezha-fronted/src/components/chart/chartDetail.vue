<template>
  <div ref="chartDetail" class="chart-detail">
    <div class="chart-detail-title" v-if="chartInfo.type === 'assetInfo'">{{$t('panel.assetInfo')}}</div>
    <div class="chart-detail-title" v-else>{{$t('panel.endpointInfo')}}</div>
    <div class="basic-info">
      <div class="basic-info-title" @click="hideElement">
        <span><i :class="{'nz-icon nz-icon-caret-right': showBasicInfo,'nz-icon nz-icon-caret-bottom': !showBasicInfo}"></i></span>
        <span>{{$t('panel.basicInfo')}}</span>
      </div>
      <el-collapse-transition>
        <div v-if="!showBasicInfo && chartInfo.type === 'assetInfo'" class="basic-info-table">
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('panel.asset.id')}}</div>
            <div class="basic-info-table-value">{{chartDetail ? chartDetail.id : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('panel.asset.name')}}</div>
            <div class="basic-info-table-value">{{chartDetail? chartDetail.name : '--' }}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('panel.asset.manageIp')}}</div>
            <div class="basic-info-table-value">{{chartDetail ? chartDetail.manageIp : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('panel.asset.type')}}</div>
            <div class="basic-info-table-value">{{chartDetail.type ? chartDetail.type.name : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('panel.asset.state')}}</div>
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
            <div class="basic-info-table-title">{{$t('panel.asset.dc')}}</div>
            <div class="basic-info-table-value">{{chartDetail.dc ? chartDetail.dc.name : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('panel.asset.cabinet')}}</div>
            <div class="basic-info-table-value">{{chartDetail.cabinet ? chartDetail.cabinet.name : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('panel.asset.brand')}}</div>
            <div class="basic-info-table-value">{{chartDetail.brand ? chartDetail.brand.name : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('panel.asset.model')}}</div>
            <div class="basic-info-table-value">{{chartDetail.model ? chartDetail.model.name : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('panel.asset.label')}}</div>
            <div class="basic-info-table-value" style="display:flex">
              <div v-for="item in chartDetail.fields" :key="item.id">
                <div class="label-table">
                  <div class="label-table-name">{{item.name}}</div>
                  <span class="label-table-value">{{item.value[0]}}</span>
                </div>
              </div>
            </div>
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
        <div v-else class="basic-info-table">
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('panel.asset.id')}}</div>
            <div class="basic-info-table-value">{{chartDetail ? chartDetail.id : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('panel.asset.name')}}</div>
            <div class="basic-info-table-value">{{chartDetail? chartDetail.name : '--' }}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('panel.asset.manageIp')}}</div>
            <div class="basic-info-table-value">{{chartDetail ? chartDetail.manageIp : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('panel.asset.type')}}</div>
            <div class="basic-info-table-value">{{chartDetail.type ? chartDetail.type.name : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('panel.asset.state')}}</div>
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
            <div class="basic-info-table-title">{{$t('panel.asset.dc')}}</div>
            <div class="basic-info-table-value">{{chartDetail.dc ? chartDetail.dc.name : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('panel.asset.cabinet')}}</div>
            <div class="basic-info-table-value">{{chartDetail.cabinet ? chartDetail.cabinet.name : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('panel.asset.brand')}}</div>
            <div class="basic-info-table-value">{{chartDetail.brand ? chartDetail.brand.name : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('panel.asset.model')}}</div>
            <div class="basic-info-table-value">{{chartDetail.model ? chartDetail.model.name : '--'}}</div>
          </div>
          <div class="basic-info-table-list">
            <div class="basic-info-table-title">{{$t('panel.asset.label')}}</div>
            <div class="basic-info-table-value" style="display:flex">
              <div v-for="item in chartDetail.fields" :key="item.id">
                <div class="label-table">
                  <div class="label-table-name">{{item.name}}</div>
                  <span class="label-table-value">{{item.value[0]}}</span>
                </div>
              </div>
            </div>
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
      </el-collapse-transition>
    </div>
  </div>
</template>

<script>
export default {
  name: 'chartDetail',
  props: {
    chartDetail: Object,
    chartInfo: Object
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
