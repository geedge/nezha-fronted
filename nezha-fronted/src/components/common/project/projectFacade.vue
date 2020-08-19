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
        <div>123</div>
        <div>456</div>
      </div>
      <div  class="facade-content">
        <vis-network
          :panel-id="item.id"
          :chart-data="item"
          :chart-index="0"
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
      }
    },
    methods:{
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
    min-height: 178px;
    display: flex;
    margin: 12px 0;
    height: 16%;
  }
  .facade-top > div{
    height: 100%;
    width: 18%;
    min-width: 280px;
    background: #FFFFFF;
    margin-right: 9px;
  }
  .facade-content{
    flex: 1;
    min-height: 800px;
    width: 80%;
  }
</style>
