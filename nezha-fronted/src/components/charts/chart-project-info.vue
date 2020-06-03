<style lang="scss">
  @import './chart.scss';
</style>
<template>
  <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box resize-box-project" ref="resizeBox">
      <div class="chart-project-info" :id="'chartProjectInfoDiv'+chartIndex" v-show="divFirstShow" @mouseenter="caretShow=true" @mouseleave="caretShow=false">
        <loading :ref="'localLoading'+chartIndex"></loading>
        <div class="clearfix chartTitle" :class="{'dragTitle':dragTitleShow}" :id="'chartTitle'+chartIndex">
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
            <span class="chart-title-text">{{$t('project.chart.projectInfo')}}</span>
          </span>
        </div>
        <div class="mt-10 chart-info-container" v-cloak  v-show="firstShow" >
          <div :id="'chartContainer'+chartIndex"  ref="chartContainer" class="asset-info-content" >
            <el-scrollbar style="height: 100%;width:100%;" ref="scrollbar" class="el-scrollbar-normal">
              <div style="padding: 0 15px">
                <div class="basic-container">
                  <div class="basic-title asset-info-content-title" @click="hideElement('basic')">
                    <span><i :class="{'el-icon-caret-right':hideBasic,'el-icon-caret-bottom':!hideBasic}"></i></span>
                    <span>{{$t('project.chart.basicTitle')}}</span>
                  </div>
                  <div class="basic-content basic-content-project init-no-animation" ref="basic">
                    <template v-if="projectInfos.basic && Object.keys(projectInfos.basic).length>0">
                      <div v-for="(item,index) in basicKey" :key="index" class="content-item">
                        <div class="content-item-key item-tip" :id="'basicKey' + index">
                          <span>{{item.label}}</span>
                          <div class="item-tip-hide item-tip-key el-popover" :class="itemTip('basicKey', item.label, index, ready)">{{item.label}}</div>
                        </div>
                        <div class="content-item-value" v-if="item.prop == 'alertStat'">
                          <div class="active-icon dark-red"></div>
                          <span>{{projectInfos.basic.alertStat[0]}}</span>&nbsp;&nbsp;
                          <div class="active-icon red"></div>
                          <span>{{projectInfos.basic.alertStat[1]}}</span>&nbsp;&nbsp;
                          <div class="active-icon orange"></div>
                          <span>{{projectInfos.basic.alertStat[2]}}</span>
                        </div>
                        <div class="content-item-value item-tip" v-else :id="'basicValue' + index">
                          <span>{{projectInfos.basic[item.prop] ? projectInfos.basic[item.prop] : "&nbsp;"}}</span>
                          <div class="item-tip-hide item-tip-value el-popover" :class="itemTip('basicValue', projectInfos.basic[item.prop], index, ready)">{{projectInfos.basic[item.prop]}}</div>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
                <div class="feature-container" v-for="(module, mi) in projectInfos.module" :key="mi">
                  <div class="feature-title asset-info-content-title" @click.stop="hideElement(module.id)" >
                    <span><i :class="{'el-icon-caret-right': showModuleIds.indexOf(module.id) == -1,'el-icon-caret-bottom': showModuleIds.indexOf(module.id) > -1}"></i></span>
                    <span>{{$t('project.module.module')}}：{{module.name}}</span>
                  </div>
                  <div class="feature-content feature-content-project" :ref="'module' + module.id">
                    <div v-for="(item,index) in moduleKey" :key="index" class="content-item">
                      <div class="content-item-key item-tip" :id="'featureKey' + module.id + '-' + index">
                        <span>{{item.label}}</span>
                        <div class="item-tip-hide item-tip-key el-popover" :class="itemTip('featureKey' + module.id + '-', item.label, index, ready)">{{item.label}}</div>
                      </div>
                      <div class="content-item-value" v-if="item.prop == 'endpointStat'">
                        <img src='../../assets/img/up.png' width="16" style="vertical-align: middle">
                        <span>{{module.endpointStat[0]}}</span>&nbsp;&nbsp;
                        <img src='../../assets/img/down.png' width="16" style="vertical-align: middle">
                        <span>{{module.endpointStat[1]}}</span>&nbsp;&nbsp;
                      </div>
                      <div class="content-item-value" v-else-if="item.prop == 'alertStat'">
                        <div class="active-icon dark-red"></div>
                        <span>{{module.alertStat[0]}}</span>&nbsp;&nbsp;
                        <div class="active-icon red"></div>
                        <span>{{module.alertStat[1]}}</span>&nbsp;&nbsp;
                        <div class="active-icon orange"></div>
                        <span>{{module.alertStat[2]}}</span>
                      </div>
                      <div v-else class="content-item-value item-tip" :id="'featureValue' + module.id + '-' + index">
                        <span>{{module[item.prop] ? module[item.prop] : "&nbsp;"}}</span>
                        <div class="item-tip-hide item-tip-value el-popover" :class="itemTip('featureValue' + module.id + '-', module[item.prop], index, ready)">{{module[item.prop]}}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>
      <span class="vue-resizable-handle" @mousedown="startResize"></span>
    </div>
  </div>
</template>

<script>
  import loading from "../common/loading";
  import timePicker from '../common/timePicker'

  export default {
    name: 'chartProjectInfo',
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
        ready: false,
        data: {}, // 该图表信息,chartItem
        unit:{},
        isError:false,
        errorContent:'',
        projectInfos:{},
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
        showModuleIds: [],
        firstShow: false, // 默认不显示操作按钮,
        caretShow:false,
        dragTitleShow:false,
        dropdownMenuShow:false,
        divFirstShow:false,
        searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()],//全屏显示的时间
        oldSearchTime: [],
        basicKey:[
          {
            label: "ID",
            prop: 'id',
          },
          {
            label: this.$t("overall.name"),
            prop: 'name',
          },
          {
            label: this.$t("overall.remark"),
            prop: 'remark',
          },
          {
            label: this.$t("project.chart.alertStat"),
            prop: 'alertStat',
          },
        ],
        moduleKey: [
          {
            label: "ID",
            prop: 'id',
          },
          {
            label: this.$t("overall.name"),
            prop: 'name',
          },
          {
            label: this.$t("overall.type"),
            prop: 'type',
          },
          {
            label: this.$t("overall.remark"),
            prop: 'remark',
          },
          {
            label: this.$t("project.chart.endpointStat"),
            prop: 'endpointStat',
          },
          {
            label: this.$t("project.chart.alertStat"),
            prop: 'alertStat',
          },
        ]
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
        if(type ==  'basic'){
          if (this.hideBasic) {
            this.$refs.basic.classList.add("unfold");
            this.$refs.basic.classList.remove("fold");
          } else {
            this.$refs.basic.classList.add("fold");
            this.$refs.basic.classList.remove("unfold");
          }
          this.hideBasic = !this.hideBasic;
        }else{
          let dom = this.$refs['module' + type][0];
          if (dom.classList.contains("unfold")) {
            dom.classList.remove("unfold");
            dom.classList.add("fold");
          } else if (dom.classList.contains("fold")) {
            dom.classList.remove("fold");
            dom.classList.add("unfold");
          } else if (!dom.classList.contains("unfold") && !dom.classList.contains("fold")) {
            dom.classList.add("unfold");
          }
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
        let container = document.querySelector('#chartProjectInfoDiv' + this.chartIndex + " .chart-info-container");
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
      setData(chartItem, projectInfos, panelId, filter,area,errorMsg) {
        this.resize(chartItem);
        if(errorMsg && errorMsg!==''){
          this.isError = true;
          this.errorContent = errorMsg;
        }else {
          this.isError = false;
          this.errorContent = '';
        }
        this.divFirstShow = true;

        this.firstShow = true; // 展示操作按键

        this.panelIdInner = panelId;
        this.data = chartItem;

        this.projectInfos=projectInfos;
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
      setTimeout(() => {
        this.ready = true;
      }, 300);
    },
    beforeDestroy() {
      this.clearChart();
    },
  };
</script>
