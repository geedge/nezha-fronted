<style lang="scss">
  @import './chart.scss';
</style>
<template>
  <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box resize-box-asset" ref="resizeBox">
      <div class="chart-asset-info" :id="'chartAssetInfoDiv'+chartIndex" v-show="divFirstShow" @mouseenter="caretShow=true" @mouseleave="caretShow=false">
        <loading  :ref="'localLoading'+chartIndex"></loading>
        <div class="clearfix chartTitle" :class="{'dragTitle':dragTitleShow}" :id="'chartTitle'+chartIndex">
          <el-popover
            v-if="isError"
            :close-delay=10
            placement="top-start"
            trigger="hover"
            popper-class="chart-error-popper">
            <div >{{errorContent}}</div>
            <span slot="reference" class="panel-info-corner panel-info-corner--error">
                <i class="nz-icon nz-icon-warning fa"></i>
                <span class="panel-info-corner-inner"></span>
            </span>
          </el-popover>
          <span class="el-dropdown-link chart-title" @click="dropdownMenuShow=!dropdownMenuShow">
            <span class="chart-title-text">{{$t('asset.createAssetTab.assetInfo')}}</span>
          </span>
        </div>
        <div class="mt-10 chart-info-container" v-cloak  v-show="firstShow" >
          <div :id="'chartContainer'+chartIndex"  ref="chartContainer" class="asset-info-content" >
            <el-scrollbar style="height: 100%;width:100%;" ref="scrollbar" class="el-scrollbar-normal">
              <div style="padding: 0 15px">
                <div class="basic-container">
                  <div class="basic-title asset-info-content-title" @click="hideElement('basic')">
                    <span><i :class="{'el-icon-caret-right':hideBasic,'el-icon-caret-bottom':!hideBasic}"></i></span>
                    <span>{{$t('asset.createAssetTab.basicTitle')}}</span>
                  </div>
                  <div class="basic-content" :class="{'shrink':hideBasic}">
                    <template v-if="assetInfos.Basic && Object.keys(assetInfos.Basic).length>0">
                      <div v-for="(item,index) in basicKey" :key="index" class="content-item hover-bg" :class="{'bg-grey':index % 2 == 1}">
                        <div class="content-item-key">{{item.label}}</div><div
                        class="content-item-value" v-if="item.prop == 'pingStatus'">
                          <div class="active-icon" :class="{'green':assetInfos.Basic[item.prop] == 1,'red':assetInfos.Basic[item.prop] != 1}"></div>
                          <span>{{assetInfos.Basic.pingRtt ? assetInfos.Basic.pingRtt + 'ms' : '&nbsp;'}}</span>
                        </div>
                        <div class="content-item-value" v-else-if="item.prop == 'alert'">
                          <span class="as-button" :class="{'success': assetInfos.Basic[item.prop] <= 0, 'danger': assetInfos.Basic[item.prop] > 0}">{{assetInfos.Basic[item.prop] + ' ' + $t('overall.active')}}</span>
                        </div>
                        <div class="content-item-value" v-else-if="item.prop == 'state'">
                          {{assetInfos.Basic[item.prop] == 1?$t('asset.createAssetTab.inStock'):$t('asset.createAssetTab.outStock')}}
                        </div>
                        <div class="content-item-value" v-else>
                          {{assetInfos.Basic[item.prop] ? assetInfos.Basic[item.prop] : "&nbsp;"}}
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
                <div class="feature-container">
                  <div class="feature-title asset-info-content-title" @click="hideElement('feature')" >
                    <span><i :class="{'el-icon-caret-right':hideFeature,'el-icon-caret-bottom':!hideFeature}"></i></span>
                    <span>{{$t('asset.createAssetTab.featureTitle')}}</span>
                  </div>
                  <div class="feature-content" :class="{'shrink':hideFeature}">
                    <div v-for="(value,key,index) in assetInfos.Feature" class="content-item" :class="{'bg-grey':index % 2 == 1,'hover-bg':Array.isArray(value) && value.length>0 &&typeof value[0] == 'string'}">
                      <div class="content-item-key" >{{key}}</div><div
                      class="content-item-value" v-if="typeof value == 'string'">{{value}}</div><div v-if="Array.isArray(value) && value.length>0" class="content-item-value content-item-value-muti">
                        <div v-if="typeof value[0] == 'string'" class="item-value-sub" v-for="(item,index) in value" :key="index">{{item}}</div>
                        <el-table
                          v-else
                          class="nz-table asset-info-table"
                          :data="value"
                          tooltip-effect="light"
                          height="100%"
                          ref="dataTable"
                          v-scrollBar:el-table="'small'"
                        >
                          <el-table-column
                            :resizable="false"
                            v-for="(item, index) in setLabels(value)"
                            v-if="item.show"
                            :key="`col-${index}`"
                            :label="item.label"
                          >
                            <template slot-scope="scope" :column="item">
                              <template >
                                <span v-html="scope.row[item.prop]"></span>
                              </template>
                            </template>
                          </el-table-column>
                        </el-table>
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
        divFirstShow:false,
        searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()],//全屏显示的时间
        oldSearchTime: [],
        basicKey:[
          {
            label: this.$t("asset.tableTitle.host"),
            prop: 'host',
          },
          {
            label: this.$t("asset.tableTitle.id"),
            prop: 'id',
          },
          {
            label: this.$t("asset.tableTitle.assetType"),
            prop: 'assetType',
          },
          {
            label: this.$t("asset.tableTitle.device"),
            prop: 'sn',
          },
          {
            label: this.$t("asset.tableTitle.assetState"),
            prop: 'state',
          },
          {
            label: this.$t("asset.tableTitle.dataCenter"),
            prop: 'dataCenter',
          },
          {
            label: this.$t("asset.tableTitle.cabinet"),
            prop: 'cabinet',
          },
          {
            label: this.$t("asset.tableTitle.model"),
            prop: 'model',
          },
          {
            label: this.$t("asset.tableTitle.vendor"),
            prop: 'vendor',
          },
          {
            label: this.$t("asset.tableTitle.procurementDate"),
            prop: 'purchaseDate',
          },
          {
            label: this.$t("asset.tableTitle.principal"),
            prop: 'principal',
          },
          {
            label: this.$t("asset.tableTitle.principalTel"),
            prop: 'tel',
          },
          {
            label:this.$t('asset.tableTitle.assetPing'),
            prop:'pingStatus',
          },
          {
            label:this.$t('asset.tableTitle.lastReply'),
            prop:'pingLastReply',
          },
          {
            label: this.$t("asset.tableTitle.modules"),
            prop: 'endpoint',
          },
          {
            label: this.$t("asset.tableTitle.alerts"),
            prop: 'alert',
          },
        ]
      };
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
        let container = document.querySelector('#chartAssetInfoDiv' + this.chartIndex + " .chart-info-container");
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
      setData(chartItem, assetInfos, panelId, filter,area,errorMsg) {
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
