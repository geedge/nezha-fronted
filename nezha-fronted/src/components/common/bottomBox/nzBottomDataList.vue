<template>
  <div>
    <div class="top-tools top-tools--sub">
      <div class="top-tool-left">
        <div class="sub-list-title">Name：<slot name="title"></slot></div>
        <div class="sub-list-tabs">
          <div v-for="tab in tabs" :key="tab.prop" :class="{'sub-list-tab--active': tab.active || tab.prop=== targetTab}" class="sub-list-tab" @click="changeTab(tab.prop)">{{tab.name}}</div>
        </div>
      </div>
      <div class="top-tool-right" v-if="!customTool">
        <div v-if="layout.indexOf('searchInput') > -1" class="top-tool-search margin-r-20">
          <search-input :searchMsg="searchMsg" position="endpoint-bottom" @search="search"></search-input>
        </div>
        <slot name="top-tool-right"></slot>
        <button v-if="layout.indexOf('elementSet') > -1" id="account-column-setting" class="top-tool-btn margin-r-20"
                type="button" @click="tools.showCustomTableTitle = true">
          <i class="nz-icon-gear nz-icon"></i>
        </button>
      </div>
      <div  class="top-tool-right" v-else>
        <slot name="top-tool-right"></slot>
      </div>
    </div>
    <!-- 自定义table列 -->
    <transition name="el-zoom-in-top">
      <element-set
        v-if="tools.showCustomTableTitle && layout.indexOf('elementSet') > -1"
        ref="customTableTitle"
        :custom-table-title="customTableTitle"
        :original-table-title="tableTitle"
        :tableId="tableId"
        @close="tools.showCustomTableTitle = false"
        @update="updateCustomTableTitle"
      ></element-set>
    </transition>
    <div class="sub-container">
      <div :class="targetTab === 'panel' ? 'bottom-panel' : 'nz-table2'">
        <slot></slot>
      </div>
      <div class="pagination-bottom" v-if="showPagination">
        <slot name="pagination"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'nzBottomDataList',
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
    tableId: {
      type: String,
      default: ''
    },
    tabs: {
      type: Array
    },
    targetTab: String,
    customTool: {
      type: Boolean,
      default: false
    },
    showPagination: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
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
    search (searchObj) {
      this.$emit('search', searchObj)
    },
    // 切换tab
    changeTab (tab) {
      this.$emit('changeTab', tab)
    }
  }
}
</script>
