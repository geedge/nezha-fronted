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
          <el-dropdown trigger="click" class="nz-chart-top" :key="'chartDropdown'+chartIndex"  v-clickoutside="clickos" :class="{'move-able':!isLock}">
            <el-dropdown-menu style="display: none"></el-dropdown-menu>
            <span class="el-dropdown-link chart-title">
<!--              <span class="chart-title-text">{{chartData.name}}</span>-->
              <span class="chart-title-text" v-on:mouseover="changeActive()" v-on:mouseout="removeActive()">{{chartData.name}}</span>
              <transition  name="el-fade-in-linear">
                <span v-show="chartDataList" class="chart-title-pit" >{{chartData.name}}</span>
              </transition>
              <span class="chart-title-icon"  :class="{'visible':caretShow,'hidden':!caretShow}">
                <span v-if="chartData.remark">
                  <el-tooltip :content="chartData.remark" placement="top" effect="light">
                     <i class="nz-icon nz-icon-info-normal"></i>
                  </el-tooltip>
                </span>
                <span  v-has="'panel_chart_edit'" :title="$t('dashboard.refresh')" class="" @click="refreshChart">
                  <i class="nz-icon nz-icon-replay"></i>
                </span>
                 <span  @click="showAllScreen"  v-if="from !== 'chartTemp'" class="" :title="$t('dashboard.screen')">
                  <i class="nz-icon nz-icon-maxview"></i>
                 </span>
                <span><i class="el-icon-more" @click.stop="dropdownMenuShow=!dropdownMenuShow"></i></span>
              </span>
            </span>
            <ul slot="dropdown" v-show="dropdownMenuShow"  :id="'dropdownUl'+chartIndex"  class="el-dropdown-menu nz-chart-dropdown"  style="" >
              <li  @click="editChart" class="el-dropdown-menu__item">
                <i class="nz-icon nz-icon-edit" style="font-size: 16px;"></i><span>{{$t('dashboard.edit')}}</span></li>
              <li  v-has="'panel_chart_delete'" class="el-dropdown-menu__item" @click="removeChart">
                <i class="nz-icon nz-icon-delete" style="font-size: 16px;"></i>{{$t('dashboard.delete')}}</li>
              <li  v-has="'panel_chart_add'" class="el-dropdown-menu__item" @click="duplicate">
                <i class="el-icon-copy-document" style="font-size: 16px;"></i>{{$t('dashboard.duplicate')}}</li>
              <li  v-has="'panel_chart_edit'"  v-if="from !== 'chartTemp'&&chartData.pid" class="el-dropdown-menu__item" @click="$emit('sync')">
                <i class="nz-icon nz-icon-sync" style="font-size: 16px;"></i>{{$t('overall.syncChart')}}</li>
            </ul>
          </el-dropdown>
        </div>
        <div class="mt-10 rich-text-container" v-cloak  v-show="firstShow" >
          <div :id="'chartContainer'+chartIndex"  ref="chartContainer" class="text-content"  >
            <diagram style="height: 100%;width: 100%" :topoData="data.param.topo" :fromChart="true" :topologyIndexF="chartData.id" :isPanel="true" ref="diagram" :chartInfo="chartData"/>
          </div>
        </div>
        <!--全屏-->
        <el-dialog class="nz-dialog table-chart-dialog" :title="$t('dashboard.panel.view')"
                   :visible.sync="screenModal"
                   width="96%"  @close="screenModal = false" :modal-append-to-body="false">
          <div slot="title">
            <span class="nz-dialog-title">{{data.name}}</span>
          </div>
          <div class="rich-text-screen-container"  >
            <div id="chartScreenContainer"  ref="chartScreenContainer" class="text-content" >
              <diagram :topoData="data.param.topo" :fromChart="true" :isScreen="true" :topologyIndexF="chartData.id + '-' + 'chartIndex'"/>
            </div>
          </div>
          <loading  :ref="'localLoadingScreen'+chartIndex"></loading>
        </el-dialog>
      </div>
      <span class="vue-resizable-handle" @mousedown="startResize" v-if="!isLock" :fromChart="true" :chartInfo="chartData"></span>
    </div>
  </div>
</template>

<script>
import loading from '../common/loading'
import 'quill/dist/quill.snow.css'
import diagram from '@/components/common/ChartDiagram/diagram'
import chartDataList from '@/components/common/mixin/chartDataList'
export default {
  name: 'diagram-chart',
  components: {
    loading: loading,
    diagram
  },
  props: {
    chartData: {
      type: Object
    },
    // 看板id
    panelId: {
      type: Number,
      default: 0
    },
    editChartId: {
      type: String,
      default: 'editChartId'
    },
    chartIndex: {
      type: Number,
      default: 0
    },
    from: { type: String },
    isLock: { type: Boolean, default: false }
  },
  mixins: [chartDataList],
  data () {
    return {
      data: {
        param: {
          topo: {}
        }
      }, // 该图表信息,chartItem
      noData: false,
      unit: {},
      text: '', // 保存信息
      screenText: '', // 全屏数据
      loading: Object,
      panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
      firstLoad: false, // 是否第一次加载
      screenModal: false,
      firstShow: false, // 默认不显示操作按钮,
      caretShow: false,
      dragTitleShow: false,
      dropdownMenuShow: false,
      divFirstShow: false
    }
  },
  created () {
  },
  computed: {},
  watch: {
    dropdownMenuShow (n) {
      this.$emit('dropmenu-change', n)
    }
  },
  methods: {
    startResize (e) {
      const vm = this
      this.$chartResizeTool.start(vm, this.data, e)
    },
    startLoading (area) {
      if (area === 'screen') {
        this.$refs['localLoadingScreen' + this.chartIndex].startLoading()
      } else {
        // this.showLoading = true;
        this.$refs['localLoading' + this.chartIndex].startLoading()
      }
    },
    endLoading (area) {
      if (area === 'screen') {
        // this.showLoadingScreen = false;
        this.$refs['localLoadingScreen' + this.chartIndex].endLoading()
      } else {
        // this.showLoading = false;
        this.$refs['localLoading' + this.chartIndex] && this.$refs['localLoading' + this.chartIndex].endLoading()
      }
    },
    showLoad (chartItem) {
      this.$nextTick(() => {
        const chartBox = document.getElementById('chartSingleStatDiv' + this.chartIndex)
        let height = Math.floor(chartItem.height / 10) * 10// 图表高度四舍五入
        if (height < this.minHeight) {
          height = this.minHeight
        }
        chartBox.style.height = `${height - this.chartSpaceHeight}px`
        const singleStatBox = document.getElementById('chartContainer' + this.chartIndex)
        singleStatBox.style.height = `${height - this.chartSpaceHeight - this.titleHeight}px`// -75-32
      })
      this.startLoading()
      this.divFirstShow = true
    },
    // 重新请求数据 刷新操作-local
    refreshChart () {
      this.dropdownMenuShow = false
      this.startLoading()
      this.firstShow = false
      this.$emit('on-refresh-data', this.data.id)
    },
    // 编辑图表
    editChart () {
      this.dropdownMenuShow = false
      this.$emit('on-edit-chart-block', this.data.id)
    },
    // 删除该图表
    removeChart () {
      this.dropdownMenuShow = false
      this.$emit('on-remove-chart-block', this.data.id)
    },
    clickos () {
      this.dropdownMenuShow = false
    },
    clearChart () {
      this.data = {}
    },
    duplicate () {
      this.dropdownMenuShow = false
      this.$emit('on-duplicate-chart-block', this.data.id)
    },
    // 全屏查看
    showAllScreen () {
      this.dropdownMenuShow = false
      this.screenModal = true
    },
    resize (chartItem) {
      document.querySelector('#chartSingleStatDiv' + this.chartIndex + ' .rich-text-container').style.height = `calc(100% - ${this.$chartResizeTool.titleHeight}px)`
      this.$refs.diagram.winResize()
    },
    // 设置数据, filter区分
    setData (chartItem, seriesItem, panelId, filter, area) {
      this.$nextTick(() => {
        this.resize(chartItem)
      })
      this.divFirstShow = true

      this.firstShow = true // 展示操作按键

      this.panelIdInner = panelId
      this.data = chartItem
      this.text = chartItem.param.text
      this.screenText = chartItem.param.text
      this.endLoading()
    }
  },
  mounted () {
    this.firstLoad = false
  },
  beforeDestroy () {
    this.clearChart()
  }
}
</script>
