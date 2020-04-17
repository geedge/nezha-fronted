<style scoped>
  .chartBox {
    box-sizing: border-box;
    float:left;
    padding: 0 10px 10px 10px;
    /*position:relative;*/
  }
  .noData{
    text-align: center
  }
  .list-width{
    width: calc(100% - 14px);
    overflow-x:hidden;/*避免鼠标第一次放到曲线时，x轴出现滚动条后消失*/
  }
  .drag-chart-class{
    cursor:move !important;
    /*
    border:solid 2px yellow;
    color:yellow;
    background-color:yellow !important;
    */
    /*background-color:red;
    opacity:1*/
  }
  .choose-class{
    cursor:move;
   /* border:solid 2px purple;
    color:purple;
    background-color:purple;*/
  }
  .chosen-class .chartTitle{
  }
  .fallback-class{
    cursor:move;
    /*background-color:green;
    cursor:pointer;*/
  }
  .chart-ghost {
    /*
    opacity: 1;
    border:solid 2px green;
    */
  }

</style>
<template>

  <div class="list-width"  id="listContainer"><!--v-drag-->
    <!--
    draggable="true"
         @dragstart="handleDragStart($event, item)"
         @dragover.prevent="handleDragOver($event, item)"
         @dragenter="handleDragEnter($event, item)"
         @dragend="handleDragEnd($event, item)"
 @mousedown="dragPosition($event,item)"
    <draggable v-model="dataList" @chang="change" @start="start" @end="end" :move="move" @choose="choose"
               @add="add" @clone="clone" @update="update" @remove="remove" @sort="sort"
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
                 handle:'.chartTitle',
               }"  >@clone="clone"
     -->
    <draggable v-model="dataList" @start="start" @end="end" :move="move"
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
                 handle:'.chartTitle',
               }"  >
      <div class="chartBox" v-for="(item, index) in dataList"    :key="item.id" :id="item.title+'_'+item.id"
          >
        <line-chart-block v-if="item.type === 'line' || item.type === 'bar' ||item.type == 'stackArea' || item.type === 4" :key="'inner' + item.id"
        ref="editChart"
        @on-refresh-data="refreshChart"
        @on-remove-chart-block="removeChart"
        @on-drag-chart="editChartForDrag"
        @on-edit-chart-block="editData"
        :panel-id="filter.panelId"
        :chart-index="index"
        :editChartId="'editChartId' + item.id"></line-chart-block>

        <chart-table v-if="item.type === 'table'" ref="editChart" :key="'inner' + item.id"
        @on-refresh-data="refreshChart"
        @on-search-data="searchData"
        @on-remove-chart-block="removeChart"
        @on-drag-chart="editChartForDrag"
        @on-edit-chart-block="editData"
        :panel-id="filter.panelId"
        :chart-index="index"
        :editChartId="'editChartId' + item.id"></chart-table>

        <chart-url v-if="item.type === 'url'" ref="editChart" :key="'inner' + item.id"
                     @on-refresh-data="refreshChart"
                     @on-search-data="searchData"
                     @on-remove-chart-block="removeChart"
                     @on-drag-chart="editChartForDrag"
                     @on-edit-chart-block="editData"
                     :panel-id="filter.panelId"
                     :chart-index="index"
                     :editChartId="'editChartId' + item.id"></chart-url>
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
import draggable from 'vuedraggable'

export default {
  name: 'chartList',
  props: {
  },
  components: {
    lineChartBlock,
    chartTable,
    chartUrl,
    draggable,
  },
  data() {
    return {
      filter: {},
      dataList: [], // 看板中所有图表信息
      //dataListDragTmp:[],
      time: {
        start: '',
        end: '',
      },
      panelId: '',
      timer: null,
      dataTotalList:[],//懒加载：总记录数
      isPage:true,//是否分页懒加载
      currentRecordNum:0,//懒加载：本次取记录的index，第一次从0开始取，每次取3行
      lineNum:3,//每页加载的行数
      pagePanelId:'',//当前分页的panelId
      dragging: null
    };
  },
  computed: {},
  watch: {},
  methods: {
    change (event) {
      console.log('change', event)
    },
    start (event) {
      console.log('start', event, this.dataList);
      let item = event.item;
      let chartTitle = item.querySelector('.chartTitle');
      chartTitle.style.background = '#d8dce1';
      console.log('start-title',chartTitle);
      //this.dataListDragTmp = [...this.dataList];
      let dragClass = document.querySelector('.drag-chart-class');//drag-chart-class:yellow chart-ghost:green  fallback-class choose-class:purple
      console.log('start---class', dragClass);
      //dragClass.style.opacity = 1;
      //dragClass.style.pointerEvents = 'auto';
/*
      let canvas = item.querySelector('canvas');
      console.log('start-canvas',canvas);
      let canvasclone = event.clone.querySelector('canvas');
      console.log('start-canvas-style',canvasclone.style);
      canvasclone.style.border='solid 2px green !importmant';
      console.log('start-canvas-style2',canvasclone.style);
      if(canvas&&canvasclone) {
        let ctx = canvas.getContext("2d");
        let image = new Image();
        image.src = canvas.toDataURL();
        //var a = document.createElement("a");
        //a.href=canvas.toDataURL();
        //a.download="drcQrcode";
        //a.click();
        console.log('clone-image', image)
        let ctxClone = canvasclone.getContext("2d");
        image.onload = function () {
          console.log('clone-image-load', image)
          //ctxClone.drawImage(image, 0, 0);
        }
      }
      */
    },
    end (event) {
      let item = event.item;
      console.log('end', event, this.dataList);
      /*
      let len = this.dataListDragTmp.length;
      let endIndex = len-1;
      let oldIndex = event.oldIndex;
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

      let newIndex = event.newIndex;
      let newItem = this.dataList[newIndex];
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
*/
      let newIndex = event.newIndex;
      let newItem = this.dataList[newIndex];
      if(this.dataList.length===1){
        newItem.prev = 0;
        newItem.next = -1;
      }else if(newIndex===0){//挪动之后为第一个元素
        let newNextItem = this.dataList[newIndex+1];
        newItem.prev = 0;
        newItem.next = newNextItem.id;
      }else if(newIndex===(this.dataList.length-1)){//挪动之后为最后一个元素
        let newPrevItem = this.dataList[newIndex-1];
        newItem.prev = newPrevItem.id;
        newItem.next = -1;
      }else{//挪动之后为中间元素
        let newNextItem = this.dataList[newIndex+1];
        let newPrevItem = this.dataList[newIndex-1];
        newItem.prev = newPrevItem.id;
        newItem.next = newNextItem.id;
      }
      //更新图表prev和next
      const modifyParams = {
        id:newItem.id,
        span:newItem.span,
        height:newItem.height,
        prev:newItem.prev,
        next:newItem.next,
      };
      if(this.dataList.length>1){
        this.$put('panel/'+ this.pagePanelId+'/charts/modify',modifyParams).then(response => {
          if (response.code === 200) {
            //let item = this.dataList.find(item => item.id === newItem.id);
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
    move (event, orgin) {
      console.log('move', event, orgin);
      let dragClass = document.querySelector('.drag-chart-class');//drag-chart-class:yellow chart-ghost:green  fallback-class choose-class:purple
      console.log('move---class', dragClass);
      //dragClass.style.opacity = 1;
      //dragClass.style.pointerEvents = 'auto';//设置此属性，end事件里newIndex为 列表长度

      let chartTitle = dragClass.querySelector('.chartTitle');
      console.log('move-title',chartTitle);
      chartTitle.style.background = '#d8dce1';

    },
    choose(event ){
      console.log('choose', event);
      let chartTitle = event.item.querySelector('.chartTitle');
      //console.log('choose-title',chartTitle);
      //chartTitle.style.background = '#d8dce1';
    },
    clone(event){
      console.log('clone',event );
      let canvas = event.item.querySelector('canvas');
      console.log('clone-canvas',canvas);
      let canvasclone = event.clone.querySelector('canvas');
      canvasclone.style.border='solid 1px yellow';
      console.log('clone-canvasclone',canvasclone);
      if(canvas&&canvasclone){
        let ctx = canvas.getContext("2d");
        let image = new Image();
        image.src= canvas.toDataURL();
        /*var a = document.createElement("a");
        a.href=canvas.toDataURL();
        a.download="drcQrcode";
        a.click();*/
        console.log('clone-image',image);
        let ctxClone = canvasclone.getContext("2d");
        //ctxClone.drawImage(image,0,0);
        image.onload = function(){
          console.log('clone-image-load',image);
          ctxClone.drawImage(image,0,0);
        }

      }
    },
    add(event){
      console.log('add',event );
    },
    update(event){
      console.log('update',event );
    },
    remove(event){
      console.log('remove',event );
    },
    sort(event){
      console.log('sort',event );
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
        //e.preventDefault();

       // var distY=Math.abs(e.clientY-startY);
       // var distX=Math.abs(e.clientX-startX);
        let left=e.clientX-distX;
        let top=e.clientY-distY;
        odiv.style.top=top+'px';
        odiv.style.left=left+'px';
        console.log('odiv====',odiv);
        /*
        //往上方拖动：
        if( e.clientY < startY){
          targetDiv.style.top=(startY-distY)+'px';
        }
        if( e.clientX < startX){
          targetDiv.style.left=(startX-distX)+'px';
        }
        //往下方拖动：
        if (e.clientY > startY) {
          targetDiv.style.top=(startY+distY)+'px';
        }
        if (e.clientX > startX) {
          targetDiv.style.left=(startX+distX)+'px';
        }
        */
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
      if (this.dataList.length > 0 && this.$refs.editChart) {
        this.$refs.editChart.forEach((item) => {
          item.clearData();
        });
      }
      this.dataList = [];
    },
    initData(filter) {
      this.dataList = [];
      // 内含 panelId,开始时间,结束时间
      this.filter = filter;
      this.pagePanelId = this.filter.panelId;
      this.getData(this.filter);
    },
    pageDataList(isAdd,panelId){
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
            let dataListTmp = this.dataList;
            this.dataList =  dataListTmp.concat(dataTmpList);
            this.dataSetFirst(dataTmpList,oldDataListLen);
          }else {
            this.dataList = dataTmpList;
          }
        }
      }
    },
    // 获取panel详情数据,获取panel下所有chart列表
    getData(params) {
      //param   目前没有用
      const param = {
        panelId: params.panelId,
        query: params.query,
      };
      if (!param.query) delete param.query;
      //根据panelId获得panel下的所有图表
      let searchTitleStr = '';
      if(this.filter.searchName&&this.filter.searchName!=''){
        searchTitleStr = '?title='+this.filter.searchName;
      }
      this.$get('panel/'+ params.panelId+'/charts'+searchTitleStr).then(response => {
        if (response.code === 200) {
          if(response.data.list){
            this.dataTotalList =  response.data.list;
          }else {
            this.dataTotalList = response.data;
          }
          if(this.isPage){
            this.pageDataList();
          }else {
            this.dataList = this.dataTotalList;
          }
          this.$nextTick(() => {
            if (this.dataList.length > 0 && this.$refs.editChart) {
              this.$refs.editChart.forEach((item, i) => {
                item.showLoad(this.dataList[i]);//之后要实现
              });
            }
          });
          this.dataSetFirst(this.dataList);
        }
      });
    },
    // arr: 该panel下图表list,生成该看板下所有图表
    dataSetFirst(arr,oldDataListLen) {
      if (arr.length) {
        arr.forEach((item, index) => {
          let realIndex = index;
          if(oldDataListLen){
            realIndex += oldDataListLen;
          }
          let chartType = item.type;
          if(chartType!=='url'){
            this.getChartData(item, realIndex);
          }else {
            this.setSize(item.span, realIndex); // 设置该图表宽度
          }
        });
      }
    },

    // 获取一个图表具体数据,图表信息，图表位置index
    getChartData(chartInfo, pos, filterType) {
      //alert(JSON.stringify(chartInfo));
      const chartItem = chartInfo;
      const index = pos; // 指标
      const len = chartItem.elements.length;
      this.setSize(chartItem.span, index); // 设置该图表宽度
      // 没有数据的设置提示信息暂无数据-针对每一个图
      if (len === 0) {
        this.$nextTick(() => {
          if(this.$refs.editChart[index]){
            this.$refs.editChart[index].setData(chartItem, [], this.filter.panelId, this.filter);//????怎么设置的无数据？？
          }
        });
      } else {
        let startTime = '';
        let endTime = '';
        if (filterType === 'refresh') {//刷新
          const now = new Date();
          const origin = new Date(this.filter.end_time);
          const numInterval = now.getTime() - origin.getTime();
          if (numInterval >= 60000) {//大于1分钟，则start、end均往后移numInterval，否则时间不变
            startTime = this.getNewTime(this.filter.start_time, numInterval);
            endTime = bus.timeFormate(now, 'yyyy-MM-dd hh:mm:ss');
          } else {
            startTime = this.filter.start_time;
            endTime = this.filter.end_time;
          }
        } else if(filterType==='showFullScreen'){//全屏时间查询
          startTime = this.filter.start_time;
          endTime = this.filter.end_time;
          //this.$parent.refreshTime(startTime,endTime);全屏查询，不更新panel列表的时间条件
        }else {
           startTime = this.filter.start_time;
           endTime = this.filter.end_time;
        }
        let step = bus.getStep(startTime,endTime);
        this.$nextTick(() => {
          const axiosArr = chartItem.elements.map((ele) => {
            const filterItem = ele;
            let query = encodeURIComponent(filterItem.expression);
            return  this.$get('/prom/api/v1/query_range?query='+query+"&start="+startTime+"&end="+endTime+'&step='+step);
          });
          // 一个图表的所有element单独获取数据
          axios.all(axiosArr).then((res) => {
            if (res.length > 0) {
              const series = [];
              const legend = [];
              const tableData = [];
              const sumData = {
                name: 'sum',
                data: [],
                visible: true,
                threshold: null,
              };
              res.forEach((response, innerPos) => {
                if (response.status === 'success') {
                  if (response.data.result) {
                    // console.log(response.data.result)
                    // 循环处理每个elements下获取的数据列
                    response.data.result.forEach((queryItem) => {
                      const seriesItem = {
                        theData: {
                          name: '',
                          symbol:'none',  //去掉点
                          smooth:true,  //曲线变平滑
                          data: [],
                          type:chartInfo.type,
                          //visible: true,
                          //threshold: null,
                        },
                        metric_name: '',
                      };
                      if(chartInfo.type === 'stackArea'){
                        seriesItem.theData.type='line';
                        seriesItem.theData.stack=chartInfo.title;
                        seriesItem.theData.areaStyle={};
                      }
                      // 图表中每条线的名字,后半部分
                      let host = '';//up,
                      if(queryItem.metric.__name__){
                        host = `${queryItem.metric.__name__}{`;//up,
                      }
                      const tagsArr = Object.keys(queryItem.metric);//["__name__","asset","idc","instance","job","module","project"]
                      // 设置时间-数据格式对
                      const dpsArr = Object.entries(queryItem.values);//[ ["0",[1577959830.781,"0"]], ["1",[1577959845.781,"0"]] ]
                      // 判断是否有数据, && tagsArr.length > 0
                      if (dpsArr.length > 0 && this.$refs.editChart[index]) {
                        tagsArr.forEach((tag, i) => {
                          if (tag !== '__name__') {
                            host += `${tag}="${queryItem.metric[tag]}",`;
                          }
                        });
                        if(host.endsWith(',')){host = host.substr(0,host.length-1);}
                        if(queryItem.metric.__name__){
                          host +="}";
                        }
                        if(!host || host===''){
                          host = chartItem.elements[innerPos].expression;
                        }
                        //处理legend别名
                        let alias=this.$refs.editChart[index].dealLegendAlias(host,chartItem.elements[innerPos].legend);
                        if(!alias || alias===''){
                          alias = chartItem.elements[innerPos].expression;
                        }
                        //if(alias){
                          //host = alias;
                        //}
                        legend.push({name:host,alias:alias});
                        // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c
                        seriesItem.theData.name = host;
                        seriesItem.metric_name = seriesItem.theData.name;
                        // 将秒改为毫秒
                        //alert('table=='+JSON.stringify(queryItem))
                        seriesItem.theData.data = queryItem.values.map((dpsItem, dpsIndex) => {
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
                            element:{element:host,alias:alias},
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
                }else{
                  if(response.msg){
                    this.$message.error(response.msg);
                  }else if(response.error){
                    this.$message.error(response.error);
                  }else {
                    this.$message.error(response);
                  }
                }
              });
              if(this.$refs.editChart&&this.$refs.editChart[index]) {
                if (chartItem.type === 'table') {//表格
                  if (filterType === 'showFullScreen') {//table的全屏查询
                    this.$refs.editChart[index].setData(chartItem, tableData,
                      this.filter.panelId, this.filter, filterType);
                  } else {
                    this.$refs.editChart[index].setData(chartItem, tableData,
                      this.filter.panelId, this.filter);
                  }
                } else if (chartItem.type === 'line' || chartItem.type === 'bar' || chartItem.type === 'stackArea' || chartItem.type === 4) {
                  if (series.length && chartItem.type === 4) {//曲线汇总
                    //series.push(sumData);//后续需要
                  }
                  if (filterType === 'showFullScreen') {//table的全屏查询
                    this.$refs.editChart[index].setData(chartItem, series,
                      this.filter.panelId, this.filter, legend, filterType);
                  } else {
                    this.$refs.editChart[index].setData(chartItem, series,
                      this.filter.panelId, this.filter, legend);
                  }
                }
              }
            } else {
              const type = chartItem.type;
              if(this.$refs.editChart[index]) {
                if (type === 'table') {
                  if (filterType === 'showFullScreen') {//table的全屏查询
                    this.$refs.editChart[index].setData(chartItem, [], this.filter.panelId,
                      this.filter, filterType);
                  } else {
                    this.$refs.editChart[index].setData(chartItem, [], this.filter.panelId,
                      this.filter);
                  }
                } else if (type === 'line' || type === 'bar' || type === 'stackArea' || chartItem.type === 4) {
                  if (filterType === 'showFullScreen') {//table的全屏查询
                    this.$refs.editChart[index].setData(chartItem, [], this.filter.panelId,
                      this.filter, filterType);
                  } else {
                    this.$refs.editChart[index].setData(chartItem, [], this.filter.panelId,
                      this.filter);
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
    },
    // 设置图表的宽度
    setSize(size, index) {
      this.$nextTick(() => {
        const chartBox = document.getElementsByClassName('chartBox');
        chartBox[index].style.width = `${(size / 12) * 100}%`;
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
    }
    /*
    // 刷新数据
    refreshData() {
      this.getData(this.filter);
    },
     */
  },

  mounted() {
  },
  beforeDestroy() {
  },
};

</script>
