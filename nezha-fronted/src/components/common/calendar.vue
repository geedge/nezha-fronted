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
    width:140px;
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
  .el-popper{

  }
</style>
<template>
  <div class="calendar top-tools">
    <el-dropdown @command="timeChange" class="calendar-dropdown-title" trigger="click" v-scrollBar:el-dropdown>
      <el-popover
        placement="bottom-end"
        width="80"
        trigger="hover">
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
          <el-col :span="16" class="panel-list-title" >{{showTime.text}}</el-col>
          <el-col :span="5" style="padding-left:0px !important;"><i class="el-icon-arrow-down el-icon--right"></i></el-col>
        </el-row>
      </el-popover>
      <el-dropdown-menu class="nz-dashboard-dropdown" slot="dropdown">
        <el-dropdown-item>{{$t('dashboard.panel.customTimeRange')}}</el-dropdown-item>
        <el-dropdown-item v-for="item in timeData" :key="item.id+1"
                          :class="showTime.id==item.id?'nz-dashboard-dropdown-bg':''" :command="item">
          {{item.text}}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import bus from '../../libs/bus';

export default {
  name: "calendar",
  props: {
  },
  data() {
    return {
      searchTime:[
        bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setMinutes(new Date(bus.computeTimezone(new Date().getTime())).getMinutes() - 15),'yyyy-MM-dd hh:mm:ss'),
        bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())),'yyyy-MM-dd hh:mm:ss')
      ],
      showTime: {
        id: 1,
        text: this.$t("dashboard.panel.lastFiveMin"),
      },
      timeData: [
        {
          id:1,
          text:this.$t("dashboard.panel.lastFiveMin"),
        },
        {
          id:2,
          text:this.$t("dashboard.panel.lastFifteenMin"),
        },
        {
          id:3,
          text:this.$t("dashboard.panel.lastThirtyMin"),
        },
        {
          id:4,
          text:this.$t("dashboard.panel.lastOneHour"),
        },
        {
          id:5,
          text:this.$t("dashboard.panel.lastThreeHour"),
        },
        {
          id:6,
          text:this.$t("dashboard.panel.lastSixHour"),
        },
        {
          id:7,
          text:this.$t("dashboard.panel.lastTwelveHour"),
        },
        {
          id:8,
          text:this.$t("dashboard.panel.lastTwentyFourHour"),
        },
        {
          id:9,
          text:this.$t("dashboard.panel.lastTwoDay"),
        },
        {
          id:10,
          text:this.$t("dashboard.panel.lastSevenDay"),
        },
        {
          id:11,
          text:this.$t("dashboard.panel.lastThirtyDay"),
        }
      ],
    };
  },
  methods: {
    timeChange(val) {
      if (!val) {
        //this.toAdd();
        return false;
      }
      this.showTime = val;
      //this.showPanel = val
      //this.filter.panelId = this.showPanel.id;
      //this.$emit('on-remove-chart-block', this.searchTime);
    },
  }
};
</script>


