<template>
  <div :class="{'chart-header--float': !chartInfo.param.showHeader}" class="chart-header">
    <span v-if="isError" class="chart-header-error">
     <el-popover
       placement="top-start"
       :close-delay=10
       trigger="hover"
       popper-class="chart-error-popper">
            <div >{{errorText}}</div>
            <span slot="reference" class="panel-info-corner panel-info-corner--error">
              <i class="nz-icon nz-icon-warning fa"></i>
              <span class="panel-info-corner-inner"></span>
           </span>
          </el-popover>
    </span>
    <span v-if="!isError&&!showAllData&&allDataLength>20" class="chart-header-error moreTitle">
     <el-popover
       placement="top-start"
       :close-delay=10
       trigger="hover"
       popper-class="chart-warring-popper">
          <div class="moreTitle">{{$t('dashboard.panel.moreTitle')}}{{$t('dashboard.panel.showAll')}}{{allDataLength}}</div>
          <span slot="reference" class="panel-info-corner panel-info-corner--error"  @click="loadMore">
            <i class="nz-icon nz-icon-warning fa"></i>
            <span class="panel-info-corner-inner"></span>
          </span>
     </el-popover>
    </span>
    <div class="chart-header__title" v-if="!isGroup">{{chartInfo.name}}</div>
    <div class="chart-header__title" v-else >
      <span @click="groupShow"> <i class="nz-icon" :class="chartInfo.param.collapse ? 'nz-icon-arrow-right': 'nz-icon-arrow-down'"></i></span>
      {{chartInfo.name}}
      <span v-show="chartInfo.param.collapse" class="collapse-content">({{chartData.length}} charts)</span>
    </div>
    <div class="chart-header__tools" v-if="chartInfo.type !== 'endpointInfo' && chartInfo.type !== 'assetInfo'">
      <span v-if="chartInfo.param.link" class="chart-header__tool" @click="openUrl">
       <i class="nz-icon nz-icon-more-app tool__icon"></i>
      </span>
      <span v-if="chartInfo.remark" class="chart-header__tool">
        <el-tooltip :content="chartInfo.remark" effect="light" placement="top">
           <i class="nz-icon nz-icon-info-normal tool__icon"></i>
        </el-tooltip>
      </span>
      <span class="chart-header__tool" @click="refreshChart">
        <el-tooltip :content="$t('dashboard.refresh')" effect="light" placement="top">
           <i class="nz-icon nz-icon-replay tool__icon"></i>
        </el-tooltip>
      </span>
      <span v-if="from !== this.$CONSTANTS.fromRoute.chartTemp" class="chart-header__tool" @click="showFullscreen">
        <el-tooltip :content="$t('dashboard.screen')" effect="light" placement="top">
           <i class="nz-icon nz-icon-maxview tool__icon"></i>
        </el-tooltip>
      </span>
      <span class="chart-header__tool">
        <el-dropdown v-clickoutside="clickos" trigger="click">
          <i class="el-icon-more tool__icon" @click.stop="dropdownMenuShow = !dropdownMenuShow"></i>
          <el-dropdown-menu style="display: none"></el-dropdown-menu>
          <ul v-show="dropdownMenuShow" slot="dropdown" class="el-dropdown-menu nz-chart-dropdown">
            <li class="el-dropdown-menu__item" @click="editChart">
              <i class="nz-icon nz-icon-edit" style="font-size: 16px;"></i>
              <span>{{$t('dashboard.edit')}}</span>
            </li>
            <li v-has="'panel_chart_delete'" class="el-dropdown-menu__item" @click="removeChart">
              <i class="nz-icon nz-icon-delete" style="font-size: 16px;"></i>
              <span>{{$t('dashboard.delete')}}</span>
            </li>
            <li v-has="'panel_chart_add'" class="el-dropdown-menu__item" @click="duplicate">
              <i class="el-icon-copy-document" style="font-size: 16px;"></i>
              <span>{{$t('dashboard.duplicate')}}</span>
            </li>
            <li v-if="from !== this.$CONSTANTS.fromRoute.chartTemp && chartInfo.pid" v-has="'panel_chart_edit'" class="el-dropdown-menu__item" @click="$emit('sync')">
              <i class="nz-icon nz-icon-sync" style="font-size: 16px;"></i>
              <span>{{$t('overall.syncChart')}}</span>
            </li>
          </ul>
        </el-dropdown>
      </span>
    </div>
  </div>
</template>

<script>
import chartHeaderMixin from '@/components/chart/chartHeaderMixin'
export default {
  name: 'chartHeader',
  mixins: [chartHeaderMixin],
  methods: {
    openUrl () {
      window.open(this.chartInfo.param.link)
    }
  }
}
</script>
