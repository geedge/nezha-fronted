<template>
  <div
    id="panel-calender"
    :class="{ 'calendar--small': size === 'small' }"
    class="calendar"
    v-clickoutside="changeDropdownFlag"
  >
    <div @click="showDropdown(!dropdownFlag)" class="date-range-text">
      <div class="calendar-popover-text">
        <i class="nz-icon nz-icon-time"></i>
      </div>
      <div class="calendar-popover-text" style="display: flex" v-if="isCustom">
        <div class="calendar-popover-text">
          {{ searchTime[0] }}
        </div>
        <div class="calendar-popover-text">{{ $t("dashboard.dashboard.to") }}</div>
        <div class="calendar-popover-text">
          {{ searchTime[1] }}
        </div>
      </div>
      <div class="calendar-popover-text" v-else>
      <el-tooltip class="item" effect="light"  placement="bottom">
        <div slot="content"> {{searchTime[0]}}<br/><p style="text-align:center">{{$t("dashboard.dashboard.to")}} </p>{{searchTime[1]}}</div>
        <div class="time-no-data">{{ showTime.text }}</div>
      </el-tooltip>
        <!-- <div class="time-no-data">{{ showTime.text }}</div> -->
      </div>
      <div class="calendar-popover-text">
        <i class="nz-icon"
           v-if="showLocked"
           @click.stop="changeLocked()"
           :title="timePickerLocked ? $t('timepicker.unlockTime') : $t('timepicker.lockTime')"
           :class="timePickerLocked ? 'nz-icon-push-pin-line colorfa901c' : 'nz-icon-push-pin-line'"
           style="margin-right: 5px;cursor: pointer"
        />
        <i class="el-icon-arrow-down"></i>
      </div>
    </div>
    <transition name="el-zoom-in-top">
      <div v-if="dropdownFlag" class="date-range-panel popper-z-index" :class="timeBoxClass">
        <el-row class="date-range-panel-top" style="position: relative">
          <el-col
            :span="16"
            class="date-range-panel-content date-range-panel-content-left"
          >
            <div class="date-range-title" style="padding-left: 0">
              {{$t('timepicker.timerange')}}
            </div>
            <my-date-picker
              prefix-icon=" "
              class="panel-time-picker-hidden"
              size="mini"
              ref="calendar"
              :format="timeFormatStrToDatePickFormat()"
              :value-format="timeFormatStrToDatePickFormat()"
              @change="dateChange"
              :default-time="['00:00:00', '23:59:59']"
              v-model="oldSearchTime"
              :isOnly="true"
              type="daterange"
              popper-class="panel-time-picker-popper time-picker-popover__select-top"
              align="right"
            >
            </my-date-picker>
<!--            @change="dateChange(whoChoose)"-->
            <div class="content-title">{{$t('dashboard.dashboard.chartForm.valMapping.from')}}</div>
            <div  tabindex="1" class="content-input" :class="oldSearchTimeError[0] ? 'input-error' : ''">
              <el-input   @focus="searchTimeValue = oldSearchTime[0]"  v-model="oldSearchTime[0]" @change="dateInputChange('start',oldSearchTime[0])" size="mini"> </el-input>
              <div @click="myDatePickerShow()" class="nz-icon-box" style="cursor:pointer">
                <i class="nz-icon nz-icon-date"/>
              </div>
              <div class="input-hint">{{inputError}}</div>
            </div>
            <div class="content-title">{{$t('dashboard.dashboard.to')}}</div>
            <div tabindex="2" class="content-input" :class="oldSearchTimeError[1] ? 'input-error' : ''">
              <el-input  @focus="searchTimeValue = oldSearchTime[1]" v-model="oldSearchTime[1]" @change="dateInputChange('end',oldSearchTime[1])" size="mini"> </el-input>
              <div  @click="myDatePickerShow()" class="nz-icon-box" style="cursor:pointer">
                <i class="nz-icon nz-icon-date"/>
              </div>
              <div class="input-hint">{{$t('date.formatError')}}</div>
            </div>
            <div>
              <el-button
                @click="timeRange(searchTime)"
                type="primary"
                size="mini"
                class="time-range-button el-button--primary"
                >{{$t('timepicker.applytimerange')}}</el-button
              >
            </div>
            <div class="date-range-title" style="padding-left: 0">
              {{$t('timepicker.recentlyUsed')}}
            </div>
            <div class="date-range-history">
              <div
                v-for="(item, index) in rangeHistoryArr"
                :key="index"
                class="date-range-history-item"
                @click="historyChange(item)"
              >
                {{ momentTz(item.start) }}
                {{ $t("dashboard.dashboard.to") }}
                {{ momentTz(item.end) }}
              </div>
            </div>
          </el-col>
          <el-col
            :span="8"
            class="date-range-panel-content date-range-panel-content-right"
            style="border-left: 1px solid rgba(0, 0, 0, 0.09)"
          >
            <div class="date-range-title">{{$t('timepicker.relatime')}}</div>
            <ul class="date-range-item">
              <li
                v-for="(item, key) in timeShowData"
                @click="timeChange(item)"
                :class="showTime.id === item.id ? 'activeLi' : ''"
                :key="key"
                :v-if="item.id !== 12 || showEmpty"

              >
                <span
                  style="position: relative"
                  v-if="item.id !== 12 || showEmpty"
                >
                  {{ item.text }}
                  <i
                    v-if="showTime.id === item.id"
                    class="nz-icon nz-icon-check"
                  ></i>
                </span>
              </li>
            </ul>
          </el-col>
        </el-row>
        <el-row class="date-range-panel-bottom" style="">
          <el-col :span="12">{{ address }}</el-col>
          <el-col :span="12" class="utc-str">
            <span>
            {{ utcStr }}
            </span>
            </el-col>
        </el-row>
      </div>
    </transition>
  </div>
</template>

<script>
import bus from '@/libs/bus'
import moment from 'moment-timezone'

export default {
  name: 'timePicker',
  props: {
    defaultPick: Number,
    showEmpty: { default: false, type: Boolean },
    size: {
      type: String
    },
    sign: [Number, String],
    showLocked: { type: Boolean, default: false }
  },
  data () {
    return {
      timePickerLocked: false, // 该参数只用于图标状态的切换 实际时间的控制 由原页面控制
      whoChoose: '',
      searchTimeValue: '',
      rangeHistory: [],
      rangeHistoryArr: [],
      address: '',
      utc: localStorage.getItem('timezoneOffset'),
      utcStr: '',
      dropdownFlag: false,
      isPopoverDisabled: false,
      isCustom: false,
      searchTime: [
        bus.timeFormate(bus.getOffsetTimezoneData(-1)),
        bus.timeFormate(bus.getOffsetTimezoneData())
      ],
      oldSearchTime: [bus.timeFormate(bus.getOffsetTimezoneData(-1)),
        bus.timeFormate(bus.getOffsetTimezoneData())],
      oldSearchTimeError: {
        0: false,
        1: false
      },
      inputError: this.$t('date.formatError'),
      showTime: {
        id: 4,
        text: this.$t('dashboard.dashboard.lastOneHour')
      },
      timeData: [
        { id: 0, text: this.$t('dashboard.dashboard.customTimeRange'), value: -1 },
        { id: 12, text: this.$t('dashboard.dashboard.noDate'), value: 0 },
        { id: 1, text: this.$t('dashboard.dashboard.lastFiveMin'), type: 'minute', value: 5 },
        { id: 2, text: this.$t('dashboard.dashboard.lastFifteenMin'), type: 'minute', value: 15 },
        { id: 3, text: this.$t('dashboard.dashboard.lastThirtyMin'), type: 'minute', value: 30 },
        { id: 4, text: this.$t('dashboard.dashboard.lastOneHour'), type: 'hour', value: 1 },
        { id: 5, text: this.$t('dashboard.dashboard.lastThreeHour'), type: 'hour', value: 3 },
        { id: 6, text: this.$t('dashboard.dashboard.lastSixHour'), type: 'hour', value: 6 },
        { id: 7, text: this.$t('dashboard.dashboard.lastTwelveHour'), type: 'hour', value: 12 },
        { id: 8, text: this.$t('dashboard.dashboard.lastTwentyFourHour'), type: 'hour', value: 24 },
        { id: 9, text: this.$t('dashboard.dashboard.lastTwoDay'), type: 'date', value: 2 },
        { id: 10, text: this.$t('dashboard.dashboard.lastSevenDay'), type: 'date', value: 7 },
        { id: 11, text: this.$t('dashboard.dashboard.lastThirtyDay'), type: 'date', value: 30 }
      ],
      timeShowData: [],
      nowTimeType: {
        id: 4,
        text: this.$t('dashboard.dashboard.lastOneHour'),
        type: 'hour',
        value: 1
      }
    }
  },
  computed: {
    timeBoxClass () {
      return this.$store.getters.getTimeBoxClass
    },
    nztimePickerLocked () {
      return this.$store.getters.getTimePickerLocked
    }
  },
  mounted () {
    this.timePickerLocked = localStorage.getItem('nz-time-picker-locked') ? JSON.parse(localStorage.getItem('nz-time-picker-locked')) : false
    this.timeShowData = JSON.parse(JSON.stringify(this.timeData))
    this.timeShowData.shift()
    this.getItem()
    this.getUtcStr()
    this.getRangeHistoryArr()
    const timeTemp = this.$lodash.cloneDeep(this.searchTime)
    this.oldSearchTime[0] = timeTemp[0]
    this.oldSearchTime[1] = timeTemp[1]
    // 监听dateFormat变化 改变日期格式
    window.addEventListener('storage', this.watchDateFormat)
  },
  methods: {
    // 监听localStorage日期格式
    watchDateFormat (e) {
      if (e.key === 'nz-default-dateFormat') {
        // 先用之前vuex的日期格式获取到正确时间
        const timeStart = this.momentStrToTimestamp(this.oldSearchTime[0], this.timeFormatMain)
        const timeEnd = this.momentStrToTimestamp(this.oldSearchTime[1], this.timeFormatMain)
        this.$set(this.oldSearchTime, 0, this.momentTz(timeStart))
        this.$set(this.oldSearchTime, 1, this.momentTz(timeEnd))
        this.searchTime = this.$lodash.cloneDeep(this.oldSearchTime)
        this.$emit('change', this.searchTime)
        // 更新vuex日期格式
        this.$store.commit('setTimeFormatMain', localStorage.getItem('nz-default-dateFormat') || 'YYYY-MM-DD HH:mm:ss')
      }
    },
    changeDropdownFlag () {
      if (this.dropdownFlag) {
        this.dropdownFlag = false
      }
    },
    getItem () {
      this.rangeHistory = localStorage.getItem('date-range-history' + this.sign)
        ? JSON.parse(localStorage.getItem('date-range-history' + this.sign))
        : []
      this.address = localStorage.getItem('nz-sys-timezone')
      this.utc = localStorage.getItem('timezoneOffset')
    },
    myDatePickerShow (item) {
      // this.whoChoose = item
      // this.isCustom = true
      this.$refs.calendar.focus()
      this.$refs.calendar.pickerVisible = true
      if (document.getElementById('viewGraphDialog')) {
        // 处理 多弹出的z-index的问题 当前为 alertMessage的处理
        const viewGraphDialogStyle = window.getComputedStyle(
          document.getElementById('viewGraphDialog', null)
        )
        setTimeout(() => {
          if (viewGraphDialogStyle['z-index'] !== 'auto') {
            const dom =
                    document.getElementsByClassName('el-picker-panel')
            Array.prototype.forEach.call(dom, function (element) {
              element.style['z-index'] =
                      viewGraphDialogStyle['z-index'] + 1
            })
            this.$refs.calendar.$el.style['z-index'] =
                    viewGraphDialogStyle['z-index'] + 1
          }
        })
      }
    },
    historyChange (item) {
      this.isCustom = true
      this.searchTime[0] = this.momentTz(item.start)
      this.searchTime[1] = this.momentTz(item.end)
      this.showTime = this.nowTimeType = {
        id: 0,
        text: this.searchTime[0] + ' ' + this.$t('dashboard.dashboard.to') + ' ' + this.searchTime[1],
        value: -1
      }
      this.showDropdown(false)
      this.setSearchTime('', '', this.searchTime)
      this.$emit('change', this.searchTime)
    },
    getRangeHistoryArr () {
      const arr = this.rangeHistory.slice(0, 3)
      this.rangeHistoryArr = arr
    },
    getUtcStr () {
      const str = 'UTC '
      this.utcStr = str + this.utc
    },
    timeRange (item) {
      if (this.oldSearchTimeError[0] || this.oldSearchTimeError[1]) {
        return
      }
      this.searchTime = this.$lodash.cloneDeep(this.oldSearchTime)
      this.showTime = this.nowTimeType = {
        id: 0,
        text: this.searchTime[0] + ' ' + this.$t('dashboard.dashboard.to') + ' ' + this.searchTime[1],
        value: -1
      }
      this.isCustom = true
      this.rangeHistory.unshift({
        start: this.momentStrToTimestamp(this.searchTime[0]),
        end: this.momentStrToTimestamp(this.searchTime[1])
      })
      localStorage.setItem(
        'date-range-history' + this.sign,
        JSON.stringify(this.rangeHistory)
      )
      this.$set(this.searchTime, 2, '')
      this.showDropdown(false)
      this.getRangeHistoryArr()
      this.setSearchTime('', '', this.searchTime)
      this.$emit('change', this.searchTime)
    },
    showDropdown (value) {
      const timeTemp = this.$lodash.cloneDeep(this.searchTime)
      this.oldSearchTime[0] = timeTemp[0]
      this.oldSearchTime[1] = timeTemp[1]
      this.oldSearchTimeError[0] = false
      this.oldSearchTimeError[1] = false
      this.dropdownFlag = value
    },
    changeLocked () {
      this.timePickerLocked = !this.timePickerLocked
      localStorage.setItem('nz-time-picker-locked', JSON.stringify(this.timePickerLocked))
      this.$store.dispatch('dispatchTimePickerLocked', this.timePickerLocked)
      if (this.timePickerLocked) {
        console.log(this.searchTime, this.nowTimeType)
        this.$store.dispatch('dispatchTimePickerRange', {
          time: this.searchTime,
          nowTimeType: this.nowTimeType
        })
      }
    },
    dateInputChange (type, v) {
      const timeFormatMain = localStorage.getItem('nz-default-dateFormat') ? localStorage.getItem('nz-default-dateFormat') : 'YYYY-MM-DD HH:mm:ss'
      if (type == 'start') {
        const dateValidate = moment(this.oldSearchTime[0], timeFormatMain).isValid()
        if (!dateValidate) {
          this.inputError = this.$t('date.formatError')
          this.oldSearchTimeError[0] = true
        } else {
          this.oldSearchTimeError[0] = false
          this.oldSearchTime[0] = bus.timeFormate(this.oldSearchTime[0])
        }
      } else if (type == 'end') {
        const dateValidate = moment(this.oldSearchTime[1], timeFormatMain).isValid()
        if (!dateValidate) {
          this.oldSearchTimeError[1] = true
        } else {
          this.oldSearchTimeError[1] = false
          // this.$set(this.oldSearchTime, 1, bus.timeFormate(this.oldSearchTime[1]))
          this.oldSearchTime[1] = bus.timeFormate(this.oldSearchTime[1])
        }
      }
      if (moment(this.oldSearchTime[0], timeFormatMain).isValid() && moment(this.oldSearchTime[1], timeFormatMain).isValid() && !moment(this.oldSearchTime[0]).isBefore(this.oldSearchTime[1])) {
        this.oldSearchTimeError[0] = true
        this.inputError = this.$t('date.fromGreaterTo')
      } else if (moment(this.oldSearchTime[0], timeFormatMain).isValid() && moment(this.oldSearchTime[1], timeFormatMain).isValid() && moment(this.oldSearchTime[0]).isBefore(this.oldSearchTime[1])) {
        this.oldSearchTimeError[0] = false
      }
    },
    dateChange () {
      this.oldSearchTimeError[0] = false
      this.oldSearchTimeError[1] = false
    },
    setCustomTime (timeGroup, timeRange) {
      if (timeGroup) {
        this.showTime = this.nowTimeType = this.timeData.find(
          (item) => item.id == timeGroup.id
        )
        if (timeGroup.value == -1) {
          this.isCustom = true
        }
        if (this.showTime) {
          this.showTime = Object.assign({}, this.showTime)
          this.$set(this.searchTime, 0, timeGroup.start_time)
          this.$set(this.searchTime, 1, timeGroup.end_time)
        } else {
          // const time = this.searchTime.splice(' ')
          // this.showTime = this.nowTimeType = {
          //   text: time[0] + ' ' + this.$t('dashboard.dashboard.to') + ' ' + time[1]
          // }
          // this.$set(this.searchTime, 0, bus.timeFormate(time[0]))
          // this.$set(this.searchTime, 1, bus.timeFormate(time[1]))
          this.$set(this.searchTime, 0, bus.timeFormate(timeGroup.start_time))
          this.$set(this.searchTime, 1, bus.timeFormate(timeGroup.end_time))
          this.showTime = this.nowTimeType = {
            id: 4,
            text: this.$t('dashboard.dashboard.lastOneHour'),
            type: 'hour',
            value: 1
          }
          const time = bus.getTimezontDateRange()
          if (timeGroup.start_time) {
            this.$set(
              this.searchTime,
              0,
              bus.timeFormate(timeGroup.start_time)
            )
            this.$set(this.searchTime, 1, bus.timeFormate(timeGroup.end_time))
          } else {
            this.$set(this.searchTime, 0, bus.timeFormate(time[0]))
            this.$set(this.searchTime, 1, bus.timeFormate(time[1]))
          }
          this.$set(this.searchTime, 0, bus.timeFormate(time[0]))
        }
      } else {
        this.showTime = this.nowTimeType = {
          id: 4,
          text: this.$t('dashboard.dashboard.lastOneHour'),
          type: 'hour',
          value: 1
        }
        const time = bus.getTimezontDateRange()
        this.$set(this.searchTime, 0, time[0])
        this.$set(this.searchTime, 1, time[1])
      }
    },
    timeChange (val, from) {
      this.nowTimeType = val
      this.$set(this.showTime, 'id', val.id)
      this.$set(this.showTime, 'text', val.text)
      if (!val) {
        this.isCustom = false
        return false
      } else {
        if (val.id !== 12) {
          this.setSearchTime(val.type, val.value)
        }

        const id = val.id
        if (id === 0) {
          // custom
          if (from === 'chart') {
            this.isCustom = false
            this.$emit('change', this.searchTime)
          } else {
            this.isCustom = true
            this.$refs.calendar.focus()
            this.$refs.calendar.pickerVisible = true
            if (document.getElementById('viewGraphDialog')) {
              // 处理 多弹出的z-index的问题 当前为 alertMessage的处理
              const viewGraphDialogStyle = window.getComputedStyle(
                document.getElementById('viewGraphDialog', null)
              )
              setTimeout(() => {
                if (viewGraphDialogStyle['z-index'] !== 'auto') {
                  const dom =
                    document.getElementsByClassName('el-picker-panel')
                  Array.prototype.forEach.call(dom, function (element) {
                    element.style['z-index'] =
                      viewGraphDialogStyle['z-index'] + 1
                  })
                  this.$refs.calendar.$el.style['z-index'] =
                    viewGraphDialogStyle['z-index'] + 1
                }
              })
            }
          }
        } else {
          this.isCustom = false
          this.showDropdown(false)
          if (this.showEmpty && id === 12) {
            this.searchTime = ['', '']
          }
          this.$emit('change', this.searchTime)
        }
      }
    },
    setTimeRange (nowTimeType, time) {
      this.isCustom = false
      this.nowTimeType = nowTimeType
      this.$set(this.showTime, 'id', nowTimeType.id)
      this.$set(this.showTime, 'text', nowTimeType.text)
      this.setSearchTime(nowTimeType.type, nowTimeType.value, time)
      const timeTemp = this.$lodash.cloneDeep(this.searchTime)
      this.oldSearchTime[0] = timeTemp[0]
      this.oldSearchTime[1] = timeTemp[1]
      this.oldSearchTimeError[0] = false
      this.oldSearchTimeError[1] = false
    },
    getCurrentTime () {
      return this.searchTime
      // let timeTypeId = this.showTime.id;
      // if (timeTypeId === 0) {
      //   return this.searchTime;
      // } else {
      //   if (!timeTypeId) {
      //     timeTypeId = 4;
      //   }
      //   const currentTime = this.timeData.find(
      //     (item) => item.id === timeTypeId
      //   );
      //   this.setSearchTime(currentTime.type, currentTime.value);
      //   return this.searchTime;
      // }
    },
    setSearchTime (type, val, time) {
      if (type === 'minute') {
        const startTime = bus.timeFormate(
          new Date(bus.computeTimezone(new Date().getTime())).setMinutes(
            new Date(bus.computeTimezone(new Date().getTime())).getMinutes() -
              val
          )
        )
        const endTime = bus.timeFormate(
          new Date(bus.computeTimezone(new Date().getTime()))
        )
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'm')
      } else if (type === 'hour') {
        const startTime = bus.timeFormate(
          new Date(bus.computeTimezone(new Date().getTime())).setHours(
            new Date(bus.computeTimezone(new Date().getTime())).getHours() - val
          )
        )
        const endTime = bus.timeFormate(
          new Date(bus.computeTimezone(new Date().getTime()))
        )
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'h')
      } else if (type === 'date') {
        const startTime = bus.timeFormate(
          new Date(bus.computeTimezone(new Date().getTime())).setDate(
            new Date(bus.computeTimezone(new Date().getTime())).getDate() - val
          )
        )
        const endTime = bus.timeFormate(
          new Date(bus.computeTimezone(new Date().getTime()))
        )
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'd')
      } else {
        this.isCustom = true
        this.$set(this.searchTime, 0, time[0])
        this.$set(this.searchTime, 1, time[1])
      }
    },
    setCostomTime: function (costomTime) {
      this.searchTime = Object.assign(costomTime)
      const val = Object.assign(this.timeData[0])
      this.$set(this.showTime, 'id', val.id)
      this.$set(this.showTime, 'text', val.text)
    },
    popoverClick (val) {
      if (val) {
        this.isPopoverDisabled = true
      } else {
        this.isPopoverDisabled = false
      }
    },
    refresh () {
      this.setSearchTime(this.nowTimeType.type, this.nowTimeType.value, this.searchTime)
      this.$emit('change', this.searchTime)
    }
  },
  watch: {
    defaultPick: {
      immediate: true,
      handler (n, o) {
        if (n && Number.isInteger(n)) {
          const showTime = this.timeData.find((item) => item.id == n)
          if (showTime) {
            this.showTime = Object.assign({}, showTime)
            this.searchTime = this.$parent.searchTime
            this.nowTimeType = this.showTime
          }
          if (this.showEmpty && this.defaultPick === 12) {
            this.searchTime = []
          }
        }
      }
    },
    sign: {
      handler (n, o) {
        if (n) {
          this.rangeHistory = localStorage.getItem('date-range-history' + this.sign)
            ? JSON.parse(localStorage.getItem('date-range-history' + this.sign))
            : []
          this.getRangeHistoryArr()
        }
      }
    },
    nztimePickerLocked (n) {
      this.timePickerLocked = n
    }
  },
  beforeDestroy () {
    window.removeEventListener('storage', this.watchDateFormat)
  }
}
</script>
