<style lang="scss">
  @import './chart.scss';
</style>
<template>
  <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box resize-box-alert-rule" ref="resizeBox">
      <div class="chart-alert-rule-info" :id="'chartAlertRuleInfoDiv'+chartIndex" @mouseenter="caretShow=true" @mouseleave="caretShow=false">
        <loading :ref="'localLoading'+chartIndex"></loading>
        <div class="clearfix chartTitle drag-disabled" :class="{'dragTitle':dragTitleShow}" :id="'chartTitle'+chartIndex">
          <el-popover
            v-if="isError"
            :close-delay=10
            placement="top-start"
            trigger="hover"
            popper-class="chart-error-popper">
            <div>{{errorContent}}</div>
            <span slot="reference" class="panel-info-corner panel-info-corner--error">
              <i class="nz-icon nz-icon-warning fa"></i>
              <span class="panel-info-corner-inner"></span>
            </span>
          </el-popover>
          <span class="el-dropdown-link chart-title" @click="dropdownMenuShow=!dropdownMenuShow">
            <span class="chart-title-text">{{data.title}}</span>
          </span>
        </div>
        <div class="mt-10 chart-info-container" v-cloak>
          <div :id="'chartContainer'+chartIndex"  ref="chartContainer" class="asset-info-content" >
            <el-scrollbar style="height: 100%;width:100%;" ref="scrollbar" class="el-scrollbar-normal">
              <div style="padding: 0 15px">
                <div v-if="detail.project && detail.project.length > 0" class="basic-container">
                  <div class="basic-title asset-info-content-title" @click.stop="hideElement('project')">
                    <span><i :class="{'el-icon-caret-right': unfold.indexOf('project') == -1,'el-icon-caret-bottom': unfold.indexOf('project') > -1}"></i></span>
                    <span>&nbsp;{{$t('project.project.project')}}</span>
                  </div>
                  <div class="basic-content basic-content-asset unfold" ref="project">
                    <div v-for="(item, index) in detail.project" class="content-item hover-bg">
                      <div class="content-item-key item-tip" :id="'project' + index">
                        <span>{{item.name}}</span>
                        <div class="item-tip-hide item-tip-key el-popover" :class="itemTip('project', item.name, index, ready)">{{item.name}}</div>
                      </div><div class="content-item-value">
                        <span>{{item.nums}}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="detail.module && detail.module.length > 0" class="basic-container">
                  <div class="basic-title asset-info-content-title" @click.stop="hideElement('module')">
                    <span><i :class="{'el-icon-caret-right': unfold.indexOf('module') == -1,'el-icon-caret-bottom': unfold.indexOf('module') > -1}"></i></span>
                    <span>&nbsp;{{$t('project.module.module')}}</span>
                  </div>
                  <div class="basic-content basic-content-asset" ref="module">
                    <div v-for="(item, index) in detail.module" class="content-item hover-bg">
                      <div class="content-item-key item-tip" :id="'module' + index">
                        <span>{{item.name}}</span>
                        <div class="item-tip-hide item-tip-key el-popover" :class="itemTip('module', item.name, index, ready)">{{item.name}}</div>
                      </div><div class="content-item-value">
                        <span>{{item.nums}}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="detail.asset && detail.asset.length > 0" class="basic-container">
                  <div class="basic-title asset-info-content-title" @click.stop="hideElement('asset')">
                    <span><i :class="{'el-icon-caret-right': unfold.indexOf('asset') == -1,'el-icon-caret-bottom': unfold.indexOf('asset') > -1}"></i></span>
                    <span>&nbsp;{{$t('asset.asset')}}</span>
                  </div>
                  <div class="basic-content basic-content-asset" ref="asset">
                    <div v-for="(item, index) in detail.asset" class="content-item hover-bg">
                      <div class="content-item-key item-tip" :id="'asset' + index">
                        <span>{{item.name}}</span>
                        <div class="item-tip-hide item-tip-key el-popover" :class="itemTip('asset', item.name, index, ready)">{{item.name}}</div>
                      </div><div class="content-item-value">
                        <span>{{item.nums}}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="detail.endpoint && detail.endpoint.length > 0" class="basic-container">
                  <div class="basic-title asset-info-content-title" @click.stop="hideElement('endpoint')">
                    <span><i :class="{'el-icon-caret-right': unfold.indexOf('endpoint') == -1,'el-icon-caret-bottom': unfold.indexOf('endpoint') > -1}"></i></span>
                    <span>&nbsp;{{$t('project.endpoint.endpoint')}}</span>
                  </div>
                  <div class="basic-content basic-content-asset" ref="endpoint">
                    <div v-for="(item, index) in detail.endpoint" class="content-item hover-bg">
                      <div class="content-item-key item-tip" :id="'endpoint' + index">
                        <span>{{item.name}}</span>
                        <div class="item-tip-hide item-tip-key el-popover" :class="itemTip('endpoint', item.name, index, ready)">{{item.name}}</div>
                      </div><div class="content-item-value">
                        <span>{{item.nums}}</span>
                      </div>
                    </div>
                  </div>
                </div>

                    <!--<div v-for="(item, index) in detail" class="content-item hover-bg">
                      <div class="content-item-key item-tip" :id="'basicKey' + index">
                        <span>{{item.label}}</span>
                        <div class="item-tip-hide item-tip-key el-popover" :class="itemTip('basicKey', item.label, index, ready)">{{item.label}}</div>
                      </div><div class="content-item-value item-tip" :id="'basicValue' + index">
                        <span>{{item.value ? item.value : "&nbsp;"}}</span>
                        <div class="item-tip-hide item-tip-value el-popover" :class="itemTip('basicValue', item.value, index, ready)">{{item.value}}</div>
                      </div>
                    </div>-->
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>
      <!--<span class="vue-resizable-handle" @mousedown="startResize"></span>-->
    </div>
  </div>
</template>

<script>
  import bus from '../../libs/bus';
  import {Loading} from 'element-ui';
  import chartDataFormat from './chartDataFormat'
  import loading from "../common/loading";
  import timePicker from '../common/timePicker'

  export default {
    name: 'chartAlertRuleInfo',
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
      },
    },
    data() {
      return {
        ready: false,
        data: {}, // 该图表信息,chartItem
        unit:{},
        detail: {},
        isError:false,
        errorContent:'',
        loading:Object,
        panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
        firstLoad: false, // 是否第一次加载
        screenModal: false,
        // 查询数据使用
        filter: {
          start_time: '',
          end_time: '',
          from: ''
        },
        unfold: ["project"], //展开的列表 project、module、asset、endpoint
        firstShow: false, // 默认不显示操作按钮,
        caretShow:false,
        dragTitleShow:false,
        dropdownMenuShow:false,
        divFirstShow:false,
        searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()],//全屏显示的时间
        oldSearchTime: [],
      };
    },
    computed: {
      itemTip() {
        return function(type, content, index, ready) {
          let className = "";
          if (ready) {
            let cellDom = document.querySelector(`#${type}${index}`);
            let spanDom = document.createElement("span");
            spanDom.style.display = "inline-block";
            spanDom.innerText = content;
            cellDom.appendChild(spanDom);
            if (cellDom.offsetWidth-16 < spanDom.offsetWidth) {
              className = "item-tip-show";
            }
            cellDom.removeChild(spanDom);
          }
          return className;
        }
      },
    },
    methods: {
      startResize(e) {
        let vm = this;
        this.$chartResizeTool.start(vm, this.data, e);
      },
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
        let dom = this.$refs[type];
        if (this.unfold.indexOf(type) > -1) {
          this.unfold.splice(this.unfold.indexOf(type), 1);
        } else {
          this.unfold.push(type);
        }
        if (dom.classList.contains("unfold")) {
          dom.classList.remove("unfold");
          dom.classList.add("fold");
        } else if (dom.classList.contains("fold")) {
          dom.classList.remove("fold");
          dom.classList.add("unfold");
        } else if (!dom.classList.contains("unfold") && !dom.classList.contains("fold")) {
          dom.classList.add("unfold");
        }
        setTimeout(()=>{
          this.$refs.scrollbar.update();
        },400);
      },
      replaceSplit(key){
        if(key){
          return key.replace(/\$_\$/g,' ')
        }
      },
      startLoading(area){
        this.$refs['localLoading'+this.chartIndex].startLoading();
      },
      endLoading(area){
        this.$refs['localLoading'+this.chartIndex].endLoading();
      },
      resize() {
        let container = document.querySelector('#chartAlertRuleInfoDiv' + this.chartIndex + " .chart-info-container");
        container.style.height = `calc(100% - ${this.$chartResizeTool.titleHeight+this.$chartResizeTool.chartTableBlankHeight}px)`;
      },
      showLoad(chartItem) {
        this.$nextTick(() => {
          this.resize();
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
      setData(chartItem, data) {
        this.resize(chartItem);
        this.divFirstShow = true;

        this.firstShow = true; // 展示操作按键

        this.data = chartItem;
        this.detail = data;

        this.$nextTick(()=>{
          this.$refs.scrollbar.update();
        });
        this.endLoading();
      },
    },
    mounted() {
      this.firstLoad = false;
      this.$nextTick(()=>{
        this.$refs.scrollbar.update();
      })
      setTimeout(() => {
        this.ready = true;
      }, 300);
    },
    beforeDestroy() {
      this.clearChart();
    },
  };
</script>
