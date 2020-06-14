<style lang="scss">
  @import './chart.scss';
</style>
<template>
  <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box" ref="resizeBox">
      <div class="chart-container" :id="'chartContainerDiv' + chartIndex" @mouseenter="caretShow = true" @mouseleave="caretShow = false">
        <loading :ref="'localLoading' + chartIndex"></loading>
        <div class="clearfix chart-title" :class="{'drag-disabled': !data.draggable}" :id="'chartTitle' + chartIndex">
          <el-popover
            v-if="isError"
            :close-delay="10"
            placement="top-start"
            trigger="hover"
            popper-class="chart-error-popper">
            <div>{{errorContent}}</div>
            <span slot="reference" class="panel-info-corner panel-info-corner--error">
              <i class="nz-icon nz-icon-warning fa"></i>
              <span class="panel-info-corner-inner"></span>
            </span>
          </el-popover>
          <span class="el-dropdown-link chart-title-text" @click="dropdownMenuShow = !dropdownMenuShow">{{data.title}}</span>
        </div>
        <div ref="chartInfo" class="mt-10 chart-info" :id="'chartInfoDiv' + chartIndex" v-cloak>
          <el-scrollbar style="height: 100%;width:100%;" ref="scrollbar" class="el-scrollbar-normal">
            <div v-for="(item, index) in detail" :key="index" style="padding: 0 15px;">
              <div class="chart-sub-title" @click="hideElement(index)">
                <span><i :class="{'el-icon-caret-right': show.indexOf(index) == -1,'el-icon-caret-bottom': show.indexOf(index) > -1}"></i></span>
                <span>{{item.title}}</span>
              </div>
              <div class="chart-sub-content" :class="{'init-no-animation': index == 0, 'fold-500': show.indexOf(index) == -1, 'unfold-500': show.indexOf(index) > -1}">
                <div class="content-item" v-for="(value, key, i) in item.data">
                  <div class="content-item-key item-tip" :id="`key-${index}-${i}`">
                    <span>{{key}}</span>
                    <div class="item-tip-hide item-tip-key el-popover" :class="itemTip(`key-${index}`, key, i, ready)">{{key}}</div>
                  </div>
                  <div class="content-item-value item-tip" :id="`value-${index}-${i}`">
                    <template v-if="data.type == 'endpointInfo' && key == $t('alert.list.state')">
                      <span style="cursor: pointer;" @click="preview"><i class="nz-icon nz-icon-chart"></i></span>
                    </template>
                    <template v-else>
                      <span>{{value}}</span>
                      <div class="item-tip-hide item-tip-value el-popover" :class="itemTip(`value-${index}`, value, i, ready)">{{value}}</div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
      <span v-if="data.resizable" class="vue-resizable-handle" @mousedown="startResize"></span>
    </div>
    <!--preview -->
    <chart-preview :panelId="panelId" ref="chartsPreview" ></chart-preview>
  </div>
</template>

<script>
  import loading from "../common/loading";
  import timePicker from '../common/timePicker';
  import chartPreview from './chartPreview';

  export default {
    name: 'chartDetail',
    components: {
      'loading': loading,
      'time-picker': timePicker,
      'chart-preview': chartPreview
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
        detail: [], //展示的详情
        unit: {},
        show: [0], //控制展开/隐藏
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
        },
        firstShow: false, // 默认不显示操作按钮,
        caretShow:false,
        dropdownMenuShow:false,
        divFirstShow:false,
        searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()],//全屏显示的时间
        oldSearchTime: [],
      };
    },
    methods: {
      itemTip(type, content, index, ready) {
        let className = "";
        this.$nextTick(() => {
          if (ready) {
            let cellDom = document.querySelector(`#${type}-${index}`);
            let spanDom = document.createElement("span");
            spanDom.style.display = "inline-block";
            spanDom.innerText = content;
            cellDom.appendChild(spanDom);
            if (cellDom.offsetWidth-16 < spanDom.offsetWidth) {
              className = "item-tip-show";
            }
            cellDom.removeChild(spanDom);
            return className;
          }
        });
        return className;
      },
      startResize(e) {
        let vm = this;
        this.$chartResizeTool.start(vm, this.data, e);
      },
      hideElement(index) {
        if (this.show.indexOf(index) > -1) {
          this.show.splice(this.show.indexOf(index), 1);
        } else {
          this.show.push(index);
        }
      },
      startLoading(area){
        this.$refs['localLoading'+this.chartIndex].startLoading();
      },
      endLoading(area){
        this.$refs['localLoading'+this.chartIndex].endLoading();
      },
      preview() {
        this.$refs.chartsPreview.show(this.data);
      },
      resize() {
        let container = document.querySelector('#chartInfoDiv' + this.chartIndex);
        container.style.height = `calc(100% - ${this.$chartResizeTool.titleHeight + this.$chartResizeTool.chartTableBlankHeight}px)`;
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
        this.dropdownMenuShow = false;
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
        this.dropdownMenuShow = false;
        this.$emit('on-remove-chart-block', this.data.id);
      },
      clearChart(){
        this.data = {};
      },

      // 设置数据, filter区分
      setData(chartItem, detail, panelId, filter, area, errorMsg) {
        //this.resize(chartItem);
        if(errorMsg && errorMsg !== ''){
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
        this.detail = detail;

        this.$nextTick(() => {
          this.$refs.scrollbar.update();
        });
        this.endLoading();
      },
    },
    mounted() {
      this.firstLoad = false;
      this.$nextTick(() => {
        this.$refs.scrollbar.update();
      });
      setTimeout(() => {
        this.ready = true;
      }, 300);
    },
    beforeDestroy() {
      this.clearChart();
    },
  };
</script>
