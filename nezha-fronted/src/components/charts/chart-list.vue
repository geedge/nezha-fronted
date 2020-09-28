<style scoped>
  .chartBox {
    float:left;
    padding: 20px 10px 0 10px;
    position:relative;
    box-sizing: border-box;
  }
  .noData{
    text-align: center
  }
  .list-width{
    width: calc(100% - 14px);
    padding: 5px 15px 5px 10px;
    box-sizing: border-box;
    overflow: hidden;/*避免鼠标第一次放到曲线时，x轴出现滚动条后消失*/
    min-height: calc(100vh - 150px);
  }
</style>
<style lang="scss">
  .vue-resizable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 0;
    right: 0;
    cursor: se-resize;
    box-sizing: border-box;
    user-select: none;
    z-index: 99;
  }
  .vue-resizable-handle:after {
    border-right: 2px solid #acb6bf;
    border-bottom: 2px solid #acb6bf;
    content: "";
    position: absolute;
    right: 3px;
    bottom: 3px;
    width: 5px;
    height: 5px;
    box-sizing: inherit;
  }

  .temp-dom {
    visibility: hidden;
    font-size: 14px;
    position: fixed;
  }
</style>
<template>
  <div class="list-width"  id="listContainer"><!--v-drag-->

    <span class="temp-dom"></span>

    <draggable v-model="dataList" @start="start" @end="end" :move="move" :key
               :scroll-sensitivity="150"
               :options="{
                 group:{name:'chartGroup',pull:'false'},
                 dragClass:'drag-chart-class',
                 fallbackClass:'fallback-class',
                 forceFallback:true,
                 ghostClass:'chart-ghost',
                 chosenClass:'choose-class',
                 scroll:true,
                 filter: '.drag-disabled',
                 scrollFn:function(offsetX,offsetY,originalEvent,touchEvt,hoverTargetEI){},
                 animation: 150,
                 handle: '.chart-title'
               }"  >
      <div v-for="(item, index) in dataList" :key="item.id" :id="'chart-' + item.id" :name="item.title" :class="{'drag-disabled': !draggable,'chartBox':true}" v-show="!item.isHide">
        <line-chart-block v-if="item.type === 'line' || item.type === 'bar' ||item.type == 'stackArea' || item.type === 4" :key="'inner' + item.id"
                          :ref="'editChart'+item.id" :temp-dom="tempDom"
                          @on-refresh-data="refreshChart"
                          @on-remove-chart-block="removeChart"
                          @on-duplicate-chart-block="duplicateChart"
                          @on-drag-chart="editChartForDrag"
                          @on-edit-chart-block="editData"
                          :panel-id="filter.panelId"
                          :chart-index="index"
                          :chart-data="item"></line-chart-block>

        <chart-single-stat  v-if="item.type === 'singleStat'" :ref="'editChart'+item.id" :key="'inner' + item.id"
                     @on-refresh-data="refreshChart"
                     @on-search-data="searchData"
                     @on-remove-chart-block="removeChart"
                     @on-duplicate-chart-block="duplicateChart"
                     @on-drag-chart="editChartForDrag"
                     @on-edit-chart-block="editData"
                     :chart-data="item"
                     :panel-id="filter.panelId"
                     :chart-index="index"></chart-single-stat>

        <chart-table  v-if="item.type === 'table'" :ref="'editChart'+item.id" :key="'inner' + item.id"
                      @on-refresh-data="refreshChart"
                      @on-search-data="searchData"
                      @on-remove-chart-block="removeChart"
                      @on-duplicate-chart-block="duplicateChart"
                      @on-drag-chart="editChartForDrag"
                      @on-edit-chart-block="editData"
                      :panel-id="filter.panelId"
                      :chart-data="item"
                      :chart-index="index"></chart-table>

        <chart-url  v-if="item.type === 'url'" :ref="'editChart'+item.id" :key="'inner' + item.id"
                     @on-refresh-data="refreshChart"
                     @on-search-data="searchData"
                     @on-remove-chart-block="removeChart"
                     @on-duplicate-chart-block="duplicateChart"
                     @on-drag-chart="editChartForDrag"
                     @on-edit-chart-block="editData"
                     :panel-id="filter.panelId"
                     :chart-data="item"
                     :chart-index="index"></chart-url>

        <chart-detail  v-if="item.type === 'assetInfo' || item.type == 'projectInfo' || item.type == 'endpointInfo' || item.type == 'alertRuleInfo'" :ref="'editChart'+item.id" :key="'inner' + item.id"
                          :panel-id="filter.panelId"
                          :chart-index="index"
                          @on-refresh-data="refreshChart"
                          :chart-data="item"
                          :editChartId="'editChartId' + item.id"
        ></chart-detail>

        <chart-alert-list  :ref="'editChart'+item.id"
                           :panel-id="filter.panelId"
                          :chart-index="index"
                          v-if="item.type  === 'alertList'"
                          :editChartId="'editChartId' + item.id"
                          :chart-info="item"
                          @on-refresh-data="refreshChart"
                          @on-search-data="searchData"
                          @on-remove-chart-block="removeChart"
                          @on-duplicate-chart-block="duplicateChart"
                          @on-drag-chart="editChartForDrag"
                          @on-edit-chart-block="editData"
        ></chart-alert-list>
      </div>
   </draggable>
    <el-row v-if="dataList.length === 0"  class="noData"></el-row>
  </div>
</template>

<script>
  import axios from 'axios';
  import bus from '../../libs/bus';
  import lineChartBlock from './line-chart-block';
  import chartTable from './chart-table';
  import chartUrl from './chart-url';
  import chartSingleStat from './chart-single-stat';
  import chartDetail from './chart-detail';
  import draggable from 'vuedraggable'
  import chartDataFormat from "./chartDataFormat";
  import chartAlertList from './chart-alert-list'
  // import visNetwork from './visNetwork'
  export default {
    name: 'chartList',
    props: {
      isModel: {type: Boolean, default: false},
      additionalInfo:{},
      draggable: {type: Boolean, default: true},
      detail: Object
    },

    components: {
      chartAlertList,
      chartDetail,
      lineChartBlock,
      chartTable,
      chartUrl,
      chartSingleStat,
      draggable,
      // visNetwork,
    },
    watch:{
      dataList(n){
      }
    },
    data() {
      return {
        filter: {},
        dataList: [], // 看板中所有图表信息
        dataListDragTmp:[],
        time: {
          start: '',
          end: '',
        },
        panelId: '',
        timer: null,
        dataTotalList:[],//懒加载：总记录数
        dataTotalListBak:[],//用于查询：懒加载，总记录备份
        isPage:false,//是否分页懒加载
        currentRecordNum:0,//懒加载：本次取记录的index，第一次从0开始取，每次取3行
        lineNum:3,//每页加载的行数
        pagePanelId:'',//当前分页的panelId
        dragging: null,
        chartDataCacheGroup:new Map,//图表数据缓存，用于查询：id:{}
        stepHeight: 50,

        tempDom: {height: "", width: ""},
      };
    },
    methods: {
      tempDomInit() {
        let span = document.querySelector(".temp-dom");
        this.tempDom.width = span.offsetWidth;
      },
      start (event) {
        //console.log('start', event, this.dataList);
        event.item.querySelector('.chartTitle').style.background = '#d8dce1';
        let projectAndAssetFeatureInfos = event.item.querySelectorAll(".feature-content");
        if (projectAndAssetFeatureInfos && projectAndAssetFeatureInfos.length > 0) {
          projectAndAssetFeatureInfos.forEach(item => {
            item.classList.remove("unfold");
            item.classList.remove("fold");
          });
        }
        this.dataListDragTmp = [...this.dataList];
      },
      end (event) {
        //console.info("end event:", event)
        let item = event.item;
        let oldIndex = event.oldIndex;
        let newIndex = event.newIndex;
        let newItem = this.dataList[newIndex];
        //移动前，移动元素前后元素next及prev修改；移动后，移动元素前后元素next及prev修改--start
        let len = this.dataListDragTmp.length;//移动之前的元素列表
        let endIndex = len-1;
        if(oldIndex===0){//挪动之前为第一个元素
          let oldNextItem = this.dataListDragTmp[oldIndex+1];
          let nextItem = this.dataList.find(item => item.id === oldNextItem.id);
          nextItem.prev = 0;
        }else if(oldIndex===endIndex){//挪动之前为最后一个元素
          let oldPrevItem = this.dataListDragTmp[oldIndex-1];
          let prevItem = this.dataList.find(item => item.id === oldPrevItem.id);
          prevItem.next = -1;
        }else{//挪动之前为中间元素
          let oldPrevItem = this.dataListDragTmp[oldIndex-1];
          let oldNextItem = this.dataListDragTmp[oldIndex+1];
          let nextItem = this.dataList.find(item => item.id === oldNextItem.id);
          let prevItem = this.dataList.find(item => item.id === oldPrevItem.id);
          prevItem.next = oldNextItem.id;
          nextItem.prev = oldPrevItem.id;
        }

        if(newIndex===0){//挪动之后为第一个元素
          let newNextItem = this.dataList[newIndex+1];
          newNextItem.prev = newItem.id;
        }else if(newIndex===endIndex){//挪动之后为最后一个元素
          let newPrevItem = this.dataList[newIndex-1];
          newPrevItem.next =newItem.id;
        }else{//挪动之后为中间元素
          let newPrevItem = this.dataList[newIndex-1];
          let newNextItem = this.dataList[newIndex+1];
          newPrevItem.next = newItem.id;
          newNextItem.prev = newItem.id;
        }
        //移动前，移动元素前后元素next及prev修改；移动后，移动元素前后元素next及prev修改--end

        //前台总列表中的顺序也得修改（dataTotalList及dataTotalListBak），后台接口也得调用
        if(newIndex<oldIndex){//从后往前移动：
          //console.log('从后往前移动：oldIndex='+oldIndex+',newIndex='+newIndex)
          let newNextItem = this.dataList[newIndex+1];
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
          let newPrevItem = this.dataList[newIndex-1];
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
          span:newItem.span,
          height:newItem.height,
          prev:newItem.prev,
          next:newItem.next,
        };

        if(this.dataList.length>1 && oldIndex !== newIndex){
          this.$put('panel/'+ this.pagePanelId+'/charts/modify',modifyParams).then(response => {
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
              this.dataList = this.dataTotalListBak;
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
        let chartTitle = item.querySelector('.chartTitle');
        chartTitle.style.background = '';
      },
      move(event, orgin) {
        let dragClass = document.querySelector('.drag-chart-class');//drag-chart-class:yellow chart-ghost:green  fallback-class choose-class:purple

        let chartTitle = dragClass.querySelector('.chartTitle');
        chartTitle.style.background = '#d8dce1';

      },
      clone(event){
        //console.log('clone',event );
        let canvas = event.item.querySelector('canvas');
        //console.log('clone-canvas',canvas);
        let canvasclone = event.clone.querySelector('canvas');
        canvasclone.style.border='solid 1px yellow';
        //console.log('clone-canvasclone',canvasclone);
        if(canvas&&canvasclone){
          let ctx = canvas.getContext("2d");
          let image = new Image();
          image.src= canvas.toDataURL();
          //console.log('clone-image',image);
          let ctxClone = canvasclone.getContext("2d");
          //ctxClone.drawImage(image,0,0);
          image.onload = function(){
            console.log('clone-image-load',image);
            ctxClone.drawImage(image,0,0);
          }
        }
      },
      dragPosition:function(e){
        console.log('===',e.clientY,e.clientX);
        let odiv=e;//目标元素e.target
        console.log('odiv====',odiv);
        //var targetDiv= document.getElementById('lineChartDiv'+this.chartIndex); //
        //得到点击时该容器的：
        var startY=e.clientY;
        var startX=e.clientX;
        var _this=this;
//鼠标相对元素的位置
        var distY=e.clientY-odiv.offsetLeft;
        var distX=e.clientX-odiv.offsetTop;
        document.onmousemove=function(e){
          e.preventDefault();
          console.log('===onmousemove',e.clientY,e.clientX);
          let left=e.clientX-distX;
          let top=e.clientY-distY;
          odiv.style.top=top+'px';
          odiv.style.left=left+'px';
          console.log('odiv====',odiv);
        };

        document.onmouseup=function(){
          document.onmousemove=null;
          document.onmouseup = null;
        }
      },
      handleDragStart(e,item){
        this.dragging = item;
      },
      handleDragEnd(e,item){
        this.dragging = null
      },
      //首先把div变成可以放置的元素，即重写dragenter/dragover
      handleDragOver(e) {
        e.dataTransfer.dropEffect = 'move'// e.dataTransfer.dropEffect="move";//在dragenter中针对放置目标来设置!
      },
      handleDragEnter(e,item){
        e.dataTransfer.effectAllowed = "move";//为需要移动的元素设置dragstart事件
        if(item === this.dragging){
          return
        }
        const newItems = [...this.dataList];
        console.log(newItems);
        const src = newItems.indexOf(this.dragging);
        const dst = newItems.indexOf(item);

        newItems.splice(dst, 0, ...newItems.splice(src, 1));

        this.dataList = newItems
      },
      initCurrentRecordNum(){
        this.currentRecordNum = 0;
      },
      cleanData(){
        this.dataList = [];
        this.chartDataCacheGroup.clear();
      },
      initData(filter) {
        this.cleanData();
        // 内含 panelId,开始时间,结束时间
        this.filter = filter;
        this.pagePanelId = this.filter.panelId;
        this.getData(this.filter);
      },
      searchCharts(searchName){
        // this.dataList = [];
        // this.dataTotalList = [];
        let chartListTmp = [];
        if(searchName && searchName.trim()!==''){
          this.dataTotalListBak.forEach((item)=>{
            if(item.title.indexOf(searchName)>-1){
              item.isLoaded = false;
              item.isHide=false;
              chartListTmp.push(item);
            }else{
              item.isLoaded = true;
              item.isHide=true;
              chartListTmp.push(item);
            }
          });
        }else{
          this.dataTotalListBak.forEach((item)=>{
            item.isLoaded = false;
            item.isHide=false;
            chartListTmp.push(item);
          });
        }

        this.dataTotalList = [...chartListTmp];
        this.dataList = [...this.dataTotalList];

        this.$nextTick(() => {
          if (this.dataList.length > 0 ) {
            this.dataList.forEach((item,index) => {

              this.$refs['editChart'+item.id][0].showLoad(item);//之后要实现
              this.setChartSize(item.span, index);//设置该图表宽度
              if(!item.isLoaded ){
                //获得当前显示在浏览器的图表，从后台获取数据
                let chartBox = document.getElementById('chart-' + item.id);//this.$refs['editChart'+item.id][0];
                this.handleElementInViewport(chartBox,0,item,index,true);
              }
            });
          }
        });
      },
      pageDataList(isAdd,panelId,isSearch){
        if(panelId!==this.pagePanelId){
          this.currentRecordNum = 0;
        }
        if(this.dataTotalList && this.dataTotalList.length>0){
          if(this.currentRecordNum>=this.dataTotalList.length){
            //alert('数据加载完毕！');
          }else {
            let dataTmpList = [];
            let spanSum = 0;
            let line = 0;//行数
            let isDataFull=false;
            let curRecNum = this.currentRecordNum;
            let len = this.dataTotalList.length;
            for(let i=curRecNum;!isDataFull && i<len;i++){
              if(line<this.lineNum){
                let item = this.dataTotalList[i];
                let span = item.span;
                let sumTmp = spanSum+span;
                if(sumTmp<=12){
                  spanSum =sumTmp;
                }else{//大于12表示够1行了，
                  line = line +1;
                  spanSum = span;
                }
                if(line<this.lineNum){
                  dataTmpList.push(item);
                  this.currentRecordNum = i+1;
                }else{
                  this.currentRecordNum = i;
                  break;
                }
              }else {//数据加载够了
                isDataFull=true;
                this.currentRecordNum = i;
                break;
              }
            }
            if(isAdd){
              let oldDataListLen = this.dataList.length;
              let dataListTmp = [...this.dataList];
              this.dataList =  [...dataListTmp.concat(dataTmpList)];
              this.$nextTick(() => {
                this.dataSetFirst(dataTmpList,oldDataListLen,isSearch);
              });
            }else {
              this.dataList = [...dataTmpList];
            }
          }
        }
      },

      // 获取panel详情数据,获取panel下所有chart列表
      getData(params) {
        const param = {
          panelId: params.panelId,
          query: params.query,
          from: params.from
        };
        //alert-rule单独处理
        if (param.from == "alertRule") {
          this.dataList = [];
          this.dataList.push({
            id: -10,
            panelId: 0,
            title: this.$t("alert.config.chart.affectEntity"),
            span: 4,
            height: 350,
            type: "alertRuleInfo",
            prev: 0,
            next: -9,
            buildIn: 1,
            draggable: false,
            resizable: false,
            editable: false,
          });
          this.dataList.push({
            id: -9,
            panelId: 0,
            title: this.$t("alert.config.chart.alertNumTrend"),
            span: 8,
            height: 350,
            type: "line",
            prev: -10,
            next: -1,
            unit: 1,
            buildIn: 1,
            elements: [{
              id: '',
              expression: `nz_alert_nums{id="${this.detail.id}"}`,
              type: ''
            }]
          });
          this.$set(this.filter, "start_time", bus.timeFormate(new Date().getTime()-24*60*60*1000, "yyyy-MM-dd hh:mm:ss"));
          this.$set(this.filter, "end_time", bus.timeFormate(new Date().getTime(), "yyyy-MM-dd hh:mm:ss"));
          this.$nextTick(() => {
            this.dataList.forEach((item,index) => {
              this.$set(item, "from", params.from);
              this.setChartSize(item, index);//设置该图表宽度
              let chartBox = document.getElementById('chart-' + item.id);
              this.handleElementInViewport(chartBox, 0, item, index);
            });
          });
          return;
        }
        //endpoint单独处理
        if (param.from == "endpoint") {
          this.dataList = [];
          this.dataList.push({
            id: -8,
            panelId: 0,
            title: this.$t("alert.alertList"),
            span: 8,
            height: 700,
            type: "alertList",
            prev: -9,
            next: -1,
            buildIn: 1,
            draggable: false,
            resizable: false,
            editable: false,
          });
          this.dataList.push({
            id: -10,
            panelId: 0,
            dataId: this.additionalInfo.id,
            title: this.$t("project.chart.endpointInfo"),
            span: 4,
            height: 350,
            type: "endpointInfo",
            prev: 0,
            next: -9,
            buildIn: 1,
            elements: [{
              expression: `up{endpoint="${this.additionalInfo.id}"}`
            }],
            draggable: false,
            resizable: false,
            editable: false,
          });
          this.dataList.push({
            id: -9,
            panelId: 0,
            title: this.$t("asset.assetInfo"),
            span: 4,
            height: 350,
            type: "assetInfo",
            prev: -10,
            next: -8,
            buildIn: 1,
            draggable: false,
            resizable: false,
            editable: false,
          });
          this.$nextTick(() => {
            this.dataList.forEach((item,index) => {
              this.$set(item, "from", params.from);
              this.setChartSize(item, index);//设置该图表宽度
              let chartBox = document.getElementById('chart-' + item.id);
              this.handleElementInViewport(chartBox, 0, item, index);
            });
          });
          return;
        }
        if (!param.query) delete param.query;
        //根据panelId获得panel下的所有图表
        this.$get('panel/'+ params.panelId+'/charts').then(response => {
          if (response.code === 200) {
            response.data.list.forEach((item,index)=>{
              item.isLoaded = false;
            });

            if(response.data.list){
              this.dataTotalList =  response.data.list;
            }else {
              this.dataTotalList = response.data;
            }
            this.dataTotalListBak = [...this.dataTotalList];

            //查询条件带name
            if(this.filter.searchName&&this.filter.searchName!=''){
              let chartListTmp = [];
              let searchTitleStr = this.filter.searchName;
              this.dataTotalListBak.forEach((item)=>{
                if(item.title.indexOf(searchTitleStr)>-1){
                  chartListTmp.push(item);
                }
              });
              this.dataTotalList = chartListTmp;
            }

            this.dataList = [...this.dataTotalList];
            // this.dataList.push({ // 拓扑图
            //   id: -10,
            //   panelId: 0,
            //   title: this.$t("alert.config.chart.alertNumTrend"),
            //   span: 8,
            //   height: 800,
            //   type: "topology",
            //   prev: -11,
            //   next: -1,
            //   unit: 1,
            //   buildIn: 1,
            //   elements: [{
            //     id: '',
            //     expression: `nz_alert_nums{id="${3333}"}`,
            //     type: ''
            //   }]
            // });
            this.$nextTick(() => {
              if (this.dataList.length > 0 ) {
                this.dataList.forEach((item,index) => {
                  this.setChartSize(item, index);//设置该图表宽度
                  this.$set(item, "from", params.from);
                  if (param.from == "asset") {
                    if (item.type == "assetInfo") {
                      this.$set(item, "draggable", true);
                      this.$set(item, "resizable", true);
                    }
                  } else if (param.from == "project") {
                    if (item.type == "projectInfo") {
                      this.$set(item, "draggable", true);
                      this.$set(item, "resizable", true);
                    }
                  } else if (!param.from) {
                    this.$set(item, "draggable", true);
                    this.$set(item, "resizable", true);
                    this.$set(item, "editable", true);
                  }
                  if(!item.isLoaded){
                    //获得当前显示在浏览器的图表，从后台获取数据
                    let chartBox = document.getElementById('chart-' + item.id);
                    this.handleElementInViewport(chartBox, 0, item, index);
                  }
                });
              }
            });
          }
        });
      },
      loadChartData(scrollTop){
        if (this.dataList.length > 0 ) {
          this.dataList.forEach((item,index) => {
            if(!item.isLoaded){
              //获得当前显示在浏览器的图表，从后台获取数据
              let chartBox = document.getElementById('chart-' + item.id);//this.$refs['editChart'+item.id][0];
              this.handleElementInViewport(chartBox,scrollTop,item,index);
            }
          });
        }
      },
      // arr: 该panel下图表list,生成该看板下所有图表
      dataSetFirst(arr,oldDataListLen,isSearch) {
        if (arr.length) {
          arr.forEach((item, index) => {
            let realIndex = index;
            if(oldDataListLen){
              realIndex += oldDataListLen;
            }
            let chartType = item.type;
            if(chartType!=='url'){
              if(isSearch){
                this.getChartDataForSearch(item,realIndex);
              }else {
                this.getChartData(item, realIndex);
              }
            }else {
              if (!isSearch && this.$refs['editChart'+item.id] && this.$refs['editChart'+item.id][0]) {

                this.$refs['editChart'+item.id][0].showLoad(item);
              }
              this.setChartSize(item, realIndex); // 设置该图表宽度
            }
          });
        }
      },
      getChartDataForSearch(chartItem,realIndex){
        let chartData = this.chartDataCacheGroup.get(chartItem.id);
        if(chartData){
          let filterType = chartData.filterType;
          let errorMsg = chartData.errorMsg;
          let tableData = chartData.tableData;
          let panelId = chartData.panelId;
          let filter = chartData.filter;
          let legend = chartData.legend;
          let series = chartData.series;
          let singleStatRlt = chartData.singleStatRlt;
          if(this.$refs['editChart'+chartItem.id] && this.$refs['editChart'+chartItem.id].length>0) {
            if (chartItem.type === 'table') {//表格
              if (filterType === 'showFullScreen') {//全屏查询
                this.$refs['editChart'+chartItem.id][0].setData(chartItem, tableData,
                  panelId, filter, filterType,errorMsg);
              } else {
                this.$refs['editChart'+chartItem.id][0].setData(chartItem, tableData,
                  panelId, filter,'',errorMsg);
              }
            } else if (chartItem.type === 'line' || chartItem.type === 'bar' || chartItem.type === 'stackArea' || chartItem.type === 4) {
              if (filterType === 'showFullScreen') {//全屏查询
                this.$refs['editChart'+chartItem.id][0].setData(chartItem, series,
                  panelId, filter, legend, filterType,errorMsg);
              } else {
                this.$refs['editChart'+chartItem.id][0].setData(chartItem, series,
                  panelId, filter, legend,'',errorMsg);
              }
            }else if(chartItem.type ==='singleStat'){
              if (filterType === 'showFullScreen') {//全屏查询
                this.$refs['editChart'+chartItem.id][0].setData(chartItem, singleStatRlt,
                  this.filter.panelId, this.filter, filterType,errorMsg);
              } else {
                this.$refs['editChart'+chartItem.id][0].setData(chartItem, singleStatRlt,
                  this.filter.panelId, this.filter,'',errorMsg);
              }
            }
          }
        }else {
          this.getChartData(chartItem, realIndex);
        }
      },
      // 获取一个图表具体数据,图表信息，图表位置index
      getChartData(chartInfo, pos, filterType) {
        const chartItem = chartInfo;
        const index = pos; // 指标
        if(chartItem.type === 'assetInfo'){
          if (chartItem.from != 'endpoint') {
            this.$set(chartItem, "draggable", true);
            this.$set(chartItem, "resizable", true);
          }
          this.getAssetInfoChartData(chartItem);
          return;
        }
        if(chartItem.type === 'endpointInfo'){
          this.getEndpointInfoChartData(chartItem);
          return;
        }
        if(chartItem.type == 'projectInfo'){
          chartItem.title = this.$t("project.chart.projectInfo");
          this.getProjectInfoChartData(chartItem);
          return;
        }
        if(chartItem.type === 'alertList'){
          this.getAlertListChartData(chartItem,filterType);
          return;
        }
        if(chartItem.type === 'alertRuleInfo'){
          this.getAlertRuleChartData(chartItem);
          return;
        }

        if (this.isModel) {
          this.modelStaticData(chartInfo, filterType);
        } else {
          // 没有数据的设置提示信息暂无数据-针对每一个图
          const len = chartItem.elements.length;
          if (len === 0) {
            this.$nextTick(() => {
              if (this.$refs['editChart' + chartItem.id] && this.$refs['editChart' + chartItem.id].length > 0) {
                this.$refs['editChart' + chartItem.id][0].setData(chartItem, [], this.filter.panelId, this.filter);//????怎么设置的无数据？？
              }
            });
          } else {
            let startTime = '';
            let endTime = '';
            if (filterType === 'refresh') {//刷新
              const now = new Date(bus.computeTimezone(new Date().getTime()));
              const origin = new Date(this.filter.end_time);
              const numInterval = now.getTime() - origin.getTime();
              if (numInterval >= 60000) {//大于1分钟，则start、end均往后移numInterval，否则时间不变
                startTime = this.getNewTime(this.filter.start_time, numInterval);
                endTime = bus.timeFormate(now, 'yyyy-MM-dd hh:mm:ss');
              } else {
                startTime = this.filter.start_time;
                endTime = this.filter.end_time;
              }
            } else if (filterType === 'showFullScreen') {//全屏时间查询
              startTime = this.filter.start_time;
              endTime = this.filter.end_time;
              //this.$parent.refreshTime(startTime,endTime);全屏查询，不更新panel列表的时间条件
            } else {
              startTime = this.filter.start_time;
              endTime = this.filter.end_time;
            }

            let step = bus.getStep(startTime, endTime);
            this.$nextTick(() => {
              const axiosArr = chartItem.elements.map((ele) => {
                const filterItem = ele;
                let query = encodeURIComponent(filterItem.expression);
                return this.$get('/prom/api/v1/query_range?query=' + query + "&start=" + this.$stringTimeParseToUnix(startTime) + "&end=" + this.$stringTimeParseToUnix(endTime) + '&step=' + step);
              });
              // 一个图表的所有element单独获取数据
              axios.all(axiosArr).then((res) => {
                if (res.length > 0) {
                  const series = [];
                  let singleStatRlt = '';
                  const legend = [];
                  const tableData = [];
                  const sumData = {
                    name: 'sum',
                    data: [],
                    visible: true,
                    threshold: null,
                  };
                  let errorMsg = "";
                  res.forEach((response, innerPos) => {
                    if (response.status === 'success') {
                      errorMsg = "";
                      if (response.data.result) {
                        // 循环处理每个elements下获取的数据列
                        if (chartItem.type === 'singleStat') {
                          if (response.data.result.length === 1) {
                            let statistics = chartItem.param.statistics;
                            if (response.data.result[0].values) {
                              singleStatRlt = bus.getSingleStatRlt(statistics, response.data.result[0].values);
                            }
                          } else if (response.data.result.length > 1) {
                            singleStatRlt = this.$t("dashboard.panel.singleStatErrorTip");
                          }
                        } else {
                          response.data.result.forEach((queryItem, resIndex) => {
                            const seriesItem = {
                              theData: {
                                name: '',
                                symbol: 'emptyCircle',  //去掉点
                                symbolSize: [2, 2],
                                smooth: 0.2,  //曲线变平滑
                                showSymbol: false,
                                data: [],
                                lineStyle: {
                                  width: 1,
                                  opacity: 0.9
                                },
                                animation: false,
                                type: chartInfo.type,
                              },
                              metric_name: '',
                            };

                            if (chartInfo.type === 'stackArea') {
                              seriesItem.theData.type = 'line';
                              seriesItem.theData.stack = chartInfo.title;
                              seriesItem.theData.areaStyle = {"opacity": 0.3};
                            }
                            if((chartInfo.type === 'line'||chartInfo.type === 'stackArea'||chartInfo.type === 'bar')&& chartInfo.param && chartInfo.param.threshold){
                              seriesItem.theData.markLine={
                                silent: true,
                                symbol:['circle','circle'],
                                label:{
                                  distance:this.computeDistance(chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(chartInfo.param.threshold)),
                                  formatter:function(params){
                                    return chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(params.value)
                                  }
                                },
                                lineStyle:{
                                  color:'#d64f40',
                                  width:2,
                                  type:'dotted'
                                },
                                data: [{
                                  yAxis: Number(chartInfo.param.threshold)
                                }, ]
                              }
                            }
                            // 图表中每条线的名字,后半部分
                            let host = '';//up,
                            if (queryItem.metric.__name__) {
                              host = `${queryItem.metric.__name__}{`;//up,
                            }
                            const tagsArr = Object.keys(queryItem.metric);//["__name__","asset","idc","instance","job","module","project"]
                            // 设置时间-数据格式对
                            let tempArr = [];
                            let dpsArr = [];
                            tempArr = queryItem.values;
                            dpsArr = Object.entries(queryItem.values);//[ ["0",[1577959830.781,"0"]], ["1",[1577959845.781,"0"]] ]
                            dpsArr = dpsArr.map(item => {
                              return [item[0], [item[1][0], Number(item[1][1])]]
                            });
                            // 判断是否有数据, && tagsArr.length > 0
                            if (dpsArr.length > 0 && this.$refs['editChart' + chartItem.id] && this.$refs['editChart' + chartItem.id].length > 0) {
                              tagsArr.forEach((tag, i) => {
                                if (tag !== '__name__') {
                                  host += `${tag}="${queryItem.metric[tag]}",`;
                                }
                              });
                              if (host.endsWith(',')) {
                                host = host.substr(0, host.length - 1);
                              }
                              if (queryItem.metric.__name__) {
                                host += "}";
                              }
                              if (!host || host === '') {
                                host = chartItem.elements[innerPos].expression;
                              }
                              //处理legend别名
                              let alias = this.$refs['editChart' + chartItem.id][0].dealLegendAlias(host, chartItem.elements[innerPos].legend);
                              if (!alias || alias === '') {
                                alias = host;
                              }
                              legend.push({name: host+"-"+chartItem.elements[innerPos].id+"-" + resIndex, alias: alias});
                              // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c

                              seriesItem.theData.name = host +"-"+chartItem.elements[innerPos].id+"-"+ resIndex;
                              //alert(seriesItem.theData.name);
                              seriesItem.metric_name = seriesItem.theData.name;
                              // 将秒改为毫秒
                              //alert('table=='+JSON.stringify(queryItem))
                              seriesItem.theData.data = tempArr.map((dpsItem, dpsIndex) => {
                                /*曲线汇总暂不需要
                                if (sumData.data[dpsIndex]) {
                                  const sumNum = sumData.data[dpsIndex][1] || 0;
                                  sumData.data[dpsIndex][1] = sumNum + dpsItem[1];
                                } else {
                                  sumData.data[dpsIndex] = [dpsItem[0] * 1000, dpsItem[1]];
                                }
                                */
                                let t_date = new Date(dpsItem[0] * 1000);
                                let timeTmp = bus.timeFormate(t_date, 'yyyy-MM-dd hh:mm:ss');
                                tableData.push({//表格数据
                                  // label: host.slice(host.indexOf('{') + 1,host.indexOf('}')),//label
                                  // metric: queryItem.metric.__name__?queryItem.metric.__name__:'',//metric列
                                  element: {element: host, alias: alias},
                                  time: timeTmp,//采集时间
                                  value: dpsItem[1],//数值
                                });
                                return [dpsItem[0] * 1000, dpsItem[1]];
                              });
                              series.push(seriesItem.theData);

                            } else if (chartItem.elements && chartItem.elements[innerPos]) {
                              // 无数据提示
                              /*
                              const currentInfo = chartItem.elements[innerPos];
                              const errorMsg = `图表 ${chartItem.title} 中 ${currentInfo.metric},${currentInfo.tags} 无数据`;
                              this.$message.warning({
                                duration: 15,
                                content: errorMsg,
                                closable: true,
                              });
                              */
                            }
                          });
                        }
                      }
                    } else {
                      if (response.msg) {
                        //this.$message.error(response.msg);
                        errorMsg = response.msg;
                      } else if (response.error) {
                        //this.$message.error(response.error);
                        errorMsg = response.error;
                      } else {
                        //this.$message.error(response);
                        errorMsg = response;
                      }
                    }
                  });

                  if (this.$refs['editChart' + chartItem.id] && this.$refs['editChart' + chartItem.id].length > 0) {
                    let chartData = {
                      chartItem: chartItem,
                      series: series,
                      singleStatRlt: singleStatRlt,
                      legend: legend,
                      tableData: tableData,
                      panelId: this.filter.panelId,
                      filter: this.filter,
                      filterType: filterType,
                      errorMsg: errorMsg,
                    }
                    this.chartDataCacheGroup.set(chartInfo.id, chartData);
                    if (chartItem.type === 'table') {//表格
                      if (filterType === 'showFullScreen') {//全屏查询
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, tableData,
                          this.filter.panelId, this.filter, filterType, errorMsg);
                      } else {
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, tableData,
                          this.filter.panelId, this.filter, '', errorMsg);
                      }
                    } else if (chartItem.type === 'line' || chartItem.type === 'bar' || chartItem.type === 'stackArea' || chartItem.type === 4) {
                      if (series.length && chartItem.type === 4) {//曲线汇总
                        //series.push(sumData);//后续需要
                      }
                      if (filterType === 'showFullScreen') {//全屏查询
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, series,
                          this.filter.panelId, this.filter, legend, filterType, errorMsg);
                      } else {
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, series,
                          this.filter.panelId, this.filter, legend, '', errorMsg);
                      }
                    } else if (chartItem.type === 'singleStat') {
                      if (filterType === 'showFullScreen') {//全屏查询
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, singleStatRlt,
                          this.filter.panelId, this.filter, filterType, errorMsg);
                      } else {
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, singleStatRlt,
                          this.filter.panelId, this.filter, '', errorMsg);
                      }
                    }
                  }
                } else {
                  const type = chartItem.type;
                  if (this.$refs['editChart' + chartItem.id] && this.$refs['editChart' + chartItem.id].length > 0) {
                    if (type === 'table') {
                      if (filterType === 'showFullScreen') {//table的全屏查询
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, [], this.filter.panelId,
                          this.filter, filterType);
                      } else {
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, [], this.filter.panelId,
                          this.filter);
                      }
                    } else if (type === 'line' || type === 'bar' || type === 'stackArea' || chartItem.type === 4) {
                      if (filterType === 'showFullScreen') {//table的全屏查询
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, [], this.filter.panelId,
                          this.filter, filterType);
                      } else {
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, [], this.filter.panelId,
                          this.filter);
                      }
                    } else if (chartItem.type === 'singleStat') {
                      if (filterType === 'showFullScreen') {//全屏查询
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, '',
                          this.filter.panelId, this.filter, filterType);
                      } else {
                        this.$refs['editChart' + chartItem.id][0].setData(chartItem, '',
                          this.filter.panelId, this.filter);
                      }
                    }
                  }
                }
              }).catch((error) => {
                if (error) {
                  this.$message.error(error.toString());
                  console.error(error)
                }
              });
            });
          }
        }
      },
      computeDistance:function(str){
        let span = document.querySelector(".temp-dom");
        span.textContent = str;
        let txtWidth = parseFloat(window.getComputedStyle(span).width);
        return Number('-'+(txtWidth+5));
      },
      modelStaticData(chartInfo, filterType) {
        let series = [];
        let legend = [];
        let tableData = [];
        let singleStatRlt = 999;
        if (chartInfo.type === 'singleStat') {
          let statistics = chartInfo.param.statistics;
        } else {
          let seriesItem = {
            theData: {
              name: '',
              symbol: 'emptyCircle',  //去掉点
              symbolSize: [2, 2],
              smooth: 0.2,  //曲线变平滑
              showSymbol: false,
              data: [],
              lineStyle: {
                width: 1,
                opacity: 0.9
              },
              type: chartInfo.type,
            },
            //visible: true,
            //threshold: null,
            metric_name: '',
          };
          if (chartInfo.type === 'stackArea') {
            seriesItem.theData.type = 'line';
            seriesItem.theData.stack = chartInfo.title;
            seriesItem.theData.areaStyle = {"opacity": 0.3};
          }
          // 图表中每条线的名字,后半部分
          let host = 'host';//up,
          let queryItem = {metric: {item1: "item1", item2: "item2", item3: "item3"}, values: []};
          const tagsArr = Object.keys(queryItem.metric);//["__name__","asset","idc","instance","job","module","project"]
          // 设置时间-数据格式对
          let tempArr = [];
          let dpsArr = [];
          let timeStamp = Math.floor(new Date().getTime() / 1000);
          for (let i = 0; i < 20; i++) {
            tempArr.push([timeStamp - (20 - i) * 15, Math.floor(Math.random() * 10) + ""]);
            queryItem.values.push(tempArr[i])
            dpsArr.push([i + "", tempArr[i]]);
          }
          // 判断是否有数据, && tagsArr.length > 0
          if (dpsArr.length > 0 && this.$refs['editChart' + chartInfo.id] && this.$refs['editChart' + chartInfo.id].length > 0) {
            tagsArr.forEach((tag, i) => {
              if (tag !== '__name__') {
                host += `${tag}="${queryItem.metric[tag]}",`;
              }
            });
            if (queryItem.metric.__name__) {
              host += "}";
            }
            //处理legend别名
            let alias = this.$refs['editChart' + chartInfo.id][0].dealLegendAlias(host, chartInfo.elements[0].legend);
            if (!alias || alias === '') {
              alias = host;
            }
            legend.push({name: host, alias: alias});
            // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c
            seriesItem.theData.name = host;
            //alert(seriesItem.theData.name);
            seriesItem.metric_name = seriesItem.theData.name;
            // 将秒改为毫秒
            //alert('table=='+JSON.stringify(queryItem))
            seriesItem.theData.data = tempArr.map((dpsItem, dpsIndex) => {
              let t_date = new Date(dpsItem[0] * 1000);
              let timeTmp = bus.timeFormate(t_date, 'yyyy-MM-dd hh:mm:ss');
              tableData.push({//表格数据
                // label: host.slice(host.indexOf('{') + 1,host.indexOf('}')),//label
                // metric: queryItem.metric.__name__?queryItem.metric.__name__:'',//metric列
                element: {element: host, alias: alias},
                time: timeTmp,//采集时间
                value: dpsItem[1],//数值
              });
              return [dpsItem[0] * 1000, dpsItem[1]];
            });
            series.push(seriesItem.theData);
          }
        }
        if (this.$refs['editChart' + chartInfo.id] && this.$refs['editChart' + chartInfo.id].length > 0) {
          let errorMsg = '';
          let chartData = {
            chartItem: chartInfo,
            series: series,
            singleStatRlt: singleStatRlt,
            legend: legend,
            tableData: tableData,
            panelId: this.filter.panelId,
            filter: this.filter,
            filterType: filterType,
            errorMsg: errorMsg
          }
          this.chartDataCacheGroup.set(chartInfo.id, chartData);
          if (chartInfo.type === 'table') {//表格
            if (filterType === 'showFullScreen') {//全屏查询
              this.$refs['editChart' + chartInfo.id][0].setData(chartInfo, tableData,
                this.filter.panelId, this.filter, filterType, '');
            } else {
              this.$refs['editChart' + chartInfo.id][0].setData(chartInfo, tableData,
                this.filter.panelId, this.filter, '', '');
            }
          } else if (chartInfo.type === 'line' || chartInfo.type === 'bar' || chartInfo.type === 'stackArea' || chartInfo.type === 4) {
            if (series.length && chartInfo.type === 4) {//曲线汇总
              //series.push(sumData);//后续需要
            }
            if (filterType === 'showFullScreen') {//全屏查询
              this.$refs['editChart' + chartInfo.id][0].setData(chartInfo, series,
                this.filter.panelId, this.filter, legend, filterType, errorMsg);
            } else {
              this.$refs['editChart' + chartInfo.id][0].setData(chartInfo, series,
                this.filter.panelId, this.filter, legend, '', errorMsg);
            }
          } else if (chartInfo.type === 'singleStat') {
            if (filterType === 'showFullScreen') {//全屏查询
              this.$refs['editChart' + chartInfo.id][0].setData(chartInfo, singleStatRlt,
                this.filter.panelId, this.filter, filterType, errorMsg);
            } else {
              this.$refs['editChart' + chartInfo.id][0].setData(chartInfo, singleStatRlt,
                this.filter.panelId, this.filter, '', errorMsg);
            }
          }
        }
      },
      getEndpointInfoChartData(chartInfo) {
        let detail = [];
        this.$refs['editChart'+chartInfo.id][0].showLoad();
        chartInfo.title = this.$t("project.chart.endpointInfo");

        let basicInfo = JSON.parse(JSON.stringify(this.detail));
        let basicInfoReq = new Promise((resolve, reject) => {
          let now = new Date();
          let startTime = bus.timeFormate(new Date(now).setHours(now.getHours()-1), 'yyyy-MM-dd hh:mm:ss');
          let endTime = bus.timeFormate(now, 'yyyy-MM-dd hh:mm:ss');
          let step = bus.getStep(startTime, endTime);
          this.$nextTick(() => {
            let query = chartInfo.elements[0].expression;
            this.$get('/prom/api/v1/query_range?query='+query+"&start="+this.$stringTimeParseToUnix(startTime)+"&end="+this.$stringTimeParseToUnix(endTime)+'&step=5m').then(response => {
              if (response.status === 'success') {
                if (response.data.result) {
                  let series = {
                    name: '',
                    symbol: 'emptyCircle',  //去掉点
                    symbolSize: 4,
                    smooth: 0.2,  //曲线变平滑
                    showSymbol: false,
                    data: [],
                    type: "line",
                    lineStyle: {
                      width: 1,
                      opacity: 0.9
                    },
                    itemStyle: {
                      color: function(params) {
                        if (params.data[1] == "1") {
                          return "#50d050";
                        } else {
                          return "#d64f40";
                        }
                      }
                    }
                  };
                  response.data.result.forEach((queryItem, resInnerPos) => {
                    // 将秒改为毫秒
                    series.data = queryItem.values.map((dpsItem, dpsIndex) => {
                      return [dpsItem[0] * 1000, dpsItem[1]];
                    });
                  });
                  basicInfo.stateSeries = [series];
                  basicInfo.state = "";
                  detail.push({title: this.$t("project.chart.basicTitle"), data: basicInfo, type: "endpointInfo"});
                  resolve(true);
                }
              }
            });
          });
        });

        let endpointId = this.additionalInfo.id;
        let alertMsg = new Promise((resolve, reject) => {
          this.$get('/alert/message?endpointId=' + endpointId).then(response => {
            if (response.code == 200) {
              let alerts = {};
              response.data && function () {
                response.data.list.forEach(item => {
                  let alertName = item.alertRule.alertName;
                  let hasAlert = false;
                  for (let alert in alerts) {
                    if (alertName == alert) {
                      hasAlert = true;
                    }
                  }
                  if (hasAlert) {
                    alerts[alertName]++;
                  } else {
                    alerts[alertName] = 1;
                  }
                });
              }();
              detail.push({title: this.$t("overall.alert"), data: alerts});
              resolve(true);
            }
          });
        });
        Promise.all([basicInfoReq, alertMsg]).then(resolves => {
          this.$refs['editChart'+chartInfo.id][0].setData(chartInfo, detail);
        });
      },
      getAssetInfoChartData(chartInfo){
        let vm = this;
        chartInfo.title = this.$t("asset.assetInfo");
        let detail = [];
        if(!this.isModel){
          this.$refs['editChart'+chartInfo.id][0].showLoad();
          let assetId = this.additionalInfo.assetId ? this.additionalInfo.assetId : this.additionalInfo.id;
          this.$get('/asset/info?id=' + assetId).then(response=>{
            if(response.code == 200){
              response.data && function() {
                response.data.Basic && detail.push({
                  title: vm.$t('project.chart.basicTitle'),
                  type: 'basic',
                  data: response.data.Basic
                });
                response.data.Attribute && detail.push({
                  title: vm.$t('asset.featureTitle'),
                  type: 'attribute',
                  data: response.data.Attribute
                });
              }();
            }
            this.$refs['editChart'+chartInfo.id][0].setData(chartInfo, detail, this.filter.panelId, this.filter);
          });
        }else {
          detail.push({
            title: vm.$t('project.chart.basicTitle'),
            type: 'basic',
            data: {
              sn: 'assetInfo Test',
              host: '192.168.40.42',
              pingStatus: 1,
              pingRtt: 80,
              cpuNum: '8',
              memery: '12GB',
              memery$_$free: '3GB'
            }
          });
          detail.push({
            title: vm.$t('asset.featureTitle'),
            type: 'feature',
            data: {
              CPU: "Intel E500",
              Memory: "256GB",
              NetworkInterface: ["eth0", "eth1"],
              Disk: [{
                mount: "/",
                total: "256GB",
                free: "128GB",
                usageRate: "50%"
              }]
            }
          });
          this.$refs['editChart'+chartInfo.id][0].setData(chartInfo, detail, this.filter.panelId, this.filter);
        }
      },
      getProjectInfoChartData(chartInfo){
        let vm = this;
        let detail = [];
        if(!this.isModel){
          this.$refs['editChart'+chartInfo.id][0].showLoad(chartInfo);
          this.$get('/project/info?id='+this.additionalInfo.id).then(response=>{
            if(response.code == 200){
              response.data && function() {
                response.data.basic && detail.push({
                  title: vm.$t('project.chart.basicTitle'),
                  data: response.data.basic,
                  type: "project"
                });
                response.data.module && function() {
                  response.data.module.forEach(d => {
                    detail.push({
                      title: `${vm.$t('project.module.module')}：${d.name}`,
                      data: d,
                      type: "module"
                    });
                  });
                }();
              }();
            }
            this.$refs['editChart'+chartInfo.id][0].setData(chartInfo, detail, this.filter.panelId, this.filter, response.msg);
          })
        }else {
          detail.push({
            title: "system",
            data: {
              id: 1,
              name: "system",
              remark: "描述信息",
              alertStat: [1,2,3],
            }
          });
          detail.push({
            title: `${this.$t("project.module.module")}：kafka`,
            data: {
              id: 1,
              name: "kafka",
              type: "http",
              remark: "描述信息",
              endpointStat: [3,23],
              alertStat: [2,3,4],
            }
          });
          detail.push({
            title: `${this.$t("project.module.module")}：kafkakafkakafkakafkakafkakafkakafka`,
            data: {
              id: 2,
              name: "kafkakafkakafkakafkakafkakafkakafka",
              type: "http",
              remark: "描述信息",
              endpointStat: [3,23],
              alertStat: [2,0,4],
            }
          });
          detail.push({
            title: `${this.$t("project.module.module")}：kafkakafka`,
            data: {
              id: 3,
              name: "kafkakafka",
              type: "snmp",
              remark: "描述信息",
              endpointStat: [3,0],
              alertStat: [2,3,4],
            }
          });
          this.$refs['editChart'+chartInfo.id][0].setData(chartInfo, detail, this.filter.panelId, this.filter);
        }
      },
      getAlertListChartData:function(chartInfo,filterType){
        if(this.additionalInfo){
          this.$set(chartInfo, "param", {endpointId: this.additionalInfo.id});
        }
        this.$refs['editChart'+chartInfo.id][0].getAlertList(filterType);
      },
      getAlertRuleChartData(chartInfo) {
        let vm = this;
        let detail = [];
        let req = new Promise((resolve, reject) => {
          this.$get("alert/rule/stat?id=" + this.additionalInfo.id).then(response => {
            if (response.code == 200) {
              response.data && function () {
                if (response.data.project && response.data.project.length > 0) {
                  detail.push({title: vm.$t("overall.entity"), data: convert(response.data.project)});
                }
                /*if (response.data.module && response.data.module.length > 0) {
                  detail.push({title: vm.$t("project.module.module"), data: convert(response.data.module)});
                }
                if (response.data.endpoint && response.data.endpoint.length > 0) {
                  detail.push({title: vm.$t("project.endpoint.endpoint"), data: convert(response.data.endpoint)});
                }*/
                if (response.data.asset && response.data.asset.length > 0) {
                  detail.push({title: vm.$t("asset.asset"), data: convert(response.data.asset)});
                }
              }();
              resolve(true);
            }
          });
        });
        req.then(result => {
          console.info(detail);
          this.$refs['editChart'+chartInfo.id][0].setData(chartInfo, detail);
        }, err => {});

        function convert(d) {
          let data = {};
          d.forEach(item => {
            data[item.name] = item.nums;
            !data._module_ ? (data._module_ = {}) : "";
            if (item.module && item.module instanceof Array && item.module.length > 0) {
              data._module_[item.name] = {};;
              item.module.forEach(m => {
                data._module_[item.name][m.name] = m.nums;
                !data._module_[item.name]._endpoint_ ? (data._module_[item.name]._endpoint_ = {}) : "";
                if (m.endpoint && m.endpoint instanceof Array && m.endpoint.length > 0) {
                  data._module_[item.name]._endpoint_[m.name] = {};
                  m.endpoint.forEach(e => {
                    data._module_[item.name]._endpoint_[m.name][e.name] = e.nums;
                  })
                }
              })
            }
          });
          return data;
        }
      },

      // 设置图表的尺寸
      setChartSize(item, index) {
        this.$nextTick(() => {
          let chartBox = document.getElementById("chart-" + item.id);
          if(chartBox){
            chartBox.style.width = `${(item.span / 12) * 100}%`;
            chartBox.style.height = `${item.height}px`;
          }
        });
      },
      getNewTime(time, num) {
        const date = new Date(time);
        const newDate = new Date(parseInt(date.getTime(), 10) + num);
        return bus.timeFormate(newDate, 'yyyy-MM-dd hh:mm:ss');
      },
      // 删除图表
      removeChart(chartId) { //from 区分从哪里点击的删除 1.从图表面板 2.从编辑框
        const chart = this.dataList.find(item => item.id === chartId);
        if (chart) {
          this.$emit('on-remove-chart', chart);
        }
      },
      //复制图表
      duplicateChart(chartId,duplicateChartBack){
        let duplicateChartId = duplicateChartBack.id;
        let chart;
        let chartIndex = -1;
        this.dataList.forEach((item,index)=>{
          if(item.id===chartId){
            chartIndex = index;
            chart = item;
          }
        });
        let chartNext;
        let chartNextIndex = chartIndex+1;
        if(chartNextIndex<=(this.dataList.length-1)){
          chartNext = this.dataList[chartNextIndex];
        }

        if (chart) {
          chart.next = duplicateChartId;
          let duplicateChart = JSON.parse(JSON.stringify(chart));
          duplicateChart.id = duplicateChartId;
          duplicateChart.prev = duplicateChartBack.prev;
          duplicateChart.next = duplicateChartBack.next;
          duplicateChart.title = duplicateChartBack.title;
          duplicateChart.elements = duplicateChartBack.elements;
          if(chartNext){
            chartNext.prev = duplicateChartId;
          }

          this.dataList.splice(chartNextIndex,0,duplicateChart);

          let indexInTotal = this.dataTotalList.indexOf(chart);
          this.dataTotalList.splice(indexInTotal+1,0,duplicateChart);
          let chartInTotal = this.dataTotalList.find(item => item.id === chartId);
          chartInTotal.next = duplicateChartId;
          if(chartNext) {
            let chartNextInTotal = this.dataTotalList.find(item => item.id === chartNext.id);
            chartNextInTotal.prev = chartNext.prev;
          }

          let indexInTotalBak = this.dataTotalListBak.indexOf(chart);
          this.dataTotalListBak.splice(indexInTotalBak+1,0,duplicateChart);
          let chartInTotalBak = this.dataTotalListBak.find(item => item.id === chartId);
          chartInTotalBak.next = duplicateChartId;
          if(chartNext) {
            let chartNextInTotalBak = this.dataTotalListBak.find(item => item.id === chartNext.id);
            chartNextInTotalBak.prev = chartNext.prev;
          }

          this.currentRecordNum = this.currentRecordNum+1;
          let chartData = this.chartDataCacheGroup.get(chart.id);
          // console.log("__chartItem00__",JSON.stringify(chartData))
          let duplicateChartData ={};
          try{
            duplicateChartData = JSON.parse(JSON.stringify(chartData));
          }catch (e) {
            console.warn(e);
          }
          duplicateChartData.chartItem = duplicateChart;
          this.chartDataCacheGroup.set(duplicateChartId,duplicateChartData);
          this.$nextTick(() => {
            if (this.$refs['editChart'+duplicateChartId][0]) {

              this.$refs['editChart'+duplicateChartId][0].showLoad(duplicateChart);//之后要实现
            }

            let chartType = duplicateChart.type;
            if(chartType!=='url'){
              this.getChartDataForSearch(duplicateChart,chartNextIndex);
            }
            this.setChartSize(duplicateChart, chartNextIndex); // 设置该图表宽度

          });
        }
      },
      // 编辑图表
      editData(chartId) {
        // 获取该id下chart的相关信息
        const chart = this.dataList.find(item => item.id === chartId);
        if (chart) {
          this.$emit('on-edit-chart', chart);
        }
      },

      editChartForDrag(chartItem){
        let chart = this.dataList.find(item => item.id === chartItem.id);
        chart.span = chartItem.span;
        chart.height = chartItem.height;
      },
      // 刷新列表中的一个图表
      refreshChart(chartId,searchTime) {
        this.dataList.forEach((item, index) => {
          if (item.id === chartId) {
            this.getChartData(item, index, 'refresh');
          }
        });
      },
      searchData(chartId,searchTime){
        if(searchTime){//全屏时间查询
          this.filter.start_time=bus.timeFormate(searchTime[0], 'yyyy-MM-dd hh:mm:ss');
          this.filter.end_time=bus.timeFormate(searchTime[1], 'yyyy-MM-dd hh:mm:ss');
        }
        this.dataList.forEach((item, index) => {
          if (item.id === chartId) {
            this.getChartData(item, index, 'showFullScreen');
          }
        });
      },
      handleElementInViewport(ele,scrollTop,item,index,isSearch) {
        /*
        网页被卷去的高：document.body.scrollTop
        网页正文全文高：document.body.scrollHeight
        网页可见区域高（包括边线的高）：document.body.offsetHeight；
        网页可见区域高：document.body.clientHeight
        */
        let that = this;
        setTimeout(function () {
          let itemHeight = item.height;
          //1.元素距离页面顶部的距离
          var mainOffsetTop = ele.offsetTop;//offsetTop: 当前元素顶部距离最近父元素顶部的距离,和有没有滚动条没有关系。单位px，只读元素。
          //2.元素的高度
          var mainHeight = itemHeight;//ele.offsetHeight;//itemHeight;
          //3.页面滚动的距离
          var windowScrollTop = scrollTop;//document.documentElement.scrollTop || document.body.scrollTop;
          //4.浏览器可见区域的高度
          var windowHeight = (window.innerHeight || document.documentElement.clientHeight)-50-42;

          /*
          * 在窗口上下滚动的情况下, 一个页面元素的状态有下面3种：
          1.向上滚动超出可见区域
          2.向下滚动超出可视区域
          3.在可视区域内
          * 第一种情况   由于元素随页面向上滚动, 整个页面滚动的距离  大于 （元素距离页面顶部的距离 + 元素本身的高度 ）-> 超出
          * 第二种情况   由于元素随页面向下滚动, 整个页面滚动的距离  小于 （元素距离页面顶部的距离 - 浏览器可见区域高度 ）-> 超出
          * */
          /*console.log("___isInView____","元素距离页面顶部的距离mainOffsetTop="+mainOffsetTop)//不变
          console.log("___isInView____","元素高度mainHeight="+mainHeight)//不变
          console.log("___isInView____","scrollTop页面滚动的距离windowScrollTop="+windowScrollTop)//变
          console.log("___isInView____","浏览器可见区域高度windowHeight="+windowHeight)//不变
          console.log(item.title,(mainOffsetTop+mainHeight/3),"<",(windowScrollTop+windowHeight),((mainOffsetTop+mainHeight/3) < (windowScrollTop+windowHeight)))*/
          if((mainOffsetTop+mainHeight/3) < (windowScrollTop+windowHeight)){
            let chartType = item.type;
            item.isLoaded = true;
            if(chartType!=='url'){
              that.getChartDataForSearch(item, index);
            } else {
              that.$refs['editChart'+item.id][0].showLoad(item);
            }
          }
        }, 100);
      },
    },
    mounted() {
      this.tempDomInit();
    },
  };

</script>
