<template>
  <el-popover ref="selectAssetTypePopBox" v-model="popBox.show" :placement="placement" :width="width" popper-class="nz-pop nz-pop-select-panel right-box-select-top" transition="slide">
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
