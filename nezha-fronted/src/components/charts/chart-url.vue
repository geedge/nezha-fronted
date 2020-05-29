<style lang="scss" scoped>
@import './chart-url.scss';
</style>
<style>
  .max-width-90{
    max-width: 90px;
  }
</style>
<template>
    <div class="chart-url"  :id="'chartUrlDiv'+chartIndex" v-show="divFirstShow" @mouseenter="caretShow=true" @mouseleave="caretShow=false" >
        <loading  :ref="'localLoading'+chartIndex"></loading>

        <div class="clearfix chartTitle" :class="{'dragTitle':dragTitleShow}" :id="'chartTitle'+chartIndex">

          <el-dropdown trigger="click" v-show="firstShow"   class="nz-chart-top" :key="'chartDropdown'+chartIndex"  v-clickoutside="clickos">
            <el-dropdown-menu style="display: none"></el-dropdown-menu>
            <span class="el-dropdown-link chart-title" @click="dropdownMenuShow=!dropdownMenuShow">
              <span class="chart-title-text">{{data.title}}</span>
              <span class="chart-title-icon"><i class="el-icon-caret-bottom el-icon--right"  :class="{'visible':caretShow,'hidden':!caretShow}"></i></span>
            </span>
            <ul slot="dropdown" v-show="dropdownMenuShow"  :id="'dropdownUl'+chartIndex"  class="el-dropdown-menu nz-chart-dropdown"  style="position: absolute; top: 30px; left: calc(50% - 79px); transform-origin: center top; z-index: 1000;" >
              <li  @click="refreshChart"  class="el-dropdown-menu__item">
                <i class="global-active-color el-icon-refresh-right" style="font-size: 16px;"></i><span>{{$t('dashboard.refresh')}}</span></li>
              <li  @click="editChart"  class="el-dropdown-menu__item">
                <i class="nz-icon nz-icon-edit" style="font-size: 14px; margin-right: 11px; margin-left: 1px;"></i>{{$t('dashboard.edit')}}</li>
              <li  @click="removeChart"  class="el-dropdown-menu__item">
                <i class="el-icon-delete" style="font-size: 16px;"></i>{{$t('dashboard.delete')}}</li>
              <li  @click="showAllScreen"  class="el-dropdown-menu__item">
                <i class="el-icon-full-screen" style="font-size: 16px;"></i>{{$t('dashboard.screen')}}</li>
              <li  @click="duplicate"  class="el-dropdown-menu__item">
                <i class="el-icon-copy-document" style="font-size: 16px;"></i>{{$t('dashboard.duplicate')}}</li>
            </ul>
          </el-dropdown>

        </div>
        <div :id="'chartUrl'+chartIndex" class="mt-10 url-container"  v-show="firstShow" >
            <iframe :id="'urlContainer'+chartIndex" frameborder="0" width="100%" height="100%" name="showHere" scrolling=auto v-if="!showStatic"
                    style="z-index:5000;padding-bottom:6px;"
            ></iframe><!--  style=" position: absolute; width: 100%; height: 100%; top: 0;left:0;"  :src="chart.url" v-scrollBar:char-url-preview-->
        </div>
      <div style="position: relative;width: 100%;height: 100%;" v-if="showStatic">
        <div  :id="'staticContainer'+chartIndex" class="center-content"></div>
      </div>
        <!--全屏-->
          <el-dialog class="nz-dialog table-chart-dialog" :title="$t('dashboard.panel.view')"  :visible.sync="screenModal" width="96%" @opened="initDialog"  @close="screenModal = false" >
            <div slot="title">
              <span class="nz-dialog-title">{{data.title}}</span>
            </div>
            <iframe :id="'urlContainerFull'+chartIndex"  frameborder="0" width="100%" height="100%" name="showHereFull" scrolling=auto v-if="!showStatic"
                    style="z-index:5000;padding-bottom:6px;"
            ></iframe><!--  style=" position: absolute; width: 100%; height: 100%; top: 0;left:0;"  :src="chart.url" v-scrollBar:char-url-preview-->
            <div style="position: relative;width: 100%;height: 100%;" v-if="showStatic">
              <div  :id="'staticContainerFull'+chartIndex" class="center-content"></div>
            </div>
            <loading  :ref="'localLoadingScreen'+chartIndex"></loading>
        </el-dialog>
      <span class="vue-resizable-handle" @mousedown="dragResize"></span>
    </div>
</template>

<script>
import bus from '../../libs/bus';
import chartDataFormat from './chartDataFormat'
import loading from "../common/loading";

export default {
    name: 'chartUrl',
  components: {
    'loading': loading,
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

            images: '',
            loading:Object,
            panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
            firstLoad: false, // 是否第一次加载
            screenModal: false,
            firstShow: false, // 默认不显示操作按钮,
            caretShow:false,
            dragTitleShow:false,
            dropdownMenuShow:false,
            minHeight:200,
            chartSpaceHeight:5,//top-border: 1,bottom-border: 1,padding-bottome:3
            titleHeight:38,//title-height:28,magrin-bottom:10
            paddingBottom:6,
            divFirstShow:false,
            showStatic:false,
        };
    },
    created() {
    },
    computed: {},
    watch: {},
    methods: {
      showLoad(chartItem) {
        console.log(chartItem)
        this.data = chartItem;
        this.panelIdInner = this.panelId;
        //设置高度
        this.$nextTick(() => {
          const chartBox = document.getElementById('chartUrlDiv'+this.chartIndex);
          let height = Math.round(chartItem.height/10)*10;//图表高度四舍五入
          if(height<this.minHeight){
            height = this.minHeight;
          }
          chartBox.style.height = `${height-this.chartSpaceHeight}px`;
          const urlBox = document.getElementById('urlContainer'+this.chartIndex);
          urlBox.style.height = `${height-this.chartSpaceHeight-this.titleHeight-this.paddingBottom}px`;// -75-32
        });
        this.startLoading();

        if(/\{\{.*?\}\}/g.test(this.data.param.url)){
          this.showStatic=true;
          this.setStaticContent();
        }else{
          this.showStatic=false;
          this.setLoadFrame();
        }
        this.divFirstShow = true;
      },
      setStaticContent:function(){
        let that = this;
        this.$nextTick(() => {
          let staticDiv = document.querySelector('#staticContainer'+this.chartIndex);
          staticDiv.innerHTML=`<div class="content-static-url">${that.data.param.url}</div><div class="content-static-tip">${that.$t('dashboard.panel.chartForm.typeVal.url.staticTip')}</div>`
          that.firstShow = true;
          that.endLoading();
        });
      },
      setLoadFrame(){
        let that = this;
        this.$nextTick(() => {
          let iframe = document.querySelector('#urlContainer'+this.chartIndex);
          // 处理兼容行问题
          if (iframe.attachEvent) {
            iframe.attachEvent('onload', function () {
              // iframe加载完毕以后执行操作
              that.firstShow = true;
              console.log('iframe已加载完毕');
              that.endLoading();
            })
          } else {
            iframe.onload = function () {
              // iframe加载完毕以后执行操作
              that.firstShow = true;
              console.log('iframe已加载完毕');
              that.endLoading();
            }
          }
          console.log(that.data)
          iframe.src = that.data.param.url;
          console.log(iframe)
        });
      },
      initDialog(){
        this.startLoading('screen');
        if(/\{\{.*?\}\}/g.test(this.data.param.url)){
          this.showStatic=true;
          this.setStaticContentFull();
        }else{
          this.showStatic=false;
          this.setLoadFrameFull();
        }

      },
      dragResize:function(e){
        var diffWidth =20; //界面的宽度空白的地方的宽度
        var chartBoxPadding = 22;
        var targetDiv= document.getElementById('chartUrlDiv'+this.chartIndex); //e.target.parentNode.parentNode;.children[0]
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
            const tableBox = document.getElementById('urlContainer'+_this.chartIndex);
            tableBox.style.height = `${containerHeight-_this.titleHeight}px`;//-75-32+25
        };

        document.onmouseup=function(){
          document.onmousemove=null;
          document.onmouseup = null;
          let targetDivHeightNew = parseInt(targetDiv.style.height);
          //let targetDivHeightNew = heightTmp
          let targetDivWidthNew = parseInt(targetDiv.style.width);
          //let targetDivWidthNew = widthTmp;

          let diffHeight =  Math.abs(targetDivHeight-targetDivHeightNew);
          if(targetDivHeight>targetDivHeightNew){
            let finalDiffHeight = Math.floor(diffHeight/stepHeight)*stepHeight;
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
          const tableBox = document.getElementById('urlContainer'+_this.chartIndex);
          tableBox.style.height = `${containerHeight-_this.titleHeight}px`;

          const modifyParams = {
            id:_this.data.id,
            span:span,
            height:(containerHeight+_this.chartSpaceHeight),
            prev:parseInt(_this.data.prev),
            next:parseInt(_this.data.next),
          };
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

        }
      },
        startLoading(area){
          if(area==='screen'){
            this.$refs['localLoadingScreen'+this.chartIndex].startLoading();
          }else {
            this.$refs['localLoading'+this.chartIndex].startLoading();
          }
        },
        endLoading(area){
          if(area==='screen'){
            this.$refs['localLoadingScreen'+this.chartIndex].endLoading();
          }else {
            this.$refs['localLoading'+this.chartIndex].endLoading();
          }
        },
        clearData(){
        },
        clearChart(){
          this.data = {};
        },
        // 重新请求数据 刷新操作-local
        refreshChart() {
            this.dropdownMenuShow=false;
            this.startLoading();
            this.firstShow = false;
            let iframe = document.querySelector('#urlContainer'+this.chartIndex);
            iframe.src = '';
            iframe.src = this.data.param.url;
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
        // 全屏查看
        showAllScreen() {
          this.dropdownMenuShow=false;
          this.screenModal = true;
        },
      duplicate(){
        this.dropdownMenuShow=false;
        const param = {id:this.data.id};
        this.$post('panel/'+ this.data.panelId+'/charts/duplicate',(param)).then(response => {
          if (response.code === 200) {
            this.$message({
              duration: 2000,
              type: 'success',
              message: this.$t("tip.duplicateSuccess")
            });
            this.$emit('on-duplicate-chart-block', this.data.id,response.data);
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
      },
      setLoadFrameFull(){
        let that = this;
        this.$nextTick(() => {
          let iframe = document.querySelector('#urlContainerFull'+this.chartIndex);

          // 处理兼容行问题
          if (iframe.attachEvent) {
            iframe.attachEvent('onload', function () {
              // iframe加载完毕以后执行操作
              that.firstShow = true;
              console.log('iframe已加载完毕');
              that.endLoading('screen');
            })
          } else {
            iframe.onload = function () {
              // iframe加载完毕以后执行操作
              that.firstShow = true;
              console.log('iframe已加载完毕');
              that.endLoading('screen');
            }
          }

          iframe.src = this.data.param.url;
        });
      },
      setStaticContentFull:function(){
        let that = this;
        this.$nextTick(() => {
          let staticDiv = document.querySelector('#staticContainerFull'+this.chartIndex);
          staticDiv.innerHTML=`<span>${that.data.param.url}</span><span>${that.$t('dashboard.panel.chartForm.typeVal.url.staticTip')}</span>`
          that.firstShow = true;
          that.endLoading('screen');
        });
      },
    },
    mounted() {
        this.firstLoad = false;
    },
    beforeDestroy() {
      this.clearChart();
    },
};
</script>
<style>
  .center-content .content-static-url{
    font-weight: bold;
    font-size: 24px;
  }
  .center-content .content-static-tip{
    font-size: 18px;
    color: lightgrey;
  }
</style>
