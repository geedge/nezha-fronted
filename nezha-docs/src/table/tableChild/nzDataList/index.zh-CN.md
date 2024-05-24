---
map:
  path: /nzDataList
---
# 关联组件
1. SearchBox
2. bottomBox
3. panelChart
4. deleteButton
5. diagnosisTab
6. configSync



# 示例代码
```vue
  <div :class="from" class="list-page">
  <!-- 主页面 -->
  <div class="main-list">
    <!-- 顶部工具栏 -->
    <div class="main-container">
      <div class="top-tools">
        <div class="top-tool-left" >
          <search-box></search-box>
          <slot name="top-tool-left"></slot>
        </div>
        <div class="top-tool-right">
          <div>
            <search-input ></search-input>
          </div>
          <template>
            <slot name="top-tool-right"></slot>
          </template>
          <button v-if="showLayout.indexOf('elementSet') > -1"  class="top-tool-btn table-column-setting"
                  type="button" @click="tools.showCustomTableTitle = true" :title="$t('overall.selectColumns')">
            <i class="nz-icon-gear nz-icon"></i>
          </button>
          <el-dropdown>
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
      <div >
        <slot name="search"></slot>
      </div>
      <div>
        <slot v-bind:mainResizeShow="bottomBox.mainResizeShow"></slot>
      </div>
      <div>
        <slot name="pagination"></slot>
      </div>
    </div>
    <!-- 自定义table列 -->
    <transition name="el-zoom-in-top">
      <element-set></element-set>
    </transition>

  </div>
  
  <transition name="el-zoom-in-bottom">
    <bottom-box ></bottom-box>
  </transition>
  
  <delete-button></delete-button>
  <diagnosis-tab></diagnosis-tab>
  
  <config-sync></config-sync>
  
</div>
```




<API src="./index.vue" lang="zh"></API>