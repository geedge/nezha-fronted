<template>
  <div class="chart-asset-info"  :id="'chartAssetInfoDiv'+chartIndex" v-show="divFirstShow" @mouseenter="caretShow=true" @mouseleave="caretShow=false">
    <loading  :ref="'localLoading'+chartIndex"></loading>
    <div class="clearfix chartTitle" :class="{'dragTitle':dragTitleShow}" :id="'chartTitle'+chartIndex">
      <el-popover
        v-if="isError"
        :close-delay=10
        placement="top-start"
        trigger="hover"
        popper-class="chart-error-popper">
        <div >{{errorContent}}</div>
        <span slot="reference" style="" class="panel-info-corner panel-info-corner--error">
                <i class="nz-icon nz-icon-warning fa"></i>
                <span class="panel-info-corner-inner"></span>
            </span>
      </el-popover>
      <span class="el-dropdown-link chart-title" @click="dropdownMenuShow=!dropdownMenuShow">
        <span class="chart-title-text">{{data.title}}</span>
      </span>
    </div>
    <div class="mt-10 chart-info-container" v-cloak  v-show="firstShow" >
      <div :id="'chartContainer'+chartIndex"  ref="chartContainer" class="asset-info-content" >
          <el-scrollbar style="height: 100%;" ref="scrollbar" class="el-scrollbar-large">
            <div style="padding: 0 15px">
              <div class="basic-container">
                <div class="basic-title" @click="hideElement('basic')">
                  <div>{{$t('asset.basicTitle')}}</div>
                  <div><i :class="{'el-icon-caret-bottom':hideBasic,'el-icon-caret-top':!hideBasic}"></i></div>
                </div>
                <div class="basic-content" :class="{'shrink':hideBasic}">
                  <template v-if="assetInfos.Basic && Object.keys(assetInfos.Basic).length>0">
                    <div v-for="(value,key,index) in assetInfos.Basic" :key="index" class="content-item" :class="{'bg-grey':index % 2 == 1}">
                      <div class="content-item-key">{{replaceSplit(key)}}</div>
                      <div class="content-item-value">{{value}}</div>
                    </div>
                  </template>
                </div>
              </div>
              <div class="feature-container">
                <div class="feature-title" @click="hideElement('feature')" >
                  <div>{{$t('asset.featureTitle')}}</div>
                  <div><i :class="{'el-icon-caret-bottom':hideFeature,'el-icon-caret-top':!hideFeature}"></i></div>
                </div>
                <div class="feature-content" :class="{'shrink':hideFeature}">
                  <div v-for="(value,key,index) in assetInfos.Feature" class="content-item" :class="{'bg-grey':index % 2 == 1}">
                    <div class="content-item-key" ><div style="vertical-align: middle">{{replaceSplit(key)}}</div></div>
                    <template v-if="typeof value == 'string'">
                      <div class="content-item-value">{{value}}</div>
                    </template>
                    <div v-if="Array.isArray(value) && value.length>0" class="content-item-value">
                      <template v-if="typeof value[0] == 'string'">
                        <div class="item-value-sub" v-for="(item,index) in value" :key="index">{{item}}</div>
                      </template>
                      <template v-else>
                        <el-table
                          class="overview-table"
                          :data="value"
                          tooltip-effect="light"
                          height="100%"
                          ref="dataTable"
                        >
                          <el-table-column
                            :resizable="false"
                            v-for="(item, index) in setLabels(value)"
                            v-if="item.show"
                            :key="`col-${index}`"
                            :width="item.width"
                            :label="item.label"
                            min-width="90"
                          >
                            <template slot-scope="scope" :column="item">
                              <template >
                                <span v-html="scope.row[item.prop]"></span>
                              </template>
                            </template>
                          </el-table-column>
                        </el-table>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
    </div>
    <span class="vue-resizable-handle" @mousedown="dragResize"></span>
  </div>
</template>

<script>
  import bus from '../../libs/bus';
  import {Loading} from 'element-ui';
  import chartDataFormat from './chartDataFormat'
  import loading from "../common/loading";
  import timePicker from '../common/timePicker'

  export default {
    name: 'chartAssetInfo',
    components: {
      'loading': loading,
      'time-picker':timePicker
    },
    props: {
      // 看板id
      panelId: {
        type: Number,
        default: 0,
      },
      editChartId: {
        type: String,
        default: 'editChartId',
      },
      chartIndex:{
        type: Number,
        default: 0,
      }
    },
    data() {
      return {
        data: {}, // 该图表信息,chartItem
        unit:{},
        isError:false,
        errorContent:'',
        assetInfos:{},
        //toolbox: false,
        loading:Object,
        panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
        firstLoad: false, // 是否第一次加载
        screenModal: false,
        // 查询数据使用
        filter: {
          start_time: '',
          end_time: '',
        },
        hideBasic:false,
        hideFeature:false,
        firstShow: false, // 默认不显示操作按钮,
        caretShow:false,
        dragTitleShow:false,
        dropdownMenuShow:false,
        minHeight:200,
        chartSpaceHeight:5,//top-border: 1,bottom-border: 1,padding-bottome:3
        titleHeight:38,//title-height:28,magrin-bottom:10
        divFirstShow:false,
        searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()],//全屏显示的时间
        oldSearchTime: [],
      };
    },
    created() {
    },
    computed: {},
    watch: {},
    methods: {
      setLabels:function(source){
        let labels=[];
        source.forEach(item=>{
          labels=labels.concat(Object.keys(item))
        })
        labels=Array.from(new Set(labels));

        labels=labels.map(item=>{
          return{
            label:this.replaceSplit(item),
            prop:item,
            show:true,
          }
        })

        return labels;
      },
      hideElement:function(type){
        if(type ==  'basic'){
          this.hideBasic=!this.hideBasic;
        }else{
          this.hideFeature=!this.hideFeature
        }
        this.$nextTick(()=>{
          this.$refs.scrollbar.update();
        })
      },
      replaceSplit(key){
        if(key){
          return key.replace('$_$',' ')
        }
      },
      dragResize:function(e){
        var diffWidth =20; //界面的宽度空白的地方的宽度
        var chartBoxPadding = 22;
        var targetDiv= document.getElementById('chartAssetInfoDiv'+this.chartIndex); //e.target.parentNode.parentNode;.children[0]
        var targetDivContainer= document.getElementById('listContainer'); //e.target.parentNode.parentNode;.children[0]
        var maxWidth = targetDivContainer.offsetWidth-diffWidth;
        var minWidth = maxWidth/12;
        var stepWidth = maxWidth/12;
        var stepHeight = 10;

        //得到点击时该容器的宽高：
        var targetDivHeight=targetDiv.offsetHeight;
        var targetDivWidth=targetDiv.offsetWidth;
        var startY=e.clientY;
        var startX=e.clientX;
        var _this=this;

        document.onmousemove=function(e){
          e.preventDefault();
          //得到鼠标拖动的宽高距离：取绝对值
          var distY=Math.abs(e.clientY-startY);
          var distX=Math.abs(e.clientX-startX);

          //往上方拖动：
          if( e.clientY < startY){
            targetDiv.style.height=targetDivHeight-distY+'px';
            //heightTmp = targetDivHeight-distY;
          }
          if( e.clientX < startX){
            targetDiv.style.width=targetDivWidth-distX+'px';
            //widthTmp = targetDivWidth-distX;
          }
          //往下方拖动：
          if (e.clientY > startY) {
            targetDiv.style.height=(targetDivHeight+distY)+'px';
            //heightTmp = targetDivHeight+distY;
          }
          if (e.clientX > startX) {
            targetDiv.style.width=(targetDivWidth+distX)+'px';
            //widthTmp = targetDivWidth+distX;
          }

          if(parseInt(targetDiv.style.height)<=_this.minHeight){
            targetDiv.style.height=_this.minHeight+'px';
            //heightTmp = _this.minHeight;
          }

          if(parseInt(targetDiv.style.width)>=maxWidth){
            targetDiv.style.width=maxWidth+'px';
            //widthTmp = maxWidth;
          }
          if(parseInt(targetDiv.style.width)<=minWidth){
            targetDiv.style.width=minWidth+'px';
            //widthTmp = minWidth;
          }
          //调整表格大小
          let containerHeight = parseInt(targetDiv.style.height);
          let containerWidth = parseInt(targetDiv.style.width);
          const chartBox = document.getElementsByClassName('chartBox');
          chartBox[_this.chartIndex].style.width = (containerWidth+chartBoxPadding)+'px';
          //chartBox[_this.chartIndex].style.height = `${containerHeight}px`;
          //表格的高度
          const chartAssetInfoBox = document.getElementById('chartContainer'+_this.chartIndex);
          chartAssetInfoBox.style.height = `${containerHeight-_this.titleHeight}px`;//-75-32+25
        }

        document.onmouseup=function(){
          let targetDivHeightNew = parseInt(targetDiv.style.height);
          //let targetDivHeightNew = heightTmp
          let targetDivWidthNew = parseInt(targetDiv.style.width);
          //let targetDivWidthNew = widthTmp;

          let diffHeight =  Math.abs(targetDivHeight-targetDivHeightNew);
          if(targetDivHeight>targetDivHeightNew){
            let finalDiffHeight = Math.floor(diffHeight/stepHeight)*stepHeight;
            //alert('oldWidth='+targetDivHeight+"===diffHeight+"+diffHeight+"==finalDiffHeight="+finalDiffHeight);
            targetDiv.style.height = (targetDivHeight-finalDiffHeight)+'px';
          }
          if(targetDivHeight<targetDivHeightNew){
            let finalDiffHeight = Math.ceil(diffHeight/stepHeight)*stepHeight;
            targetDiv.style.height = (targetDivHeight+finalDiffHeight)+'px';
          }

          var span = _this.data.span;
          if(targetDivWidth>targetDivWidthNew){
            span =  Math.floor((targetDivWidthNew*12)/maxWidth);
            let finalWidth = Math.floor((targetDivWidthNew*12)/maxWidth)*stepWidth;
            if((finalWidth)<minWidth){
              targetDiv.style.width=minWidth+'px';
              span = 1;
            }else {
              targetDiv.style.width = finalWidth+'px';
            }
          }
          if(targetDivWidth<targetDivWidthNew){
            span =  Math.ceil((targetDivWidthNew*12)/maxWidth);
            let spanUnit = Math.ceil((targetDivWidthNew*12)/maxWidth);
            let finalWidth = spanUnit*stepWidth;
            if(finalWidth>maxWidth || spanUnit===12){
              targetDiv.style.width=maxWidth+'px';
              span = 12;
            }else {
              targetDiv.style.width = finalWidth+'px';
            }
          }
          //调整表格大小
          let containerHeight = parseInt(targetDiv.style.height);
          let containerWidth = parseInt(targetDiv.style.width);

          const chartBox = document.getElementsByClassName('chartBox');
          chartBox[_this.chartIndex].style.width = (containerWidth+chartBoxPadding)+'px';
          //chartBox[_this.chartIndex].style.height = `${containerHeight}px`;
          //表格的高度
          const chartAssetInfoBox = document.getElementById('chartContainer'+_this.chartIndex);
          chartAssetInfoBox.style.height = `${containerHeight-_this.titleHeight}px`;

          const modifyParams = {
            id:_this.data.id,
            span:span,
            height:(containerHeight+_this.chartSpaceHeight),
            prev:parseInt(_this.data.prev),
            next:parseInt(_this.data.next),
          }
          targetDiv.style.height = (Math.round((containerHeight+_this.chartSpaceHeight)/10)*10-_this.chartSpaceHeight)+'px';//图表实际渲染高度，采用个位数字四舍五入
          _this.$put('panel/'+  _this.panelIdInner+'/charts/modify',modifyParams).then(response => {
            if (response.code === 200) {
              //更新当前图表数据
              _this.data.span= span;
              _this.data.height= containerHeight+_this.chartSpaceHeight;
              _this.$emit('on-drag-chart', _this.data);
            }else {
              if(response.msg){
                _this.$message.error(response.msg);
              }else if(response.error){
                _this.$message.error(response.error);
              }else {
                _this.$message.error(response);
              }
            }
          });
          document.onmousemove=null;
          document.onmouseup = null;
        }
      },
      startLoading(area){
        this.$refs['localLoading'+this.chartIndex].startLoading();
      },
      endLoading(area){
        this.$refs['localLoading'+this.chartIndex].endLoading();
      },
      clearData(){
      },
      showLoad(chartItem) {
        this.$nextTick(() => {
          const chartBox = document.getElementById('chartAssetInfoDiv'+this.chartIndex);
          let height = Math.round(chartItem.height/10)*10;//图表高度四舍五入
          if(height<this.minHeight){
            height = this.minHeight;
          }
          chartBox.style.height = `${height-this.chartSpaceHeight}px`;
          const singleStatBox = document.getElementById('chartContainer'+this.chartIndex);
          singleStatBox.style.height = `${height-this.chartSpaceHeight-this.titleHeight}px`;// -75-32
        });
        this.startLoading();
        this.divFirstShow = true;
      },
      // 重新请求数据 刷新操作-local
      refreshChart() {
        this.dropdownMenuShow=false;
        this.startLoading();
        this.firstShow = false;
        this.$emit('on-refresh-data', this.data.id);
      },
      // 编辑图表
      editChart() {
        this.dropdownMenuShow=false;
        this.$emit('on-edit-chart-block', this.data.id);
      },
      // 删除该图表
      removeChart() {
        this.dropdownMenuShow=false;
        this.$emit('on-remove-chart-block', this.data.id);
      },
      clickos() {
        this.dropdownMenuShow=false;
      },
      clearChart(){
        this.data = {};
      },

      // 设置数据, filter区分
      setData(chartItem, assetInfos, panelId, filter,area,errorMsg) {
        if(errorMsg && errorMsg!==''){
          this.isError = true;
          this.errorContent = errorMsg;
        }else {
          this.isError = false;
          this.errorContent = '';
        }
        this.$nextTick(() => {
          const chartBox = document.getElementById('chartAssetInfoDiv'+this.chartIndex);
          let height = Math.round(chartItem.height/10)*10;//图表高度四舍五入
          if(height<this.minHeight){
            height = this.minHeight;
          }
          chartBox.style.height = `${height-this.chartSpaceHeight}px`;
          const singleStatBox = document.getElementById('chartContainer'+this.chartIndex);
          singleStatBox.style.height = `${height-this.chartSpaceHeight-this.titleHeight}px`;// -75-32
        });
        this.divFirstShow = true;

        this.firstShow = true; // 展示操作按键

        this.panelIdInner = panelId;
        this.data = chartItem;

        this.assetInfos=assetInfos;
        this.$nextTick(()=>{
          this.$refs.scrollbar.update();
        })
        this.endLoading();
      },
    },
    mounted() {
      this.firstLoad = false;
      this.$nextTick(()=>{
        this.$refs.scrollbar.update();
      })
    },
    beforeDestroy() {
      this.clearChart();
    },
  };
</script>
<style lang="scss" scoped>
  @import './chart-asset-info';
</style>
<style>
  .asset-info-content .el-scrollbar__view {
    height: 100%;
  }
</style>
