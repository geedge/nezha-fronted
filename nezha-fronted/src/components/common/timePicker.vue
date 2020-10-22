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
    margin-top: 0px !important;
    text-align:left;
    border-radius:4px;
    min-width:80px;
    height:24px;
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
    visibility: hidden !important;
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
</style>
<style lang="scss">
  .panel-time-picker-popper[x-placement^=bottom] .popper__arrow {
    left: 85% !important;
  }
  .panel-time-picker-popper[x-placement^=bottom] {
  }

  .panel-time-picker-popper .el-date-table td.today span {
    color: #FFF !important;
  }

  .panel-time-picker-popper .el-picker-panel__footer button:nth-child(1){
    display:none;
  }
</style>
<template>
  <div class="calendar top-tools" id="panel-calender">
    <el-date-picker prefix-icon=" " class="panel-time-picker-hidden " size="mini" ref="calendar"
                    format="yyyy/MM/dd HH:mm:ss" @change="dateChange" v-model="searchTime" type="datetimerange"
                    popper-class="panel-time-picker-popper"
                    :range-separator="$t('dashboard.panel.to')"
                    :start-placeholder="$t('dashboard.panel.startTime')"
                    :end-placeholder="$t('dashboard.panel.endTime')" align="right">
    </el-date-picker>
    <!--
    <button type="button" style="border-radius: 1px 1px 1px 1px" @click="right()" v-show="isCustom"
            class="nz-btn nz-btn-size-normal nz-btn-style-light time-picker-button time-picker-right-button" >
      <i style="font-size: 12px" class="el-icon-arrow-right"></i>
    </button>-->
    <el-dropdown @command="timeChange" ref="timePickerDropdown"   class="calendar-dropdown-title" trigger="click" v-scrollBar:el-dropdown @visible-change="popoverClick">
      <el-popover
        placement="bottom-end"
        min-width="120px"
        :visible-arrow="false"
        :disabled="isPopoverDisabled"
        trigger="hover"
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
          <i class="nz-icon nz-icon-arrow-down"  style="padding-left:0px !important;width:20px;"></i>
        </div>
      </el-popover>
      <el-dropdown-menu class="nz-dashboard-dropdown" slot="dropdown">
        <!-- <el-dropdown-item >{{$t('dashboard.panel.customTimeRange')}}</el-dropdown-item>  -->
        <template v-for="item in timeData" >
          <el-dropdown-item :class="showTime.id==item.id?'nz-dashboard-dropdown-bg':''" :command="item" v-if="item.id != 12 || showEmpty">
            {{item.text}}
          </el-dropdown-item>
        </template>

      </el-dropdown-menu>
    </el-dropdown>
    <!--
    <button type="button" style="border-radius: 1px 1px 1px 1px" @click="left()" v-show="isCustom"
            class="nz-btn nz-btn-size-normal nz-btn-style-light time-picker-button time-picker-left-button" >
      <i style="font-size: 12px" class="el-icon-arrow-left"></i>
    </button>-->
  </div>
</template>

<script>
import bus from '../../libs/bus';

export default {
  name: "timePicker",
  props: {
    defaultPick:Number,
    showEmpty:{default:false,type:Boolean}
  },
  data() {
    return {
      isPopoverDisabled:false,
      isCustom:false,
      searchTime:[
        bus.timeFormate(bus.getOffsetTimezoneData(-1),'yyyy-MM-dd hh:mm:ss'),
        bus.timeFormate(bus.getOffsetTimezoneData(),'yyyy-MM-dd hh:mm:ss')
      ],
      showTime: {
        id: 4,
        text: this.$t("dashboard.panel.lastOneHour"),
      },
      timeData: [
        {
          id:0,
          text:this.$t("dashboard.panel.customTimeRange"),
        },
        {
          id:12,
          text:this.$t("dashboard.panel.noDate"),

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
      nowTimeType:{
        id:4,
        text:this.$t("dashboard.panel.lastOneHour"),
        type:'hour',
        value:1,
      },
    };
  },
  methods: {
    dateChange(val){
      let startTime = bus.timeFormate(val[0], 'yyyy-MM-dd hh:mm:ss');
      let endTime = bus.timeFormate(val[1], 'yyyy-MM-dd hh:mm:ss');
      this.$set(this.searchTime, 0, startTime);
      this.$set(this.searchTime, 1, endTime);

      //let timerPicker = document.querySelector('#timePickerContent');
      //timerPicker.innerText = this.searchTime[0]+" "+this.$t("dashboard.panel.to")+" "+this.searchTime[1];
      this.$set(this.showTime, 'id', 0);
      this.$set(this.showTime, 'text', this.searchTime[0]+" "+this.$t("dashboard.panel.to")+" "+this.searchTime[1]);
      /*
            let tipElementList = document.getElementsByClassName('calendar-popover-text');
            if(tipElementList && tipElementList.length===3){
              console.log('-0-0-0',tipElementList);
              tipElementList[0].innerHTML = this.searchTime[0];
              tipElementList[1].innerHTML = this.$t("dashboard.panel.to");
              tipElementList[2].innerHTML = this.searchTime[1];
              console.log('-0-0-2',tipElementList);
            }*/
      this.$emit('change', this.searchTime);

    },
    setCustomTime(timeGroup){
      if(timeGroup.length===2){
        this.$set(this.searchTime, 0, timeGroup[0]);
        this.$set(this.searchTime, 1, timeGroup[1]);

        this.$set(this.showTime, 'id', 0);
        this.$set(this.showTime, 'text', this.searchTime[0]+" "+this.$t("dashboard.panel.to")+" "+this.searchTime[1]);
      }
    },
    //left(){},
    //right(){},
    timeChange(val) {
      this.nowTimeType=val;
      this.$set(this.showTime, 'id', val.id);
      this.$set(this.showTime, 'text', val.text);
      if (!val) {
        this.isCustom = false;
        return false;
      }else {
        this.setSearchTime(val.type,val.value);
        //let timerPicker = document.querySelector('#timePickerContent');
        //timerPicker.innerText = val.text;
/*
        let tipElementList = document.getElementsByClassName('calendar-popover-text');
        if(tipElementList && tipElementList.length===3){
          tipElementList[0].innerHTML = this.searchTime[0];
          tipElementList[1].innerHTML = this.$t("dashboard.panel.to");
          tipElementList[2].innerHTML = this.searchTime[1];
        }*/

        let id = val.id;
        if(id===0){//custom
          this.isCustom = true;
          this.$refs.calendar.focus();
        }else {
          this.isCustom = false;
          if(this.showEmpty&& id === 12){
            this.searchTime=[]
          }
          this.$emit('change', this.searchTime);

        }
      }
    },
    getCurrentTime(){
       let timeTypeId = this.showTime.id;
       if(timeTypeId===0){
         return this.searchTime;
       }else {
         if(!timeTypeId){timeTypeId = 4;}
         let currentTime = this.timeData.find(item => item.id === timeTypeId);
         this.setSearchTime(currentTime.type,currentTime.value);
         return this.searchTime;
       }

    },
    setSearchTime(type,val){
      if(type==='minute'){
        let startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setMinutes(new Date(bus.computeTimezone(new Date().getTime())).getMinutes() - val),'yyyy-MM-dd hh:mm:ss');
        let endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())),'yyyy-MM-dd hh:mm:ss');
        this.$set(this.searchTime, 0, startTime);
        this.$set(this.searchTime, 1, endTime);
        this.$set(this.searchTime, 2, val + "m");
      }else if(type==='hour'){
        let startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - val),'yyyy-MM-dd hh:mm:ss');
        let endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())),'yyyy-MM-dd hh:mm:ss');
        this.$set(this.searchTime, 0, startTime);
        this.$set(this.searchTime, 1, endTime);
        this.$set(this.searchTime, 2, val + "h");
      }else if(type==='date'){
        let startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setDate(new Date(bus.computeTimezone(new Date().getTime())).getDate() - val),'yyyy-MM-dd hh:mm:ss');
        let endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())),'yyyy-MM-dd hh:mm:ss');
        this.$set(this.searchTime, 0, startTime);
        this.$set(this.searchTime, 1, endTime);
        this.$set(this.searchTime, 2, val + "d");
      }
    },
    setCostomTime:function(costomTime){
      this.searchTime=Object.assign(costomTime);
      let val=Object.assign(this.timeData[0]);
      this.$set(this.showTime, 'id', val.id);
      this.$set(this.showTime, 'text', val.text);
    },
    popoverClick(val){
      if(val){
        this.isPopoverDisabled = true;
      }else{
        this.isPopoverDisabled = false;
      }
    },
  },
  created() {
  },
  watch:{
    defaultPick:{
      immediate:true,
      handler(n,o){
        if(n&&Number.isInteger(n)){
          let showTime=this.timeData.find(item=>item.id == n);
          if(showTime){
            this.showTime = Object.assign({},showTime);
          }
          if(this.showEmpty&& this.defaultPick === 12){
            this.searchTime=[]
          }
        }
      }
    },
  },
  mounted: function () {
    /*
    if(this.isCustom){
      if(this.timeGroup.length===2){
        this.$set(this.searchTime, 0, this.timeGroup[0]);
        this.$set(this.searchTime, 1, this.timeGroup[1]);

        this.$set(this.showTime, 'id', 0);
        this.$set(this.showTime, 'text', this.searchTime[0]+" "+this.$t("dashboard.panel.to")+" "+this.searchTime[1]);
      }
    }else{
      let timeObj = this.timeData.find((item)=>{return item.id===this.timeDataId});
      this.$set(this.showTime, 'id', this.timeDataId);
      this.$set(this.showTime, 'text', timeObj.text);
      this.setSearchTime(timeObj.type,timeObj.value);
    }*/
  },
};
</script>


