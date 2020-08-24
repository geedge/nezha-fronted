<template>
  <div style="background: #F9F9F9;height: 100%">
    <div class="top-tools">
      <!--时间选择-->
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
      <div  class="facade-content">
        <!--拓扑图盒子-->
        <vis-network
          :panel-id="item.id"
          :chart-data="item"
          :chart-index="0"
          :allModuleInfo="allModuleInfo"
          :projectInfo="projectInfo"
          :alertData="alertData"
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
    position: relative;
  }
  .facade-content{
    flex: 1;
    min-height: 800px;
    width: calc(100% - 20px);
  }
</style>
