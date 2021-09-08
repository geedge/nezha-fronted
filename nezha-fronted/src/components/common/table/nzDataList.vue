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
              <search-input ref="searchInput" :from="from" :inTransform="bottomBox.inTransform" :searchMsg="searchMsg" @search="search"></search-input>
            </div>
            <slot name="top-tool-right"></slot>
            <button v-if="showLayout.indexOf('elementSet') > -1"  class="top-tool-btn table-column-setting"
                    type="button" @click="tools.showCustomTableTitle = true">
              <i class="nz-icon-gear nz-icon"></i>
            </button>
          </div>
          <!-- 顶部分页组件，当打开底部上滑框时出现 -->
          <!-- <div v-if="showLayout.indexOf('pagination') > -1" class="pagination-top pagination-top-hide display-none"></div>-->
        </div>
        <div v-if="showLayout.indexOf('clickSearch') > -1" class="search-box">
          <slot name="search"></slot>
        </div>
        <div v-show="bottomBox.mainResizeShow" :style="{ height: nzTableHeight }" class="nz-table2">
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
                  :is-full-screen="bottomBox.isFullScreen"
                  :obj="bottomBox.object"
                  :sub-resize-show="bottomBox.subResizeShow"
                  :target-tab.sync="bottomBox.targetTab"
                  @closeSubList="bottomBox.showSubList = false"
                  @exitFullScreen="exitFullScreen"
                  @fullScreen="fullScreen"
                  @listResize="listResize" ></bottom-box>
    </transition>
  </div>
</template>

<script>
import { fromRoute } from '@/components/common/js/constants'
import bottomBox from '@/components/common/bottomBox/bottomBox'
import { bottomBoxWindow } from '@/components/common/js/tools'

export default {
  name: 'nzDataList',
  components: {
    bottomBox
  },
  props: {
    from: {
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
    searchRight: Boolean
  },
  computed: {
    nzTableHeight () {
      if (this.nzTableHeightOffset) {
        if (this.layout.indexOf('clickSearch') > -1) {
          return `calc(100% - ${this.nzTableHeightOffset}px`
        }
      }
      return ''
    }
  },
  data () {
    return {
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
      showLayout: []
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
    }
  }
}
</script>
