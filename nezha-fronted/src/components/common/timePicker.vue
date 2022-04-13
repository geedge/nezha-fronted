<template>
  <div
    id="panel-calender"
    :class="{ 'calendar--small': size === 'small' }"
    class="calendar"
  >
    <!-- <my-date-picker
      prefix-icon=" "
      class="panel-time-picker-hidden"
      size="mini"
      ref="calendar"
      :value-format="timeFormatStrToDatePickFormat(timeFormatMain)"
      :format="timeFormatStrToDatePickFormat(timeFormatMain)"
      @change="dateChange"
      v-model="searchTime"
      type="datetimerange"
      popper-class="panel-time-picker-popper time-picker-popover__select-top"
      :default-time="['00:00:00', '23:59:59']"
      :range-separator="$t('dashboard.panel.to')"
      :start-placeholder="$t('dashboard.panel.startTime')"
      :end-placeholder="$t('dashboard.panel.endTime')"
      align="right"
    >
    </my-date-picker> -->
    <div @click="showDropdown" class="date-range-text">
      <div class="calendar-popover-text">
        <i class="nz-icon nz-icon-time"></i>
      </div>
      <div class="calendar-popover-text" style="display: flex" v-if="isCustom">
        <div class="calendar-popover-text">
          {{ searchTime[0] }}
        </div>
        <div class="calendar-popover-text">{{ $t("dashboard.panel.to") }}</div>
        <div class="calendar-popover-text">
          {{ searchTime[1] }}
        </div>
      </div>
      <div class="calendar-popover-text" v-else>
        <div class="time-no-data">{{ showTime.text }}</div>
      </div>
      <div class="calendar-popover-text">
        <i class="el-icon-arrow-down"></i>
      </div>
    </div>
    <!-- <el-dropdown ref="timePickerDropdown" class="calendar-dropdown-title" trigger="click" @command="timeChange" @visible-change="popoverClick">
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
            <el-col :span="24" class="calendar-popover-text">{{$t('dashboard.panel.to')}}</el-col>
          </el-row>
          <el-row  :gutter="10" class="calendar-popover">
            <el-col :span="24" class="calendar-popover-text">{{searchTime[1]}}</el-col>
          </el-row>
        </template>
        <template v-else>
          <div class="time-no-data">{{$t("dashboard.panel.noDate")}}</div>
        </template>
        <div  class="el-dropdown-link" slot="reference">
          <i class="nz-icon nz-icon-time" style="width:20px;"></i>
          <span class="panel-list-title" id="timePickerContent">{{showTime.text}}</span>
          <span class="dropdown--suffix">
            <i class="el-icon-arrow-down"></i>
          </span>
        </div>
      </el-popover>
      <el-dropdown-menu class="nz-dashboard-dropdown popper-z-index" style="margin-top: 5px" slot="dropdown">
        <template v-for="(item, index) in timeData" >
          <el-dropdown-item v-if="item.id !== 12 || showEmpty" :key="index" :class="showTime.id === item.id ? 'nz-dashboard-dropdown-bg' : ''" :command="item">
            {{item.text}}
          </el-dropdown-item>
        </template>

      </el-dropdown-menu>
    </el-dropdown> -->
    <transition name="el-zoom-in-top">
      <div v-if="dropdownFlag" class="date-range-panel popper-z-index">
        <el-row class="date-range-panel-top" style="position: relative">
          <el-col
            :span="16"
            class="date-range-panel-content date-range-panel-content-left"
          >
            <div class="date-range-title" style="padding-left: 0">
              Absolute time range
            </div>
            <my-date-picker
              prefix-icon=" "
              class="panel-time-picker-hidden"
              size="mini"
              ref="calendar"
              :format="timeFormatStrToDatePickFormat(timeFormatMain)"
              @change="dateChange(whoChoose)"
              v-model="searchTimeValue"
              type="date"
              popper-class="panel-time-picker-popper time-picker-popover__select-top"
              align="right"
            >
            </my-date-picker>

            <div class="content-title">From</div>
            <div @click="myDatePickerShow('start')" tabindex="1" class="content-input">
              <!-- {{ searchTime[0] }} -->
              <el-input v-model="searchTime[0]" @change="dateChange('start',searchTime[0])"> </el-input>
            </div>
            <div class="content-title">To</div>
            <div @click="myDatePickerShow('end')" tabindex="2" class="content-input">
              <el-input v-model="searchTime[1]" @change="dateChange('end',searchTime[1])"> </el-input>

              <!-- {{ searchTime[1] }} -->

            </div>
            <div>
              <el-button
                @click="timeRange(searchTime)"
                type="primary"
                size="mini"
                >Apply time range</el-button
              >
            </div>
            <div class="date-range-title" style="padding-left: 0">
              Recently used absolute ranges
            </div>
            <div class="date-range-history">
              <div
                v-for="(item, index) in rangeHistoryArr"
                :key="index"
                class="date-range-history-item"
                @click="historyChange(item)"
              >
                {{ timeFormate(item.start) }}
                —
                {{ timeFormate(item.end) }}
              </div>
            </div>
          </el-col>
          <el-col
            :span="8"
            class="date-range-panel-content date-range-panel-content-right"
            style="border-left: 1px solid rgba(0, 0, 0, 0.09)"
          >
            <div class="date-range-title">Relatime time ranges</div>
            <ul class="date-range-item">
              <li
                v-for="(item, key) in timeData"
                @click="timeChange(item)"
                :class="showTime.id === item.id ? 'active' : ''"
                :key="key"
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
          <el-col :span="12" class="utc-str">{{ utcStr }}</el-col>
        </el-row>
      </div>
    </transition>
  </div>
</template>

<script>
import bus from "@/libs/bus";

export default {
  name: "timePicker",
  props: {
    defaultPick: Number,
    showEmpty: { default: false, type: Boolean },
    size: {
      type: String,
    },
  },
  data() {
    return {
      whoChoose:'',
      searchTimeValue:'',
      rangeHistory: [],
      rangeHistoryArr: [],
      address: "",
      utc: localStorage.getItem("timezoneOffset"),
      utcStr: "",
      dropdownFlag: false,
      isPopoverDisabled: false,
      isCustom: false,
      searchTime: [
        bus.timeFormate(bus.getOffsetTimezoneData(-1)),
        bus.timeFormate(bus.getOffsetTimezoneData()),
      ],
      showTime: {
        id: 4,
        text: this.$t("dashboard.panel.lastOneHour"),
      },
      timeData: [
        // {
        //   id: 0,
        //   text: this.$t("dashboard.panel.customTimeRange"),
        //   value: -1,
        // },
        {
          id: 12,
          text: this.$t("dashboard.panel.noDate"),
          value: 0,
        },
        {
          id: 1,
          text: this.$t("dashboard.panel.lastFiveMin"),
          type: "minute",
          value: 5,
        },
        {
          id: 2,
          text: this.$t("dashboard.panel.lastFifteenMin"),
          type: "minute",
          value: 15,
        },
        {
          id: 3,
          text: this.$t("dashboard.panel.lastThirtyMin"),
          type: "minute",
          value: 30,
        },
        {
          id: 4,
          text: this.$t("dashboard.panel.lastOneHour"),
          type: "hour",
          value: 1,
        },
        {
          id: 5,
          text: this.$t("dashboard.panel.lastThreeHour"),
          type: "hour",
          value: 3,
        },
        {
          id: 6,
          text: this.$t("dashboard.panel.lastSixHour"),
          type: "hour",
          value: 6,
        },
        {
          id: 7,
          text: this.$t("dashboard.panel.lastTwelveHour"),
          type: "hour",
          value: 12,
        },
        {
          id: 8,
          text: this.$t("dashboard.panel.lastTwentyFourHour"),
          type: "hour",
          value: 24,
        },
        {
          id: 9,
          text: this.$t("dashboard.panel.lastTwoDay"),
          type: "date",
          value: 2,
        },
        {
          id: 10,
          text: this.$t("dashboard.panel.lastSevenDay"),
          type: "date",
          value: 7,
        },
        {
          id: 11,
          text: this.$t("dashboard.panel.lastThirtyDay"),
          type: "date",
          value: 30,
        },
      ],
      nowTimeType: {
        id: 4,
        text: this.$t("dashboard.panel.lastOneHour"),
        type: "hour",
        value: 1,
      },
    };
  },
  mounted() {
    this.getItem();
    this.getUtcStr();
    this.getRangeHistoryArr();
  },
  methods: {
    getItem() {
      this.rangeHistory = localStorage.getItem("date-range-history")
        ? JSON.parse(localStorage.getItem("date-range-history"))
        : [];
      this.address = localStorage.getItem("nz-sys-timezone");
      this.utc = localStorage.getItem("timezoneOffset");
    },
    myDatePickerShow(item) {
      this.whoChoose = item
        this.$refs.calendar.pickerVisible = true;
    },
    historyChange(item) {
      this.searchTime[0] = item.start;
      this.searchTime[1] = item.end;
      this.isCustom = true;
      this.showDropdown();
      this.$emit("change", this.searchTime);
      this.setSearchTime('','',this.searchTime)
    },
    getRangeHistoryArr() {
      const arr = this.rangeHistory.slice(0, 3)
      this.rangeHistoryArr = arr
    },
    getUtcStr() {
      let str = "UTC ";
      this.utcStr = str + this.utc;
    },
    timeRange(item) {
      
      this.isCustom = true;
      this.rangeHistory.unshift({
        start: item[0],
        end: item[1],
      });
      localStorage.setItem(
        "date-range-history",
        JSON.stringify(this.rangeHistory)
      );
      this.showDropdown();
      this.getRangeHistoryArr()
      console.log('timerange里searchTime',this.searchTime);
      this.searchTime[2]=''
      this.$emit("change", this.searchTime);
      this.setSearchTime('','',this.searchTime)
    },
    showDropdown() {
      this.dropdownFlag = !this.dropdownFlag;
    },
    dateChange(type,v) {
      if(type == 'start'){
        if(!v){
          const startTime = bus.timeFormate(this.searchTimeValue).trim().split(" ")[0] + ' ';
        this.$set(this.searchTime, 0, startTime);
        }else{
          console.log(v);
          let str = v.trim().split(' ')[1]
          console.log(str);
          let reg = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/
          if(reg.test(str)){
            const startTime = bus.timeFormate(v)
          this.$set(this.searchTime, 0, startTime);
          }else{
            console.log('输入不规范');
          this.$set(this.searchTime, 0, '');

          }
        }
      }else if(type == 'end'){
        if(!v){
          const endTime = bus.timeFormate(this.searchTimeValue).trim().split(" ")[0] + ' ';
        this.$set(this.searchTime, 1, endTime);
        }else{
           let str = v.trim().split(' ')[1]
          console.log(str);
          let reg = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/
          if(reg.test(str)){
            const endTime = bus.timeFormate(v)
          this.$set(this.searchTime, 1, endTime);
          }else{
            console.log('输入不规范');
          this.$set(this.searchTime, 1, '');

          }
        }
      }
      this.searchTime[2] = ''
      console.log('searchTime',this.searchTime);
      this.$set(this.showTime, "id", 0);
      this.$set(
        this.showTime,
        "text",
        this.searchTime[0] +
          " " +
          this.$t("dashboard.panel.to") +
          " " +
          this.searchTime[1]
      );
      console.log('showTime',this.showTime);
    },
    setCustomTime(timeGroup, timeRange) {
      if (timeGroup) {
        console.log('timeGroup',timeGroup);
        this.showTime = this.nowTimeType = this.timeData.find(
          (item) => item.id == timeGroup.id
        );
        console.log(this.showTime);
        if (this.showTime) {
          this.showTime = Object.assign({}, this.showTime);
          this.$set(this.searchTime, 0, timeGroup.start_time);
          this.$set(this.searchTime, 1, timeGroup.end_time);
        } else {
          const time = this.searchTime.splice(' ')
          this.showTime= this.nowTimeType ={
            text:time[0] +' ' + this.$t('dashboard.panel.to') +' '+time[1]
          }
          this.$set(this.searchTime, 0, bus.timeFormate(time[0]));
          this.$set(this.searchTime, 1, bus.timeFormate(time[1]));
          // this.showTime = this.nowTimeType = {
          //   id: 4,
          //   text: this.$t("dashboard.panel.lastOneHour"),
          //   type: "hour",
          //   value: 1,
          // };
          // const time = bus.getTimezontDateRange();
          // if (timeGroup.start_time) {
          //   this.$set(
          //     this.searchTime,
          //     0,
          //     bus.timeFormate(timeGroup.start_time)
          //   );
          //   this.$set(this.searchTime, 1, bus.timeFormate(timeGroup.end_time));
          // } else {
          //   this.$set(this.searchTime, 0, bus.timeFormate(time[0]));
          //   this.$set(this.searchTime, 1, bus.timeFormate(time[1]));
          // }
            // this.$set(this.searchTime, 0, bus.timeFormate(time[0]));
        }
      } else {
        console.log('no timegroup');
        this.showTime = this.nowTimeType = {
          id: 4,
          text: this.$t("dashboard.panel.lastOneHour"),
          type: "hour",
          value: 1,
        };
        const time = bus.getTimezontDateRange();
        this.$set(this.searchTime, 0, time[0]);
        this.$set(this.searchTime, 1, time[1]);
      }
    },
    timeChange(val, from) {
      console.log(val, from);
      this.nowTimeType = val;
      this.$set(this.showTime, "id", val.id);
      this.$set(this.showTime, "text", val.text);
      if (!val) {
        this.isCustom = false;
        return false;
      } else {
        this.setSearchTime(val.type, val.value);

        const id = val.id;
        if (id === 0) {
          // custom
          if (from === "chart") {
            this.isCustom = false;
            this.$emit("change", this.searchTime);
          } else {
            this.isCustom = true;
            this.$refs.calendar.focus();
            this.$refs.calendar.pickerVisible = true;
            if (document.getElementById("viewGraphDialog")) {
              // 处理 多弹出的z-index的问题 当前为 alertMessage的处理
              const viewGraphDialogStyle = window.getComputedStyle(
                document.getElementById("viewGraphDialog", null)
              );
              setTimeout(() => {
                if (viewGraphDialogStyle["z-index"] !== "auto") {
                  const dom =
                    document.getElementsByClassName("el-picker-panel");
                  Array.prototype.forEach.call(dom, function (element) {
                    element.style["z-index"] =
                      viewGraphDialogStyle["z-index"] + 1;
                  });
                  this.$refs.calendar.$el.style["z-index"] =
                    viewGraphDialogStyle["z-index"] + 1;
                }
              });
            }
          }
        } else {
          console.log('else',this.searchTime);
          // this.isCustom = false;
          this.showDropdown()
          if (this.showEmpty && id === 12) {
            this.searchTime = [];
          }
          this.$emit("change", this.searchTime);
        }
      }

    },
    getCurrentTime() {
        return this.searchTime;
      console.log('getcurrenttime');
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
    setSearchTime(type, val,time) {
      if (type === "minute") {
        const startTime = bus.timeFormate(
          new Date(bus.computeTimezone(new Date().getTime())).setMinutes(
            new Date(bus.computeTimezone(new Date().getTime())).getMinutes() -
              val
          )
        );
        const endTime = bus.timeFormate(
          new Date(bus.computeTimezone(new Date().getTime()))
        );
        this.$set(this.searchTime, 0, startTime);
        this.$set(this.searchTime, 1, endTime);
        this.$set(this.searchTime, 2, val + "m");
      } else if (type === "hour") {
        const startTime = bus.timeFormate(
          new Date(bus.computeTimezone(new Date().getTime())).setHours(
            new Date(bus.computeTimezone(new Date().getTime())).getHours() - val
          )
        );
        const endTime = bus.timeFormate(
          new Date(bus.computeTimezone(new Date().getTime()))
        );
        this.$set(this.searchTime, 0, startTime);
        this.$set(this.searchTime, 1, endTime);
        this.$set(this.searchTime, 2, val + "h");
      } else if (type === "date") {
        const startTime = bus.timeFormate(
          new Date(bus.computeTimezone(new Date().getTime())).setDate(
            new Date(bus.computeTimezone(new Date().getTime())).getDate() - val
          )
        );
        const endTime = bus.timeFormate(
          new Date(bus.computeTimezone(new Date().getTime()))
        );
        this.$set(this.searchTime, 0, startTime);
        this.$set(this.searchTime, 1, endTime);
        this.$set(this.searchTime, 2, val + "d");
      }else{
        this.$set(this.searchTime, 0, time[0]);
        this.$set(this.searchTime, 1, time[1]);

      }
    },
    setCostomTime: function (costomTime) {
      this.searchTime = Object.assign(costomTime);
      const val = Object.assign(this.timeData[0]);
      this.$set(this.showTime, "id", val.id);
      this.$set(this.showTime, "text", val.text);
    },
    popoverClick(val) {
      if (val) {
        this.isPopoverDisabled = true;
      } else {
        this.isPopoverDisabled = false;
      }
    },
  },
  watch: {
    defaultPick: {
      immediate: true,
      handler(n, o) {
        console.log(n);
        if (n && Number.isInteger(n)) {
          const showTime = this.timeData.find((item) => item.id == n);
          if (showTime) {
            this.showTime = Object.assign({}, showTime);
            this.searchTime = this.$parent.searchTime;
          }
          if (this.showEmpty && this.defaultPick === 12) {
            this.searchTime = [];
          }
        }
      },
    },
  },
};
</script>
