<template>
  <el-popover :placement="placement" popper-class="nz-pop nz-pop-select-panel right-public-box-select-top right-public-box-dropdown-top nz-pop-select-panel__dropdown" ref="selectPanelPopBox" transition="slide" v-model="popBox.show" width="310" :disabled="disabled">
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
<!--              <span class="tree&#45;&#45;operation" v-if="!panelLock">-->
<!--                <span @click.stop="deletePanel(data)" class="panel-dropdown-btn panel-dropdown-btn-delete" v-has="'panel_delete'"><i class="nz-icon nz-icon-delete"></i></span>-->
<!--                <span class="panel-dropdown-btn" @click.stop="editPanel(data)"><i v-has="'panel_edit'" class="nz-icon nz-icon-edit"></i></span>-->
<!--              </span>-->
              <el-row class="block-col-2" v-if="!panelLock"  style="width: 35px;">
                <el-col>
                  <el-dropdown placement="bottom" trigger="click">
                    <span class="el-dropdown-link tree--operation" @click.stop><i class="nz-icon nz-icon-more1"></i></span>
                    <el-dropdown-menu slot="dropdown"  v-has="['panel_edit', 'panel_delete']">
                      <el-dropdown-item>
                        <span @click.stop="editPanel(data)"><i v-has="'panel_edit'" class="nz-icon nz-icon-edit"></i>{{$t('overall.edit')}}</span>
                      </el-dropdown-item>
                      <el-dropdown-item>
                        <span @click.stop="deletePanel(data)" v-has="'panel_delete'"><i class="nz-icon nz-icon-delete"></i>{{$t('overall.delete')}}</span>
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
    filterPanel: { type: String }
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
      handler (n) {
        if (n) {
          this.panel = JSON.parse(JSON.stringify(n))
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
    selectPanel (data, checked, child) {
      this.$emit('selectPanel', data)
      this.$refs.panelTree.setCurrentKey(data)
      this.esc()
    }
    // tree设为单选
    /* clearOthers(data, checked, child) {
          if (checked) {
            this.panel = data;
            this.$refs.panelTree.setCheckedKeys([data.id]);
          } else {
            this.panel = {id: '', name: ''};
          }
        } */
  }
}
</script>

<style lang="scss">
.movable {
  .el-tree-node__content {
    cursor: move;
    .tree--node>span:first-of-type {
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-word;
    }
    .tree--node>span:last-of-type>span {
      cursor: pointer;
    }
  }
}
.tree--node>span:last-of-type>span>i {
  font-weight: normal !important;
}
.select-panel-tree {
  height: 350px;
  overflow: auto;
}
.select-panel-tree .el-tree-node__content {
  height: 34px;
  line-height: 34px;
}
.select-panel-tree .el-tree-node__content:hover {
  color: $global-text-color-active;
}
.select-panel-tree .el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
  background-color: #F5F7FA;
  font-weight: bold;
  color: $global-text-color-active;
}
.tree--node {
  display: flex;
  justify-content: space-between;
  width: calc(100% - 28px);
}
.tree--node span:nth-of-type(1) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-word;
}
.tree--operation {
  opacity: 0;
}
.tree--node:hover .tree--operation {
  opacity: 1;
}
.panel-dropdown-btn {
  color: #60BEFF;
}
.panel-dropdown-btn:hover {
  color: #409EFF;
}
.panel-dropdown-btn-delete {
  color: #F98D9A;
}

.panel-dropdown-btn-delete:hover {
  color: #D96D7A;
}
</style>
