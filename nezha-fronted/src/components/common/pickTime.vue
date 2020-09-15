<template>
  <div class="interval-refresh ">
    <time-picker v-if="showTimePicker" ref="timePicker" class="time-picker" @change="dateChange"></time-picker>
    <chart-unit v-model="unit" v-if="useChartUnit"></chart-unit>
      <div class="nz-btn-group nz-btn-group-size-normal nz-btn-group-light margin-r-20" v-show="useRefresh" style="height: 24px;line-height: 24px;vertical-align: middle;">
        <button style="border-right: 1px solid rgba(162,162,162,0.50);" type="button" class="nz-btn nz-btn-size-normal nz-btn-style-light" @click="refreshDataFunc">
          <i style="font-size: 12px" class="global-active-color nz-icon nz-icon-refresh"></i>&nbsp;
          <span class="nz-btn nz-btn-text" ><slot name="added-text"></slot></span>
        </button>
        <el-popover v-model="visible" placement="bottom-start" :width="50" trigger="click" popper-class="interval-refresh-popover" >
          <ul class="popover_ul">
            <li v-for="i in $CONSTANTS.intervalList" :style="{color:interval == i.value ? '#31749C' : ''}" :key="i.value + i.label" @click="selectInterval(i)">
              {{i.label}}
            </li>
          </ul>
          <button type="button" style="border-radius: 0 4px 4px 0;" class="nz-btn nz-btn-size-normal nz-btn-style-light" slot="reference">
            <span class="nz-btn nz-btn-text">{{interval.value != -1 ? interval.label : ''}}&nbsp</span><i style="font-size: 12px" class="nz-icon nz-icon-arrow-down"></i>
          </button>
        </el-popover>
      </div>
  </div>
</template>

<script>
  import bus from "../../libs/bus";
  import timePicker from "./timePicker";
  import chartUnit from "./chartUnit";
  export default {
    name: "intervalRefresh",
    components:{
      'time-picker':timePicker,
      'chart-unit':chartUnit,
    },
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
      },
      useChartUnit:{
        type:Boolean,
        default:true,
      },
      showTimePicker:{
        type:Boolean,
        default:true,
      }
    },
    data(){
      return{
        searchTime:[],
        visible: false,
        intervalTimer: null,
        interval: -1,
        unit:2,
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
        this.interval = val;
        if(!this.showTimePicker){
          this.intervalTimer = setInterval(() => {
            this.$emit('change',this.searchTime)
            this.refreshDataFunc();
          }, val.value * 1000);
          return
        }
        if (val && val.value != -1) {
          const start = new Date(this.searchTime[1]);
          const now = bus.getOffsetTimezoneData();
          const interval = Math.floor((now - start.getTime()) / 1000); //计算当前结束时间到现在的间隔（秒）
          if (interval >= 60) { //如果结束时间到现在超过30s，则
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
        this.$refs.timePicker.setCostomTime(this.searchTime);
        this.$emit('change',this.searchTime)
        //刷新数据
        this.refreshDataFunc();
      },
      timeFormate(timeRange){
        const startTime = bus.timeFormate(timeRange[0], 'yyyy-MM-dd hh:mm:ss');
        const endTime = bus.timeFormate(timeRange[1], 'yyyy-MM-dd hh:mm:ss');
        return [startTime, endTime];
      },
      dateChange(time) {
        this.searchTime=time;
        this.$emit('change',this.searchTime)
        this.refreshDataFunc();
      },
    },
    watch:{
      unit:{
        immediate:true,
        handler(n,o){
          this.$emit('unitChange',n);
        }
      }
    }
  }
</script>

<style scoped lang="scss">
.interval-refresh{
  display: flex;
  align-items: center;
}
.interval-refresh .time-picker{
  margin-right: 20px;
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
