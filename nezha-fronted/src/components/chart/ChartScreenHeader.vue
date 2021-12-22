<template>
  <div :class="{'chart-header--float': !chartInfo.param.showHeader}" class="chart-screen-header">
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
    <div class="chart-header__title">{{chartInfo.name}}</div>
    <div class="chart-header__tools">
      <span v-if="chartInfo.remark" class="chart-header__tool">
        <el-tooltip :content="chartInfo.remark" effect="light" placement="top">
           <i class="nz-icon nz-icon-info-normal tool__icon"></i>
        </el-tooltip>
      </span>
      <span class="chart-header__tool">
        <pick-time :refresh-data-func="dateChange" v-model="searchTime" :use-chart-unit="false" :showMultiple="true" ref="pickTime" style="height: 28px;" id="line-chart"></pick-time>
      </span>
      <span class="chart-header__tool" @click="closeDialog">
        <i class="nz-icon nz-icon-close" style="font-size: 16px;"></i>
      </span>
    </div>
  </div>
</template>

<script>
import bus from '@/libs/bus'
import lodash from 'lodash'
export default {
  name: 'ChartScreenHeader',
  props: {
    chartInfo: Object,
    from: String,
    isGroup: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    isError: {
      type: Boolean,
      default: false
    },
    chartData: {}
  },
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
      this.filter.start_time = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss')
      this.filter.end_time = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss')
      this.filter.value = this.searchTime[2]
      this.filter.id = this.$refs.pickTime.$refs.timePicker.showTime.id
      this.$emit('dateChange', this.filter)
    },
    closeDialog () {
      this.$emit('close')
    },
    setSearchTime (type, val, nowTimeType) { // 设置searchTime
      if (type === 'minute') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setMinutes(new Date(bus.computeTimezone(new Date().getTime())).getMinutes() - val), 'yyyy-MM-dd hh:mm:ss')
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())), 'yyyy-MM-dd hh:mm:ss')
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'm')
      } else if (type === 'hour') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - val), 'yyyy-MM-dd hh:mm:ss')
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())), 'yyyy-MM-dd hh:mm:ss')
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'h')
      } else if (type === 'date') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setDate(new Date(bus.computeTimezone(new Date().getTime())).getDate() - val), 'yyyy-MM-dd hh:mm:ss')
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())), 'yyyy-MM-dd hh:mm:ss')
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'd')
      }
      this.$refs.pickTime.$refs.timePicker.searchTime = this.searchTime
    }
  },
  watch: {
    isError: {
      immediate: true,
      handler (n) {
        if (n) {
          this.errorText = this.chartData.filter(item => item.error).map(item => item.error).join('\n')
        }
      }
    },
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
      this.$refs.pickTime.$refs.multipleTime.showDropdown = false
      this.$refs.pickTime.$refs.timePicker.setCustomTime(this.nowType)
    }
  }
}
</script>
