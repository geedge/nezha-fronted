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
            <span class="el-dropdown-link chart-title" @click.stop="dropdownMenuShow=!dropdownMenuShow">
              <span class="chart-title-text">{{chartData.name}}</span>
              <span class="chart-title-icon"><i class="nz-icon nz-icon-xialaxuanze  "  :class="{'visible':caretShow,'hidden':!caretShow}"></i></span>
            </span>
            <ul slot="dropdown" v-show="dropdownMenuShow"  :id="'dropdownUl'+chartIndex"  class="el-dropdown-menu nz-chart-dropdown"  style="position: absolute; top: 30px; left: calc(50% - 79px); transform-origin: center top; z-index: 1000;" >
              <li  @click="refreshChart" class="el-dropdown-menu__item">
                <i class="global-active-color el-icon-refresh-right" style="font-size: 16px;"></i><span>{{$t('dashboard.refresh')}}</span></li>
              <li  @click="editChart" class="el-dropdown-menu__item" v-has="`${from}_chart_toEdit`">
                <i class="nz-icon nz-icon-edit" style="font-size: 14px; margin-right: 11px; margin-left: 1px;"></i>{{$t('dashboard.edit')}}</li>
              <li  @click="removeChart" class="el-dropdown-menu__item" v-has="`${from}_chart_delete`">
                <i class="nz-icon nz-icon-delete" style="font-size: 16px;"></i>{{$t('dashboard.delete')}}</li>
              <li  @click="showAllScreen"  class="el-dropdown-menu__item">
                <i class="el-icon-full-screen" style="font-size: 16px;"></i>{{$t('dashboard.screen')}}</li>
              <li  @click="duplicate" class="el-dropdown-menu__item" v-has="`${from}_chart_duplicate`">
                <i class="el-icon-copy-document" style="font-size: 16px;"></i>{{$t('dashboard.duplicate')}}</li>
            </ul>
          </el-dropdown>

        </div>
        <div :id="'chartUrl'+chartIndex" class="mt-10 url-container">
          <chart-list-group :groupList.sync="chartData.children" :panel-lock="panelLock" :filterParent="filter"  :class="{'show-top':false}" :hasGroup="false" :from="from" ref="listGroup" :panelId="panelId" @on-edit-group-chart="editGroupItem" @on-remove-chart="removeChartGroup" @moveGroupItem="moveGroupItem"></chart-list-group>
        </div>
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
      this.$emit('on-edit-group-chart', chart)
    },
    // 删除该图表
    removeChart () {
      this.dropdownMenuShow = false
      this.$emit('on-remove-chart-block', this.data.id)
    },
    // 删除该图表
    removeChartGroup (chart) {
      this.$emit('on-remove-group-chart', chart)
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
      this.$confirm(this.$t('tip.confirmDuplicate'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'info'
      }).then(() => {
        const param = { id: this.data.id }
        this.$post('panel/' + this.data.panelId + '/charts/duplicate', (param)).then(response => {
          if (response.code === 200) {
            this.$message({
              duration: 2000,
              type: 'success',
              message: this.$t('tip.duplicateSuccess')
            })
            this.$emit('on-duplicate-chart-block', this.data.id, response.data)
          } else {
            if (response.msg) {
              this.$message.error(response.msg)
            } else if (response.error) {
              this.$message.error(response.error)
            } else {
              this.$message.error(response)
            }
          }
        })
      })
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
  .resize-box-group{
    position: unset !important;
  }
</style>
