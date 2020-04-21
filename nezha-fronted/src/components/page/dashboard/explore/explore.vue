<template>
    <div class="explore">
      <left-menu >
        <div slot="content-left" class="slot-content">
          <div class="sidebar-title">{{$t('dashboard.title')}}</div>
          <div class="sidebar-info">
            <div class="sidebar-info-item " @click="jumpTo('overview')">{{$t('dashboard.overview.title')}}</div>
            <div class="sidebar-info-item" @click="jumpTo('panel')">{{$t('dashboard.panel.title')}}</div>
            <div class="sidebar-info-item" @click="jumpTo('metricPreview')">{{$t('dashboard.metricPreview.title')}}</div>
            <div class="sidebar-info-item sidebar-info-item-active" >{{$t('dashboard.metricPreview.title')}}</div>
          </div>
        </div>
        <div slot="content-right" class="slot-content">
          <div class="main-list main-and-sub-transition" >
            <!-- 顶部工具栏 -->
            <div class="top-tools" >
              <div class="nz-btn-group nz-btn-group-size-normal nz-btn-group-light margin-r-20">
                <button style="border-right: 1px solid rgba(162,162,162,0.50);" type="button"
                        class="nz-btn nz-btn-size-normal nz-btn-style-light" @click="Refresh()">
                  <i style="font-size: 12px" class="global-active-color nz-icon nz-icon-refresh"></i>
                </button><el-popover
                v-model="visible" placement="bottom-start" width="200" trigger="click">
                <ul class="popover_ul">
                  <li v-for="i in intervalList" :style="{color:interval==i.value?'#31749C':''}" :key="i.value+i.name"
                      @click="selectInterval(i.value)">
                    {{i.name}}
                  </li>
                </ul>
                <button type="button" style="border-radius: 0 4px 4px 0" class="nz-btn nz-btn-size-normal nz-btn-style-light" slot="reference">
                  <i style="font-size: 12px" class="nz-icon nz-icon-arrow-down"></i>
                </button>
              </el-popover>
              </div>
              <el-date-picker size="mini" ref="calendar"
                              format="yyyy/MM/dd HH:mm"
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
            </div>
            <div class="expression-room">
              <promql-input
                v-for="index of promqlCount"
                :key="expressions[index]"
                :expression-list="expressions"
                :index="index"
                @change="expressionChange"
                @addExpression="addExpression"
                @removeExpression="removeExpression"
              ></promql-input>
            </div>
            <div class="chart-room" style="width: 100%;height: 500px">
              <chart ref="exploreChart"></chart>
            </div>
            <div class="table-room">table</div>
          </div>
        </div>
      </left-menu>
    </div>
</template>

<script>
  import bus from "../../../../libs/bus";
  import promqlInput from "./promqlInput";
  import chart from "../overview/chart";
  import axios from 'axios'
  import chartDataFormat from "../../../charts/chartDataFormat";
  export default {
    name: "explore",
    components:{
      'promql-input':promqlInput,
      'chart':chart,
    },
    data(){
      return{
        promqlCount:1,
        expressions:[''],
        searchTime:[new Date().setHours(new Date().getHours() -1),new Date()],
        filterTime:{},
        visible:false,
        intervalList: [{
          value: 0,
          name: this.$t("dashboard.panel.refreshInterval.never"),
        }, {
          value: 60,
          name: this.$t("dashboard.panel.refreshInterval.oneMinute"),
        }, {
          value: 180,
          name: this.$t("dashboard.panel.refreshInterval.threeMinutes"),
        }, {
          value: 300,
          name: this.$t("dashboard.panel.refreshInterval.fiveMinutes"),
        }, {
          value: 600,
          name: this.$t("dashboard.panel.refreshInterval.tenMinutes"),
        }],
        interval: 0,
        pickerOptions: {
          shortcuts: [
            {
              text:  this.$t("dashboard.panel.recOne"),
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setHours(start.getHours() - 1);
                picker.$emit('pick', [start, end]);
              }
            },{
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
            },  {
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
            },{
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
                picker.$emit('pick', [start, end]);
              }
            },{
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
      }
    },
    created(){
      this.filterTime.startTime=bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss');
      this.filterTime.endTime=bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss');
    },
    methods:{
      queryChartData:function(){
        setTimeout(()=>{
          if(this.expressions.length>0){
            let requestArr=[];
            this.expressions.forEach((item,index)=>{
              if(item != ''){
                requestArr.push(axios.get('/prom/api/v1/query_range?query='+item+'&start='+this.filterTime.startTime+'&end='+this.filterTime.endTime+'&step=15'))
              }
            })
            axios.all(requestArr).then(res=>{
              if(res.length>0){
                let series=[];
                let legend=[];
                res.forEach((response,index)=>{
                  if(response.data.status == 'success'){
                    let data=response.data.data.result;
                    data.forEach((result,index)=>{
                      let seriesItem={
                        name: '',
                        symbol:'none',  //去掉点
                        smooth:true,  //曲线变平滑
                        data: [],
                        type:'line',
                      }
                      seriesItem.data=result.values.map((item)=>{
                        return [item[0]*1000,item[1]];
                      })
                      console.log(seriesItem);
                      let metric=Object.assign({},result.metric);
                      seriesItem.name+=metric.__name__+'{';
                      delete metric.__name__;
                      for (let key in metric){
                        seriesItem.name+=key+"="+'"'+metric[key]+'",';
                      }
                      seriesItem.name=seriesItem.name.substr(0,seriesItem.name.length-1);
                      seriesItem.name+="}";
                      series.push(seriesItem);
                      legend.push({name:seriesItem.name,alias:null,isGray:false});
                    })
                  }
                })
                this.$refs.exploreChart.setLegend(legend);
                this.$refs.exploreChart.setSeries(series)
              }
            })
          }
        },200)
      },
      queryTableData:function(){
        setTimeout(()=>{
          if(this.expressions.length>0){
            let requestArr=[];
            this.expressions.forEach((item,index)=>{
              if(item != ''){
                requestArr.push(axios.get('/prom/api/v1/query?query='+item))
              }
            })

            axios.all(requestArr).then(res=>{
              res.forEach((response,index)=>{
                // console.log(response);
              })
            })
          }
        },200)
      },
      expressionChange:function(){
        this.queryTableData();
        this.queryChartData()
      },
      addExpression:function(index){
        this.expressions.splice(index+1,0,'');
        this.promqlCount++;
      },
      removeExpression:function(index){
        this.expressions.splice(index,1);
        this.promqlCount--;
      },
      dateChange(time) {
        this.filterTime.startTime=bus.timeFormate(time[0], 'yyyy-MM-dd hh:mm:ss');
        this.filterTime.endTime=bus.timeFormate(time[1], 'yyyy-MM-dd hh:mm:ss');
      },
      jumpTo(data, id) {
        bus.$emit("menu-change", data);
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
    },
    watch:{
      promqlCount:function(n,o){
        this.expressionChange();
      }
    }
  }
</script>

<style scoped>
.explore{
  height: 100%;
}
</style>
