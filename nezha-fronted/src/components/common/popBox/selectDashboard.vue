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
          <span class="dashboard-select-add" v-has="'main_add'" :title='$t("dashboard.panel.createPanelTitleSec")' @click="toAdd">
            <i class="nz-icon nz-icon-create-square"></i>&nbsp;&nbsp;{{$t('overall.addDashboard')}}
          </span>
        </div>
      </div>
      <div class="pop-item-wider">
        <div class="panel-select-header">
          <el-input id="panel-list-search" v-model="filterPanel" :placeholder="$t('overall.search')" clearable size="small" style="width:316px"></el-input>
        </div>
        <div :class="{'movable': !panelLock&&currentTab==='all'}" class="select-panel-tree">
          <el-tree
            :data="treeData"
            :draggable="!panelLock&&currentTab==='all'"
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
              <span :title="node.label + ' (' + data.chartNum +' charts）' " v-html="ruleTitle(node.label)"></span>
              <el-row class="block-col-2" style="margin-left:10px;margin-right:8px">
                <el-col>
                  <el-dropdown v-if="!panelLock"  placement="bottom-end" trigger="click" style="margin-right:10px">
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
                    <i v-if="data.starred" class="nz-icon nz-icon-a-xingzhuang2" @click.stop="delStarred(data)"></i>
                    <i v-else class="nz-icon nz-icon-xingzhuang" @click.stop="addStarred(data)"></i>
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
export default {
  name: 'selectDashboard',
  props: {
    placement: { type: String },
    panelData: { type: Array },
    showPanel: { type: Object },
    panelLock: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false }
  },
  watch: {
    filterPanel: {
      immediate: true,
      handler (n) {
        this.$refs.panelTree && this.$refs.panelTree.filter(n)
      }
    },
    showPanel: {
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
      async handler (n) {
        await this.getStarred()
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
      // 树形控件数据
      treeData: [],
      // 收藏列表
      starredList: [],
      // 用户id
      userId: ''
    }
  },
  created () {
    this.userId = localStorage.getItem('nz-user-id')
  },
  methods: {
    // 新增仪表盘
    toAdd () {
      this.$parent.toAdd()
      this.esc()
    },

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
      if (type === 'all') { // 全部
        this.treeData = JSON.parse(JSON.stringify(this.panelData))
      } else if (type === 'starred') { // 我的收藏
        this.treeData = JSON.parse(JSON.stringify(this.starredList))
      } else if (type === 'create') { // 我的创建
        const flatArr = this.flatten(this.panelData)
        this.treeData = flatArr.filter(item => item.createBy == this.userId)
      } else if (type === 'browse') { // 最近浏览
        const browseArr = JSON.parse(localStorage.getItem(`nz-view-dashboard-${this.userId}`) || '[]')
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
        this.treeData = JSON.parse(JSON.stringify(tempArr))
      }
      this.$nextTick(() => {
        this.$refs.panelTree.setCurrentKey(this.showPanel)
        this.$refs.panelTree.filter(this.filterPanel)
        // 更新父组件面板收藏状态
        this.$set(this.$parent.showPanel, 'starred', this.starredList.some(item => item.id === this.showPanel.id))
      })
    },
    // 获取收藏的列表
    async getStarred (type) {
      const params = {
        type: 'panel'
      }
      const response = await this.$get('/sys/user/starred', params)
      this.starredList = []
      this.recursionStarred(this.panelData, response.data ? response.data.list : [])
    },
    // 比对收藏的列表和全部列表 设置starred状态
    recursionStarred (allList, starredList) {
      const that = this
      function handler (allList, starredList) {
        allList.forEach((item) => {
          item.starred = false
          starredList.forEach((subItem) => {
            // 判断全部列表每一项的id和收藏列表每一项的id是否相等
            if (item.id === subItem.tid) {
              if (that.starredList.every(val => val.id !== item.id)) {
                item.starred = true
                that.starredList.push({
                  ...item,
                  children: []
                })
              }
            }
          })
          if (item.children && item.children.length) {
            handler(item.children, starredList)
          }
        })
      }
      handler(allList, starredList)
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
    // 设置最近浏览的面板
    setBrowse () {
      // 获取最近浏览id数组
      let browseArr = JSON.parse(localStorage.getItem(`nz-view-dashboard-${this.userId}`) || '[]')
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
      localStorage.setItem(`nz-view-dashboard-${this.userId}`, JSON.stringify(browseArr))
    },
    // 新增收藏
    addStarred: bus.debounceFn(function (data) {
      const params = {
        type: 'panel',
        tid: data.id
      }
      this.$post('/sys/user/starred', params).then(async response => {
        if (response.code === 200) {
          await this.getStarred()
          this.setData()
        }
      })
    },
    300, true),
    // 删除收藏
    delStarred: bus.debounceFn(function (data) {
      this.$delete('/sys/user/starred?type=panel&tid=' + data.id).then(async response => {
        if (response.code === 200) {
          await this.getStarred()
          this.setData()
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
    // 高亮搜索的关键字
    ruleTitle (title) {
      const reg = new RegExp(this.filterPanel, 'ig')
      const arr = title.match(reg)
      let index = -1
      return title.replace(reg, function () {
        index++
        return '<span class="highlight-keyword">' + arr[index] + '</span>'
      })
    },
    updateWeight (data) {
      const toUpdate = []
      let count = 0

      handler(this.treeData)
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
      // 更新父组件Weight
      this.$emit('updateWeight', this.treeData)
    },
    deletePanel (data) {
      this.$emit('deletePanel', data)
    },
    editPanel (data) {
      this.$emit('editPanel', data)
    },
    esc () {
      this.popBox.show = false
    },
    // 确认选择某个节点，与父组件交互
    selectDashboard (data, checked, child) {
      this.$emit('selectDashboard', data)
      this.$refs.panelTree.setCurrentKey(data)
      this.esc()
    }
  }
}
</script>
