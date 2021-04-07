<template>
  <div :class="from" class="list-page">
    <!-- 主页面 -->
    <div :class="{'main-list-with-sub': bottomBox.showSubList}" class="main-list">
      <!-- 顶部工具栏 -->
      <div class="main-modal"></div>
      <div v-show="bottomBox.mainResizeShow" class="top-tools">
        <div :class="{'top-tool-main-right-to-left': bottomBox.showSubList}" class="top-tool-main-right">
          <div v-if="components.indexOf('searchInput') > -1" class="top-tool-search">
            <search-input ref="searchInput" :inTransform="bottomBox.inTransform" :searchMsg="searchMsg" @search="search"></search-input>
          </div>
          <slot name="top-tool"></slot>
          <button v-if="components.indexOf('elementSet') > -1" id="account-column-setting" class="top-tool-btn margin-l-10"
                  type="button" @click="!tools.showCustomTableTitle && (tools.showCustomTableTitle = true)">
            <i class="nz-icon-gear nz-icon"></i>
          </button>
        </div>
        <!-- 顶部分页组件，当打开底部上滑框时出现 -->
        <div v-if="components.indexOf('pagination') > -1" class="pagination-top pagination-top-hide display-none"></div>
      </div>
      <!-- 自定义table列 -->
      <transition name="el-zoom-in-top">
        <element-set
          v-if="tools.showCustomTableTitle"
          id="account-list"
          ref="customTableTitle"
          :custom-table-title="customTableTitle"
          :original-table-title="tableTitle"
          @close="tools.showCustomTableTitle = false"
          @update="updateCustomTableTitle"
        ></element-set>
      </transition>
      <div v-show="bottomBox.mainResizeShow" class="nz-table2">
        <slot v-bind:mainResizeShow="bottomBox.mainResizeShow"></slot>
      </div>
      <div v-show="!bottomBox.showSubList" class="pagination-bottom">
        <slot name="pagination"></slot>
      </div>
    </div>
    <transition name="el-zoom-in-bottom">
      <bottom-box v-if="bottomBox.showSubList"
                  ref="bottomBox"
                  :from="from"
                  :is-full-screen="bottomBox.isFullScreen"
                  :obj="bottomBox.object"
                  :sub-resize-show="bottomBox.subResizeShow"
                  :target-tab.sync="bottomBox.targetTab"
                  @closeSubList="bottomBox.showSubList = false" @exitFullScreen="exitFullScreen" @fullScreen="fullScreen" @listResize="listResize" ></bottom-box>
    </transition>
  </div>
</template>

<script>
import { bottomBoxWindow } from '@/components/common/js/tools'

export default {
  name: 'nzDataList',
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
    components: {
      type: Array,
      default () { return [] }
    },
    searchMsg: {
      type: Object
    },
    tableId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
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
      }
    }
  },
  methods: {
    updateCustomTableTitle (custom) {
      this.$emit('update:customTableTitle', custom)
    },
    // 全屏
    fullScreen () {
      const vm = this
      // this.$bottomBoxWindow.fullScreen(vm)
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
    }
  },
  watch: {
    'bottomBox.showSubList': function (n) {
      const vm = this
      bottomBoxWindow.showSubListWatch(vm, n)
    }
  }
}
</script>
<style lang="scss">
@import '@/assets/css/common/tableCommon.scss';
</style>
