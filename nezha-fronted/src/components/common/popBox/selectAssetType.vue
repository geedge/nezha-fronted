<template>
  <el-popover ref="selectAssetTypePopBox" v-model="popBox.show" :placement="placement" :width="width" popper-class="nz-pop nz-pop-select-panel" transition="slide">
    <div>
      <div class="pop-item-wider">

        <slot name="header"></slot>

        <div class="select-panel-tree">
          <el-tree
            :data="assetTypeData"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            :props="{label: 'name', children: 'children'}"
            @node-click="selectAssetType"
            check-on-click-node
            check-strictly
            default-expand-all
            highlight-current
            node-key="id"
            ref="assetTypeTree">
            <div :class="{'tree--node__disabled': data.disabled}" class="tree--node" slot-scope="{ node, data }">
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
  name: 'selectAssetType',
  props: {
    placement: { type: String },
    assetTypeData: { type: Array },
    showType: { type: Object },
    width: { type: String, default: '625' }
  },
  mounted () {
    this.$refs.assetTypeTree.setCurrentKey(this.assetType)
  },
  watch: {
    showType: {
      immediate: true,
      handler (n) {
        if (n) {
          this.assetType = JSON.parse(JSON.stringify(n))
        }
      }
    }
  },
  data () {
    return {
      popBox: { show: false },
      assetType: { id: 0, name: '' }
    }
  },
  methods: {
    filterNode (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    esc () {
      this.popBox.show = false
    },
    // 确认选择某个节点，与父组件交互
    selectAssetType (data, checked, child) {
      if (data.disabled) {
        return
      }
      this.$emit('selectAssetType', data)
      this.$refs.assetTypeTree.setCurrentKey(data)
      this.esc()
    }
  }
}
</script>
<style>
  .tree--node__disabled {
    opacity: .6;
  }
  .tree--node__disabled:hover {
    cursor: not-allowed;
  }
</style>
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
</style>
