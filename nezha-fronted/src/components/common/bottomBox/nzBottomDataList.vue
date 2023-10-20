<template>
  <div class="bottom-data-list">
    <div class="top-tools top-tools--sub">
      <div v-if="customTool" class="top-tool-right">
        <slot name="top-tool-right"></slot>
      </div>
      <div class="top-tool-right" v-if="!customTool">
        <div v-if="layout.indexOf('searchInput') > -1" class="top-tool-search margin-r-20">
          <search-input v-if="!showSearchBox && searchInputShow "  :searchMsg="searchMsg" :position="'bottom' + targetTab + obj.id" @search="search" :targetTab="targetTab"></search-input>
          <search-box v-if="showSearchBox" :from="from" :position="'bottom' + targetTab + obj.id" :targetTab="targetTab" :searchMsg="searchMsg" @search="search"></search-box>
        </div>
        <slot name="top-tool-right"></slot>
        <button v-if="layout.indexOf('elementSet') > -1" id="account-column-setting" class="top-tool-btn margin-r-20"
                type="button" @click="tools.showCustomTableTitle = true" :title="$t('overall.selectColumns')">
          <i class="nz-icon-gear nz-icon"></i>
        </button>
      </div>
      <div class="top-tool-left">
        <div class="sub-list-title" v-if="showTitle">{{bottomHeaderTitle}}：<slot name="title"></slot></div>
        <div class="sub-list-tabs">
          <!--          <div v-for="tab in tabs" :key="tab.prop" :class="{'sub-list-tab&#45;&#45;active': tab.active || tab.prop == targetTab }" :title='tab.name' class="sub-list-tab" @click="changeTab(tab.prop)">{{tab.name}}</div>-->
          <el-tabs v-model="activeTargetTab" @tab-click="changeTab" class="sub-list-tabs-nz-tabs" :class="customClassName">
            <el-tab-pane v-for="tab in tabs" :label="tab.name" :name="tab.prop" :key="tab.prop"  :class="tab.class" class="sub-list-tab"></el-tab-pane>
          </el-tabs>
        </div>
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
        :table-class="true"
      ></element-set>
    </transition>
    <div class="sub-container">
      <div :class="subContentClass">
        <slot></slot>
      </div>
      <div class="pagination-bottom" v-if="showPagination">
        <slot name="pagination"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { fromRoute } from '@/components/common/js/constants'
import SearchBox from '@/components/common/searchBox/searchBox'
export default {
  name: 'nzBottomDataList',
  components: {
    SearchBox
  },
  props: {
    from: {
      type: String,
      default: ''
    },
    customClassName: {
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
    obj: { },
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
    },
    showTitle: {
      type: Boolean,
      default: true
    },
    title: {
      type: String
    },
    hideHeader: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    bottomHeaderTitle () {
      return this.title || (this.$t('overall.name'))
    },
    subContentClass () {
      const className = []
      switch (this.targetTab) {
        case 'dashboardTab':
          className.push('nz-table-list bottom-dashboard')
          break
        case 'log': {
          className.push('bottom-log')
          break
        }
        default: {
          className.push('nz-table-list')
          break
        }
      }
      this.from === fromRoute.chartTemp && className.push('chart-temp')
      return className.join(' ')
    },
    showDeleteTableRel () {
      return this.$store.getters.getShowDeleteTableRel
    },
    showSearchBox () {
      const flag = (this.targetTab === 'alertMessageTab' || this.targetTab === 'moduleAlertMessage' || this.targetTab === 'endpointAlertMessage' || this.targetTab === 'alertRuleAlertMessage')
      return flag
    }
  },
  data () {
    return {
      fromRoute: fromRoute,
      searchInputShow: true,
      tools: {
        toTopBtnTop: this.$tableHeight.toTopBtnTop, // to-top按钮的top属性
        tableHover: false, // 控制滚动条和top按钮同时出现
        showCustomTableTitle: false // 自定义列弹框是否显示
      },
      activeTargetTab: ''
    }
  },
  watch: {
    obj (n) {
      this.searchInputShow = false
      setTimeout(() => {
        this.searchInputShow = true
      }, 100)
    },
    targetTab: {
      immediate: true,
      handler (n) {
        this.searchInputShow = false
        this.activeTargetTab = n
        setTimeout(() => {
          this.searchInputShow = true
        }, 100)
      }
    },
    showDeleteTableRel (n) {
      if (!n) {
        this.$parent.getTableData()
      }
    }
  },
  methods: {
    updateCustomTableTitle (custom) {
      this.$parent.updateCustomTableTitle(custom)
    },
    search (searchObj) {
      this.$emit('search', searchObj)
    },
    // 切换tab
    changeTab (tab, event) {
      this.$emit('changeTab', tab.name)
    }
  }
}
</script>
