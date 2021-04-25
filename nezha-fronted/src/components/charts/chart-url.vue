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
          <el-dropdown trigger="click" class="nz-chart-top" :key="'chartDropdown'+chartIndex"  v-clickoutside="clickos" :class="{'move-able':!isLock}">
            <el-dropdown-menu style="display: none"></el-dropdown-menu>
            <span class="el-dropdown-link chart-title">
              <span class="chart-title-text">{{chartData.name}}</span>
              <span class="chart-title-icon"  v-if="from !== 'chartTemp'"  :class="{'visible':caretShow,'hidden':!caretShow}">
                <span v-if="chartData.remark">
                  <el-tooltip :content="chartData.remark" placement="top" effect="light">
                     <i class="nz-icon nz-icon-info-normal"></i>
                  </el-tooltip>
                </span>
                <span  v-has="'panel_chart_edit'" :title="$t('dashboard.refresh')" class="" @click="refreshChart">
                  <i class="nz-icon nz-icon-replay"></i>
                </span>
                 <span  @click="showAllScreen" class="" :title="$t('dashboard.screen')">
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
            </ul>
          </el-dropdown>

        </div>
        <div :id="'chartUrl'+chartIndex" class="mt-10 url-container"  v-show="firstShow" >
          <iframe :id="'urlContainer'+chartIndex" frameborder="0" width="100%" height="100%" name="showHere" scrolling=auto v-if="!showStatic"
                  style="z-index:5000;padding-bottom:6px;"
          ></iframe>
        </div>
        <div style="position: absolute;width: 100%; top:calc(50% - 50px);text-align: center;" v-if="showStatic">
          <div  :id="'staticContainer'+chartIndex" class="center-content"></div>
        </div>
        <!--全屏-->
        <el-dialog class="nz-dialog table-chart-dialog" :title="$t('dashboard.panel.view')"  :visible.sync="screenModal" width="96%" @opened="initDialog"  @close="screenModal = false" >
          <div slot="title">
            <span class="nz-dialog-title">{{chartData.name}}</span>
          </div>
          <iframe :id="'urlContainerFull'+chartIndex"  frameborder="0" width="100%" height="100%" name="showHereFull" scrolling=auto v-if="!showStatic"
                  style="z-index:5000;padding-bottom:6px;"
          ></iframe>
          <div style="position: absolute;width: 100%; top:calc(50% - 100px);text-align: center;" v-if="showStatic">
            <div  :id="'staticContainerFull'+chartIndex" class="center-content"></div>
          </div>
          <loading  :ref="'localLoadingScreen'+chartIndex"></loading>
        </el-dialog>
      </div>
      <span class="vue-resizable-handle" @mousedown="startResize" v-if="!isLock"></span>
    </div>
  </div>
</template>

<script>
import loading from '../common/loading'

export default {
  name: 'chartUrl',
  components: {
    loading: loading
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
  data () {
    return {
      data: {}, // 该图表信息,chartItem
      unit: {},

      images: '',
      loading: Object,
      panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
      firstLoad: false, // 是否第一次加载
      screenModal: false,
      firstShow: false, // 默认不显示操作按钮,
      caretShow: false,
      dragTitleShow: false,
      dropdownMenuShow: false,
      minHeight: 200,
      chartSpaceHeight: 5, // top-border: 1,bottom-border: 1,padding-bottome:3
      titleHeight: 38, // title-height:28,magrin-bottom:10
      paddingBottom: 6,
      divFirstShow: false,
      showStatic: false
    }
  },
  methods: {
    startResize (e) {
      const vm = this
      this.$chartResizeTool.start(vm, this.chartData, e)
    },
    resize (chartItem) {
      const chartBox = document.getElementById('chartUrlDiv' + this.chartIndex)
      chartBox.querySelector('.url-container').style.height = `calc(100% - ${this.$chartResizeTool.titleHeight}px)`
    },
    showLoad (chartItem) {
      this.data = chartItem
      this.panelIdInner = this.panelId
      // 设置高度
      this.$nextTick(() => {
        this.resize(chartItem)
      })
      this.startLoading()

      if (/\{\{.*?\}\}/g.test(this.data.param.url)) {
        this.showStatic = true
        this.setStaticContent()
      } else {
        this.showStatic = false
        this.setLoadFrame()
      }
      this.divFirstShow = true
    },
    setStaticContent: function () {
      const that = this
      this.$nextTick(() => {
        const staticDiv = document.querySelector('#staticContainer' + this.chartIndex)
        staticDiv.innerHTML = `<div class="content-static-url">${that.data.param.url}</div><div class="content-static-tip">${that.$t('dashboard.panel.chartForm.typeVal.url.staticTip')}</div>`
        that.firstShow = true
        that.endLoading()
      })
    },
    setLoadFrame () {
      const that = this
      this.$nextTick(() => {
        const iframe = document.querySelector('#urlContainer' + this.chartIndex)
        // 处理兼容行问题
        if (iframe.attachEvent) {
          iframe.attachEvent('onload', function () {
            // iframe加载完毕以后执行操作
            that.firstShow = true
            // console.log('iframe已加载完毕');
            that.endLoading()
          })
        } else {
          iframe.onload = function () {
            // iframe加载完毕以后执行操作
            that.firstShow = true
            // console.log('iframe已加载完毕');
            that.endLoading()
          }
        }
        iframe.src = that.data.param.url
      })
    },
    initDialog () {
      this.startLoading('screen')
      if (/\{\{.*?\}\}/g.test(this.data.param.url)) {
        this.showStatic = true
        this.setStaticContentFull()
      } else {
        this.showStatic = false
        this.setLoadFrameFull()
      }
    },
    startLoading (area) {
      if (area === 'screen') {
        this.$refs['localLoadingScreen' + this.chartIndex].startLoading()
      } else {
        this.$refs['localLoading' + this.chartIndex].startLoading()
      }
    },
    endLoading (area) {
      if (area === 'screen') {
        this.$refs['localLoadingScreen' + this.chartIndex].endLoading()
      } else {
        this.$refs['localLoading' + this.chartIndex].endLoading()
      }
    },
    clearChart () {
      this.data = {}
    },
    screenRefreshChart () {
      ('urlContainerFull' + this.chartIndex).window.location.reload()
    },
    // 重新请求数据 刷新操作-local
    refreshChart () {
      this.dropdownMenuShow = false
      this.startLoading()
      this.firstShow = false
      const iframe = document.querySelector('#urlContainer' + this.chartIndex)
      iframe.src = ''
      iframe.src = this.data.param.url
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
    // 全屏查看
    showAllScreen () {
      this.dropdownMenuShow = false
      this.screenModal = true
    },
    duplicate () {
      this.dropdownMenuShow = false
      this.$emit('on-duplicate-chart-block', this.data.id)
    },
    setLoadFrameFull () {
      const that = this
      this.$nextTick(() => {
        const iframe = document.querySelector('#urlContainerFull' + this.chartIndex)

        // 处理兼容行问题
        if (iframe.attachEvent) {
          iframe.attachEvent('onload', function () {
            // iframe加载完毕以后执行操作
            that.firstShow = true
            // console.log('iframe已加载完毕');
            that.endLoading('screen')
          })
        } else {
          iframe.onload = function () {
            // iframe加载完毕以后执行操作
            that.firstShow = true
            // console.log('iframe已加载完毕');
            that.endLoading('screen')
          }
        }

        iframe.src = this.data.param.url
      })
    },
    setStaticContentFull: function () {
      const that = this
      this.$nextTick(() => {
        const staticDiv = document.querySelector('#staticContainerFull' + this.chartIndex)
        staticDiv.innerHTML = `<div class="content-static-url">${that.data.param.url}</div><div class="content-static-tip">${that.$t('dashboard.panel.chartForm.typeVal.url.staticTip')}</div>`
        that.firstShow = true
        that.endLoading('screen')
      })
    }
  },
  watch: {
    dropdownMenuShow (n) {
      this.$emit('dropmenu-change', n)
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
