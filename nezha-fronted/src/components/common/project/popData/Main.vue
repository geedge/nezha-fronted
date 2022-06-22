<template>
  <div class="main-content">
    <div class="main-box">
      <div class="main-box-title">{{$t("asset.asset")}}</div>
      <div class="main-box-content">
        <div class="tooltip--row">
          <div class="legend-value">
            <div>{{moduleInfo.assetStat.up}}</div>
            <div>{{moduleInfo.assetStat.down}}</div>
          </div>
          <div class="tooltip-chart" id="chart--asset"></div>
        </div>
      </div>
    </div>

    <div class="main-box">
      <div class="main-box-title">{{$t("project.endpoint.endpoint")}}</div>
      <div class="main-box-content">
        <div class="tooltip--row">
          <div class="legend-value">
            <div>{{moduleInfo.endpointStat.up}}</div>
            <div>{{moduleInfo.endpointStat.down}}</div>
            <div>{{moduleInfo.endpointStat.suspended}}</div>
          </div>
          <div class="tooltip-chart" id="chart--endpoint"></div>
        </div>
        <!--<div class="content-box">
          <span class="content-title"><i class="nz-icon nz-icon-arrow-up2 colorFFF bg23BF9A"></i>up</span>
          <span class="float-right">{{moduleInfo.endpointStat.up}}</span>
        </div>
        <div class="content-box">
          <span class="content-title"><i class="nz-icon nz-icon-arrow-down1 colorFFF bgEC7F66"></i>down</span>
          <span class="float-right">{{moduleInfo.endpointStat.down}}</span>
        </div>-->
      </div>
    </div>

    <div class="main-box">
      <div class="main-box-title">Alert messages</div>
      <div class="main-box-content">
        <div class="tooltip-alert--row">
          <div class="row--label row--label__p1">P1</div><div class="row--value row--value__p1">{{moduleInfo.alertStat.P1}}</div>
        </div>
        <div class="tooltip-alert--row">
          <div class="row--label row--label__p2">P2</div><div class="row--value row--value__p2">{{moduleInfo.alertStat.P2}}</div>
        </div>
        <div class="tooltip-alert--row">
          <div class="row--label row--label__p3">P3</div><div class="row--value row--value__p3">{{moduleInfo.alertStat.P3}}</div>
        </div>
        <!--<div class="content-box">
          <span class="content-title"><i class="nz-icon nz-icon-jiantou-top colorFFF bg23BF9A"></i>P1</span>
          <span class="float-right">{{moduleInfo.alertStat.P1}}</span>
        </div>
        <div class="content-box">
          <span class="content-title"><i class="nz-icon nz-icon-jiantou-right colorFFF bg3C92F1"></i>P2</span>
          <span class="float-right">{{moduleInfo.alertStat.P2}}</span>
        </div>
        <div class="content-box">
          <span class="content-title"><i class="nz-icon nz-icon-jiantou-down colorFFF bgEC7F66"></i>P3</span>
          <span class="float-right">{{moduleInfo.alertStat.P3}}</span>
        </div>-->
      </div>
    </div>
  </div>
</template>

<script>
import chartConfig from '../../../page/dashboard/overview/chartConfig'
import * as echarts from 'echarts'

let endpointChart
let assetChart
export default {
  name: 'popDataMain',
  props: {
    moduleId: {},
    projectId: {}
  },
  watch: {
    moduleId (n) {
      if (n) {
        this.init()
      }
    }
  },
  data () {
    return {
      moduleInfo: {
        alertStat: {
          P1: 0,
          P3: 0,
          P2: 0
        },
        assetStat: {
          down: 0,
          up: 0
        },
        endpointStat: {
          down: 0,
          up: 0
        }
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.$get('/module/stat', { id: this.moduleId }).then(res => {
        this.moduleInfo = res.data
        endpointChart = echarts.init(document.querySelector('#chart--endpoint'))
        assetChart = echarts.init(document.querySelector('#chart--asset'))
        const endpointOption = chartConfig.getOption('topoPie')
        const assetOption = chartConfig.getOption('topoPie')
        endpointOption.series[0].label.formatter = this.moduleInfo.endpointStat.down + this.moduleInfo.endpointStat.up + ''
        endpointOption.series[0].data = [
          { name: this.$t('config.agent.up'), value: this.moduleInfo.endpointStat.up ? this.moduleInfo.endpointStat.up : 0 },
          { name: this.$t('asset.down'), value: this.moduleInfo.endpointStat.down ? this.moduleInfo.endpointStat.down : 0 },
          { name: this.$t('asset.suspended'), value: this.moduleInfo.endpointStat.suspended ? this.moduleInfo.endpointStat.suspended : 0 }
        ]
        endpointOption.title.show = false
        endpointOption.legend.data = [this.$t('config.agent.up'), this.$t('asset.down'), this.$t('asset.suspended')]
        assetOption.series[0].label.formatter = this.moduleInfo.assetStat.up + this.moduleInfo.assetStat.down + ''
        assetOption.series[0].data = [
          { name: this.$t('config.agent.up'), value: this.moduleInfo.assetStat.up ? this.moduleInfo.assetStat.up : 0 },
          { name: this.$t('asset.down'), value: this.moduleInfo.assetStat.down ? this.moduleInfo.assetStat.down : 0 }
        ]
        assetOption.title.show = false
        assetOption.legend.data = [this.$t('config.agent.up'), this.$t('asset.down')]
        endpointChart.setOption(endpointOption, true)
        assetChart.setOption(assetOption, true)
      })
    }
  }
}
</script>
