<style scoped lang="scss">
  .loading-font{
    color:#232f3e !important;
  }
  popper-z-index{
    z-index: 3000 !important;
  }
  .calendar{
  }
  .nz-dashboard-dropdown-bg {
    background: $global-text-color-active;
    color: #fff;
  }
  .calendar-dropdown-title {
    line-height:28px;
    padding-left:5px;
    margin-left:0px;
    margin-top: 0px !important;
    text-align:left;
    border-radius:2px;
    min-width:80px;
    height:28px;
    border:solid 1px  #d8dce1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .el-dropdown-link {
    cursor: pointer;
  }
  .calendar-popover{
    line-height:22px;
    text-align:center;
  }
  .panel-time-picker-hidden{
    width:0px !important;
    padding:0px !important;
    border:0px !important;
   height: 0 !important;
    overflow: hidden;
  }
  .time-picker-button{
    padding: 0 1px !important;
    height:24px !important;
    margin-top:0px !important;
  }

  .time-picker-left-button{
    margin-right: 4px;
  }

  .time-picker-right-button{
    margin-left: 4px;
  }
  .calendar-popover-text {}
  .multiple-time-box{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .compare-box{
    line-height: 50px;
  }
  .compare-box .nz-icon-compare{
   border-right: none;
  }
  .calendar{
    /*width: 125px;*/
  }
  .nz-icon-compare{
    background: #FFFFFF;
    border: 1px solid #DEDEDE;
    border-radius: 2px;
    padding: 6px 8px;
  }
  .multiple-time-datepicker-enter-active {
    animation: bounce-in .5s;
  }
  .multiple-time-datepicker-leave-active {
    animation: bounce-in .5s reverse;
  }
  @keyframes bounce-in {
    0% {
      width: 0;
      overflow: hidden;
    }
    100% {
     width:125px;
      overflow: hidden;
    }
  }
</style>
<style lang="scss">
  .panel-time-picker-popper[x-placement^=bottom] .popper__arrow {
    left: 85% !important;
  }
  .panel-time-picker-popper[x-placement^=bottom] {
  }

  .panel-time-picker-popper .el-date-table td.today span {
    color: #232f3e !important;
  }

  .panel-time-picker-popper .el-picker-panel__footer button:nth-child(1){
    display:none;
  }

  .dropdown--suffix {
    padding: 0 8px;
    color: #aaa;
  }
</style>
<template>
  <div class="multiple-time-box">
    <div :class="showDropdown?'compare-box':''"><i class="nz-icon nz-icon-compare" @click="changeShowDropdown" /></div>
<!--    name="multiple-time-datepicker"-->
    <transition>
      <div class="calendar top-tools" id="panel-calender" v-show="showDropdown">
        <el-date-picker prefix-icon=" " size="mini" ref="calendar"
                        format="yyyy/MM/dd HH:mm:ss" class="panel-time-picker-hidden" @change="dateChange" v-model="startTime" type="datetime"
                        popper-class="panel-time-picker-popper"
                        align="right">
        </el-date-picker>
        <!--
        <button type="button" style="border-radius: 1px 1px 1px 1px" @click="right()" v-show="isCustom"
                class="nz-btn nz-btn-size-normal nz-btn-style-light time-picker-button time-picker-right-button" >
          <i style="font-size: 12px" class="el-icon-arrow-right"></i>
        </button>-->
        <el-dropdown @command="timeChange" @visible-change="popoverClick"   class="calendar-dropdown-title" ref="timePickerDropdown" trigger="click">
          <el-popover
            placement="bottom-end"
            min-width="120px"
            :visible-arrow="false"
            :disabled="isPopoverDisabled"
            trigger="hover"
            popper-class="popper-z-index"
            id="panel-calender-popover">
            <template v-if="this.searchTime&&this.searchTime.length>1">
              <el-row  :gutter="10" class="calendar-popover">
                <el-col :span="24" class="calendar-popover-text">{{searchTime[0]}}</el-col>
              </el-row>
              <el-row  :gutter="10" class="calendar-popover">
                <el-col :span="24" class="calendar-popover-text">{{$t('dashboard.panel.to')}}</el-col>
              </el-row>
              <el-row  :gutter="10" class="calendar-popover">
                <el-col :span="24" class="calendar-popover-text">{{searchTime[1]}}</el-col>
              </el-row>
            </template>
            <template v-else>
              <div style="text-align: center;width: 100%;color: #909399;font-family: NotoSans !important;font-size: 12px !important;">{{$t("dashboard.panel.noDate")}}</div>
            </template>
            <div  class="el-dropdown-link" slot="reference">
              <i class="nz-icon nz-icon-time" style="width:20px;"></i>
              <span class="panel-list-title" id="timePickerContent">{{showTime.text}}</span>
              <span class="dropdown--suffix">
            <i class="el-icon-arrow-down"></i>
          </span>
            </div>
          </el-popover>
          <el-dropdown-menu class="nz-dashboard-dropdown popper-z-index" slot="dropdown">
            <!-- <el-dropdown-item >{{$t('dashboard.panel.customTimeRange')}}</el-dropdown-item>  -->
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
        text: this.$t('dashboard.panel.noDate')
      },
      timeData: [
        {
          id: 0,
          text: this.$t('dashboard.panel.customTimeRange')
        },
        {
          id: 12,
          text: this.$t('dashboard.panel.noDate')

        },
        {
          id: 1,
          text: this.$t('dashboard.panel.beforeFiveMin'),
          type: 'minute',
          value: 5
        },
        {
          id: 2,
          text: this.$t('dashboard.panel.beforeFifteenMin'),
          type: 'minute',
          value: 15
        },
        {
          id: 3,
          text: this.$t('dashboard.panel.beforeThirtyMin'),
          type: 'minute',
          value: 30
        },
        {
          id: 4,
          text: this.$t('dashboard.panel.beforeOneHour'),
          type: 'hour',
          value: 1
        },
        {
          id: 5,
          text: this.$t('dashboard.panel.beforeThreeHour'),
          type: 'hour',
          value: 3
        },
        {
          id: 6,
          text: this.$t('dashboard.panel.beforeSixHour'),
          type: 'hour',
          value: 6
        },
        {
          id: 7,
          text: this.$t('dashboard.panel.beforeTwelveHour'),
          type: 'hour',
          value: 12
        },
        {
          id: 8,
          text: this.$t('dashboard.panel.beforeTwentyFourHour'),
          type: 'hour',
          value: 24
        },
        {
          id: 9,
          text: this.$t('dashboard.panel.beforeTwoDay'),
          type: 'date',
          value: 2
        },
        {
          id: 10,
          text: this.$t('dashboard.panel.beforeSevenDay'),
          type: 'date',
          value: 7
        },
        {
          id: 11,
          text: this.$t('dashboard.panel.beforeThirtyDay'),
          type: 'date',
          value: 30
        }
      ],
      nowTimeType: {
        id: 4,
        text: this.$t('dashboard.panel.beforeOneHour'),
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
            const startTime = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss')
            const endTime = bus.timeFormate(new Date(this.searchTime[0]).getTime() + new Date(this.stepSearchTime[1]).getTime() - new Date(this.stepSearchTime[0]).getTime(), 'yyyy-MM-dd hh:mm:ss')
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
    console.log(this.searchTime, 'this.searchTime')
  },
  methods: {
    dateChange (val) {
      const startTime = bus.timeFormate(val, 'yyyy-MM-dd hh:mm:ss')
      const endTime = bus.timeFormate(new Date(val).getTime() + new Date(this.stepSearchTime[1]).getTime() - new Date(this.stepSearchTime[0]).getTime(), 'yyyy-MM-dd hh:mm:ss')
      this.$set(this.searchTime, 0, startTime)
      this.$set(this.searchTime, 1, endTime)

      // let timerPicker = document.querySelector('#timePickerContent');
      // timerPicker.innerText = this.searchTime[0]+" "+this.$t("dashboard.panel.to")+" "+this.searchTime[1];
      this.$set(this.showTime, 'id', 0)
      this.$set(this.showTime, 'text', this.searchTime[0] + ' ' + this.$t('dashboard.panel.to') + ' ' + this.searchTime[1])
      this.$set(this.showTime, 'type', '')
      this.$set(this.showTime, 'value', '')
      /*
            let tipElementList = document.getElementsByClassName('calendar-popover-text');
            if(tipElementList && tipElementList.length===3){
              console.log('-0-0-0',tipElementList);
              tipElementList[0].innerHTML = this.searchTime[0];
              tipElementList[1].innerHTML = this.$t("dashboard.panel.to");
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
        // let timerPicker = document.querySelector('#timePickerContent');
        // timerPicker.innerText = val.text;
        /*
        let tipElementList = document.getElementsByClassName('calendar-popover-text');
        if(tipElementList && tipElementList.length===3){
          tipElementList[0].innerHTML = this.searchTime[0];
          tipElementList[1].innerHTML = this.$t("dashboard.panel.to");
          tipElementList[2].innerHTML = this.searchTime[1];
        } */

        const id = val.id
        if (id === 0) { // custom
          if (from === 'chart') {
            this.isCustom = false
            this.$emit('change', this.searchTime)
          } else {
            this.isCustom = true
            this.$refs.calendar.focus()
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
        const startTime = bus.timeFormate(new Date(this.stepSearchTime[0]).getTime() - val * 60 * 1000, 'yyyy-MM-dd hh:mm:ss')
        const endTime = bus.timeFormate(new Date(this.stepSearchTime[1]).getTime() - val * 60 * 1000, 'yyyy-MM-dd hh:mm:ss')
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'm')
      } else if (type === 'hour') {
        const startTime = bus.timeFormate(new Date(this.stepSearchTime[0]).getTime() - val * 60 * 60 * 1000, 'yyyy-MM-dd hh:mm:ss')
        const endTime = bus.timeFormate(new Date(this.stepSearchTime[1]).getTime() - val * 60 * 60 * 1000, 'yyyy-MM-dd hh:mm:ss')
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'h')
      } else if (type === 'date') {
        const startTime = bus.timeFormate(new Date(this.stepSearchTime[0]).getTime() - val * 24 * 60 * 60 * 1000, 'yyyy-MM-dd hh:mm:ss')
        const endTime = bus.timeFormate(new Date(this.stepSearchTime[1]).getTime() - val * 24 * 60 * 60 * 1000, 'yyyy-MM-dd hh:mm:ss')
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
            text: this.$t('dashboard.panel.noDate')
          }
        }, 500)
        this.$emit('change', this.searchTime)
      } else {
        this.searchTime = []
        this.showTime = this.nowTimeType = {
          id: 4,
          text: this.$t('dashboard.panel.beforeOneHour'),
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

<style scoped>
.bR4004{
  border-radius: 4px 0 0 4px ;
}
</style>
