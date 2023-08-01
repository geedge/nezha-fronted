<template>
  <div :class="from" class="list-page">
    <!-- 主页面 -->
    <div :class="{'main-list-with-sub': bottomBox.showSubList}" class="main-list">
      <!-- 顶部工具栏 -->
      <div class="main-modal"></div>
      <div class="main-container">
        <div v-show="bottomBox.mainResizeShow" class="top-tools">
          <div class="top-tool-left" style="min-width: 300px">
            <slot name="top-tool-left"></slot>
          </div>
          <div :class="{'top-tool-main-right-to-left': bottomBox.showSubList}" class="top-tool-right">
            <div v-if="showLayout.indexOf('searchInput') > -1" class="top-tool-search margin-r-20" :class="{'project-search alert-table asset-table endpoint-table': searchRight}">
              <search-input ref="searchInput" :from="from" :position='from' :inTransform="bottomBox.inTransform" :searchMsg="searchMsg" @search="search"></search-input>
<!--              <search-box :from="from" :position='from' :inTransform="bottomBox.inTransform" :searchMsg="searchMsg" @search="search"></search-box>-->
            </div>
            <template>
              <slot name="top-tool-right"></slot>
            </template>
            <button v-if="showLayout.indexOf('elementSet') > -1"  class="top-tool-btn table-column-setting"
                    type="button" @click="tools.showCustomTableTitle = true" :title="$t('overall.selectColumns')">
              <i class="nz-icon-gear nz-icon"></i>
            </button>
            <el-dropdown
              type="primary"
              trigger="click"
              v-if="showLayout.indexOf('detailViewSet') > -1"
              class="margin-l-5"
              @command="changeDetailType">
              <button class="top-tool-btn table-column-setting"
                      type="button" :title="$t('overall.switchView')">
                <i class="nz-icon nz-icon-list-view" />
              </button>
              <el-dropdown-menu slot="dropdown"  class="right-public-box-dropdown-top right-box-select-top">
                <el-dropdown-item :command="'list'" :class="detailType === 'list' ? 'active' : ''">{{$t('asset.detail.list')}}</el-dropdown-item>
                <el-dropdown-item :command="'view'" :class="detailType === 'view' ? 'active' : ''">{{$t('asset.detail.detail')}}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <!-- 顶部分页组件，当打开底部上滑框时出现 -->
          <!-- <div v-if="showLayout.indexOf('pagination') > -1" class="pagination-top pagination-top-hide display-none"></div>-->
        </div>
        <div v-show="bottomBox.mainResizeShow" v-if="showLayout.indexOf('clickSearch') > -1" class="search-box">
          <slot name="search"></slot>
        </div>
        <div v-show="bottomBox.mainResizeShow" :style="{ height: nzTableHeight }" class="nz-table-list">
          <slot v-bind:mainResizeShow="bottomBox.mainResizeShow"></slot>
        </div>
        <div v-show="bottomBox.mainResizeShow" v-if="showLayout.indexOf('pagination') > -1" class="pagination-bottom">
          <slot name="pagination"></slot>
        </div>
      </div>
      <!-- 自定义table列 -->
      <transition name="el-zoom-in-top">
        <element-set
          v-if="tools.showCustomTableTitle"
          :tableId="$parent.tableId"
          ref="customTableTitle"
          :custom-table-title="customTableTitle"
          :original-table-title="tableTitle"
          :operation-true="operationRecord"
          @close="tools.showCustomTableTitle = false"
          @update="updateCustomTableTitle"
        ></element-set>
      </transition>

    </div>
    <transition name="el-zoom-in-bottom">
      <bottom-box v-if="bottomBox.showSubList"
                  @getTableData = 'getTableData'
                  ref="bottomBox"
                  :from="from"
                  :sign ="sign"
                  :is-full-screen="bottomBox.isFullScreen"
                  :obj="bottomBox.object"
                  :sub-resize-show="bottomBox.subResizeShow"
                  :target-tab.sync="bottomBox.targetTab"
                  @closeSubList="bottomBox.showSubList = false"
                  @exitFullScreen="exitFullScreen"
                  @fullScreen="fullScreen"
                  @listResize="listResize" ></bottom-box>
    </transition>
    <!-- 全屏查看 -->
    <el-dialog
      v-if="topologyShow"
      :visible.sync="topologyShow"
      :show-close="false"
      class="nz-dialog chart-fullscreen"
      :close-on-click-modal="false"
      destroy-on-close
      fullscreen
      :modal-append-to-body="false"
    >
      <panel-chart
        :ref="'chart-fullscreen' + topologyChartInfo.id"
        :chart-info="topologyChartInfo"
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
  </div>
</template>

<script>
import { fromRoute } from '@/components/common/js/constants'
import bottomBox from '@/components/common/bottomBox/bottomBox'
import { bottomBoxWindow } from '@/components/common/js/tools'
import panelChart from '@/components/chart/panelChart'
import bus from '@/libs/bus'
import routerPathParams from '@/components/common/mixin/routerPathParams'
import SearchBox from '@/components/common/searchBox/searchBox'
import deleteButton from '@/components/common/deleteButton'
import diagnosisTab from '@/components/common/diagnosisTab'
export default {
  name: 'nzDataList',
  mixins: [routerPathParams],
  components: {
    SearchBox,
    bottomBox,
    panelChart,
    deleteButton,
    diagnosisTab
  },
  props: {
    from: {
      type: String,
      default: ''
    },
    detailType: {
      type: String,
      default: ''
    },
    tableTitle: {
      type: Array
    },
    customTableTitle: {
      type: Array
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
    operationRecord: Boolean
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
    }
  },
  data () {
    return {
      sign: '',
      singleDelete: [],
      api: '',
      single: true,
      deleteTitle: '',
      forceDeleteShow: false,
      delFlag: false,
      fromRoute: fromRoute,
      /* 二级页面相关 */
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
      // 故障诊断数据
      diagnosisTabData: {},
      triggerFrom: ''
    }
  },
  mounted () {
    bus.$on('delTableRow', this.delTableRow)
  },
  methods: {
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
    },
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
    listResize (e, cb) {
      const vm = this
      bottomBoxWindow.listResize(vm, e, cb)
    },
    showBottomBox (targetTab, row) {
      this.sign = row.id
      if (!this.bottomBox.showSubList) {
        this.bottomBox.targetTab = targetTab
      }
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
    }
  },
  watch: {
    'bottomBox.showSubList': function (n) {
      const vm = this
      bottomBoxWindow.showSubListWatch(vm, n)
      this.updatePath(this.$route.query, this.$route.path, 'nzDatalist')
    },
    'bottomBox.object': function (n) {
      const vm = this
      bottomBoxWindow.showSubListWatch(vm, n)
      this.updatePath(this.$route.query, this.$route.path, 'nzDatalist')
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
    }
  },
  beforeDestroy () {
    bus.$off('delTableRow', this.delTableRow)
  }
}
</script>
