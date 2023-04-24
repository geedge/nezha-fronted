<template>
  <el-popover :placement="placement" :popper-class="chartBox === true ? 'nz-pop nz-pop-select-panel right-box-select-top nz-pop-select-panel__dropdown' : 'nz-pop nz-pop-select-panel right-box-select-top right-public-box-dropdown-top nz-pop-select-panel__dropdown'" ref="selectPanelPopBox" transition="slide" v-model="popBox.show" :width="chartBox === true ? 626 : 310" :disabled="disabled">
    <div>
      <div class="pop-item-wider">

        <slot name="header"></slot>

        <div :class="{'movable': !panelLock}" class="select-panel-tree">
          <el-tree
            :data="panelData"
            :draggable="!panelLock"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            :props="{label: 'name', children: 'children'}"
            @node-click="selectPanel"
            @node-drop="nodeDrop"
            check-on-click-node
            check-strictly
            default-expand-all
            highlight-current
            node-key="id"
            ref="panelTree">
            <div class="tree--node" slot-scope="{ node, data }">
              <span :title="node.label + ' (' + data.chartNum +' charts）' ">{{ node.label }}</span>
              <el-row class="block-col-2" v-if="!panelLock"  style="width: 35px;">
                <el-col>
                  <el-dropdown placement="bottom-end" trigger="click">
                    <span class="el-dropdown-link tree--operation" @click.stop><i class="nz-icon nz-icon-more1"></i></span>
                    <el-dropdown-menu class="right-box-select-top" slot="dropdown"  v-has="['main_edit', 'main_delete']">
                      <el-dropdown-item>
                        <div @click="editPanel(data)"><i v-has="'panel_edit'" class="nz-icon nz-icon-edit"></i>{{$t('overall.edit')}}</div>
                      </el-dropdown-item>
                      <el-dropdown-item>
                        <div @click="deletePanel(data)" v-has="'main_delete'"><i class="nz-icon nz-icon-delete"></i>{{$t('overall.delete')}}</div>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
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
    <div slot="default">
      <slot name="tail"></slot>
    </div>
  </el-popover>
</template>

<script>
export default {
  name: 'selectPanel',
  props: {
    placement: { type: String },
    isEdit: { type: Boolean, default: true },
    panelData: { type: Array },
    showPanel: { type: Object },
    panelLock: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    filterPanel: { type: String },
    chartBox: { type: Boolean }
  },
  mounted () {
    this.$refs.panelTree.setCurrentKey(this.panel)
  },
  watch: {
    filterPanel: {
      immediate: true,
      handler (n) {
        this.$refs.panelTree && this.$refs.panelTree.filter(n)
      }
    },
    showPanel: {
      immediate: true,
      deep: true,
      handler (n) {
        if (n) {
          this.panel = JSON.parse(JSON.stringify(n))
          this.setDefault()
        }
      }
    }
    /* panel: {
          immediate: true,
          handler(n) {
            if (this.$refs.panelTree) {
              console.info(n.id, n.name)
              this.$refs.panelTree.setCurrentKey(n);
            }
          }
        } */
  },
  data () {
    return {
      popBox: { show: false },
      panel: { id: 0, name: '' }
    }
  },
  methods: {
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

      this.$put('visual/dashboard/tree', toUpdate)
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
    selectPanel (data, checked, child) {
      this.$emit('selectPanel', data)
      this.$refs.panelTree.setCurrentKey(data)
      this.esc()
    },
    setDefault () {
      this.$refs.panelTree && this.$refs.panelTree.setCurrentKey(this.showPanel)
      this.$refs.panelTree && this.$refs.panelTree.filter(this.filterPanel)
      this.$emit('setPanelName', this.$refs.panelTree && this.$refs.panelTree.getNode(this.showPanel))
      if (!this.showPanel.id) {
        this.$refs.panelTree && this.$refs.panelTree.setCurrentKey(null)
        this.$refs.panelTree && this.$refs.panelTree.filter(this.filterPanel)
      }
    }
  }
}
</script>
