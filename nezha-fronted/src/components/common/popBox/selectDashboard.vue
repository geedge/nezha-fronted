<template>
  <div>
    <el-popover :placement="placement" popper-class="'nz-pop nz-pop-select-panel right-box-select-top right-public-box-dropdown-top nz-pop-select-panel__dropdown'" transition="slide" v-model="popBox.show" :width="536" :disabled="disabled">
      <div class="dashboard-select-wrap">
        <div class="dashboard-select-left">
          <ul class="dashboard-select-list">
            <li class="dashboard-select-item" :class="{active:currentTab===item.value}" v-for="item in tabList" :key="item.value" @click="tabChange(item.value)">
              <i class="nz-icon" :class="item.icon"></i>
              <span>{{item.name}}</span>
            </li>
          </ul>
          <div class="dashboard-select-tail">
            <slot name="button"></slot>
          </div>
        </div>
        <div class="pop-item-wider">
          <div class="dashboard-select-header">
            <el-input v-model="filterPanel" :placeholder="$t('overall.search')" clearable size="small"></el-input>
            <button v-has="'main_add'" :title="$t('dashboard.createPlaylist')" class="top-tool-btn margin-l-10" type="button" @click="addPlaylist" v-if="currentTab==='playlist'">
              <i class="nz-icon-create-square nz-icon"></i>
            </button>
          </div>
          <!-- 全部仪表盘数据（树形结构）-->
          <div :class="{'movable': !panelLock}" class="select-dashboard-tree" v-if="currentTab==='all'">
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
                    <el-dropdown placement="bottom-end" trigger="click" style="margin-right:10px" v-has="['main_edit', 'main_delete']">
                      <span class="el-dropdown-link tree--operation" @click.stop><i class="nz-icon nz-icon-more1"></i></span>
                      <el-dropdown-menu class="right-box-select-top" slot="dropdown">
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
          <!-- 我的收藏、我的创建、最近浏览数据、轮播列表（无层级关系） -->
          <div class="select-dashboard-tree" :class="{'playlistTree':currentTab==='playlist'}" v-else>
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
              :highlight-current="currentTab!=='playlist'"
              node-key="id"
              ref="otherTree">
              <div class="tree--node" slot-scope="{ node, data }" v-if="currentTab!=='playlist'">
                <HighlightText :queries="filterPanel" :highlightClass="'highlight-keyword'" style="vertical-align: middle" :title="node.label + ' (' + data.chartNum +' charts）' ">{{node.label}}</HighlightText>
                <el-row class="block-col-2" style="margin-left:10px;margin-right:8px">
                  <el-col>
                    <el-dropdown placement="bottom-end" trigger="click" style="margin-right:10px" v-has="['main_edit', 'main_delete']">
                      <span class="el-dropdown-link tree--operation" @click.stop><i class="nz-icon nz-icon-more1"></i></span>
                      <el-dropdown-menu class="right-box-select-top nz-el-dropdown-menu" slot="dropdown">
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
              <!-- 轮播列表 -->
              <div class="tree--node" slot-scope="{ node, data }" v-else>
                <HighlightText :queries="filterPanel" :highlightClass="'highlight-keyword'" style="vertical-align: middle">{{node.label}}</HighlightText>
                <el-row class="block-col-2" style="margin-left:10px;margin-right:8px">
                  <el-col>
                    <el-dropdown placement="bottom-end" trigger="click" style="margin-right:10px" v-has="['main_edit', 'main_delete']">
                      <span class="el-dropdown-link tree--operation" @click.stop><i class="nz-icon nz-icon-more1"></i></span>
                      <el-dropdown-menu class="right-box-select-top nz-el-dropdown-menu" slot="dropdown">
                        <el-dropdown-item>
                          <div @click="editPlaylist(data)" v-has="'main_edit'"><i  class="nz-icon nz-icon-edit"></i>{{$t('overall.edit')}}</div>
                        </el-dropdown-item>
                        <el-dropdown-item>
                          <div @click="deletePlaylist(data)" v-has="'main_delete'"><i class="nz-icon nz-icon-delete"></i>{{$t('overall.delete')}}</div>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                    <template>
                      <i class="nz-icon nz-icon-bofang" @click.stop="startPlay(data)" :title ="$t('dashboard.startPlaylist')"></i>
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
    <transition name="right-box">
      <playlistBox v-if="playlistVisible" @close="closePlaylist" :obj="playlistObj"></playlistBox>
    </transition>
  </div>
</template>
<script>
import bus from '@/libs/bus'
import HighlightText from 'vue-text-highlight'
import playlistBox from '@/components/common/rightBox/playlistBox'
export default {
  name: 'selectDashboard',
  components: {
    HighlightText,
    playlistBox
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
        { name: this.$t('dashboard.recentlyViewed'), icon: 'nz-icon-liulanlishi', value: 'browse' },
        { name: this.$t('dashboard.playlist'), icon: 'nz-icon-Playlists', value: 'playlist' }
      ],
      currentTab: 'all',
      // 过滤值
      filterPanel: '',
      // 其他tab的数据（我的收藏、我的创建、最近浏览数据）
      otherData: [],
      // 收藏列表
      starredList: [],
      playlist: [],
      playlistVisible: false,
      playlistObj: {}
    }
  },
  created () {
    this.getPlaylist()
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
      switch (type) {
        case 'starred': { // 我的收藏
          this.otherData = JSON.parse(JSON.stringify(this.starredList))
          break
        }
        case 'create': { // 我的创建
          const flatArr = bus.flatten(this.panelData)
          this.otherData = flatArr.filter(item => item.createBy == userId)
          break
        }
        case 'browse': { // 最近浏览
          const browseArr = JSON.parse(localStorage.getItem(`nz-view-dashboard-${userId}`) || '[]')
          const flatArr = bus.flatten(this.panelData)
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
          break
        }
        case 'playlist': {
          this.otherData = JSON.parse(JSON.stringify(this.playlist))
          break
        }
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
    startPlay (val) {
      const data = this.$loadsh.cloneDeep(val)
      data.dashboardIds = JSON.parse(data.dashboardIds)
      if (data.dashboardIds.length) {
        this.esc()
        this.$emit('startPlay', data)
      } else {
        this.$message.error(this.$t('PLAYLIST_DASHBOARD_IDS_ISNULL'))
      }
    },
    async getPlaylist () {
      const res = await this.$get('/visual/playlist', { pageSize: -1 })
      this.playlist = res.data.list
      this.setData()
    },
    addPlaylist () {
      this.esc()
      this.playlistObj = {
        name: '',
        intvl: undefined,
        dashboardIds: [],
        mode: 'normal'
      }
      this.playlistVisible = true
    },
    async editPlaylist (data) {
      this.esc()
      const res = await this.$get('/visual/playlist/' + data.id)
      this.playlistObj = {
        id: res.data.id,
        name: res.data.name,
        intvl: res.data.intvl,
        dashboardIds: res.data.dashboardIds,
        mode: res.data.mode || 'normal'
      }
      this.playlistObj.dashboardIds = JSON.parse(this.playlistObj.dashboardIds)
      this.playlistVisible = true
    },
    async deletePlaylist (data) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('/visual/playlist?ids=' + data.id).then((response) => {
          if (response.code === 200) {
            this.$message({
              duration: 1000,
              type: 'success',
              message: this.$t('tip.deleteSuccess')
            })
            this.getPlaylist(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    closePlaylist (refresh) {
      this.playlistVisible = false
      if (refresh) {
        this.getPlaylist()
      }
    },
    // 获取收藏的列表
    async getStarred () {
      // 1: 已收藏 0：未收藏
      const flatArr = bus.flatten(this.panelData) // 数组对象扁平化
      this.starredList = flatArr.filter(item => {
        return item.starred === 1
      })
    },
    // 存储最近浏览的面板
    setBrowse () {
      const userId = localStorage.getItem('nz-user-id')
      // 获取最近浏览id数组
      let browseArr = JSON.parse(localStorage.getItem(`nz-view-dashboard-${userId}`) || '[]')
      const flatArr = bus.flatten(this.panelData)
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
        type: 'dashboard',
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
      this.$delete('/sys/user/starred?type=dashboard&tid=' + data.id).then(async response => {
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
      this.$put('visual/dashboard/tree', toUpdate)
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
      if (this.currentTab === 'all') {
        this.$refs.panelTree && this.$refs.panelTree.setCurrentKey(data)
      } else {
        this.$refs.otherTree && this.$refs.otherTree.setCurrentKey(data)
      }
      if (this.currentTab === 'playlist') return
      this.$emit('selectDashboard', data, 'select')
      this.esc()
    }
  }
}
</script>
