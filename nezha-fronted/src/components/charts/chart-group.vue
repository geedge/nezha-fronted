<style lang="scss">
  @import './chart.scss';
</style>
<template>
  <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box resize-box-group" ref="resizeBox">
      <div class="chart-url" :id="'chartUrlDiv'+chartIndex" @mouseenter="caretShow=true" @mouseleave="caretShow=false" >
        <loading  :ref="'localLoading'+chartIndex"></loading>
        <div class="clearfix chartTitle" :class="{'dragTitle':dragTitleShow}" :id="'chartTitle'+chartIndex">
          <el-dropdown trigger="click" class="nz-chart-top" :key="'chartDropdown'+chartIndex"  v-clickoutside="clickos" :class="{'move-able':!isLock}">
            <el-dropdown-menu style="display: none"></el-dropdown-menu>
            <span class="el-dropdown-link chart-title">
              <span class="chart-title-text">
                <span @click="showList=!showList">
                  <i class="nz-icon nz-icon-arrow-down" :class="showList?'':'is-active'"/>
                </span>
                {{chartData.name}}
                <span v-show="!showList" class="collapse-content">({{chartData.children.length}} charts)</span>
              </span>
              <span class="chart-title-icon"  v-if="from !== 'chartTemp'"  :class="{'visible':caretShow,'hidden':!caretShow}">
                <span v-if="chartData.remark">
                  <el-tooltip :content="chartData.remark" placement="top" effect="light">
                     <i class="nz-icon nz-icon-info-normal"></i>
                  </el-tooltip>
                </span>
                <span  v-has="'panel_chart_edit'" :title="$t('dashboard.refresh')" class="" @click="addGroupItemChart">
                  <i class="nz-icon nz-icon-plus"></i>
                </span>
<!--                 <span  @click="showAllScreen" class="" :title="$t('dashboard.screen')">-->
<!--                  <i class="nz-icon nz-icon-maxview"></i>-->
<!--                 </span>-->
                <span><i class="el-icon-more" @click.stop="dropdownMenuShow=!dropdownMenuShow"></i></span>

              </span>
              <span class="chart-title-icon"  v-else :class="{'visible':caretShow,'hidden':!caretShow}">
                <span  v-has="'panel_chart_edit'" :title="$t('dashboard.refresh')" class="" @click="addGroupItemChart">
                  <i class="nz-icon nz-icon-plus"></i>
                </span>
              </span>
            </span>
            <ul slot="dropdown" v-show="dropdownMenuShow"  :id="'dropdownUl'+chartIndex"  class="el-dropdown-menu nz-chart-dropdown"  style="" >
              <li  @click="editChart" class="el-dropdown-menu__item">
                <i class="nz-icon nz-icon-edit" style="font-size: 16px;"></i><span>{{$t('dashboard.edit')}}</span></li>
              <li  v-has="'panel_chart_delete'" class="el-dropdown-menu__item" @click="removeChart">
                <i class="nz-icon nz-icon-delete" style="font-size: 16px;"></i>{{$t('dashboard.delete')}}</li>
<!--              <li  @click="duplicate" class="el-dropdown-menu__item" v-has="`${from}_chart_duplicate`">-->
<!--                <i class="el-icon-copy-document" style="font-size: 16px;"></i>{{$t('dashboard.duplicate')}}</li>-->
            </ul>
          </el-dropdown>

        </div>
        <el-collapse-transition>
          <div :id="'chartUrl'+chartIndex" class="mt-10 url-container" v-show="showList">
            <chart-list-group :groupList.sync="chartData.children" :panel-lock="panelLock" :filterParent="filter"  :hasGroup="false" :from="from" ref="listGroup" :panelId="panelId" @on-edit-group-chart="editGroupItem" @on-duplicate-group-chart="duplicateGroupItem" @on-remove-chart="removeChartGroup" @moveGroupItem="moveGroupItem" @on-remove-group-chart="removeGroupItem" :groupId="chartData.id"></chart-list-group>
          </div>
        </el-collapse-transition>
        <div style="position: absolute;width: 100%; top:calc(50% - 50px);text-align: center;" v-if="showStatic">
          <div  :id="'staticContainer'+chartIndex" class="center-content"></div>
        </div>
      </div>
<!--      <span class="vue-resizable-handle" @mousedown="startResize" v-if="!isLock"></span>-->
    </div>
  </div>
</template>

<script>
import loading from '../common/loading'
import chartListGroup from './chart-list-group'
export default {
  name: 'chartGroup',
  components: {
    loading: loading,
    chartListGroup
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
    isLock: { type: Boolean, default: false },
    filter: {},
    panelLock: { type: Boolean, default: false },
    dataList: {}
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
      showStatic: false,
      showList: true
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
    setData (chartItem) {
      this.data = chartItem
    },
    showLoad (chartItem) {
      this.data = chartItem
      this.panelIdInner = this.panelId
      // 设置高度
      this.$nextTick(() => {
        this.resize(chartItem)
      })
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
      // this.startLoading()
      this.firstShow = false
      this.$refs.listGroup.refresh()
    },
    // 编辑图表
    editChart () {
      this.dropdownMenuShow = false
      this.$emit('on-edit-chart-block', this.data.id)
    },
    editGroupItem (chart) {
      chart.isGroup = true
      this.$emit('on-edit-group-chart', chart)
    },
    duplicateGroupItem (chart) {
      chart.isGroup = true
      this.$emit('on-duplicate-group-chart', chart)
    },
    // 删除该图表
    removeChart () {
      this.dropdownMenuShow = false
      this.$emit('on-remove-chart-block', this.data.id)
    },
    removeGroupItem (chart) {
      this.dropdownMenuShow = false
      this.$emit('on-remove-group-chart', chart)
    },
    // 删除group 下的该图表
    removeChartGroup (chart) {
      this.$emit('on-remove-group-chart', chart)
    },
    addGroupItemChart () {
      this.$emit('on-add-group-item-chart', this.data.id)
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
    moveGroupItem (groupList) {
      this.$emit('moveGroupItem', { groupId: this.data.id, children: groupList })
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
            that.endLoading('screen')
          })
        } else {
          iframe.onload = function () {
            // iframe加载完毕以后执行操作
            that.firstShow = true
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
  .resize-box-group{
    position: unset !important;
  }
</style>
<style scoped>
  .chart-title .nz-icon-arrow-down{
    display: inline-block;
    transition: transform .3s;
  }
  .chart-title .nz-icon-arrow-down.is-active{
    transform: rotate(
      -90deg
    );
  }
  .collapse-content{
    font-size: 12px;
    color: #999999;
  }
</style>
