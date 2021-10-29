<template>
  <el-popover :disabled="disabled" @show="tempWalk.detailShow = false" v-if="popBox.show" :placement="placement" width="367" ref="selectWalkPopBox" popper-class="right-box-select-top right-public-box-dropdown-top nz-pop nz-pop-select-walk" transition="slide">
    <div class="pop-item-wider" @click="tempWalk.detailShow = false">
      <div v-if="tempWalk.detailShow" class="el-popover walk-pop" :style="{left: detailPopPosition.left, top: detailPopPosition.top}">
        <p><span class="metirc-tip-list">Name&nbsp;:&nbsp;</span><span>{{tempWalk.name}}</span></p>
        <p><span class="metirc-tip-list">OID&nbsp;:&nbsp;</span><span>{{tempWalk.objectID}}</span></p>
        <p><span class="metirc-tip-list">MIB&nbsp;:&nbsp;</span><span>{{mibName(tempWalk.objectID)}}</span></p>
      </div>
      <div class="select-walk-tree" ref="scrollbar">
        <el-tree
          ref="walkTree"
          node-key="objectID"
          :props="{label: 'name', children: 'subTree', disabled: disabledNode}"
          :data="walkData"
          :default-expanded-keys="expandedWalk"
          :expand-on-click-node="false"
          check-on-click-node
          check-strictly
          show-checkbox
          @check="change"
          @node-click="hideDetail"
          :default-checked-keys="currentWalk"
        >
          <div slot-scope="data" :class="getClass(data.data.objectID)" class="walk-tree-item">
            <span>
              <span v-if="!data.data.type"><i class="nz-icon nz-icon-reading"></i></span>
              <span v-else>
                <i v-if="data.data.type.toUpperCase() === 'IDENTIFIER'" class="el-icon-folder-opened"></i>
                <i v-if="data.data.type.toUpperCase() === 'OBJECT' && data.data.subTree.length > 0" class="el-icon-folder-opened"></i>
                <i v-if="data.data.type.toUpperCase() === 'OBJECT' && data.data.subTree.length == 0" class="nz-icon nz-icon-leaf"></i>
                <i v-if="data.data.type.toUpperCase() === 'ENTRY'" class="nz-icon nz-icon-table-edit"></i>
                <i v-if="data.data.type.toUpperCase() === 'TABLE'" class="nz-icon nz-icon-table"></i>
                <span style="position: relative;" @click.stop="showDetail(data.data, $event)">
                  <i class="nz-icon nz-icon-info-normal metric-tip-icon"></i>
                </span>
              </span>
            </span>
            {{data.data.name}}
          </div>
        </el-tree>
      </div>
    </div>
    <div slot="reference">
      <slot name="trigger">
      </slot>
    </div>
  </el-popover>
</template>

<script>
export default {
  name: 'selectWalk',
  props: {
    placement: { type: String },
    walkData: { type: Array },
    currentWalk: { type: Array },
    expandedWalk: { type: Array },
    disabled: {type: Boolean, default: false }
  },
  data () {
    return {
      popBox: { show: true },
      tempWalk: { detailShow: false, objectID: '' },
      detailPopPosition: { top: '0', left: '0' }
    }
  },
  computed: {
    getClass () {
      return (value) => {
        if (!value) {
          return ''
        }
        return this.currentWalk.indexOf(value) == -1 ? '' : 'walk-active'
      }
    },
    mibName () {
      return (value) => {
        return value ? this.getMibName(value) : ''
      }
    }
  },
  methods: {
    getMibName (oid) {
      const node = this.$refs.walkTree.getNode(oid)
      const mibName = getMibName(node)
      function getMibName (n) {
        if (n.parent && n.parent.parent) {
          return getMibName(n.parent)
        } else if (n.parent) {
          return n.data.name
        } else {
          return ''
        }
      }
      if (mibName) {
        return mibName
      } else {
        return ''
      }
    },
    change (data, tree) {
      this.$emit('selectWalk', data.objectID)
    },
    show () {
      this.popBox.show = true
    },
    hideDetail (data, num) {
      this.tempWalk.detailShow = false
    },
    showDetail (data, e) {
      if (this.tempWalk.objectID != data.objectID) {
        this.tempWalk.detailShow = false
        data.detailShow = !data.detailShow
        this.tempWalk = data
      } else {
        data.detailShow = !data.detailShow
      }

      this.detailPopPosition.top = e.screenY - 23 + 'px'
      this.detailPopPosition.left = e.screenX - 16 + 'px'
    },
    disabledNode (data) {
      if (data.objectID) {
        return false
      }
      return true
    }
  },
  beforeDestroy () {

  }
}
</script>

<style lang="scss">
.select-walk-tree {
  height: 350px;
  overflow-y: auto;
}
.select-walk-tree .el-tree-node__content {
  height: 34px;
  line-height: 34px;
}
.select-walk-tree .el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
  background-color: #F5F7FA;
  font-weight: bold;
  color: $global-text-color-active;
}
.select-walk-tree .el-tree .el-checkbox {
  display: none;
}
.nz-pop-select-walk {
  padding: 0 !important;
}
.walk-active {
  color: $global-text-color-active;
}
.walk-tree-item {
  height: 34px;
  line-height: 34px;
}
.walk-detail {
  z-index: 10000 !important;
}

.walk-pop {
  position: fixed;
  transform: translate(-100%, -100%);
}
.walk-pop::after {
  content: '';
  display: block;
  width:0;
  height:0;
  overflow: hidden;
  font-size: 0;
  line-height: 0;
  border: 5px;
  border-style: dashed dashed dashed solid;
  border-color: transparent transparent transparent #fff ;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translate(10px, -50%);
}

</style>
