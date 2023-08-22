<template>
  <div :class="from" class="list-page detail-view">
    <!-- 主页面 -->
    <div class="main-list">
      <!-- 顶部工具栏 -->
      <div class="main-modal"></div>
      <div class="main-container">
        <div  class="top-tools">
          <div class="top-tool-left" style="min-width: 300px">
            <slot name="top-tool-left"></slot>
            <div v-if="showLayout.indexOf('searchInput') > -1" class="top-tool-search margin-r-20" :class="{'project-search alert-table asset-table endpoint-table': searchRight}">
              <search-input ref="searchInput" :from="from" :position="from" :inTransform="bottomBox.inTransform" :searchMsg="searchMsg" @search="search"></search-input>
            </div>
          </div>
          <div :class="{'top-tool-main-right-to-left': bottomBox.showSubList}" class="top-tool-right">
            <slot name="top-tool-right"></slot>
            <el-dropdown
              type="primary"
              v-if="showLayout.indexOf('detailViewSet') > -1"
              trigger="click"
              @command="changeDetailType">
              <button class="top-tool-btn table-column-setting"
                      type="button" :title="$t('overall.switchView')">
                <i class="nz-icon nz-icon-detail-view" />
              </button>
              <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
                <el-dropdown-item :command="'list'" :class="detailType === 'list' ? 'active' : ''">{{$t('asset.detail.list')}}</el-dropdown-item>
                <el-dropdown-item :command="'view'" :class="detailType === 'view' ? 'active' : ''">{{$t('asset.detail.detail')}}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <!-- 顶部分页组件，当打开底部上滑框时出现 -->
          <!-- <div v-if="showLayout.indexOf('pagination') > -1" class="pagination-top pagination-top-hide display-none"></div>-->
        </div>
        <div :style="{ height: nzTableHeight }" class="nz-detail-view" :class="dataLength?'':'nz-detail-view-no-data'">
          <div class="nz-detail-view-left" v-show="dataLength">
            <slot name="nz-detail-view-list"></slot>
            <div v-if="showLayout.indexOf('pagination') > -1" class="nz-detail-view-pagination">
              <slot name="pagination"></slot>
            </div>
          </div>
          <div v-if="!dataLength" class="no-data">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#nz-icon-no-data-list"></use>
            </svg>
            <div class="table-no-data__title">No results found</div>
          </div>
          <div class="nz-detail-view-right"   v-if="detailViewRightObj">
            <detailViewRight
              @getTableData = 'getTableData'
              ref="detailViewRight"
              v-if="detailViewRightObj"
              :from="from"
              :obj="detailViewRightObj"
              :target-tab="'dashboardTab'"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- 全屏查看 -->
    <el-dialog
      v-if="topologyShow"
      :visible.sync="topologyShow"
      :show-close="false"
      class="nz-dialog chart-fullscreen"
      destroy-on-close
      fullscreen
      :modal-append-to-body="false"
    >
      <panel-chart
        :ref="'chart-fullscreen' + topologyChartInfo.id"
        :chart-info="topologyChartInfo"
        :close-on-click-modal="false"
        :from="from"
        :time-range="timeRange"
        :is-fullscreen="true"
        @showFullscreen="showFullscreen"
      ></panel-chart>
    </el-dialog>
    <delete-button
      ref="deleteButton"
      :from="triggerFrom"
      :forceDeleteShow="forceDeleteShow"
      :deleteTitle="deleteTitle"
      type=''
      :title="$t('overall.delete')"
      :api="api"
      :single="single"
      :delete-objs="singleDelete"
      @before="delFlag=true"
    ></delete-button>
    <diagnosis-tab
      ref="diagnosisTab"
      :diagnosisTabData ="diagnosisTabData"
    ></diagnosis-tab>
    <config-sync ref="configSync" type="single" :from="triggerFrom" :batch-objs="syncObj"></config-sync>
  </div>
</template>

<script>
import { fromRoute } from '@/components/common/js/constants'
import { bottomBoxWindow } from '@/components/common/js/tools'
import detailViewRight from '@/components/common/detailView/view/detailViewRight'
import panelChart from '@/components/chart/panelChart'
import deleteButton from '@/components/common/deleteButton'
import diagnosisTab from '@/components/common/diagnosisTab'
import configSync from '@/components/common/configSync'
export default {
  name: 'nzDetailView',
  components: {
    detailViewRight,
    panelChart,
    deleteButton,
    diagnosisTab,
    configSync
  },
  props: {
    from: {
      type: String,
      default: ''
    },
    tableTitle: {
      type: Array
    },
    detailType: {
      type: String,
      default: ''
    },
    customTableTitle: {
      type: Array
    },
    dataLength: {
      type: Number,
      default: 1
    },
    layout: {
      type: Array,
      default () { return [] }
    },
    searchMsg: {
      type: Object
    },
    nzTableHeightOffset: Number,
    searchRight: Boolean,
    operationRecord: Boolean,
    detailViewRightObj: {}
  },
  computed: {
    nzTableHeight () {
      if (this.nzTableHeightOffset) {
        if (this.layout.indexOf('clickSearch') > -1) {
          return `calc(100% - ${this.nzTableHeightOffset}px`
        }
      }
      return ''
    },
    topologyShow () {
      return this.$store.getters.getTopologyShow
    },
    topologyChartInfo () {
      return this.$store.getters.getTopologyChartInfo
    },
    showDeleteTableRel () {
      return this.$store.getters.getShowDeleteTableRel
    },
    deleteTableRel () {
      return this.$store.getters.getDeleteTableRel
    },
    diagnosisTab () {
      return this.$store.getters.getDiagnosisTab
    },
    showConfigSync () {
      return this.$store.getters.getShowConfigSync
    },
    configSync () {
      return this.$store.getters.getConfigSync
    }
  },
  data () {
    return {
      fromRoute: fromRoute,
      /* 二级页面相关 */
      api: '',
      bottomBox: {
        object: {},
        mainResizeShow: true, // dom高度改变时是否展示|隐藏
        subResizeShow: true,
        isFullScreen: false, // 全屏状态
        showSubList: false, // 是否显示二级列表
        targetTab: '', // 显示二级列表中的哪个页签
        inTransform: false // 搜索框相关，搜索条件下拉框是否在transform里
      },
      tools: {
        toTopBtnTop: this.$tableHeight.toTopBtnTop, // to-top按钮的top属性
        tableHover: false, // 控制滚动条和top按钮同时出现
        showCustomTableTitle: false // 自定义列弹框是否显示
      },
      showLayout: [],
      timeRange: [new Date(), new Date()],
      single: true,
      deleteTitle: '',
      forceDeleteShow: false,
      singleDelete: [],
      diagnosisTabData: {},
      // 配置同步数据
      syncObj: [],
      triggerFrom: ''
    }
  },
  methods: {
    updateCustomTableTitle (custom) {
      this.$emit('update:customTableTitle', custom)
    },
    // 全屏
    fullScreen () {
      const vm = this
      bottomBoxWindow.fullScreen(vm)
    },
    // 退出全屏
    exitFullScreen () {
      const vm = this
      bottomBoxWindow.exitFullScreen(vm)
    },
    // 鼠标拖动二级列表
    listResize (e) {
      const vm = this
      bottomBoxWindow.listResize(vm, e)
    },
    showBottomBox (targetTab, row) {
      this.bottomBox.targetTab = targetTab
      this.bottomBox.object = JSON.parse(JSON.stringify(row))
      this.bottomBox.showSubList = true
    },
    search (searchObj) {
      this.$emit('search', searchObj)
    },
    getTableData () {
      this.$emit('getTableData')
    },
    changeDetailType (item) {
      this.$emit('changeDetailType', item)
    },
    showFullscreen (flag) {
      this.$store.commit('setTopologyShow', flag)
    },
    configSyncRow (row, from) {
      this.triggerFrom = from || this.from
      this.syncObj = [row]
      this.$nextTick(() => {
        this.$refs.configSync.showDialog()
      })
    },
    delTableRelRow (url, row, forceDeleteShow = false, single = false, deleteTitle = '', from) {
      this.triggerFrom = from || this.from
      this.api = url
      this.singleDelete = [row]
      this.forceDeleteShow = forceDeleteShow
      this.single = single
      this.deleteTitle = deleteTitle
      this.$refs.deleteButton.batchDelete()
    },
    delTableRow (ids) { // 接收一个 删除的id数组 判断当前底部弹窗id 是否包含 包含则关闭当前弹窗
      if (ids.indexOf(this.bottomBox.object.id) !== -1) {
        this.bottomBox = {
          object: {},
          mainResizeShow: true, // dom高度改变时是否展示|隐藏
          subResizeShow: true,
          isFullScreen: false, // 全屏状态
          showSubList: false, // 是否显示二级列表
          targetTab: '', // 显示二级列表中的哪个页签
          inTransform: false // 搜索框相关，搜索条件下拉框是否在transform里
        }
      }
    }
  },
  watch: {
    'bottomBox.showSubList': function (n) {
      const vm = this
      bottomBoxWindow.showSubListWatch(vm, n)
    },
    layout: {
      immediate: true,
      deep: true,
      handler (n) {
        this.showLayout = [...n]
      }
    },
    showDeleteTableRel (n) {
      if (n) {
        this.delTableRelRow(this.deleteTableRel.url, this.deleteTableRel.row, this.deleteTableRel.forceDeleteShow, this.deleteTableRel.single, this.deleteTableRel.deleteTitle, this.deleteTableRel.from)
      }
    },
    diagnosisTab (n) {
      this.diagnosisTabData = n
    },
    showConfigSync (n) {
      if (n) {
        this.configSyncRow(this.configSync.row, this.configSync.from)
      }
    }
  }
}
</script>
