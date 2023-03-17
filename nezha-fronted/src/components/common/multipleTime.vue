<template>
  <div class="multiple-time-box">
    <div :class="showDropdown?'compare-box':''" :title="$t('dashboard.dashboard.customTimeRange')"><i class="nz-icon nz-icon-compare" @click="changeShowDropdown" /></div>
    <transition>
      <div v-show="showDropdown" id="panel-calender" class="calendar" style="position: relative">
        <my-date-picker prefix-icon=" " size="mini" ref="calendar"
                        :value-format="timeFormatStrToDatePickFormat(timeFormatMain)"
                        :format="timeFormatStrToDatePickFormat(timeFormatMain)" class="panel-time-picker-hidden" @change="dateChange" v-model="startTime" type="datetime"
                        popper-class="panel-time-picker-popper"
                        align="right">
        </my-date-picker>
        <el-dropdown @command="timeChange" @visible-change="popoverClick"   class="calendar-dropdown-title" ref="timePickerDropdown" trigger="click">
          <el-popover
            placement="bottom-end"
            min-width="120px"
            :visible-arrow="false"
            :disabled="isPopoverDisabled"
            trigger="hover"
            popper-class="popper-z-index right-box-select-top right-public-box-dropdown-top"
            id="panel-calender-popover">
            <template v-if="this.searchTime&&this.searchTime.length>1">
              <el-row  :gutter="10" class="calendar-popover">
                <el-col :span="24" class="calendar-popover-text">{{searchTime[0]}}</el-col>
              </el-row>
              <el-row  :gutter="10" class="calendar-popover">
                <el-col :span="24" class="calendar-popover-text">{{$t('dashboard.dashboard.to')}}</el-col>
              </el-row>
              <el-row  :gutter="10" class="calendar-popover">
                <el-col :span="24" class="calendar-popover-text">{{searchTime[1]}}</el-col>
              </el-row>
            </template>
            <template v-else>
              <div class="time-no-data">{{$t("dashboard.dashboard.noDate")}}</div>
            </template>
            <div  class="el-dropdown-link" slot="reference">
              <i class="nz-icon nz-icon-time" style="width:20px;"></i>
              <span class="panel-list-title" id="timePickerContent">{{showTime.text}}</span>
              <span class="dropdown--suffix">
            <i class="el-icon-arrow-down"></i>
          </span>
            </div>
          </el-popover>
          <el-dropdown-menu class="nz-dashboard-dropdown right-box-select-top right-public-box-dropdown-top popper-z-index" slot="dropdown">
            <template v-for="(item, index) in timeData" >
              <el-dropdown-item v-if="item.id !== 12" :key="index" :class="showTime.id === item.id ? 'nz-dashboard-dropdown-bg' : ''" :command="item">
                {{item.text}}
              </el-dropdown-item>
            </template>

          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </transition>
  </div>
</template>

<script>
import bus from '../../libs/bus'

export default {
  name: 'multipleTime',
  props: {
    stepSearchTime: {},
    defaultPick: Number,
    showEmpty: { default: false, type: Boolean }
  },
  components: {},
  data () {
    return {
      startTime: '',
      searchTime: [],
      showDropdown: false,
      step: '',
      showTime: {
        id: 12,
        text: this.$t('dashboard.dashboard.noDate')
      },
      timeData: [
        {
          id: 0,
          text: this.$t('dashboard.dashboard.customTimeRange')
        },
        {
          id: 12,
          text: this.$t('dashboard.dashboard.noDate')

        },
        {
          id: 1,
          text: this.$t('dashboard.dashboard.beforeFiveMin'),
          type: 'minute',
          value: 5
        },
        {
          id: 2,
          text: this.$t('dashboard.dashboard.beforeFifteenMin'),
          type: 'minute',
          value: 15
        },
        {
          id: 3,
          text: this.$t('dashboard.dashboard.beforeThirtyMin'),
          type: 'minute',
          value: 30
        },
        {
          id: 4,
          text: this.$t('dashboard.dashboard.beforeOneHour'),
          type: 'hour',
          value: 1
        },
        {
          id: 5,
          text: this.$t('dashboard.dashboard.beforeThreeHour'),
          type: 'hour',
          value: 3
        },
        {
          id: 6,
          text: this.$t('dashboard.dashboard.beforeSixHour'),
          type: 'hour',
          value: 6
        },
        {
          id: 7,
          text: this.$t('dashboard.dashboard.beforeTwelveHour'),
          type: 'hour',
          value: 12
        },
        {
          id: 8,
          text: this.$t('dashboard.dashboard.beforeTwentyFourHour'),
          type: 'hour',
          value: 24
        },
        {
          id: 9,
          text: this.$t('dashboard.dashboard.beforeTwoDay'),
          type: 'date',
          value: 2
        },
        {
          id: 10,
          text: this.$t('dashboard.dashboard.beforeSevenDay'),
          type: 'date',
          value: 7
        },
        {
          id: 11,
          text: this.$t('dashboard.dashboard.beforeThirtyDay'),
          type: 'date',
          value: 30
        }
      ],
      nowTimeType: {
        id: 4,
        text: this.$t('dashboard.dashboard.beforeOneHour'),
        type: 'hour',
        value: 1
      },
      isPopoverDisabled: false,
      isCustom: false,
      valueArr: []
    }
  },
  watch: {
    stepSearchTime: {
      immediate: true,
      handler (n, o) {
        if (n && this.searchTime[0]) {
          if (this.showTime.value) {
            this.setSearchTime(this.showTime.type, this.showTime.value)
          } else {
            const startTime = bus.timeFormate(this.searchTime[0], this.multipleTime)
            const endTime = bus.timeFormate(new Date(this.searchTime[0]).getTime() + new Date(this.stepSearchTime[1]).getTime() - new Date(this.stepSearchTime[0]).getTime(), this.multipleTime)
            this.$set(this.searchTime, 0, startTime)
            this.$set(this.searchTime, 1, endTime)
          }
        }
      }
    },
    defaultPick: {
      immediate: true,
      handler (n, o) {
        if (n && Number.isInteger(n)) {
          const showTime = this.timeData.find(item => item.id == n)
          if (showTime) {
            this.showTime = Object.assign({}, showTime)
          }
          if (this.showEmpty && this.defaultPick === 12) {
            this.searchTime = []
          }
        }
      }
    }
  },
  mounted () {
  },
  methods: {
    dateChange (val) {
      const startTime = this.momentTz(this.momentStrToTimestamp(val))
      const end = this.momentStrToTimestamp(val) + this.momentStrToTimestamp(this.stepSearchTime[1]) - this.momentStrToTimestamp(this.stepSearchTime[0])
      const endTime = this.momentTz(end, this.multipleTime)
      this.$set(this.searchTime, 0, startTime)
      this.$set(this.searchTime, 1, endTime)

      // let timerPicker = document.querySelector('#timePickerContent');
      // timerPicker.innerText = this.searchTime[0]+" "+this.$t("dashboard.dashboard.to")+" "+this.searchTime[1];
      this.$set(this.showTime, 'id', 0)
      this.$set(this.showTime, 'text', this.searchTime[0] + ' ' + this.$t('dashboard.dashboard.to') + ' ' + this.searchTime[1])
      this.$set(this.showTime, 'type', '')
      this.$set(this.showTime, 'value', '')
      /*
            let tipElementList = document.getElementsByClassName('calendar-popover-text');
            if(tipElementList && tipElementList.length===3){
              console.log('-0-0-0',tipElementList);
              tipElementList[0].innerHTML = this.searchTime[0];
              tipElementList[1].innerHTML = this.$t("dashboard.dashboard.to");
              tipElementList[2].innerHTML = this.searchTime[1];
              console.log('-0-0-2',tipElementList);
            } */
      this.$emit('change', this.searchTime)
    },
    // left(){},
    // right(){},
    timeChange (val, from) {
      this.nowTimeType = val
      this.$set(this.showTime, 'id', val.id)
      this.$set(this.showTime, 'text', val.text)
      this.$set(this.showTime, 'value', val.value)
      this.$set(this.showTime, 'type', val.type)
      if (!val) {
        this.isCustom = false
        return false
      } else {
        this.setSearchTime(val.type, val.value)
        if (this.searchTime[0]) {
          this.startTime = this.searchTime[0]
        }

        const id = val.id
        if (id === 0) { // custom
          if (from === 'chart') {
            this.isCustom = false
            this.$emit('change', this.searchTime)
          } else {
            this.isCustom = true
            this.$refs.calendar.focus()
            this.$refs.calendar.pickerVisible = true
          }
        } else {
          this.isCustom = false
          if (this.showEmpty && id === 12) {
            this.searchTime = []
          }
          this.$emit('change', this.searchTime)
        }
      }
    },
    getCurrentTime () {
      let timeTypeId = this.showTime.id
      if (timeTypeId === 0) {
        return this.searchTime
      } else {
        if (!timeTypeId) { timeTypeId = 4 }
        const currentTime = this.timeData.find(item => item.id === timeTypeId)
        this.setSearchTime(currentTime.type, currentTime.value)
        return this.searchTime
      }
    },
    setSearchTime (type, val) {
      if (type === 'minute') {
        const startTime = bus.timeFormate(new Date(bus.formateTimeToTime(this.stepSearchTime[0])).getTime() - val * 60 * 1000)
        const endTime = bus.timeFormate(new Date(bus.formateTimeToTime(this.stepSearchTime[1])).getTime() - val * 60 * 1000)
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'm')
      } else if (type === 'hour') {
        const startTime = bus.timeFormate(new Date(bus.formateTimeToTime(this.stepSearchTime[0])).getTime() - val * 60 * 60 * 1000)
        const endTime = bus.timeFormate(new Date(bus.formateTimeToTime(this.stepSearchTime[1])).getTime() - val * 60 * 60 * 1000)
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'h')
      } else if (type === 'date') {
        const startTime = bus.timeFormate(new Date(bus.formateTimeToTime(this.stepSearchTime[0])).getTime() - val * 24 * 60 * 60 * 1000)
        const endTime = bus.timeFormate(new Date(bus.formateTimeToTime(this.stepSearchTime[1])).getTime() - val * 24 * 60 * 60 * 1000)
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'd')
      }
    },
    setCostomTime: function (costomTime) {
      this.searchTime = Object.assign(costomTime)
      const val = Object.assign(this.timeData[0])
      this.$set(this.showTime, 'id', val.id)
      this.$set(this.showTime, 'text', val.text)
      this.$set(this.showTime, 'type', val.type)
      this.$set(this.showTime, 'value', val.value)
    },
    popoverClick (val) {
      if (val) {
        this.isPopoverDisabled = true
      } else {
        this.isPopoverDisabled = false
      }
    },
    changeShowDropdown () {
      this.showDropdown = !this.showDropdown
      if (!this.showDropdown) {
        this.searchTime = []
        setTimeout(() => {
          this.showTime = this.nowTimeType = {
            id: 12,
            text: this.$t('dashboard.dashboard.noDate')
          }
        }, 500)
        this.$emit('change', this.searchTime)
      } else {
        this.searchTime = []
        this.showTime = this.nowTimeType = {
          id: 4,
          text: this.$t('dashboard.dashboard.beforeOneHour'),
          type: 'hour',
          value: 1
        }
        this.setSearchTime(this.showTime.type, this.showTime.value)
        this.$emit('change', this.searchTime)
      }
    }
  }
}
</script>
