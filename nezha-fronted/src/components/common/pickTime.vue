<template>
  <div class="interval-refresh margin-r-10" style="position: relative">
    <time-picker v-if="showTimePicker" :showLocked="showLocked" ref="timePicker" v-model="searchTime" :default-pick="defaultPick" :show-empty="showEmpty" class="time-picker margin-r-10" size="small" @change="dateChange" :sign="sign"></time-picker>
    <multipleTime v-if="showMultiple" ref="multipleTime" :stepSearchTime="searchTime" class="multiple-time margin-r-10" @change="dateChange(searchTime)"/>
    <chart-unit v-if="useChartUnit" v-model="unit" ref="chartUnit" class="margin-r-10"></chart-unit>
    <div v-show="useRefresh" class="top-tool-btn-group">
      <button :id="id+'-refresh'" class="top-tool-btn top-tool-btn--text" @click="antiShake" :title="id === 'explore' ? '': $t('dashboard.refresh')">
        <i class="global-active-color nz-icon nz-icon-refresh" style="font-size: 14px"></i>&nbsp;
        <span><slot name="added-text"></slot></span>
      </button>
      <button id="browser-go" class="top-tool-btn top-tool-btn--dropdown" @click="dropdownHandler(dropdownShow)" :title="$t('el.datepicker.selectTime')">
        <span class="select-refresh-time-label" v-if="interval">{{interLabel}}</span>
        <i class="nz-icon nz-icon-arrow-down" style="font-size: 12px;"></i>
        <transition name="el-zoom-in-top">
          <ul v-show="dropdownShow" class="el-dropdown-menu el-popper el-dropdown-menu--mini nz-dropdown popper-z-index" v-clickoutside="dropdownHandler">
            <li v-for="i in $CONSTANTS.intervalList" :key="i.value + i.label" :style="{color:interval === i.value || interval.value === i.value ? theme.themeColor : ''}" class="el-dropdown-menu__item dropdown-content" @click="selectInterval(i,true)">
              {{$t(i.label)}}
            </li>
            <li :key="-1" style="display: none" class="el-dropdown-menu__item dropdown-content" @click="selectInterval({label: 10, value: 10},true)">
              {{$t(10)}}
            </li>
          </ul>
        </transition>
      </button>
    </div>
  </div>
</template>

<script>
import bus from '../../libs/bus'
import timePicker from './timePicker'
import multipleTime from './multipleTime'
import chartUnit from './chartUnit'
export default {
  name: 'pickTime',
  components: {
    'time-picker': timePicker,
    'chart-unit': chartUnit,
    multipleTime
  },
  model: {
    event: 'change',
    prop: 'timeRange'
  },
  props: {
    refreshDataFunc: {
      required: true,
      type: Function
    },
    timeRange: {
      type: Array,
      required: true
    },
    useRefresh: {
      type: Boolean,
      default: true
    },
    useChartUnit: {
      type: Boolean,
      default: true
    },
    showTimePicker: {
      type: Boolean,
      default: true
    },
    showMultiple: {
      type: Boolean,
      default: false
    },
    defaultPick: Number,
    showEmpty: { type: Boolean, default: false },
    id: String,
    sign: [Number, String],
    from: String,
    showLocked: { type: Boolean, default: false },
  },
  data () {
    return {
      searchTime: ['', ''],
      visible: false,
      intervalTimer: null,
      interval: -1,
      unit: 2,
      dropdownShow: false,
      interLabel: '',
      theme: {
        themeColor: ''
      },
      timer: ''
    }
  },
  created () {
    this.searchTime = this.timeFormate(this.timeRange)
    this.$emit('change', this.searchTime)
  },
  methods: {
    selectInterval (val, route) {
      this.visible = false
      clearInterval(this.intervalTimer)
      this.interval = val.value
      this.interLabel = val.label
      if (!this.showTimePicker && val && val.value != 0) {
        this.intervalTimer = setInterval(() => {
          this.$emit('change', this.searchTime)
          this.refreshDataFunc()
        }, val.value * 1000)
        return
      }
      // refresh拼接到地址栏参数中
      if (this.from === 'dashboard' && route) {
        const newQuery = JSON.parse(JSON.stringify(this.$route.query))
        if (val.label == newQuery.refresh) return
        val.value ? newQuery.refresh = val.label : delete newQuery.refresh
        this.$router.replace({ query: newQuery })
      }
      if (val && val.value != 0) {
        const start = new Date(this.searchTime[1])
        const now = bus.getOffsetTimezoneData()
        const interval = Math.floor((now - start.getTime()) / 1000) // 计算当前结束时间到现在的间隔（秒）
        if (interval >= 60) { // 如果结束时间到现在超过30s，则
          this.getIntervalData(interval)
        }
        this.intervalTimer = setInterval(() => {
          this.getIntervalData(this.interval.value)
        }, val.value * 1000)
      }
    },
    dropdownHandler (show) {
      if (!show) {
        this.dropdownShow = true
      } else {
        this.dropdownShow = false
      }
    },
    getIntervalData (interval) { // interval:结束时间到现在的秒数
      // const start = new Date(this.searchTime[0])
      // const end = new Date(this.searchTime[1])
      // start.setSeconds(start.getSeconds() + interval)
      // end.setSeconds(end.getSeconds() + interval)
      //
      // this.searchTime = this.timeFormate([start, end])
      // this.$refs.timePicker.setCostomTime(this.searchTime)
      // this.$emit('change', this.searchTime)
      // 刷新数据
      this.refreshDataFunc()
    },
    timeFormate (timeRange) {
      if (timeRange && timeRange.length < 2) {
        return ['', '']
      }
      if (!timeRange[0]) {
        return ['', '']
      }
      const startTime = bus.timeFormate(timeRange[0], this.pickTimer)
      const endTime = bus.timeFormate(timeRange[1], this.pickTimer)
      const timeType = timeRange[2]
      return [startTime, endTime, timeType || '']
    },
    dateChange (time) {
      this.searchTime = time
      setTimeout(() => {
        this.$emit('change', this.searchTime)
        this.refreshDataFunc(true)
      }, 100)
    },
    antiShake () {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.refreshDataFunc()
          this.timer = null
        }, 200)
      } else {
        this.timer = setTimeout(() => {
          this.refreshDataFunc()
          this.timer = null
        }, 200)
      }
    }
  },
  watch: {
    unit: {
      handler (n, o) {
        this.$emit('unitChange', n)
      }
    }
  },
  beforeDestroy () {
    if (this.timer) {
      this.timer = setTimeout(() => {
        this.refreshDataFunc()
        this.timer = null
      }, 200)
    }
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer)
      this.intervalTimer = null
    }
  }
}
</script>

<style>
.interval-refresh {
  display: flex;
}
.select-refresh-time-label{
  margin-left: 5px;
}
.time-picker {
  /* padding-left: 8px; */
  display: flex;
}
</style>
