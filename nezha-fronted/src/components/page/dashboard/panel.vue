<template>
  <div class="panel">
    <div class="top-tools">
      <div class="top-tool-main-left" v-if="panelData.length == 0" style="margin-left: 10px;">
        <button @click="toAdd" class="nz-btn nz-btn-style-light nz-btn-size-small"><i class="nz-icon nz-icon-create-square"></i>&nbsp;&nbsp;{{$t("dashboard.panel.createPanelTitleSec")}}</button>
      </div>
      <template v-else>
        <div class="top-tool-main-left">
          <el-dropdown @command="panelChange" class="panel-dropdown-title" trigger="click" placement="bottom-start" v-scrollBar:el-dropdown>
            <el-row @click.native="scrollbarHeightHandler" :gutter="10" class="el-dropdown-link" style="padding-right: 5px">
              <el-col :span="21" class="panel-list-title" :title="showPanel.name">{{showPanel.name}}</el-col>
              <el-col :span="3" style="padding-left:0px !important;"><i class="nz-icon nz-icon-arrow-down"></i></el-col>
            </el-row>
            <el-dropdown-menu class="nz-dashboard-dropdown" slot="dropdown">
              <el-dropdown-item>{{$t('dashboard.panel.createPanelTitleSec')}}</el-dropdown-item>
              <draggable v-model="panelData" @start="start" @end="end" :move="move" :key
                         :scroll-sensitivity="150"
                         :options="{
               group:{name:'chartGroup',pull:'false'},
               dragClass:'drag-chart-class',
               fallbackClass:'fallback-class',
               forceFallback:true,
               ghostClass:'chart-ghost',
               chosenClass:'choose-class',
               scroll:true,
               scrollFn:function(offsetX,offsetY,originalEvent,touchEvt,hoverTargetEI){},
               animation:150,
               handle:'.panelContent',
             }"  >
                <el-dropdown-item v-for="item in panelData" :key="item.id+1" class="panel-title-li"
                                  :class="showPanel.id==item.id?'nz-dashboard-dropdown-bg':''" :command="item">
                  <!--{{item.name}}-->
                  <el-row  :gutter="10" class="panel-list-width" >
                    <el-col :span="2" class="panelContent move-area"><i class="nz-icon nz-icon-sort4"></i></el-col>
                    <el-col :span="17" class="panel-list-item" :title="item.name">{{item.name}}</el-col>
                    <el-col :span="1"><span class="panel-dropdown-btn panel-dropdown-btn-delete" @click.stop="del(item)"><i class="nz-icon nz-icon-delete"></i></span></el-col>
                    <el-col :span="1">&nbsp;</el-col>
                    <el-col :span="1"><span class="panel-dropdown-btn" @click.stop="edit(item)"><i class="nz-icon nz-icon-edit"></i></span></el-col>
                  </el-row>
                </el-dropdown-item>
              </draggable>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="top-tool-main-right">
          <div class="top-tool-search relative-position margin-r-20">
            <el-input ref="queryPanel" @clear="clearInput" id="queryPanel" @focus="focusInput"  @blur="blurInput" v-model="filter.searchName" class="query-input-inactive" size="mini" clearable   >
              <i slot="suffix" class="el-input__icon nz-icon nz-icon-search" @click="focusInput" style="float: right"></i>
            </el-input>
          </div>

          <pick-time :refresh-data-func="dateChange" v-model="searchTime" :use-chart-unit="false"></pick-time>
          <export-excel
            export-file-name="chart"
            export-url="/panel/export"
            import-url="/panel/import"
            :params="filter"
            @afterImport="dateChange"
          >
            <template slot="optionZone">
              <button @click="addChart" :title="$t('overall.createChart')"
                      class="nz-btn nz-btn-size-normal nz-btn-style-light ">
                <i class="nz-icon-create-square nz-icon"></i>
              </button>
            </template>
          </export-excel>
        </div>
      </template>
    </div>
    <div class="table-list" id="tableList">
      <el-scrollbar class="el-scrollbar-large" style="height: 100%" ref="dashboardScrollbar">
        <div class="box-content">
          <chart-list @on-edit-chart="editChart" @on-refresh-time="refreshTime" @on-remove-chart="delChart"
                      ref="chartList"></chart-list>
        </div>
      </el-scrollbar>
    </div>
    <button class="to-top" :class="{'to-top-is-hover': tableHover}" v-show="showTopBtn" @click="$toTop('el', $refs.dashboardScrollbar.wrap)" style="bottom: 0;"><i class="nz-icon nz-icon-top"></i></button>

    <transition name="right-box">
      <chart-box @close="closeChartBox" :chart="chart" v-if="rightBox.chart.show" ref="addChartModal" :show-panel="showPanel" :panel-data="panelData" @reload="panelReload" @on-create-success="createSuccess" @on-delete-success="delChartOk" @reloadOnlyPanel="panelReloadOnlyPanel"></chart-box>
    </transition>
    <transition name="right-box">
      <panel-box v-if="closePanelBox" :panel="panel" @reload="panelReload" @reloadForDel="panelReloadForDel" ref="panelBox"></panel-box>
    </transition>
  </div>
</template>

<script>
  import ChartBox from "./chartBox";
  import ChartList from '../../charts/chart-list';
  import bus from '../../../libs/bus';
  import timePicker from '../../common/timePicker'
  import draggable from 'vuedraggable'
  import pickTime from "../../common/pickTime";
  import exportXLSX from "../../common/exportXLSX";
  export default {
    name: "panel",
    data() {
      return {
        showTopBtn: false, //top按钮
        visible: false,
        rightBox: { //面板弹出框相关
          chart: {show: false},
          panel: {show: false},
        },
        tableHover: false,
        searchTime: bus.getTimezontDateRange(),
        intervalTimer: null,
        interval: 0,
        showPanel: { //panel下拉列表
          id: '',
          name: ''
        },
        panel: { //新增panel
          id: '',
          name: ''
        },
        chart: {},
        blankChart: {
          id:'',
          title: '',
          type:'line',
          span:12,
          height:'400',
          unit:2,
          param:{
            url:'',
            threshold:'',
          },
          elements:[],
          panel: '',
          sync: 0
        },
        pageObj: {
          pageNo: 1,
          pageSize: -1, //此处获取所有数据，所以设置一个较大的值
          total: 0
        },
        chartsData: [], //中间部分图表相关数据
        panelData: [],
        panelDataDragTmp:[],
        dataTotalListBak:[],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [
            /*
                        {
                        id: 1,
                        name: this.$t("dashboard.panel.searchItem.name"),
                        type: 'input',
                        label: 'name',
                        disabled: false
                      }*/
          ],
        },
        searchLabel: {}, //搜索参数
        //---图表相关参数--start
        dataList: [], // 数据列表
        filter: { // 过滤条件
          panelId: 0,
          start_time: '',
          end_time: '',
          searchName: ''
        },
        panelId: 0,
        //---图表相关参数--end
      }
    },
    components: {
      'chart-box': ChartBox,
      'chart-list': ChartList,
      'time-picker':timePicker,
      draggable,
      'pick-time':pickTime,
      'export-excel':exportXLSX,
    },
    methods: {
      //刷新
      Refresh() {
        let curTime = this.$refs.calendarPanel.getCurrentTime();
        this.filter.start_time = bus.timeFormate(curTime[0], 'yyyy-MM-dd hh:mm:ss');
        this.filter.end_time = bus.timeFormate(curTime[1], 'yyyy-MM-dd hh:mm:ss');
        this.getTableData();
      },
      //面板相关操作
      panelChange(val) {
        if (!val) {
          this.toAdd();
          return false;
        }
        this.filter.searchName='';
        //this.$refs.searchInput.select();
        this.showPanel = val;
        this.filter.panelId = this.showPanel.id;
        // let curTime = this.$refs.calendarPanel.getCurrentTime();
        let curTime=this.searchTime;
        this.filter.start_time = bus.timeFormate(curTime[0], 'yyyy-MM-dd hh:mm:ss');
        this.filter.end_time = bus.timeFormate(curTime[1], 'yyyy-MM-dd hh:mm:ss');
        //this.$refs.chartList.initCurrentRecordNum();
        this.$refs.chartList.cleanData();
        this.getData(this.filter);

      },
      del(u) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("panel?ids=" + u.id).then(response => {
            if (response.code === 200) {
              this.$message({
                duration: 1000,
                type: 'success',
                message: this.$t("tip.deleteSuccess")
              });
              if (this.showPanel.id === u.id) {
                this.showPanel.id = '';
              }
              this.getTableData();
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      edit(u) {
        this.panel = Object.assign({}, u);
        this.$refs.panelBox.setTitle(this.$t("dashboard.panel.editPanelTitle"));
        this.$refs.panelBox.show(true);
      },
      toAdd() {
        this.$refs.panelBox.show(true);
        this.panel = {
          id: '',
          name: ''
        };
        this.$refs.panelBox.setTitle(this.$t("dashboard.panel.createPanelTitle"));
      },
      panelReload(clearShowPanel) {
        this.getTableData(clearShowPanel);
      },
      refreshTime(st, et) {
        const startTime = bus.timeFormate(st, 'yyyy-MM-dd hh:mm');
        const endTime = bus.timeFormate(et, 'yyyy-MM-dd hh:mm');
        this.searchTime = [startTime, endTime];
      },
      panelReloadForDel: function () {
        if (this.showPanel.id === this.panel.id) {
          this.showPanel.id = '';
        }
        this.getTableData();
      },
      /*图表相关操作--start*/
      addChart() {
        this.chart = this.newChart();
        this.rightBox.chart.show = true;
      },
      newChart() {
        return JSON.parse(JSON.stringify(this.blankChart));
      },
      scrollbarHeightHandler() {
        setTimeout(() => {
          let top = '';
          let top2 = '';
          document.querySelector("body>.el-dropdown-menu").addEventListener("ps-y-reach-end", () => {
            let yDom = document.querySelector("body>.el-dropdown-menu>.ps__rail-y");
            let yDom2 = document.querySelector("body>.el-dropdown-menu>.ps__rail-y>.ps__thumb-y");
            if (top) {
              yDom.style.top = top;
            } else {
              top = yDom.style.top;
            }
            if (top2) {
              yDom2.style.top = top2;
            } else {
              top2 = yDom2.style.top;
            }
          });
        }, 100);
      },
      // 编辑图表信息,打开编辑弹窗
      editChart(data) {
        if (!data.param) {
          data.param = {url: '', threshold: '',};
        }
        this.chart = JSON.parse(JSON.stringify(data));
        this.rightBox.chart.show = true;
      },
      closeChartBox(refresh) {
        this.rightBox.chart.show = false;
        if (refresh) {

        }
      },
      closePanelBox(refresh) {
        this.rightBox.panel.show = false;
        if (refresh) {

        }
      },
      // 移除图表:弹出确认框询问
      delChart(data,from) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("panel/" + data.panelId + "/charts?ids=" + data.id).then(response => {
            if (response.code === 200) {
              this.$message({
                duration: 2000,
                type: 'success',
                message: this.$t("tip.deleteSuccess")
              });
              let chartList=this.$refs.chartList.dataList;
              for (let i =0;i< chartList.length;i++){
                if(chartList[i].id === data.id){
                  chartList.splice(i,1);
                  break;
                }
              }
              // this.getTableData(); //删除相关图表后，刷新面板数据
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      delChartOk() {
        this.filter.panelId = this.showPanel.id;
        this.getData(this.filter);
      },
      // 图表创建成功，回调panel页面，进行图表的刷新
      createSuccess(msg, data, params, panel) {
        this.filter.panelId = this.showPanel.id;
        this.getData(this.filter);
      },
      // 获取数据,用在子页面
      getData(params) {
        if (params.start_time === '' || params.end_time === '') {
          let now = bus.getTimezontDateRange();
          let endTimeTmp = bus.timeFormate(now[1].getTime(), 'yyyy-MM-dd hh:mm:ss');
          let startTimeTmp = bus.timeFormate(now[0].getTime(), 'yyyy-MM-dd hh:mm:ss');
          params.start_time = startTimeTmp;
          params.end_time = endTimeTmp;
        }
        if(this.$refs.chartList){
          this.$refs.chartList.initData(params);
        }
      },

      /*图表相关操作--end*/
      /*时间条件查询--start*/
      // 选择日期变化
      dateChange(val) {
        this.filter.start_time = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss');
        this.filter.end_time = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss');
        this.filter.panelId = this.showPanel.id;
        this.getData(this.filter);
      },
      /*时间条件查询--end*/
      //公用操作
      jumpTo(data, id) {
        bus.$emit("menu-change", data);
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
      panelReloadOnlyPanel() { //仅刷新panel数据
        this.$get('panel').then(response => {
          if (response.code === 200) {
            this.panelData = response.data.list;
            for (let i = 0; i < this.panelData.length; i++) {
              if (this.panelData[i].id == this.showPanel.id) {
                this.showPanel.name = this.panelData[i].name;
                break;
              }
            }
          }
        });
      },
      getTableData(clearShowPanel) {
        this.$get('panel?type=dashboard').then(response => {
          if (response.code === 200) {
            this.panelData = response.data.list;
            this.dataTotalListBak=[...response.data.list]
            let isInitData = false;
            if (response.data.list.length > 0) {
              if (this.$store.state.showPanel.id > 0 && this.$store.state.showPanel.name) {
                this.showPanel = JSON.parse(JSON.stringify(this.$store.state.showPanel));
              }
              if (clearShowPanel) {
                this.showPanel.id = '';
              }
              if (!this.showPanel.id) {
                this.showPanel = response.data.list[0];
                this.filter.panelId = this.showPanel.id;
                this.getData(this.filter);
                isInitData = true;
              }else{
                this.showPanel=response.data.list.find(item=>{return item.id == this.showPanel.id})
              }
              this.filter.panelId = this.showPanel.id;
            } else {
              this.showPanel.id = '';
              this.filter.panelId = '';
            }
            this.pageObj.total = response.data.total;
            if (!isInitData &&(this.panel.id === '' || this.panel.id === this.showPanel.id)) {
              this.getData(this.filter);
            }
            this.$store.state.showPanel.id = 0;
            this.$store.state.showPanel.name = '';
            this.$store.state.showPanel.type = 'dashboard';
          }else {
            if(response.msg){
              this.$message.error(response.msg);
            }else if(response.error){
              this.$message.error(response.error);
            }else {
              this.$message.error(response);
            }
          }
        }).catch((error) => {
          //console.log('error................'+JSON.stringify(error));
          if (error) {
            this.$message.error(error.toString());
          }
        });
      },
      //定期刷新
      selectInterval(val) {

        this.visible = false;
        clearInterval(this.intervalTimer);
        if (val) {
          this.interval = val;
          const start = new Date(this.searchTime[1]);
          const now = new Date();
          const interval = Math.floor((now.getTime() - start.getTime()) / 1000); //计算当前结束时间到现在的间隔（秒）
          if (interval >= 60) { //如果结束时间到现在超过1分钟，则
            this.getIntervalData(interval);
          }
          this.intervalTimer = setInterval(() => {
            this.getIntervalData(this.interval);
          }, val * 1000);
        }
      },
      getIntervalData(interval) { //interval:结束时间到现在的秒数
        const start = new Date(this.searchTime[0]);
        const end = new Date(this.searchTime[1]);
        start.setSeconds(start.getSeconds() + interval);
        end.setSeconds(end.getSeconds() + interval);
        const startTime = bus.timeFormate(start, 'yyyy-MM-dd hh:mm');
        const endTime = bus.timeFormate(end, 'yyyy-MM-dd hh:mm');
        this.searchTime = [startTime, endTime];
        //刷新数据
        this.dateChange();
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getTableData();
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        this.getTableData();
      },
      search:function(){
        if(this.$refs.chartList){
          this.$refs.chartList.searchCharts(this.filter.searchName);
        }
      },
      // 滚动事件触发下拉加载
      onScroll() {
        let _self = this;
        let scrollbarWrap = this.$refs.dashboardScrollbar.wrap;

        scrollbarWrap.onscroll = bus.debounce(function() {
          if (scrollbarWrap.scrollTop > 50) {
            _self.showTopBtn = true;
          } else {
            _self.showTopBtn = false;
          }
          _self.$refs.chartList.loadChartData(scrollbarWrap.scrollTop);
          //if (scrollbarWrap.scrollHeight - scrollbarWrap.scrollTop - scrollbarWrap.offsetHeight < 20) {
            //_self.$refs.chartList.pageDataList(true, _self.showPanel.id);
          //}
        },300);
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
      start (event) {
        // console.log('start', event, this.panelData);

        event.item.querySelector('.panelContent').style.background = '#d8dce1';
        let projectAndAssetFeatureInfos = event.item.querySelectorAll(".feature-content");
        if (projectAndAssetFeatureInfos && projectAndAssetFeatureInfos.length > 0) {
          projectAndAssetFeatureInfos.forEach(item => {
            item.classList.remove("unfold");
            item.classList.remove("fold");
          });
        }
        this.panelDataDragTmp = [...this.panelData];
        //console.log(this.panelDataDragTmp)
      },
      end (event) {
        // console.info("end event:", event)
        let item = event.item;
        let oldIndex = event.oldIndex;
        let newIndex = event.newIndex;
        let newItem = this.panelData[newIndex];
        //移动前，移动元素前后元素next及prev修改；移动后，移动元素前后元素next及prev修改--start
        let len = this.panelDataDragTmp.length;//移动之前的元素列表
        let endIndex = len-1;
        if(oldIndex===0){//挪动之前为第一个元素
          let oldNextItem = this.panelDataDragTmp[oldIndex+1];
          let nextItem = this.panelData.find(item => item.id === oldNextItem.id);
          nextItem.prev = 0;
        }else if(oldIndex===endIndex){//挪动之前为最后一个元素
          let oldPrevItem = this.panelDataDragTmp[oldIndex-1];
          let prevItem = this.panelData.find(item => item.id === oldPrevItem.id);
          prevItem.next = -1;
        }else{//挪动之前为中间元素
          let oldPrevItem = this.panelDataDragTmp[oldIndex-1];
          let oldNextItem = this.panelDataDragTmp[oldIndex+1];
          let nextItem = this.panelData.find(item => item.id === oldNextItem.id);
          let prevItem = this.panelData.find(item => item.id === oldPrevItem.id);
          prevItem.next = oldNextItem.id;
          nextItem.prev = oldPrevItem.id;
        }

        if(newIndex===0){//挪动之后为第一个元素
          let newNextItem = this.panelData[newIndex+1];
          newNextItem.prev = newItem.id;
        }else if(newIndex===endIndex){//挪动之后为最后一个元素
          let newPrevItem = this.panelData[newIndex-1];
          newPrevItem.next =newItem.id;
        }else{//挪动之后为中间元素
          let newPrevItem = this.panelData[newIndex-1];
          let newNextItem = this.panelData[newIndex+1];
          newPrevItem.next = newItem.id;
          newNextItem.prev = newItem.id;
        }
        //移动前，移动元素前后元素next及prev修改；移动后，移动元素前后元素next及prev修改--end

        //前台总列表中的顺序也得修改（dataTotalList及dataTotalListBak），后台接口也得调用
        if(newIndex<oldIndex){//从后往前移动：
          //console.log('从后往前移动：oldIndex='+oldIndex+',newIndex='+newIndex)
          let newNextItem = this.panelData[newIndex+1];
          newItem.next = newNextItem.id;

          let nextItemIndexInTotal = -1;
          this.dataTotalListBak.forEach((item,index)=>{
            if(item.id===newNextItem.id){
              nextItemIndexInTotal = index;
            }
          })
          // console.log('从后往前移动：next元素在总列表中之前的元素的index='+nextItemIndexInTotal)
          if(nextItemIndexInTotal>0){//总列表中：移动之后的当前元素后面的元素之前有元素
            let prevItem = this.dataTotalListBak[nextItemIndexInTotal-1];
            newItem.prev = prevItem.id;
          }else{//之前无元素
            newItem.prev = 0;
          }
        }else if(newIndex>oldIndex){//从前往后移动
          //console.log('从前往后移动：oldIndex='+oldIndex+',newIndex='+newIndex)
          let newPrevItem = this.panelData[newIndex-1];
          newItem.prev = newPrevItem.id;

          let prevItemIndexInTotal = -1;
          this.dataTotalListBak.forEach((item,index)=>{
            if(item.id===newPrevItem.id){
              prevItemIndexInTotal = index;
            }
          });
          //console.log('从前往后移动：prev元素在总列表中之后的元素的index='+prevItemIndexInTotal)
          if(prevItemIndexInTotal<this.dataTotalListBak.length-1){//总列表中：移动之后的当前元素前面的元素之后有元素
            let nextItem = this.dataTotalListBak[prevItemIndexInTotal+1];
            newItem.next = nextItem.id;
          }else{//之后无元素
            newItem.next = -1;
          }
        }else {//oldIndex = newIndex

        }
        //更新图表prev和next
        const modifyParams = {
          id:newItem.id,
          type:'dashboard',
          prev:newItem.prev,
          next:newItem.next,
        };

        if(this.panelData.length>1 && oldIndex !== newIndex){
          this.$put('panel/modify',modifyParams).then(response => {
            if (response.code === 200) {
              //修改前台列表中元素的顺序
              let curItem = this.dataTotalListBak.find((item,index)=>{return newItem.id===item.id});
              let curIndex = this.dataTotalListBak.indexOf(curItem);
              this.dataTotalListBak.splice(curIndex,1);

              let nextItemTmp = this.dataTotalListBak.find((item)=>{return item.id===newItem.next});
              if(nextItemTmp){
                let nextIndex = this.dataTotalListBak.indexOf(nextItemTmp);
                this.dataTotalListBak.splice(nextIndex,0,newItem);
              }else{//移动到最后一个元素
                this.dataTotalListBak.push(newItem);
              }
              this.panelData = this.dataTotalListBak;
            }else {
              if(response.msg){
                this.$message.error(response.msg);
              }else if(response.error){
                this.$message.error(response.error);
              }else {
                this.$message.error(response);
              }
            }
          });
        }
        let chartTitle = item.querySelector('.panelContent');
        chartTitle.style.background = '';
      },
      move (event, orgin) {
        // console.log('move', event, orgin);
        let dragClass = document.querySelector('.drag-chart-class');//drag-chart-class:yellow chart-ghost:green  fallback-class choose-class:purple
        // console.log('move---class', dragClass);
        //dragClass.style.opacity = 1;
        //dragClass.style.pointerEvents = 'auto';//设置此属性，end事件里newIndex为 列表长度
        let panelContent = dragClass.querySelector('.panelContent');
        panelContent.style.background = '#d8dce1';

      },
    },
    created() {
      this.getTableData();
    },
    mounted() {
      this.onScroll();
      document.querySelector("#tableList").addEventListener("mouseenter", () => {
        this.tableHover = true;
      });
      document.querySelector("#tableList").addEventListener("mouseleave", () => {
        this.tableHover = false;
      });
    },
    watch: {
      'filter.searchName': function(n,o){
        let temp=this;
        setTimeout(function(){
          temp.search();
        },1000)
      },
    }
  }
</script>
<style scoped lang="scss">
  .panel {
    height: 100%;
  }

  .panel .el-table {
    border-radius: 5px;
  }

  .panel-list-width {
    width:240px;
  }

  .panel-dropdown-title {
    line-height:24px;
    padding-left:5px;
    margin-left:10px;
    margin-top: 3px;
    text-align:left;
    border-radius:4px;
    width:260px;
    height:24px;
    border:solid 1px  #d8dce1;
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }
  .panel-list-title {
    min-height:24px;
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }

  .panel-list-item {
    width:190px;
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }

  .content-right-option {
    cursor: pointer;
    display: inline-block;
    margin-right: 6px;
  }

  .content-right-option .nz-icon-delete {
    color: #F98D9A;
  }

  .content-right-option .nz-icon-delete:hover {
    color: #D96D7A;
  }

  .content-right-option .nz-icon-view {
    color: #60BEFF;
  }

  .content-right-option .nz-icon-view:hover {
    color: #409EFF;
  }

  /* begin-chart list*/
  .table-list {
    margin-top: 6px;
    overflow-y: auto;
    height: calc(100% - 92px);
  }

  .box-content {
    position: relative;
  }

  /* end-chart list*/
  /* begin--Panel-自定义可编辑的el-select下拉框样式*/
  .panel-dropdown-btn {
    display: inline-block;
    margin-left: 7px;
    float: right;
    color: #60BEFF;
    font-size: 13px
  }

  .panel-dropdown-btn:hover {
    color: #409EFF;
  }

  .panel-dropdown-btn-create {
    display: inline-block;
    float: left;
    font-size: 13px;
    color: #F98D9A;
    width: 100%;
  }

  .panel-dropdown-btn-create:hover {
    color: #D96D7A;
  }

  .panel-dropdown-btn-delete {
    color: #F98D9A;
    font-size: 13px
  }

  .panel-dropdown-btn-delete:hover {
    color: #D96D7A;
  }

  .panel-dropdown-error-message {
    color: #F98D9A;
  }

  /* end--Panel-自定义可编辑的el-select下拉框样式*/
  .panel-select-width {
    width: 150px;
  }

  .panel-refresh-interval {
    margin-right: 5px;
    float: right;
  }

  .panel-refresh-interval-select {
    width: 95px;
  }

  .panel-calendar {
    float: right;
    margin-right: 1px;
  }

  .top-tools {
    button {
      background: $btn-light-background-color;
      outline: none;
      border: 1px solid #ccc;
    }

    button:hover {
      background: $btn-light-background-color-hover;
    }
  }

  .nz-dashboard-dropdown {
    height: 300px;
    overflow-y: auto;
    li {
      /*padding: 0 20px !important;*/
      padding-left:20px !important;
      padding-right:0px !important;
      width:240px;
      white-space:nowrap;
      overflow-x:hidden;
      text-overflow:ellipsis;
    }
  }

  .nz-dashboard-dropdown-bg {
    background: $global-text-color-active;
    color: #fff;
  }

  .el-dropdown-link {
    cursor: pointer;
    font-weight: bold;
  }

  .refresh {
    display: flex;
    background: #fff;
    border-radius: 4px;
    align-items: center;
    justify-content: center;
    margin: 0 10px;
    border: 1px solid #ccc;
    background: $btn-light-background-color;

    span {
      display: inline-block;
      padding: 1px 8px;
    }
  }

  .popover_ul li {
    padding: 10px 3px;
    cursor: pointer;
  }

  .popover_ul li:hover {
    background: $dropdown-hover-background-color !important;
    color: $global-text-color-active !important;
  }

  .nz-dashboard-refresh {
    border-right: 1px solid #ccc;
    color: #F0BF84;
  }

  .nz-dashboard-picker {
  }
  .move-area:hover{
    cursor: move;
  }
</style>
<style lang="scss">
  .panel .top-tools input {
    background-color: $content-right-background-color;
  }
  .panel .top-tools  .el-input__inner {
    background-color: $content-right-background-color;
  }
  .panel-calendar .el-range-editor--mini.el-input__inner {
    height: 25px !important;
    border-color: #d8d8d8;
  }

  .panel-calendar .el-range-editor--mini .el-range__close-icon {
    line-height: 18px;
  }

  .panel-calendar .el-range-editor--mini .el-range__icon {
    display: none;
  }

  .panel-calendar .el-range-editor--mini .el-range-separator {
    line-height: 17px;
  }

  .panel-calendar .el-date-editor--datetimerange.el-input, .panel-calendar .el-date-editor--datetimerange.el-input__inner {
    padding-right: 0;
    vertical-align: top;
  }

  .nz-dashboard-dropdown .nz-icon-edit {
    font-size: 12px;
  }
  .panel-title-li{
    .panel-dropdown-btn{
      visibility: hidden;
    }
  }
  .panel-title-li:hover{
    .panel-dropdown-btn{
      visibility: visible;
    }
  }
</style>

