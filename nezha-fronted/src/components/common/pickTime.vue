<template>
  <div class="interval-refresh">
    <el-date-picker size="mini" ref="calendar"
                    format="yyyy/MM/dd HH:mm:ss"
                    @change="dateChange"
                    v-model="searchTime"
                    type="datetimerange"
                    :picker-options="pickerOptions"
                    :range-separator="$t('dashboard.panel.to')"
                    :start-placeholder="$t('dashboard.panel.startTime')"
                    :end-placeholder="$t('dashboard.panel.endTime')"
                    style="margin-right: 20px"
                    align="right">
    </el-date-picker>
    <div class="nz-btn-group nz-btn-group-size-normal nz-btn-group-light margin-r-20" v-show="useRefresh">
      <button style="border-right: 1px solid rgba(162,162,162,0.50);height: 100%" type="button" class="nz-btn nz-btn-size-normal nz-btn-style-light" @click="refreshDataFunc">
        <i style="font-size: 12px" class="global-active-color nz-icon nz-icon-refresh"></i>&nbsp;
        <span class="nz-btn nz-btn-text" ><slot name="added-text"></slot></span>
      </button>
      <el-popover v-model="visible" placement="bottom-start" :width="50" trigger="click" popper-class="interval-refresh-popover" >
        <ul class="popover_ul">
          <li v-for="i in intervalList" :style="{color:interval==i.value?'#31749C':''}" :key="i.value+i.name" @click="selectInterval(i)">
            {{i.name}}
          </li>
        </ul>
        <button type="button" style="border-radius: 0 4px 4px 0;height: 100%" class="nz-btn nz-btn-size-normal nz-btn-style-light" slot="reference">
          <span class="nz-btn nz-btn-text">{{interval.value != -1?interval.name:''}}&nbsp</span><i style="font-size: 12px" class="nz-icon nz-icon-arrow-down"></i>
        </button>
      </el-popover>
    </div>
  </div>
</template>

<script>
  import bus from "../../libs/bus";

  export default {
    name: "intervalRefresh",
    model:{
      event:'change',
      prop:'timeRange'
    },
    props:{
      refreshDataFunc:{
        required:true,
        type:Function
      },
      timeRange:{
        type:Array,
        required: true,
      },
      useRefresh:{
        type:Boolean,
        default:true,
      }
    },
    data(){
      return{
        searchTime:[],
        pickerOptions: {
          shortcuts: [
            {
              text: this.$t("dashboard.panel.recOne"),
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setHours(start.getHours() - 1);
                picker.$emit('pick', [start, end]);
              }
            }, {
              text: this.$t("dashboard.panel.recFour"),
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setHours(start.getHours() - 4);
                picker.$emit('pick', [start, end]);
              }
            }, {
              text: this.$t("dashboard.panel.recOneDay"),
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 1);
                picker.$emit('pick', [start, end]);
              }
            }, {
              text: this.$t("dashboard.panel.yesterday"),
              onClick(picker) {
                const start = new Date();
                const end = new Date();
                start.setDate(start.getDate() - 1);
                start.setHours(0);
                start.setMinutes(0);
                start.setSeconds(0);
                end.setDate(end.getDate() - 1);
                end.setHours(23);
                end.setMinutes(59);
                end.setSeconds(59);
                picker.$emit('pick', [start, end]);
              }
            }, {
              text: this.$t("dashboard.panel.recSevenDay"),
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 7);
                picker.$emit('pick', [start, end]);
              }
            }, {
              text: this.$t("dashboard.panel.recOneMonth"),
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 30);
                picker.$emit('pick', [start, end]);
              }
            }, {
              text: this.$t("dashboard.panel.curMonth"),
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setDate(1);
                start.setHours(0);
                start.setMinutes(0);
                start.setSeconds(0)
                picker.$emit('pick', [start, end]);
              }
            }, {
              text: this.$t("dashboard.panel.lastMonth"),
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setDate(1);
                start.setMonth(start.getMonth() - 1);
                end.setDate(0);
                start.setStart();
                end.setEnd();
                picker.$emit('pick', [start, end]);
              }
            }],
        },
        visible: false,
        intervalTimer: null,
        intervalList: [{
          value: -1,
          name: this.$t("dashboard.panel.refreshInterval.never"),
        }, {
          value: 30,
          name: '30s',
        }, {
          value: 60,
          name: '1m',
        }, {
          value: 300,
          name: '5m',
        }, {
          value: 900,
          name: '15m',
        }, {
          value: 1800,
          name: '30m',
        }],
        interval: -1,
      }
    },
    created(){
      this.searchTime=this.timeFormate(this.timeRange)
      this.$emit('change',this.searchTime)
    },
    methods:{
      selectInterval(val) {
        this.visible = false;
        clearInterval(this.intervalTimer);
        if (val && val.value != -1) {
          this.interval = val;
          const start = new Date(this.searchTime[1]);
          const now = new Date();
          const interval = Math.floor((now.getTime() - start.getTime()) / 1000); //计算当前结束时间到现在的间隔（秒）
          if (interval >= 60) { //如果结束时间到现在超过1分钟，则
            this.getIntervalData(interval);
          }
          this.intervalTimer = setInterval(() => {
            this.getIntervalData(this.interval.value);
          }, val.value * 1000);
        }
      },
      getIntervalData(interval) { //interval:结束时间到现在的秒数
        const start = new Date(this.searchTime[0]);
        const end = new Date(this.searchTime[1]);
        start.setSeconds(start.getSeconds() + interval);
        end.setSeconds(end.getSeconds() + interval);

        this.searchTime = this.timeFormate([start,end])
        //刷新数据
        this.refreshDataFunc();
      },
      timeFormate(timeRange){
        const startTime = bus.timeFormate(timeRange[0], 'yyyy-MM-dd hh:mm:ss');
        const endTime = bus.timeFormate(timeRange[1], 'yyyy-MM-dd hh:mm:ss');
        return [startTime, endTime];
      },
      dateChange(time) {
        let timeRange=this.timeFormate(time);
        this.$emit('change',timeRange)
        this.refreshDataFunc();
      },
    }
  }
</script>

<style scoped lang="scss">
.interval-refresh{
  display: flex;
}
.popover_ul{
  text-align: center;
}
.popover_ul li {
  padding: 10px 3px;
  cursor: pointer;
}
.popover_ul li:hover {
  background: $dropdown-hover-background-color !important;
  color: $global-text-color-active !important;
}
</style>
<style>
  .interval-refresh-popover{
    min-width: unset !important;
  }
</style>
