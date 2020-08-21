<template>
  <div style="background: #F9F9F9;height: 100%">
    <div class="top-tools">
      <template>
        <div class="top-tool-main-right">
          <div class="top-tool-search relative-position margin-r-20">
            <el-input ref="queryPanel" @clear="clearInput" id="queryPanel" @focus="focusInput"  @blur="blurInput" v-model="filter.searchName" class="query-input-inactive" size="mini" clearable   >
              <i slot="suffix" class="el-input__icon el-icon-search" @click="focusInput" style="float: right"></i>
            </el-input>
          </div>

          <pick-time :refresh-data-func="dateChange" v-model="searchTime" :use-chart-unit="false"></pick-time>
        </div>
      </template>
    </div>
    <div class="project-facade">
      <div class="facade-top">
        <div class="facade-top-left" v-loading="projectInfo.loading">
          <div class="facade-top-title">
            {{projectInfo.title}}
          </div>
          <div>
            <span><span class="label">Id :</span>{{projectInfo.id}}</span>
            <span><span class="label special">Name :</span>{{projectInfo.name}}</span>
          </div>
          <div>
            <span><span class="label">Description :</span>{{projectInfo.remark?projectInfo.remark:'--'}}</span>
          </div>
          <div>
            <span>
              <span class="label">Alert state :</span>
              <div class="active-icon" style="background: #B7464A 100%;"></div>{{projectInfo.alertStat[0]}}
              <div class="active-icon" style="background: #E64E4E 100%;"></div>{{projectInfo.alertStat[1]}}
              <div class="active-icon" style="background: #F7B500 100%;"></div>{{projectInfo.alertStat[2]}}
            </span>
          </div>
          <div>
            <span><span class="label">Module Mum :</span>{{projectInfo.moduleMum}}</span>
          </div>
        </div>
        <div class="facade-top-right" v-loading="alertData.loading">
          <div class="facade-top-title">
            <span class="label">{{alertData.title}}</span>
            {{alertData.sssObj.total}}
          </div>
          <div class="facade-top-right-content">
            <div>
              <el-progress
                type="circle"
                :percentage="(alertData.sssObj.pending/alertData.sssObj.total)*100"
                :show-text="false"
                :width="40"
                color="#F5A390"
              ></el-progress>
              <div class="align--center">{{alertData.sssObj.pending}}</div>
            </div>
            <div>
              <el-progress
                type="circle"
                :percentage="(alertData.sssObj.stop/alertData.sssObj.total)*100"
                :show-text="false"
                :width="40"
                color="#F6B977"
              ></el-progress>
              <div class="align--center">{{alertData.sssObj.stop}}</div>
            </div>
            <div>
              <el-progress
                type="circle"
                :percentage="(alertData.sssObj.other/alertData.sssObj.total)*100"
                :show-text="false"
                :width="40"
                color="#EBD066"
              ></el-progress>
              <div class="align--center">{{alertData.sssObj.other}}</div>
            </div>
          </div>
        </div>
      </div>
      <div  class="facade-content">
        <vis-network
          :panel-id="item.id"
          :chart-data="item"
          :chart-index="0"
          :allModuleInfo="allModuleInfo"
        >
        </vis-network>
      </div>
    </div>
  </div>
</template>

<script>
  import visNetwork from './visNetwork'
  import draggable from 'vuedraggable'
  import pickTime from "@/components/common/pickTime";
  import bus from '@/libs/bus';
  import timePicker from '@/components/common/timePicker'
	export default {
		name:"projectFacade",
    components: {
      visNetwork,
      draggable,
      'pick-time':pickTime,
      'time-picker':timePicker,
    },
    props:{
		  obj:{}
    },
    watch:{
		  obj:{
        // immediate: true,
        deep: true,
        handler(n){
          this.getProjectData(n);
        },
      }
    },
    data(){
		  return {
		    item:{ // 拓扑图
          id: -10,
          panelId: 0,
          title: this.$t("alert.config.chart.alertNumTrend"),
          span: 8,
          height: 800,
          type: "topology",
          prev: -11,
          next: -1,
          unit: 1,
          buildIn: 1,
          elements: [{
            id: '',
            expression: `nz_alert_nums{id="${3333}"}`,
            type: ''
          }]
        },
        panelData: [],
        toAdd() {
          this.$refs.panelBox.show(true);
          this.panel = {
            id: '',
            name: ''
          };
          this.$refs.panelBox.setTitle(this.$t("dashboard.panel.createPanelTitle"));
        },
        showPanel: { //panel下拉列表
          id: '',
          name: ''
        },
        filter: { // 过滤条件
          panelId: 0,
          start_time: '',
          end_time: '',
          searchName: ''
        },
        searchTime: [
          new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - 1),
          new Date(bus.computeTimezone(new Date().getTime()))
        ],
        projectInfo:{
		      title:'Project information',
          id:'1',
          remark:'系统内置project，展示系统基础信息',
          alertStat:[1,2,3],
          moduleMum:6,
          loading:true,
        },
        alertData:{
          loading:true,
          title:'Alert : ',
          sssObj:{
            total:60,
            stop:10,
            pending:40,
            other:10,
          }
        },
        allModuleInfo:[]
      }
    },
    mounted(){
		  if(this.obj.id){
        this.getProjectData(this.obj);
      }
    },
    methods:{
		  getProjectData(n){
		    //获取projectInfo
        this.projectInfo.loading=true;
        this.$get('project/info', {id:n.id}).then(response => {
          if (response.code === 200) {
            this.projectInfo={...this.projectInfo,...response.data.basic,moduleMum:response.data.module.length};
            this.allModuleInfo=response.data;
           this.$nextTick(()=>{
             this.projectInfo.loading=false;
           })
          }
        });

        //获取所有asset
        this.alertData.loading=true;
        setTimeout(()=>{
          this.$nextTick(()=>{
            this.alertData.loading=false;
          })
        },300)
      },
      focusInput() {
        let classVal=document.getElementById('queryPanel').parentElement.getAttribute("class");
        classVal=classVal.replace('query-input-inactive','query-input-active');
        document.getElementById('queryPanel').parentElement.setAttribute("class",classVal );
        this.$refs.queryPanel.focus();
      },
      blurInput() {
        if(!this.filter.searchName || this.filter.searchName == ''){
          setTimeout(function(){
            let classVal=document.getElementById('queryPanel').parentElement.getAttribute("class");
            classVal=classVal.replace('query-input-active','query-input-inactive');
            document.getElementById('queryPanel').parentElement.setAttribute("class",classVal );
          },100)
        }
      },
      clearInput() {
        this.$refs.queryPanel.focus();
      },
      dateChange(val) {
        this.filter.start_time = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss');
        this.filter.end_time = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss');
        this.filter.panelId = this.showPanel.id;
        // this.getData(this.filter);
        console.log(this.filter)
      },
    }
	}
</script>

<style scoped>
  .project-facade{
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .facade-top{
    min-height: 138px;
    display: flex;
    margin: 12px 0;
    height: calc(16% - 40px);
    font-size: 12px;
  }
  .facade-top > div{
    height: calc(100% - 40px);
    width: 18%;
    min-width: 280px;
    background: #FFFFFF;
    margin-right: 9px;
    padding: 20px;
  }
  .facade-top-title{
    font-size: 16px;
    color: #333333;
    font-weight: bold;
    padding: 5px 0;
  }
  .facade-top-left{
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
  .facade-content{
    flex: 1;
    min-height: 800px;
    width: calc(100% - 20px);
  }
  .label{
    padding: 0 15px;
  }
  .special.label{
    margin-left: 30px;
  }
  .facade-top .facade-top-right{
    width: 12%;
    min-width: 280px;
  }
  .facade-top-right-content{
    display: flex;
    justify-content: space-around;
    justify-items: center;
    height: calc(100% - 30px);
    align-items:center;
  }
  .align--center{
    text-align: center;
  }
</style>
