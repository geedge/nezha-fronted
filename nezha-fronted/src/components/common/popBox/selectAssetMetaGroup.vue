<template>
  <el-popover ref="selectAssetMetaGroupPopBox" v-model="popBox.show" :placement="placement" popper-class="nz-pop nz-pop-select-panel right-box-select-top right-public-box-dropdown-top nz-pop-select-panel__dropdown" transition="slide" width="300">
    <div>
      <div class="pop-item-wider">

        <slot name="header"></slot>

        <div class="select-panel-tree">
          <el-tree
            ref="tree"
            :data="objectData"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            :props="{label: 'name', children: 'children'}"
            check-on-click-node
            check-strictly
            default-expand-all
            highlight-current
            node-key="id"
            @node-click="selectObject">
            <div slot-scope="{ node, data }" class="tree--node">
<!--              -->
              <span>
                <el-popover
                  placement="right"
                  trigger="hover"
                  :content="node.label">
                  <span slot="reference">{{ node.label }}</span>
                </el-popover>
              </span>
              <el-row class="block-col-2" style="margin-left: 10px; margin-right: 8px;">
                <el-col>
                  <el-dropdown placement="bottom-end" trigger="click" v-if="data.id != -1">
                    <span class="el-dropdown-link tree--operation" @click.stop><i class="nz-icon nz-icon-more1"></i></span>
                    <el-dropdown-menu class="right-box-select-top nz-el-dropdown-menu" slot="dropdown"  v-has="['asset_label_delete', 'asset_label_edit']">
                      <el-dropdown-item>
                        <div @click="edit(data)"><i v-has="'asset_label_edit'" class="nz-icon nz-icon-edit"></i>{{$t('overall.edit')}}</div>
                      </el-dropdown-item>
                      <el-dropdown-item>
                        <div @click="del(data)" v-has="'asset_label_delete'"><i class="nz-icon nz-icon-delete"></i>{{$t('overall.delete')}}</div>
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
    <div slot="reference" style="cursor: pointer">
      <slot name="trigger"></slot>
    </div>
    <div slot="default">
      <slot name="tail"></slot>
    </div>
  </el-popover>
</template>

<script>
export default {
  name: 'selectAssetMetaGroup',
  props: {
    placement: { type: String },
    isEdit: { type: Boolean, default: true },
    objectData: { type: Array },
    showObject: { type: Object },
    filterObject: { type: String }
  },
  mounted () {
    this.$refs.tree.setCurrentKey(this.object)
  },
  watch: {
    filterObject: {
      immediate: true,
      handler (n) {
        this.$refs.tree && this.$refs.tree.filter(n)
      }
    },
    showObject: {
      immediate: true,
      handler (n) {
        if (n) {
          this.object = JSON.parse(JSON.stringify(n))
        }
      }
    }
  },
  data () {
    return {
      popBox: { show: false },
      object: { id: 0, name: '' }
    }
  },
  methods: {
    filterNode (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    del (data) {
      this.$emit('del', data)
    },
    edit (data) {
      this.$emit('edit', data)
      this.esc()
    },
    esc () {
      this.popBox.show = false
    },
    // 确认选择某个节点，与父组件交互
    selectObject (data, checked, child) {
      this.$emit('selectObject', data)
      this.$refs.tree.setCurrentKey(data)
      this.esc()
    }
  }
}
</script>
