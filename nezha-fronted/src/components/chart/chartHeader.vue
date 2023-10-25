<template>
  <!-- <div :class="{'chart-header--float': !chartInfo.param.showHeader}" class="chart-header"> -->
  <div :class="{'chart-header--float': chartInfo.param.showHeader===0}" class="chart-header">
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
    <span v-if="isGroup&&hiddenText" class="chart-header-error hiddenTitle">
     <el-popover
       placement="top-start"
       :close-delay=10
       trigger="hover"
       popper-class="chart-hidden-popper">
        <div >{{hiddenText}}</div>
        <span slot="reference" class="panel-info-corner panel-info-corner--error">
          <i class="nz-icon nz-icon-yincang1 fa"></i>
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
          <div class="moreTitle" @click="loadMore">{{$t('dashboard.dashboard.moreTitle')}}{{$t('dashboard.dashboard.showAll')}}{{allDataLength}}</div>
          <span slot="reference" class="panel-info-corner panel-info-corner--error"  @click="loadMore">
            <i class="nz-icon nz-icon-warning fa"></i>
            <span class="panel-info-corner-inner"></span>
          </span>
     </el-popover>
    </span>
    <div class="chart-header__title" v-if="!isGroup" :title="nameFormate">{{nameFormate}}</div>
    <div class="chart-header__title groupTitle" v-else :title="chartData ? chartData.length : 0" style="cursor:pointer" @click="groupShow">
      <span>
        <i class="nz-icon" :class="chartInfo.param.collapse ? 'nz-icon-arrow-right': 'nz-icon-arrow-down'"></i>
      </span>
      {{nameFormate}}
      <span v-show="chartInfo.param.collapse" class="collapse-content">({{chartData ? chartData.length : 0}} charts)</span>
    </div>
    <div class="temp"></div>
    <div class="chart-header__tools" v-if="chartInfo.type !== 'endpointInfo' && chartInfo.type !== 'assetInfo' && showTool">
      <!-- link -->
      <span v-if="chartInfo.param.link" :title="$t('overall.link')" class="chart-header__tool" @click="openUrl">
        <i class="nz-icon nz-icon-more-app tool__icon"></i>
      </span>
      <!-- remark -->
      <span v-if="chartInfo.remark" class="chart-header__tool">
        <el-tooltip :content="chartInfo.remark" effect="light" placement="top">
           <i class="nz-icon nz-icon-info-normal tool__icon"></i>
        </el-tooltip>
      </span>
      <template v-if="from!=='notebook'">
        <!-- group add -->
        <span v-if="chartInfo.type=='group' && !chartInfo.repeatIndex&&from!=='integration' && !isExportHtml" class="chart-header__tool" @click="addChartGroup">
          <i class="nz-icon nz-icon-plus tool__icon" :title="$t('tip.add')"></i>
        </span>
        <!-- refresh -->
        <span v-if="!isExportHtml" class="chart-header__tool" @click="refreshChart">
          <div :title="$t('dashboard.refresh')" effect="light" placement="top">
            <i class="nz-icon nz-icon-replay tool__icon"></i>
          </div>
        </span>
        <!-- screen -->
        <span v-if="chartInfo.type!=='group'" class="chart-header__tool" @click="showFullscreen">
          <div :title="$t('dashboard.screen')" effect="light" placement="top">
            <i class="nz-icon nz-icon-maxview tool__icon"></i>
          </div>
        </span>
        <!-- more -->
        <span class="chart-header__tool" v-if="!chartInfo.repeatIndex && from!=='integration' && !isExportHtml">
          <el-dropdown v-clickoutside="clickos" v-has="['main_edit','main_delete','main_add']" trigger="click">
            <i class="el-icon-more tool__icon" @click.stop="dropdownMenuShow = !dropdownMenuShow" :title="$t('overall.more')"></i>
            <el-dropdown-menu style="display: none" class="temp-dropdown"></el-dropdown-menu>
            <ul v-show="dropdownMenuShow" slot="dropdown" class="el-dropdown-menu nz-chart-dropdown">
              <li class="el-dropdown-menu__item" v-has="'main_edit'" @click="editChart">
                <i class="nz-icon nz-icon-edit" style="font-size: 16px;"></i>
                <span>{{$t('overall.edit')}}</span>
              </li>
              <li v-has="'main_add'" class="el-dropdown-menu__item" @click="duplicate">
                <i class="el-icon-copy-document" style="font-size: 16px;"></i>
                <span>{{$t('overall.duplicate')}}</span>
              </li>
              <li v-has="'main_delete'" class="el-dropdown-menu__item" @click="removeChart">
                <i class="nz-icon nz-icon-delete" style="font-size: 16px;"></i>
                <span>{{$t('overall.delete')}}</span>
              </li>
              <li v-has="'main_add'" class="el-dropdown-menu__item" @click="downloadCSV" v-if="showDownloadCsv(chartInfo.type)">
                <i class="nz-icon nz-icon-download1" style="font-size: 16px;"></i>
                <span>{{$t('overall.downloadCSV')}}</span>
              </li>
              <li v-if="from !== this.$CONSTANTS.fromRoute.chartTemp && chartInfo.pid" v-has="'main_edit'" class="el-dropdown-menu__item" @click="sync">
                <i class="nz-icon nz-icon-sync" style="font-size: 16px;"></i>
                <span>{{$t('overall.syncChart')}}</span>
              </li>
            </ul>
          </el-dropdown>
        </span>
      </template>
      <template v-else-if="notebookEdit">
        <span class="chart-header__tool" @click="editChart">
          <i class="nz-icon nz-icon-edit" style="font-size: 16px;"></i>
        </span>
        <span class="chart-header__tool" @click="duplicate">
          <i class="nz-icon nz-icon-override" style="font-size: 16px;"></i>
        </span>
        <span class="chart-header__tool" @click="removeChart">
          <i class="nz-icon nz-icon-delete" style="font-size: 16px;"></i>
        </span>
      </template>
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
    },
    addChartGroup () {
      this.$store.commit('setGroupId', this.chartInfo.id)
      this.$store.dispatch('dispatchEditChart', {
        chart: '',
        type: 'addGroupItem'
      })
    }
  }
}
</script>
