<template>
  <div class="interval-refresh">
    <time-picker v-if="showTimePicker" ref="timePicker" v-model="searchTime" :default-pick="defaultPick" :show-empty="showEmpty" class="time-picker margin-r-10" size="small" @change="dateChange"></time-picker>
    <multipleTime ref="multipleTime" v-if="showMultiple" :stepSearchTime="searchTime" @change="dateChange(searchTime)" class="multiple-time"/>
    <chart-unit v-model="unit" v-if="useChartUnit"></chart-unit>
    <div v-show="useRefresh" class="top-tool-btn-group margin-r-10">
      <button :id="id+'-refresh'" class="top-tool-btn top-tool-btn--text" @click="refreshDataFunc">
        <i class="global-active-color nz-icon nz-icon-refresh" style="font-size: 14px"></i>&nbsp;
        <span><slot name="added-text"></slot></span>
      </button>
      <button id="browser-go" class="top-tool-btn top-tool-btn--dropdown" @mouseenter="dropdownHandler(true)" @mouseleave="dropdownHandler(false)">
        <span class="select-refresh-time-label" v-if="interval !== -1">{{interLabel}}</span>
        <i class="nz-icon nz-icon-arrow-down" style="font-size: 12px;"></i>
        <transition name="el-zoom-in-top">
          <ul v-show="dropdownShow" class="el-dropdown-menu el-popper el-dropdown-menu--mini nz-dropdown">
            <li v-for="i in $CONSTANTS.intervalList" :key="i.value + i.label" :style="{color:interval === i.value || interval.value === i.value ? theme.themeColor : ''}" class="el-dropdown-menu__item dropdown-content" @click="selectInterval(i)">
              {{i.label}}
            </li>
          </ul>
        </transition>
      </button>
<!--      <el-popover v-model="visible" placement="bottom-start" :width="50" trigger="click" popper-class="interval-refresh-popover" >
        <ul class="popover_ul">
          <li v-for="i in $CONSTANTS.intervalList" :style="{color:interval == i.value ? '#31749C' : ''}" :key="i.value + i.label" @click="selectInterval(i)">
            {{i.label}}
          </li>
        </ul>
        <button type="button" class="top-tool-btn" slot="reference">
          <span v-if="interval.value && interval.value != -1">{{interval.label}}</span><i class="nz-icon nz-icon-arrow-down" style="font-size: 14px"></i>
        </button>
      </el-popover>-->
    </div>
  </div>
</template>

<script>
import bus from '../../libs/bus'
import timePicker from './timePicker'
import multipleTime from './multipleTime'
import chartUnit from './chartUnit'
let timeout
export default {
  name: 'intervalRefresh',
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
    id: String
  },
  data () {
    return {
      searchTime: [],
      visible: false,
      intervalTimer: null,
      interval: -1,
      unit: 2,
      dropdownShow: false,
      interLabel: ''
    }
  },
  created () {
    this.searchTime = this.timeFormate(this.timeRange)
    this.$emit('change', this.searchTime)
  },
  methods: {
    selectInterval (val) {
      this.visible = false
      this.interval = val.value
      this.interLabel = val.label
      console.info(this.interval, val)
      if (!this.showTimePicker && val && val.value != -1) {
        this.intervalTimer = setInterval(() => {
          this.$emit('change', this.searchTime)
          this.refreshDataFunc()
        }, val.value * 1000)
        return
      }
      if (val && val.value != -1) {
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
      if (show) {
        clearTimeout(timeout)
        this.dropdownShow = true
      } else {
        timeout = setTimeout(() => {
          this.dropdownShow = false
        }, 700)
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
        return []
      }
      const startTime = bus.timeFormate(timeRange[0], 'yyyy-MM-dd hh:mm:ss')
      const endTime = bus.timeFormate(timeRange[1], 'yyyy-MM-dd hh:mm:ss')
      return [startTime, endTime]
    },
    dateChange (time) {
      this.searchTime = time
      this.$emit('change', this.searchTime)
      this.refreshDataFunc()
    }
  },
  watch: {
    unit: {
      immediate: true,
      handler (n, o) {
        this.$emit('unitChange', n)
      }
    }
  }
}
</script>

<style lang="scss">
.interval-refresh {
  display: flex;
}
  .select-refresh-time-label{
    margin-left: 5px;
  }
</style>
