<template>
  <!-- <div :class="{'chart-header--float': !chartInfo.param.showHeader}" class="chart-screen-header list-page"> -->
  <div class="chart-screen-header list-page">
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
        <div class="moreTitle" @click="loadMore">{{$t('dashboard.dashboard.moreTitle')}}{{$t('dashboard.dashboard.showAll')}}{{allDataLength}}</div>
        <span slot="reference" class="panel-info-corner panel-info-corner--error"  @click="loadMore">
          <i class="nz-icon nz-icon-warning fa"></i>
          <span class="panel-info-corner-inner"></span>
        </span>
     </el-popover>
    </span>
    <div class="chart-header__title" :title="nameFormate">
      <slot name="title-icon"></slot>
      {{nameFormate}}
    </div>
    <div class="chart-header__tools">
      <span v-if="chartInfo.remark" class="chart-header__tool top-tool-btn-group">
        <el-tooltip :content="chartInfo.remark" effect="light" placement="top">
           <i class="nz-icon nz-icon-info-normal tool__icon"></i>
        </el-tooltip>
      </span>
      <span class="chart-header__tool" v-if="showTime(chartInfo.type)">
        <pick-time
          :refresh-data-func="dateChange"
          v-model="searchTime"
          :use-chart-unit="showUnit(from)"
          :showMultiple="showMultiple(chartInfo.type)"
          ref="pickTime"
          style="height: 28px;"
          id="line-chart"
          :sign="chartInfo.id"
          @unitChange="unitChange"
        ></pick-time>
      </span>
      <span class="chart-header__tool" v-if="showSaveBtn(from)">
        <button id="endpoint-query-full-chart-save" v-has="'main_add'" class="nz-btn nz-btn-size-large nz-btn-style-normal" @click="saveChart">{{$t('dashboard.metric.saveChart')}}</button>
      </span>
      <span class="chart-header__tool" @click="closeDialog"  :title="$t('overall.close')">
        <i class="nz-icon nz-icon-close" style="font-size: 16px;"></i>
      </span>
    </div>
  </div>
</template>

<script>
import bus from '@/libs/bus'
import lodash from 'lodash'
import chartHeaderMixin from '@/components/chart/chartHeaderMixin'
export default {
  name: 'ChartScreenHeader',
  mixins: [chartHeaderMixin],
  computed: {
    timeRange () {
      return this.$store.getters.getTimeRange
    },
    fatherNowTimeType () {
      return this.$store.getters.getNowTimeType
    }
  },
  data () {
    return {
      dropdownMenuShow: false,
      errorText: '',
      searchTime: [],
      nowType: {},
      filter: {}
    }
  },
  methods: {
    dateChange () {
      const nowTimeType = this.$refs.pickTime.$refs.timePicker.nowTimeType
      this.setSearchTime(nowTimeType.type, nowTimeType.value, nowTimeType)
      this.filter.start_time = bus.timeFormate(this.searchTime[0])
      this.filter.end_time = bus.timeFormate(this.searchTime[1])
      this.filter.value = this.searchTime[2]
      this.filter.id = this.$refs.pickTime.$refs.timePicker.showTime.id
      setTimeout(() => {
        let multipleTime = this.$refs.pickTime.$refs.multipleTime ? this.$refs.pickTime.$refs.multipleTime.searchTime : ''
        if (this.$refs.pickTime.$refs.multipleTime && !this.$refs.pickTime.$refs.multipleTime.showDropdown) {
          multipleTime = ''
        }
        this.$emit('dateChange', this.filter, multipleTime)
      }, 100)
    },
    closeDialog () {
      this.$emit('close')
    },
    setSearchTime (type, val, nowTimeType) { // 设置searchTime
      if (type === 'minute') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setMinutes(new Date(bus.computeTimezone(new Date().getTime())).getMinutes() - val))
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())))
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'm')
      } else if (type === 'hour') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - val))
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())))
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'h')
      } else if (type === 'date') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setDate(new Date(bus.computeTimezone(new Date().getTime())).getDate() - val))
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())))
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'd')
      }
      this.$refs.pickTime.$refs.timePicker.searchTime = this.searchTime
    },
    showTime (type) {
      switch (type) {
        case 'line' :
        case 'area' :
        case 'point' :
        case 'bar' :
        case 'table' :
        case 'stat' :
        case 'gauge' :
        case 'pie' :
        case 'treemap' :
        case 'log' :
        case 'hexagon' :
        case 'diagram' :
        case 'url':
        case 'clock':
        case 'bubble' :
        case 'rank' :
        case 'sankey' :
        case 'funnel' :
          return true
        default: return false
      }
    },
    showMultiple (type) {
      switch (type) {
        case 'line' :
        case 'area' :
        case 'point' :
          return true
        default: return false
      }
    },
    showUnit (type) {
      switch (type) {
        case 'endpointQuery' :
        case 'recordRulesQuery' :
          return true
        default: return false
      }
    },
    showSaveBtn (type) {
      switch (type) {
        case 'endpointQuery' :
        case 'recordRulesQuery' :
          return true
        default: return false
      }
    },
    saveChart () {
      this.$emit('saveChart')
    }
  },
  watch: {
    timeRange: {
      immediate: true,
      handler (n) {
        this.searchTime = lodash.cloneDeep(n)
      }
    },
    fatherNowTimeType: {
      immediate: true,
      handler (n) {
        this.nowType = lodash.cloneDeep(n)
      }
    }
  },
  mounted () {
    if (this.$refs.pickTime) {
      if (this.$refs.pickTime.$refs.multipleTime) {
        this.$refs.pickTime.$refs.multipleTime.showDropdown = false
      }
      this.searchTime[0] = bus.timeFormate(this.timeRange[0])
      this.searchTime[1] = bus.timeFormate(this.timeRange[1])
      this.nowType.start_time = this.searchTime[0]
      this.nowType.end_time = this.searchTime[1]
      this.$refs.pickTime.$refs.timePicker.setCustomTime(this.nowType)
      this.setSearchTime(this.nowType.type, this.nowType.value, this.nowType)
    }
  }
}
</script>
