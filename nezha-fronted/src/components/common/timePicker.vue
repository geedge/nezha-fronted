<style scoped lang="scss">
  .loading-font{
    color:#232f3e !important;
  }
  .calendar{
  }
  .nz-dashboard-dropdown-bg {
    background: $global-text-color-active;
    color: #fff;
  }
  .calendar-dropdown-title {
    line-height:24px;
    padding-left:5px;
    margin-left:0px;
    margin-top: 3px;
    text-align:left;
    border-radius:4px;
    width:160px;
    height:24px;
    border:solid 1px  #d8dce1;
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }
  .el-dropdown-link {
    cursor: pointer;
  }
  .calendar-popover{
    line-height:22px;
    text-align:center;
  }
</style>
<template>
  <div class="calendar top-tools" id="panel-calender">
    <el-dropdown @command="timeChange" class="calendar-dropdown-title" trigger="click" v-scrollBar:el-dropdown @visible-change="popoverClick">
      <el-popover
        placement="bottom-end"
        min-width="120px"
        :visible-arrow="false"
        :disabled="isPopoverDisabled"
        trigger="hover"
        id="panel-calender-popover">
        <el-row  :gutter="10" class="calendar-popover">
          <el-col :span="24">{{searchTime[0]}}</el-col>
        </el-row>
        <el-row  :gutter="10" class="calendar-popover">
          <el-col :span="24">to</el-col>
        </el-row>
        <el-row  :gutter="10" class="calendar-popover">
          <el-col :span="24">{{searchTime[1]}}</el-col>
        </el-row>
        <el-row  :gutter="10" class="el-dropdown-link" slot="reference">
          <el-col :span="3" ><i class="el-icon-time"></i></el-col>
          <el-col :span="17" class="panel-list-title" >{{showTime.text}}</el-col>
          <el-col :span="4" style="padding-left:0px !important;"><i class="el-icon-arrow-down el-icon--right"></i></el-col>
        </el-row>
      </el-popover>
      <el-dropdown-menu class="nz-dashboard-dropdown" slot="dropdown">
        <!-- <el-dropdown-item >{{$t('dashboard.panel.customTimeRange')}}</el-dropdown-item>  -->
        <el-dropdown-item v-for="item in timeData" :key="item.id+1"
                          :class="showTime.id==item.id?'nz-dashboard-dropdown-bg':''" :command="item">
          {{item.text}}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-date-picker prefix-icon=" " class="nz-dashboard-picker" size="mini" ref="calendar"
                    format="yyyy/MM/dd HH:mm" @change="dateChange" v-model="searchTime" type="datetimerange"
                    :picker-options="pickerOptions" :range-separator="$t('dashboard.panel.to')"
                    :start-placeholder="$t('dashboard.panel.startTime')"
                    :end-placeholder="$t('dashboard.panel.endTime')" align="right">
    </el-date-picker>
  </div>
</template>

<script>
import bus from '../../libs/bus';

export default {
  name: "timePicker",
  props: {
  },
  data() {
    return {
      isPopoverDisabled:false,
      searchTime:[
        bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setMinutes(new Date(bus.computeTimezone(new Date().getTime())).getMinutes() - 5),'yyyy-MM-dd hh:mm:ss'),
        bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())),'yyyy-MM-dd hh:mm:ss')
      ],
      showTime: {
        id: 1,
        text: this.$t("dashboard.panel.lastFiveMin"),
      },
      oldTime:{
        id: 1,
        text: this.$t("dashboard.panel.lastFiveMin"),
      },
      timeData: [
        {
          id:0,
          text:this.$t("dashboard.panel.customTimeRange"),
        },
        {
          id:1,
          text:this.$t("dashboard.panel.lastFiveMin"),
          type:'minute',
          value:5,
        },
        {
          id:2,
          text:this.$t("dashboard.panel.lastFifteenMin"),
          type:'minute',
          value:15,
        },
        {
          id:3,
          text:this.$t("dashboard.panel.lastThirtyMin"),
          type:'minute',
          value:30,
        },
        {
          id:4,
          text:this.$t("dashboard.panel.lastOneHour"),
          type:'hour',
          value:1,
        },
        {
          id:5,
          text:this.$t("dashboard.panel.lastThreeHour"),
          type:'hour',
          value:3,
        },
        {
          id:6,
          text:this.$t("dashboard.panel.lastSixHour"),
          type:'hour',
          value:6,
        },
        {
          id:7,
          text:this.$t("dashboard.panel.lastTwelveHour"),
          type:'hour',
          value:12,
        },
        {
          id:8,
          text:this.$t("dashboard.panel.lastTwentyFourHour"),
          type:'hour',
          value:24,
        },
        {
          id:9,
          text:this.$t("dashboard.panel.lastTwoDay"),
          type:'date',
          value:2,
        },
        {
          id:10,
          text:this.$t("dashboard.panel.lastSevenDay"),
          type:'date',
          value:7,
        },
        {
          id:11,
          text:this.$t("dashboard.panel.lastThirtyDay"),
          type:'date',
          value:30,
        }
      ],
    };
  },
  methods: {
    timeChange(val) {
      this.showTime = val;

      if (!val) {
        return false;
      }else {
        let id = val.id;
        if(id===0){

        }else {
          this.oldTime = val;
        }
        this.setSearchTime(val.type,val.value);
      }
      this.$emit('change', this.searchTime);
    },
    setSearchTime(type,val){
      if(type==='minute'){
        this.searchTime[0] = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setMinutes(new Date(bus.computeTimezone(new Date().getTime())).getMinutes() - val),'yyyy-MM-dd hh:mm:ss'),
        this.searchTime[1] = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())),'yyyy-MM-dd hh:mm:ss');
      }else if(type==='hour'){
        this.searchTime[0] = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - val),'yyyy-MM-dd hh:mm:ss'),
          this.searchTime[1] = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())),'yyyy-MM-dd hh:mm:ss');
      }else if(type==='date'){
        this.searchTime[0] = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setDate(new Date(bus.computeTimezone(new Date().getTime())).getDate() - val),'yyyy-MM-dd hh:mm:ss'),
          this.searchTime[1] = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())),'yyyy-MM-dd hh:mm:ss');
      }
    },
    popoverClick(val){
      if(val){
        this.isPopoverDisabled = true;
      }else{
        this.isPopoverDisabled = false;
      }
    },
  }
};
</script>


