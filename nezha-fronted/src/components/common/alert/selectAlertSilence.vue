<template>
  <el-popover :placement="placement" popper-class="nz-pop nz-pop-select-panel nz-pop-select-silence" ref="selectSilencePopBox" transition="slide" v-model="popBox.show" width="400">
    <div>
      <div class="pop-item-wider">

        <slot name="header"></slot>

        <div class="select-panel-tree">
          <el-tree
            :data="silenceData"
            :filter-node-method="filterNode"
            :props="{label: 'name', children: 'children'}"
            @node-click="selectSilence"
            @node-drop="nodeDrop"
            check-on-click-node
            check-strictly
            highlight-current
            node-key="id"
            v-loading="typeContentLoading"
            ref="panelTree">
            <div class="tree--node" slot-scope="{ node, data }">
              <span>{{ node.label }}</span>
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
  export default {
    name: "selectAlertSilence",
    props:{
      placement: {type: String},
      isEdit: {type: Boolean, default: true},
      silenceData: {type: Array},
      filterSilence: {type: String},
      typeContentLoading:{type: Boolean, default: false}
    },
    mounted() {
      // this.$refs.panelTree.setCurrentKey();
    },
    watch: {
      filterSilence: {
        immediate: true,
        handler(n) {
          this.$refs.panelTree && this.$refs.panelTree.filter(n);
        }
      },
      /*panel: {
        immediate: true,
        handler(n) {
          if (this.$refs.panelTree) {
            console.info(n.id, n.name)
            this.$refs.panelTree.setCurrentKey(n);
          }
        }
      }*/
    },
    data(){
      return {
        popBox: {show: false},
        panel: {id: 0, name: ""},
      }
    },
    methods:{
      /*
      * node: 被拖的节点
      * relative: 发生关系的节点
      * position: ['before', 'after', 'inner'] 与relative节点的关系
      * */
      nodeDrop(node, relative, position, event) {
        if (position === 'inner') {
          node.data.pid = relative.data.id;
        } else {
          node.data.pid = relative.data.pid;
        }
        this.updateWeight();
      },
      filterNode(value, data) {
        if (!value) return true;
        return data.name.indexOf(value) !== -1;
      },
      updateWeight() {
        let toUpdate = [];
        let count = 0;
        handler(this.silenceData);

        function handler(silenceData) {
          silenceData.forEach(panel => {
            panel.weight = count++;
            toUpdate.push({id: panel.id, pid: panel.pid, weight: panel.weight});
            if (panel.children && panel.children.length > 0) {
              handler(panel.children);
            }
          });
        }

        this.$put("/panel/tree", toUpdate);
      },
      deletePanel(data) {
        this.$emit("deletePanel", data);
      },
      editPanel(data) {
        this.$emit("editPanel", data);
      },
      esc(){
        this.popBox.show = false;
      },
      //确认选择某个节点，与父组件交互
      selectSilence(data, checked, child) {
        if(data.children) return
        this.$emit('selectSilence', data);
        this.$refs.panelTree.setCurrentKey(data);
        this.esc();
      },
      //tree设为单选
      /*clearOthers(data, checked, child) {
        if (checked) {
          this.panel = data;
          this.$refs.panelTree.setCheckedKeys([data.id]);
        } else {
          this.panel = {id: '', name: ''};
        }
      }*/
    },
  }
</script>

<style lang="scss">
  .movable {
    .el-tree-node__content {
      cursor: move;
      .tree--node>span:first-of-type {
        cursor: pointer;
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
  .nz-pop-select-silence /deep/ .panel-select-header{
    text-align: center;
  }
</style>
