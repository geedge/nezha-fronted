<style lang="scss">
@import './chart.scss';
</style>
<template>
  <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box resize-box-url" ref="resizeBox">
      <div class="chart-url" :id="'chartUrlDiv'+chartIndex" @mouseenter="caretShow=true" @mouseleave="caretShow=false" >
        <loading  :ref="'localLoading'+chartIndex"></loading>
        <div class="clearfix chartTitle" :class="{'dragTitle':dragTitleShow}" :id="'chartTitle'+chartIndex">
          <el-dropdown trigger="click" class="nz-chart-top" :key="'chartDropdown'+chartIndex"  v-clickoutside="clickos">
            <el-dropdown-menu style="display: none"></el-dropdown-menu>
            <span class="el-dropdown-link chart-title" @click.stop="dropdownMenuShow=!dropdownMenuShow">
              <span class="chart-title-text">{{chartData.title}}</span>
              <span class="chart-title-icon"><i class="nz-icon nz-icon-xialaxuanze  "  :class="{'visible':caretShow,'hidden':!caretShow}"></i></span>
            </span>
            <ul slot="dropdown" v-show="dropdownMenuShow"  :id="'dropdownUl'+chartIndex"  class="el-dropdown-menu nz-chart-dropdown"  style="position: absolute; top: 30px; left: calc(50% - 79px); transform-origin: center top; z-index: 1000;" >
              <li  @click="refreshChart"  class="el-dropdown-menu__item">
                <i class="global-active-color el-icon-refresh-right" style="font-size: 16px;"></i><span>{{$t('dashboard.refresh')}}</span></li>
              <li  @click="editChart"  class="el-dropdown-menu__item">
                <i class="nz-icon nz-icon-edit" style="font-size: 14px; margin-right: 11px; margin-left: 1px;"></i>{{$t('dashboard.edit')}}</li>
              <li  @click="removeChart"  class="el-dropdown-menu__item">
                <i class="nz-icon nz-icon-delete" style="font-size: 16px;"></i>{{$t('dashboard.delete')}}</li>
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
        <div style="position: absolute;width: 100%; top:calc(50% - 50px);text-align: center;" v-if="showStatic">
          <div  :id="'staticContainer'+chartIndex" class="center-content"></div>
        </div>
        <!--全屏-->
        <el-dialog class="nz-dialog table-chart-dialog" :title="$t('dashboard.panel.view')"  :visible.sync="screenModal" width="96%" @opened="initDialog"  @close="screenModal = false" >
          <div slot="title">
            <span class="nz-dialog-title">{{chartData.title}}</span>
            <!--<span class="float-right  dialog-tool" @click="screenRefreshChart" style="margin-right: 15px"><i class="global-active-color nz-icon nz-icon-refresh"/></span>-->
          </div>
          <iframe :id="'urlContainerFull'+chartIndex"  frameborder="0" width="100%" height="100%" name="showHereFull" scrolling=auto v-if="!showStatic"
                  style="z-index:5000;padding-bottom:6px;"
          ></iframe><!--  style=" position: absolute; width: 100%; height: 100%; top: 0;left:0;"  :src="chart.url" v-scrollBar:char-url-preview-->
          <div style="position: absolute;width: 100%; top:calc(50% - 100px);text-align: center;" v-if="showStatic">
            <div  :id="'staticContainerFull'+chartIndex" class="center-content"></div>
          </div>
          <loading  :ref="'localLoadingScreen'+chartIndex"></loading>
        </el-dialog>
      </div>
      <span class="vue-resizable-handle" @mousedown="startResize"></span>
    </div>
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
    chartData: {
      type: Object
    },
    chartData: {
      type: Object
    },
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
    },

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
  methods: {
    startResize(e) {
      let vm = this;
      this.$chartResizeTool.start(vm, this.chartData, e);
    },
    resize(chartItem) {
      let chartBox = document.getElementById('chartUrlDiv'+this.chartIndex);
      chartBox.querySelector(".url-container").style.height = `calc(100% - ${this.$chartResizeTool.titleHeight}px)`
    },
    showLoad(chartItem) {
      this.data = chartItem;
      this.panelIdInner = this.panelId;
      //设置高度
      this.$nextTick(() => {
        this.resize(chartItem);
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
            // console.log('iframe已加载完毕');
            that.endLoading();
          })
        } else {
          iframe.onload = function () {
            // iframe加载完毕以后执行操作
            that.firstShow = true;
            // console.log('iframe已加载完毕');
            that.endLoading();
          }
        }
        iframe.src = that.data.param.url;
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
    clearChart(){
      this.data = {};
    },
    screenRefreshChart(){
     ('urlContainerFull'+this.chartIndex).window.location.reload()
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
            // console.log('iframe已加载完毕');
            that.endLoading('screen');
          })
        } else {
          iframe.onload = function () {
            // iframe加载完毕以后执行操作
            that.firstShow = true;
            // console.log('iframe已加载完毕');
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
        staticDiv.innerHTML=`<div class="content-static-url">${that.data.param.url}</div><div class="content-static-tip">${that.$t('dashboard.panel.chartForm.typeVal.url.staticTip')}</div>`
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
