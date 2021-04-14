<template>
  <div>
    <div class="top-tools top-tools--sub">
      <div class="top-tool-left">
        <div class="sub-list-title">Name：<slot name="title"></slot></div>
        <div class="sub-list-tabs">
          <div v-for="tab in tabs" :key="tab.prop" :class="{'sub-list-tab--active': tab.active}" class="sub-list-tab" @click="changeTab(tab.prop)">{{tab.name}}</div>
        </div>
      </div>
      <div class="top-tool-right">
        <div v-if="layout.indexOf('searchInput') > -1" class="top-tool-search margin-r-20">
          <search-input :searchMsg="searchMsg" position="endpoint-bottom" @search="search"></search-input>
        </div>
        <slot name="top-tool-right"></slot>
        <button v-if="layout.indexOf('elementSet') > -1" id="account-column-setting" class="top-tool-btn margin-r-20"
                type="button" @click="tools.showCustomTableTitle = true">
          <i class="nz-icon-gear nz-icon"></i>
        </button>
      </div>
    </div>
    <!-- 自定义table列 -->
    <transition name="el-zoom-in-top">
      <element-set
        v-if="tools.showCustomTableTitle"
        ref="customTableTitle"
        :custom-table-title="customTableTitle"
        :original-table-title="tableTitle"
        :tableId="tableId"
        @close="tools.showCustomTableTitle = false"
        @update="updateCustomTableTitle"
      ></element-set>
    </transition>
    <div class="sub-container">
      <div class="nz-table2">
        <slot></slot>
      </div>
      <div class="pagination-bottom">
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

<style lang="scss">
@import '@/assets/css/common/tableCommon.scss';
/* begin--二级顶部工具栏*/
.sub-top-tools {
  display: flex;
  height: 32px;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #DCDFE6;
  border-bottom: 1px solid #E4E7ED;
  margin: 0 -6px;
  padding-right: 80px;
  background-color: $content-right-background-color;
  margin-bottom: 10px;
}
.sub-top-tools>div {
  margin-top: 2px;
}
.sub-top-tools .top-tool-search {
  width: 260px;
  margin: -1px 0 0 0;
  .select_input input {
    background-color: white;
  }
}
.sub-container {
  padding: 10px;
  height: 100%;
  background-color: #f6f6f6;
  &>div {
    background-color: white;
  }
}
.sub-top-tools .top-tool-btn-txt .nz-icon{
  display: inline-block;
  font-size: 12px;
  margin-right: 6px;
}
.sub-top-tool-right {
  display: flex;
  align-content: center;
}
.has-sub-popper {
  color: $danger-color;
}
.sub-box {
  height: 50%;
  position: relative;
}
.sub-list {
  height: calc(100% - 9px);
  position: absolute;
  width: 100%;
  z-index: 1;
  top: 9px;

  .sub-list__tabs {
    height: 100%;
    background-color: white;

    &>div {
      height: 100%;
      background-color: #f6f6f6;

      .nz-table2 {
        height: calc(100% - 92px);
        padding: 20px 20px 0;
      }
    }
  }
}
.main-and-sub-transition {
  transition: .4s height;
}

.resize-modal {
  width: calc(100% - 240px);
  opacity: 0.6;
  background-color: #f5f9ff;
  border: 1px solid #a7d0f7;
  box-sizing: border-box;
  position: fixed;
  cursor: ns-resize;
  display: none;
  z-index: 20;
  vertical-align: bottom;
  bottom: 0;
}

/* end--二级顶部工具栏*/
</style>
