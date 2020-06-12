<style lang="scss">
  @import './chart.scss';
</style>
<template>
  <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box resize-box-endpoint" ref="resizeBox">
      <div class="chart-asset-info" :id="'chartEndpointInfoDiv'+chartIndex" @mouseenter="caretShow=true" @mouseleave="caretShow=false">
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
                <div v-if="noData" class="chart-no-data">No Data</div>
                <div v-if="!noData" class="basic-container">
                  <div class="basic-title asset-info-content-title" @click.stop="hideElement('basic')">
                    <span><i :class="{'el-icon-caret-right': unfold.indexOf('basic') == -1,'el-icon-caret-bottom': unfold.indexOf('basic') > -1}"></i></span>
                    <span>&nbsp;{{$t('project.endpoint.endpoint')}}</span>
                  </div>
                  <div class="basic-content basic-content-asset unfold" ref="basic">
                    <div v-for="(item, index) in detail" class="content-item hover-bg">
                      <div class="content-item-key item-tip" :id="'basicKey' + index">
                        <span>{{item.label}}</span>
                        <div class="item-tip-hide item-tip-key el-popover" :class="itemTip('basicKey', item.label, index, ready)">{{item.label}}</div>
                      </div><div v-if="item.label != $t('alert.list.state')" class="content-item-value item-tip" :id="'basicValue' + index">
                        <span>{{item.value ? item.value : '&nbsp;'}}</span>
                        <div class="item-tip-hide item-tip-value el-popover" :class="itemTip('basicValue', item.value, index, ready)">{{item.value}}</div>
                      </div><div v-else class="content-item-value item-tip" :id="'basicValue' + index">
                        <span style="cursor: pointer;" @click="preview"><i class="nz-icon nz-icon-chart"></i></span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="!noData" class="feature-container">
                  <div class="feature-title asset-info-content-title" @click="hideElement('feature')" >
                    <span><i :class="{'el-icon-caret-right': unfold.indexOf('feature') == -1,'el-icon-caret-bottom': unfold.indexOf('feature') > -1}"></i></span>
                    <span>{{$t('alert.alert')}}</span>
                  </div>
                  <div class="feature-content feature-content-asset" ref="feature">
                    <div v-for="(item, index) in alerts" class="content-item hover-bg">
                      <div class="content-item-key item-tip" :id="'alert' + index">
                        <span>{{item.label}}</span>
                        <div class="item-tip-hide item-tip-key el-popover" :class="itemTip('alert', item.label, index, ready)">{{item.label}}</div>
                      </div><div class="content-item-value">
                      <span>{{item.value}}</span>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </div>
    <!--preview -->
    <chart-preview :panelId="panelId" ref="chartsPreview" ></chart-preview>
  </div>
</template>

<script>
  import bus from '../../libs/bus';
  import {Loading} from 'element-ui';
  import chartDataFormat from './chartDataFormat'
  import loading from "../common/loading";
  import timePicker from '../common/timePicker';
  import chartPreview from './chartPreview';


  export default {
    name: 'chartEndpointInfo',
    components: {
      'loading': loading,
      'time-picker': timePicker,
      'chart-preview': chartPreview,
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
        ready: false,
        data: {}, // 该图表信息,chartItem
        unit:{},
        detail: [],
        state: [],
        alerts: [],
        unfold: ["basic"],
        isError:false,
        errorContent:'',
        assetInfos:{},
        showState: false,

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
      noData() {
        return !this.detail || this.detail.length == 0;
      }
    },
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
        });

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
          this.$refs.scrollbar && this.$refs.scrollbar.update();
        },400);
      },
      preview() {
        this.$refs.chartsPreview.show(this.data);
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
        let container = document.querySelector('#chartEndpointInfoDiv' + this.chartIndex + " .chart-info-container");
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
      setData(chartItem, endpointDetail, alerts) {
        this.resize(chartItem);
        this.divFirstShow = true;

        this.firstShow = true; // 展示操作按键

        this.data = chartItem;
        this.detail = endpointDetail;
        this.alerts = alerts;
        this.detail.push({label: this.$t("alert.list.state"), value: ""});
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
