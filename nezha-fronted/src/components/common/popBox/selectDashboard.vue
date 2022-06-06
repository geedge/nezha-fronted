<template>
  <el-popover :placement="placement" popper-class="'nz-pop nz-pop-select-panel right-box-select-top right-public-box-dropdown-top nz-pop-select-panel__dropdown'" transition="slide" v-model="popBox.show" :width="500" :disabled="disabled">
    <div class="panel-select-wrap">
      <div class="panel-select-left">
        <ul class="panel-select-list">
          <li class="panel-select-item" :class="{active:currentTab===item.value}" v-for="item in tabList" :key="item.value" @click="tabChange(item.value)">
            <i class="nz-icon" :class="item.icon"></i>
            <span>{{item.name}}</span>
          </li>
        </ul>
        <div slot="default">
          <slot name="tail"></slot>
        </div>
      </div>
      <div class="pop-item-wider">
        <div class="panel-select-header">
          <el-input id="panel-list-search" v-model="filterPanel" :placeholder="$t('overall.search')" clearable size="small" style="padding:0 12px"></el-input>
        </div>
        <div :class="{'movable': !panelLock}" class="select-panel-tree">
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
            highlight-current
            node-key="id"
            ref="panelTree">
            <div class="tree--node" slot-scope="{ node, data }">
              <span :title="data.id?node.label + ' (' + data.chartNum +' charts）':''" :class="{'select-panel-title':data.id===0}">{{ node.label }}</span>
              <el-row class="block-col-2" style="margin-left:10px">
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
                  <template v-if="data.id">
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
  mounted () {
    this.$refs.panelTree.setCurrentKey(this.panel)
  },
  watch: {
    filterPanel: {
      immediate: true,
      handler (n) {
        this.$refs.panelTree && this.$refs.panelTree.filter(n)
        this.$refs.starredTree && this.$refs.starredTree.filter(n)
      }
    },
    showPanel: {
      immediate: true,
      handler (n) {
        if (n) {
          this.panel = JSON.parse(JSON.stringify(n))
        }
      }
    }
  },
  data () {
    return {
      popBox: { show: false },
      panel: { id: 0, name: '' },
      tabList: [
        { name: '全部仪表盘', icon: 'nz-icon-a-leimucuquanbu', value: 'all' },
        { name: '我的收藏', icon: 'nz-icon-xingzhuang', value: 'starred' },
        { name: '我的创建', icon: 'nz-icon-wodechuangjian', value: 'create' },
        { name: '最近浏览', icon: 'nz-icon-liulanlishi', value: 'browse' }
      ],
      currentTab: 'all',
      filterPanel: ''
    }
  },
  methods: {
    // 左侧tab点击
    tabChange (value) {
      if (this.currentTab !== value) {
        this.currentTab = value
        console.log(666)
      }
    },
    // 获取收藏的列表
    async getStarred (type) {
      // const params = {
      //   type: 'panel'
      // }
      // const response = await this.$get('/sys/user/starred', params)
      // if (response.code === 200) {
      //   this.tempArr = []
      //   this.recursionStarred(this.panelData, response.data.list)
      //   if (type === 'tree') {
      //     // 刷新树形控件
      //     this.$emit('refreshStarred', { data: this.panelData, type: 'tree' })
      //   } else {
      //     this.$emit('refreshStarred', { data: this.panelData })
      //   }
      // }
    },
    // 比对收藏的列表和全部列表 改变状态
    recursionStarred (allList, starredList) {
      allList.forEach((item) => {
        item.starred = false
        starredList.forEach((subItem) => {
          // 判断全部列表每一项的id和收藏列表每一项的id是否相等
          if (item.id === subItem.tid) {
            if (this.tempArr.every(val => val.id !== item.id)) {
              item.starred = true
              this.tempArr.push({
                ...item,
                children: []
              })
            }
          }
        })
        if (item.children && item.children.length) {
          this.recursionStarred(item.children, starredList)
        }
      })
    },
    // 格式化收藏列表 (树形)
    formatStarred (list) {
      const arr = JSON.parse(JSON.stringify(list))
      arr.reverse()
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].pid) {
          // 找到父级所在下标
          const parentIndex = arr.findIndex(subItem => subItem.id === arr[i].pid)
          if (parentIndex > -1) {
            arr[parentIndex].children.unshift(arr[i])
            arr.splice(i, 1)
            i--
          }
        }
      }
      return arr.reverse()
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
          data.starred = true
        }
      })
    },
    300, true),

    // 删除收藏
    delStarred: bus.debounceFn(function (data) {
      this.$delete('/sys/user/starred?type=panel&tid=' + data.id).then(async response => {
        if (response.code === 200) {
          await this.getStarred()
          data.starred = false
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
      return data.name.indexOf(value) !== -1
    },
    updateWeight () {
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
      this.getStarred()
      this.$put('visual/panel/tree', toUpdate)
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
      // 判断是否点击的Starred Panels或All Panels
      if (!data.id) {
        this.$refs.panelTree.setCurrentKey(this.showPanel)
        return false
      }
      this.$emit('selectDashboard', data)
      this.$refs.panelTree.setCurrentKey(data)
      this.esc()
    }
  }
}
</script>
