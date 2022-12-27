<template>
  <el-popover :placement="placement" popper-class="'nz-pop nz-pop-select-panel right-box-select-top right-public-box-dropdown-top nz-pop-select-panel__dropdown'" transition="slide" v-model="popBox.show" :width="520" :disabled="disabled">
    <div class="panel-select-wrap">
      <div class="panel-select-left">
        <ul class="panel-select-list">
          <li class="panel-select-item" :class="{active:currentTab===item.value}" v-for="item in tabList" :key="item.value" @click="tabChange(item.value)">
            <i class="nz-icon" :class="item.icon"></i>
            <span>{{item.name}}</span>
          </li>
        </ul>
        <div class="dashboard-select-tail">
          <slot name="button"></slot>
        </div>
      </div>
      <div class="pop-item-wider">
        <div class="panel-select-header">
          <el-input id="panel-list-search" v-model="filterPanel" :placeholder="$t('overall.search')" clearable size="small" style="width:316px"></el-input>
        </div>
        <!-- 全部仪表盘 数据 -->
        <div :class="{'movable': !panelLock}" class="select-panel-tree" v-if="currentTab==='all'">
          <el-tree
            :data="panelData"
            :draggable="!panelLock"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            :props="{label: 'name', children: 'children'}"
            @node-click="selectDashboard"
            @node-drop="nodeDrop"
            check-on-click-node
            check-strictly
            default-expand-all
            :highlight-current="true"
            node-key="id"
            ref="panelTree">
            <div class="tree--node" slot-scope="{ node, data }">
              <HighlightText :queries="filterPanel" :highlightClass="'highlight-keyword'" style="vertical-align: middle" :title="node.label + ' (' + data.chartNum +' charts）' ">{{node.label}}</HighlightText>
              <el-row class="block-col-2" style="margin-left:10px;margin-right:8px">
                <el-col>
                  <el-dropdown  placement="bottom-end" trigger="click" style="margin-right:10px">
                    <span class="el-dropdown-link tree--operation" @click.stop><i class="nz-icon nz-icon-more1"></i></span>
                    <el-dropdown-menu class="right-box-select-top" slot="dropdown"  v-has="['main_edit', 'main_delete']">
                      <el-dropdown-item>
                        <div @click="editPanel(data)" v-has="'main_edit'"><i  class="nz-icon nz-icon-edit"></i>{{$t('overall.edit')}}</div>
                      </el-dropdown-item>
                      <el-dropdown-item>
                        <div @click="deletePanel(data)" v-has="'main_delete'"><i class="nz-icon nz-icon-delete"></i>{{$t('overall.delete')}}</div>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                  <template>
                    <i v-if="data.starred===1" class="nz-icon nz-icon-a-xingzhuang2" @click.stop="delStarred(data)" :title ="$t('overall.starred')"></i>
                    <i v-else class="nz-icon nz-icon-xingzhuang" @click.stop="addStarred(data)" :title ="$t('overall.unstarred')"></i>
                  </template>
                </el-col>
              </el-row>
            </div>
          </el-tree>
        </div>
        <!-- 我的收藏、我的创建、最近浏览数据 -->
        <div class="select-panel-tree" v-else>
          <el-tree
            :data="otherData"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            :props="{label: 'name', children: 'children'}"
            @node-click="selectDashboard"
            @node-drop="nodeDrop"
            check-on-click-node
            check-strictly
            default-expand-all
            :highlight-current="true"
            node-key="id"
            ref="otherTree">
            <div class="tree--node" slot-scope="{ node, data }">
              <HighlightText :queries="filterPanel" :highlightClass="'highlight-keyword'" style="vertical-align: middle" :title="node.label + ' (' + data.chartNum +' charts）' ">{{node.label}}</HighlightText>
              <el-row class="block-col-2" style="margin-left:10px;margin-right:8px">
                <el-col>
                  <el-dropdown  placement="bottom-end" trigger="click" style="margin-right:10px">
                    <span class="el-dropdown-link tree--operation" @click.stop><i class="nz-icon nz-icon-more1"></i></span>
                    <el-dropdown-menu class="right-box-select-top nz-el-dropdown-menu" slot="dropdown"  v-has="['main_edit', 'main_delete']">
                      <el-dropdown-item>
                        <div @click="editPanel(data)" v-has="'main_edit'"><i  class="nz-icon nz-icon-edit"></i>{{$t('overall.edit')}}</div>
                      </el-dropdown-item>
                      <el-dropdown-item>
                        <div @click="deletePanel(data)" v-has="'main_delete'"><i class="nz-icon nz-icon-delete"></i>{{$t('overall.delete')}}</div>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                  <template>
                    <i v-if="data.starred===1" class="nz-icon nz-icon-a-xingzhuang2" @click.stop="delStarred(data)" :title ="$t('overall.starred')"></i>
                    <i v-else class="nz-icon nz-icon-xingzhuang" @click.stop="addStarred(data)" :title ="$t('overall.unstarred')"></i>
                  </template>
                </el-col>
              </el-row>
            </div>
          </el-tree>
        </div>
      </div>
    </div>
    <div slot="reference">
      <slot name="trigger"></slot>
    </div>
  </el-popover>
</template>
<script>
import bus from '@/libs/bus'
import HighlightText from 'vue-text-highlight'
export default {
  name: 'selectDashboard',
  components: {
    HighlightText
  },
  props: {
    placement: { type: String },
    panelData: { type: Array },
    showPanel: { type: Object },
    panelLock: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false }
  },
  watch: {
    filterPanel: {
      handler (n) {
        if (this.currentTab === 'all') {
          this.$refs.panelTree && this.$refs.panelTree.filter(n)
        } else {
          this.$refs.otherTree && this.$refs.otherTree.filter(n)
        }
      }
    },
    showPanel: {
      immediate: true,
      handler (n) {
        if (n) {
          this.panel = JSON.parse(JSON.stringify(n))
          // 设置最近浏览数据
          this.setBrowse()
          this.setData()
        }
      }
    },
    panelData: {
      immediate: true,
      async handler () {
        // 获取收藏列表
        this.getStarred()
        this.setData()
      }
    }
  },
  data () {
    return {
      popBox: { show: false },
      panel: { id: 0, name: '' },
      tabList: [
        { name: this.$t('dashboard.allDashboards'), icon: 'nz-icon-a-leimucuquanbu', value: 'all' },
        { name: this.$t('dashboard.starredDashboards'), icon: 'nz-icon-xingzhuang', value: 'starred' },
        { name: this.$t('dashboard.createdByYou'), icon: 'nz-icon-wodechuangjian', value: 'create' },
        { name: this.$t('dashboard.recentlyViewed'), icon: 'nz-icon-liulanlishi', value: 'browse' }
      ],
      currentTab: 'all',
      // 过滤值
      filterPanel: '',
      // 其他tab的数据（我的收藏、我的创建、最近浏览数据）
      otherData: [],
      // 收藏列表
      starredList: []
    }
  },
  methods: {
    // 左侧tab点击
    tabChange (value) {
      if (this.currentTab !== value) {
        this.currentTab = value
        this.filterPanel = ''
      }
      this.setData()
    },
    // 设置树形菜单数据
    setData (type = this.currentTab) {
      const userId = localStorage.getItem('nz-user-id')
      if (type === 'starred') { // 我的收藏
        this.otherData = JSON.parse(JSON.stringify(this.starredList))
      } else if (type === 'create') { // 我的创建
        const flatArr = this.flatten(this.panelData)
        this.otherData = flatArr.filter(item => item.createBy == userId)
      } else if (type === 'browse') { // 最近浏览
        const browseArr = JSON.parse(localStorage.getItem(`nz-view-dashboard-${userId}`) || '[]')
        const flatArr = this.flatten(this.panelData)
        const tempArr = []
        // 比对id获取最近浏览的数据
        browseArr.forEach(item => {
          flatArr.forEach(subItem => {
            if (item.id === subItem.id) {
              tempArr.push(subItem)
            }
          })
        })
        this.otherData = JSON.parse(JSON.stringify(tempArr))
      }
      // 设置当前面板高亮 以及保持搜索状态
      this.$nextTick(() => {
        if (this.currentTab === 'all') {
          this.$refs.panelTree && this.$refs.panelTree.setCurrentKey(this.showPanel)
          this.$refs.panelTree && this.$refs.panelTree.filter(this.filterPanel)
        } else {
          this.$refs.otherTree && this.$refs.otherTree.setCurrentKey(this.showPanel)
          this.$refs.otherTree && this.$refs.otherTree.filter(this.filterPanel)
        }
      })
    },
    // 获取收藏的列表
    async getStarred () {
      // 1: 已收藏 0：未收藏
      const flatArr = this.flatten(this.panelData) // 数组对象扁平化
      this.starredList = flatArr.filter(item => {
        return item.starred === 1
      })
    },
    // 数组对象扁平化
    flatten (arr) {
      const tempArr = JSON.parse(JSON.stringify(arr))
      // 递归调用
      function handler (tempArr) {
        const newArr = []
        tempArr.forEach(element => {
          newArr.push(element)
          if (element.children) {
            newArr.push.apply(newArr, handler(element.children))
            delete element.children
          }
        })
        return newArr
      }
      return handler(tempArr)
    },
    // 存储最近浏览的面板
    setBrowse () {
      const userId = localStorage.getItem('nz-user-id')
      // 获取最近浏览id数组
      let browseArr = JSON.parse(localStorage.getItem(`nz-view-dashboard-${userId}`) || '[]')
      const flatArr = this.flatten(this.panelData)
      // 若最近浏览的数据已被删除 则截取掉
      for (let i = 0; i < browseArr.length; i++) {
        const flag = flatArr.some(item => {
          return item.id === browseArr[i].id
        })
        if (flag === false) {
          browseArr.splice(i, 1)
          i--
        }
      }
      // 若已经存在 则先删除
      const value = browseArr.find(item => item.id === this.panel.id)
      if (value) {
        browseArr = browseArr.filter(item => item.id !== value.id)
      }
      // 追加到数组前边
      browseArr.unshift({ id: this.panel.id })
      // 如果数组长度大于10则截取
      browseArr.splice(10)
      localStorage.setItem(`nz-view-dashboard-${userId}`, JSON.stringify(browseArr))
    },
    // 新增收藏
    addStarred: bus.debounceFn(function (data) {
      const params = {
        type: 'panel',
        tid: data.id
      }
      this.$post('/sys/user/starred', params).then(async response => {
        if (response.code === 200) {
          data.starred = 1
          // 更新panelData收藏状态
          handler(this.panelData)
          function handler (list) {
            list.forEach(item => {
              if (item.id === data.id) {
                item.starred = 1
              } else if (item.children && item.children.length > 0) {
                handler(item.children)
              }
            })
          }
          this.getStarred()
          this.setData()
          // 更新父组件面板收藏状态
          this.$set(this.$parent.showPanel, 'starred', this.starredList.some(item => item.id === this.showPanel.id) ? 1 : 0)
        }
      })
    },
    300, true),
    // 删除收藏
    delStarred: bus.debounceFn(function (data) {
      this.$delete('/sys/user/starred?type=panel&tid=' + data.id).then(async response => {
        if (response.code === 200) {
          data.starred = 0
          // 更新panelData收藏状态
          handler(this.panelData)
          function handler (list) {
            list.forEach(item => {
              if (item.id === data.id) {
                item.starred = 0
              } else if (item.children && item.children.length > 0) {
                handler(item.children)
              }
            })
          }
          this.getStarred()
          this.setData()
          // 更新父组件面板收藏状态
          this.$set(this.$parent.showPanel, 'starred', this.starredList.some(item => item.id === this.showPanel.id) ? 1 : 0)
        }
      })
    },
    300, true),

    /*
      * node: 被拖的节点
      * relative: 发生关系的节点
      * position: ['before', 'after', 'inner'] 与relative节点的关系
      * */
    nodeDrop (node, relative, position, event) {
      if (position === 'inner') {
        node.data.pid = relative.data.id
      } else {
        node.data.pid = relative.data.pid
      }
      this.updateWeight()
    },
    filterNode (value, data) {
      if (!value) return true
      // 不区分大小写
      return data.name.toLowerCase().indexOf(value.toLowerCase()) !== -1
    },
    updateWeight (data) {
      const toUpdate = []
      let count = 0

      handler(this.panelData)
      function handler (panelData) {
        panelData.forEach(panel => {
          panel.weight = count++
          toUpdate.push({ id: panel.id, pid: panel.pid, weight: panel.weight })
          if (panel.children && panel.children.length > 0) {
            handler(panel.children)
          }
        })
      }
      this.$put('visual/panel/tree', toUpdate)
    },
    deletePanel (data) {
      this.$emit('deletePanel', data)
    },
    editPanel (data) {
      this.$emit('editPanel', data)
      this.esc()
    },
    esc () {
      this.popBox.show = false
    },
    // 确认选择某个节点，与父组件交互
    selectDashboard (data, checked, child) {
      this.$emit('selectDashboard', data)
      if (this.currentTab === 'all') {
        this.$refs.panelTree && this.$refs.panelTree.setCurrentKey(data)
      } else {
        this.$refs.otherTree && this.$refs.otherTree.setCurrentKey(data)
      }
      this.esc()
    }
  }
}
</script>
