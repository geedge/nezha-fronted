<style lang="scss">
  @import './chart.scss';
</style>
<template>
  <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box resize-box-single" ref="resizeBox">
      <div class="chart-text"  :id="'chartSingleStatDiv'+chartIndex" @mouseenter="caretShow=true" @mouseleave="caretShow=false">
        <loading  :ref="'localLoading'+chartIndex"></loading>
        <div class="clearfix chartTitle" :class="{'dragTitle':dragTitleShow}" :id="'chartTitle'+chartIndex">
          <el-dropdown trigger="click" class="nz-chart-top" :key="'chartDropdown'+chartIndex"  v-clickoutside="clickos">
            <el-dropdown-menu style="display: none"></el-dropdown-menu>
            <span class="el-dropdown-link chart-title" @click.stop="dropdownMenuShow=!dropdownMenuShow">
              <span class="chart-title-text">{{chartData.title}}</span>
              <span class="chart-title-icon"><i class="nz-icon nz-icon-caret-bottom  "  :class="{'visible':caretShow,'hidden':!caretShow}"></i></span>
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
        <div class="mt-10 rich-text-container" v-cloak  v-show="firstShow" >
          <div :id="'chartContainer'+chartIndex"  ref="chartContainer" class="text-content"  >
            <el-scrollbar style="height: 100%;" class="el-scrollbar-normal">
              <div style="height: 100%;" v-html="text" ></div>
            </el-scrollbar>
          </div>
        </div>
        <!--全屏-->
        <el-dialog class="nz-dialog table-chart-dialog" :title="$t('dashboard.panel.view')"
                   :visible.sync="screenModal"
                   width="96%"  @close="screenModal = false" >
          <div slot="title">
            <span class="nz-dialog-title">{{data.title}}</span>
          </div>
          <div class="rich-text-screen-container"  >
            <div id="chartScreenContainer"  ref="chartScreenContainer" class="text-content" >
              <el-scrollbar style="height: 100%;" class="el-scrollbar-normal">
                <div style="height: 100%;" v-html="screenText" ></div>
              </el-scrollbar>
            </div>
          </div>
          <loading  :ref="'localLoadingScreen'+chartIndex"></loading>
        </el-dialog>
      </div>
      <span class="vue-resizable-handle" @mousedown="startResize"></span>
    </div>
  </div>
</template>

<script>
  import loading from "../common/loading";
  import timePicker from '../common/timePicker'
  import 'quill/dist/quill.snow.css'
  export default {
    name: 'chartSingleStat',
    components: {
      'loading': loading,
      'time-picker':timePicker
    },
    props: {
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
      }
    },
    data() {
      return {
        data: {}, // 该图表信息,chartItem
        noData:false,
        unit:{},
        text: '', // 保存信息
        screenText:'',//全屏数据
        loading:Object,
        panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
        firstLoad: false, // 是否第一次加载
        screenModal: false,
        firstShow: false, // 默认不显示操作按钮,
        caretShow:false,
        dragTitleShow:false,
        dropdownMenuShow:false,
        divFirstShow:false,
      };
    },
    created() {
    },
    computed: {},
    watch: {},
    methods: {
      startResize(e) {
        let vm = this;
        this.$chartResizeTool.start(vm, this.data, e);
      },
      startLoading(area){
        if(area==='screen'){
          this.$refs['localLoadingScreen'+this.chartIndex].startLoading();
        }else {
          //this.showLoading = true;
          this.$refs['localLoading'+this.chartIndex].startLoading();
        }
      },
      endLoading(area){
        if(area==='screen'){
          //this.showLoadingScreen = false;
          this.$refs['localLoadingScreen'+this.chartIndex].endLoading();
        }else {
          //this.showLoading = false;
          this.$refs['localLoading'+this.chartIndex].endLoading();
        }
      },
      showLoad(chartItem) {
        this.$nextTick(() => {
          const chartBox = document.getElementById('chartSingleStatDiv'+this.chartIndex);
          let height = Math.floor(chartItem.height/10)*10;//图表高度四舍五入
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
      // 全屏查看
      showAllScreen() {
        this.dropdownMenuShow=false;
        this.screenModal = true;
      },
      resize(chartItem) {
        document.querySelector('#chartSingleStatDiv' + this.chartIndex + " .rich-text-container").style.height = `calc(100% - ${this.$chartResizeTool.titleHeight}px)`;
      },
      // 设置数据, filter区分
      setData(chartItem, seriesItem, panelId, filter,area) {
        this.$nextTick(() => {
          this.resize(chartItem);
        });
        this.divFirstShow = true;

        this.firstShow = true; // 展示操作按键

        this.panelIdInner = panelId;
        this.data = chartItem;
        this.text=chartItem.param.text;
        this.screenText=chartItem.param.text;
        this.endLoading();

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
